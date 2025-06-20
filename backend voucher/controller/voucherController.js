const getDbConnection = require("../utils/dbConnector.js");
const { voucherSchema } = require("../models/voucher.model");
const { entriesSchema } = require("../models/entries.model");
const { activityLogSchema } = require("../models/activity.model");
// Add this import for Account schema
const { AccountSchema } = require("../models/account");
const getModel = require("../utils/getModel");
const mongoose = require("mongoose");
// const uploadFileToFolder = require("../utils/uploadFileToFolder");

exports.addVoucher = async (req, res) => {
  try {
    const dbprefix = req.headers.dbprefix;
    const connection = await getDbConnection(dbprefix);

    const Voucher = getModel(connection, "Voucher", voucherSchema);
    const Entries = getModel(connection, "Entries", entriesSchema);
    const ActivityLog = getModel(connection, "ActivityLog", activityLogSchema);

    const { date, transactions: rawTransactions, type, metadata } = req.body;
    const created_by = req.user?.id;

    const transactions = rawTransactions; // if transactions sent as JSON string
    // const files = req.files; // Multer .array('files') gives array of files
    // console.log(req.body);
    // ✅ Upload each file and attach to matching transaction
    // for (let i = 0; i < transactions.length; i++) {
    //   const file = files?.[i];

    //   if (file) {
    //     const folderName = `${dbprefix}/voucher`;
    //     const fileUrl = await uploadFileToFolder(file, folderName);
    //     transactions[i].file = fileUrl;
    //   } else {
    //     transactions[i].file = "";
    //   }
    // }
    // ✅ Move each uploaded file to 'uploads/voucher' and assign to transaction
    // if (req.files && req.files.length) {
    //   req.files.forEach((file, index) => {
    //     const movedPath = uploadFileToFolder(file, `${dbprefix}/voucher`);
    //     if (transactions[index]) {
    //       transactions[index].file = movedPath;
    //     }
    //   });
    // }

    const accounts = [...new Set(transactions.map((txn) => txn.account))];

    let nextVoucherNumber = 1;
    const latest = await Voucher.find({ type })
      .sort({ created_at: -1 })
      .limit(1);
    if (latest.length) {
      const last = parseInt(latest[0].voucher_id.split("-")[1]);
      if (!isNaN(last)) nextVoucherNumber = last + 1;
    }

    const voucherCode = getVoucherCode(type);
    let newVoucherId = `${voucherCode}-${nextVoucherNumber}`;
    while (await Voucher.findOne({ voucher_id: newVoucherId })) {
      nextVoucherNumber++;
      newVoucherId = `${voucherCode}-${nextVoucherNumber}`;
    }

    const newVoucher = new Voucher({
      voucher_id: newVoucherId,
      date,
      type,
      created_by,
      updated_by: created_by,
      accounts,
      is_void: false,
      is_posted: true,
      metadata: metadata || {},
      // file: null, // if overall voucher has no file
    });

    const savedVoucher = await newVoucher.save();

    const grouped = {};
    transactions.forEach((txn) => {
      if (!grouped[txn.account]) grouped[txn.account] = [];
      grouped[txn.account].push({
        voucherId: savedVoucher._id,
        type,
        description: txn.description,
        credit: txn.credit,
        debit: txn.debit,
        isVoid: false,
        isPosted: true,
        // file: txn.file || "",
        date: txn.date || new Date(),
        metadata: txn.metadata || {},
      });
    });

    const entriesDocs = Object.keys(grouped).map((accountId) => ({
      accountId,
      entries: grouped[accountId],
    }));

    await Entries.insertMany(entriesDocs);

    await ActivityLog.create({
      action: "create",
      user_id: created_by,
      details: `Created voucher ${savedVoucher.voucher_id}`,
      entity_type: "Voucher",
      entity_id: savedVoucher._id,
    });

    res.status(201).json({
      message: "Voucher created",
      newVoucher: savedVoucher,
      entries: entriesDocs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error adding voucher",
      error: error.message,
    });
  }
};

// Get all vouchers
exports.getAllVouchers = async (req, res) => {
  try {
    const {
      type,
      entries,
      is_void,
      date,
      startDate,
      endDate,
      search,
      accountid, // << Added here
      page = 1,
      limit = 25,
      sort = "created_at",
      order = "desc",
    } = req.query;

    const connection = await getDbConnection(req.headers.dbprefix);
    const Voucher = connection.model("Voucher", voucherSchema);
    const Entries = connection.model("Entries", entriesSchema);

    // Build filter object
    const filter = {};

    if (type) filter.type = type;

    if (is_void === "true") filter.is_void = true;
    else if (is_void === "false") filter.is_void = false;

    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(targetDate.getDate() + 1);
      filter.date = { $gte: targetDate, $lt: nextDay };
    } else if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (search) {
      filter.$or = [
        { voucher_id: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (accountid) {
      filter.accounts = { $in: [accountid] }; // Ensure accountid is in the voucher's accounts array
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortOption = {};
    sortOption[sort] = order === "asc" ? 1 : -1;

    const totalCount = await Voucher.countDocuments(filter);

    const vouchers = await Voucher.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    if (entries === "true") {
      const voucherIds = vouchers.map((v) => v._id);

      const allEntries = await Entries.find({
        "entries.voucherId": { $in: voucherIds },
      }).lean();

      const entriesMap = {};
      allEntries.forEach((entryDoc) => {
        entryDoc.entries.forEach((entry) => {
          const vid = String(entry.voucherId);
          if (!entriesMap[vid]) entriesMap[vid] = [];

          const existing = entriesMap[vid].find(
            (doc) => String(doc._id) === String(entryDoc._id)
          );

          if (!existing) {
            const filteredDoc = {
              ...entryDoc,
              entries: entryDoc.entries.filter(
                (e) => String(e.voucherId) === vid
              ),
            };
            entriesMap[vid].push(filteredDoc);
          }
        });
      });

      const vouchersWithEntries = vouchers.map((voucher) => ({
        ...voucher,
        entries: entriesMap[String(voucher._id)] || [],
      }));

      return res.json({
        items: vouchersWithEntries,
        totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      });
    }

    res.json({
      items: vouchers,
      totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    console.error("Error in getAllVouchers:", error);
    res.status(500).json({
      message: "Error fetching vouchers",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Get voucher by ID
exports.getVoucherById = async (req, res) => {
  try {
    const connection = await getDbConnection(req.headers.dbprefix);
    const Voucher = connection.model("Voucher", voucherSchema);
    const Entries = connection.model("Entries", entriesSchema);
    // Register Account model for population
    const Account = getModel(connection, "Account", AccountSchema);

    // Get voucher
    const voucher = await Voucher.findById(req.params.id).populate("accounts");
    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    // Fetch all documents that contain this voucherId in any sub-entry
    const entriesDocs = await Entries.find({
      "entries.voucherId": voucher._id,
    });

    // Filter entries for the exact voucher
    const filteredEntries = entriesDocs.map((entryDoc) => ({
      ...entryDoc.toObject(),
      entries: entryDoc.entries.filter(
        (entry) => String(entry.voucherId) === String(voucher._id)
      ),
    }));

    res.json({ voucher, entries: filteredEntries });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching voucher",
      error: error.message,
    });
  }
};

exports.updateVoucher = async (req, res) => {
  try {
    const connection = await getDbConnection(req.headers.dbprefix);

    const Voucher = getModel(connection, "Voucher", voucherSchema);
    const Entries = getModel(connection, "Entries", entriesSchema);
    const ActivityLog = getModel(connection, "ActivityLog", activityLogSchema);

    const { id } = req.params;
    const { date, transactions, type, metadata } = req.body;
    const updated_by = req.user?.id;

    const existingVoucher = await Voucher.findById(id);
    if (!existingVoucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    // Update accounts list from transactions
    const accounts = [...new Set(transactions.map((txn) => txn.account))];

    // Update Voucher fields
    existingVoucher.date = date || existingVoucher.date;
    existingVoucher.type = type || existingVoucher.type;
    existingVoucher.accounts = accounts;
    existingVoucher.updated_by = updated_by;
    existingVoucher.metadata = metadata || existingVoucher.metadata;
    // existingVoucher.file = req.file ? req.file.path : existingVoucher.file;

    const updatedVoucher = await existingVoucher.save();

    // Delete old entries for this voucher
    await Entries.updateMany(
      { "entries.voucherId": updatedVoucher._id },
      {
        $pull: { entries: { voucherId: updatedVoucher._id } },
      }
    );

    // Clean up entries with no remaining subdocuments
    await Entries.deleteMany({ entries: { $size: 0 } });

    // Group new entries by account
    const grouped = {};
    transactions.forEach((txn) => {
      if (!grouped[txn.account]) grouped[txn.account] = [];
      grouped[txn.account].push({
        voucherId: updatedVoucher._id,
        type,
        description: txn.description,
        credit: txn.credit,
        debit: txn.debit,
        isVoid: false,
        isPosted: true,
        // file: txn.file || "",
        date: date,
        metadata: txn.metadata || {},
        addedBy: updated_by,
        updatedBy: updated_by,
      });
    });

    // Insert updated entries
    const entriesDocs = Object.keys(grouped).map((accountId) => ({
      accountId,
      entries: grouped[accountId],
      addedBy: updated_by,
      updatedBy: updated_by,
    }));

    await Entries.insertMany(entriesDocs);

    // Log activity
    await ActivityLog.create({
      action: "update",
      user_id: updated_by,
      details: `Updated voucher ${updatedVoucher.voucher_id}`,
      entity_type: "Voucher",
      entity_id: updatedVoucher._id,
    });

    res.status(200).json({
      message: "Voucher updated successfully",
      updatedVoucher,
      entries: entriesDocs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error updating voucher",
      error: error.message,
    });
  }
};

// Void a voucher
exports.toggleVoucherVoid = async (req, res) => {
  try {
    const connection = await getDbConnection(req.headers.dbprefix);

    const Voucher = getModel(connection, "Voucher", voucherSchema);
    const Entries = getModel(connection, "Entries", entriesSchema);
    const ActivityLog = getModel(connection, "ActivityLog", activityLogSchema);

    const { voucherId } = req.params;
    const { is_void } = req.body;
    const userId = req.user?.id;

    // Validate voucher
    const existingVoucher = await Voucher.findById(voucherId);
    if (!existingVoucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    // Update is_void on voucher
    existingVoucher.is_void = is_void;
    existingVoucher.updated_by = userId;
    existingVoucher.updated_at = new Date();

    const updatedVoucher = await existingVoucher.save();

    // Update is_void inside entries array where voucherId matches
    await Entries.updateMany(
      { "entries.voucherId": updatedVoucher._id },
      {
        $set: {
          "entries.$[elem].isVoid": is_void,
        },
      },
      {
        arrayFilters: [{ "elem.voucherId": updatedVoucher._id }],
      }
    );

    // Log activity
    await ActivityLog.create({
      action: is_void ? "void" : "unvoid",
      user_id: userId,
      details: `${is_void ? "Voided" : "Unvoided"} voucher ${
        updatedVoucher.voucher_id
      }`,
      entity_type: "Voucher",
      entity_id: updatedVoucher._id,
      timestamp: new Date(),
    });

    res.status(200).json({
      message: `Voucher ${is_void ? "voided" : "unvoided"} successfully`,
      updatedVoucher,
    });
  } catch (error) {
    console.error("Void/Unvoid Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteVoucher = async (req, res) => {
  try {
    const connection = await getDbConnection(req.headers.dbprefix);
    const Voucher = connection.model("Voucher", voucherSchema);
    const Entries = connection.model("Entries", entriesSchema);
    const ActivityLog = connection.model("ActivityLog", activityLogSchema);

    const { id } = req.params;

    // Find the voucher first
    const voucher = await Voucher.findById(id);
    if (!voucher) return res.status(404).json({ message: "Voucher not found" });

    // Delete the voucher
    await Voucher.findByIdAndDelete(id);

    // Remove all entries related to this voucher
    await Entries.updateMany(
      { "entries.voucher_id": id },
      { $pull: { entries: { voucher_id: id } } }
    );

    // Log deletion
    await ActivityLog.create({
      action: "delete",
      user_id: req.user?._id,
      details: `Deleted voucher ${voucher.voucher_id}`,
      entity_type: "Voucher",
      entity_id: voucher._id,
      timestamp: new Date(),
    });

    res.json({ message: "Voucher deleted successfully" });
  } catch (error) {
    console.error("Delete voucher error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.entriesTotal = async (req, res) => {
  try {
    const connection = await getDbConnection(req.headers.dbprefix);
    const Entries = connection.model("Entries", entriesSchema);

    const accountId = req.params.id;

    // Optional: accept date range (future use)
    // const { startDate, endDate } = req.query;

    const entriesDocs = await Entries.find({
      accountId,
      isDeleted: false, // ignore soft-deleted docs
    });

    let totalDebit = 0;
    let totalCredit = 0;

    for (const doc of entriesDocs) {
      for (const entry of doc.entries) {
        // ✅ Exclude voided entries
        if (entry.isVoid) continue;

        totalDebit += entry.debit || 0;
        totalCredit += entry.credit || 0;
      }
    }

    const difference = totalDebit - totalCredit;

    res.json({
      totalDebit,
      totalCredit,
      difference,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error calculating totals",
      error: error.message,
    });
  }
};

exports.getAccountWiseTotals = async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const toDate = new Date(date);

    // Get database connection using the prefix from headers
    const connection = await getDbConnection(req.headers.dbprefix);
    const Entries = connection.model("Entries", entriesSchema);

    // Fetch all entries where at least one sub-entry is on or before the given date
    const entryDocs = await Entries.find({
      "entries.date": { $lte: toDate },
      isDeleted: false,
    });

    const totals = {};

    for (const doc of entryDocs) {
      const accountId = doc.accountId?.toString(); // 🔑 Correct access

      // Initialize if not already
      if (!totals[accountId]) {
        totals[accountId] = {
          account_id: accountId,
          total_debit: 0,
          total_credit: 0,
          difference: 0,
        };
      }

      // Loop through valid sub-entries
      for (const entry of doc.entries) {
        if (entry.isVoid || new Date(entry.date) > toDate) continue;

        totals[accountId].total_debit += entry.debit || 0;
        totals[accountId].total_credit += entry.credit || 0;
      }

      // Finalize difference
      totals[accountId].difference =
        totals[accountId].total_debit - totals[accountId].total_credit;
    }

    return res.json(Object.values(totals));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error calculating account-wise totals",
      error: error.message,
    });
  }
};

// Get opening balance vouchers for specific account
exports.getOpeningBalanceByAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: "Account ID is required",
      });
    }

    const connection = await Promise.race([
      getDbConnection(req.headers.dbprefix),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database connection timeout")), 10000)
      ),
    ]);

    const Voucher = getModel(connection, "Voucher", voucherSchema);
    const Entries = getModel(connection, "Entries", entriesSchema);
    const Account = getModel(connection, "Account", AccountSchema);

    const voucher = await Voucher.findOne({
      type: "openingbalance",
      accounts: accountId,
      is_deleted: false,
      is_void: false,
    })
      .populate("accounts")
      .populate("assignedTo", "name email")
      .sort({ date: -1, created_at: -1 });

    if (!voucher) {
      return res.json({
        success: true,
        message: `No opening balance voucher found for account ${accountId}`,
        vouchers: [],
        entries: [],
        total: 0,
      });
    }

    const entriesDocs = await Entries.find({
      "entries.voucherId": voucher._id,
    });

    const entriesByVoucher = {};
    entriesDocs.forEach((entryDoc) => {
      entryDoc.entries.forEach((entry) => {
        const voucherId = String(entry.voucherId);
        if (voucherId === String(voucher._id)) {
          if (!entriesByVoucher[voucherId]) {
            entriesByVoucher[voucherId] = [];
          }
          entriesByVoucher[voucherId].push({
            ...entryDoc.toObject(),
            entries: [entry],
          });
        }
      });
    });

    const vouchersWithEntries = [
      {
        voucher: voucher.toObject(),
        entries: entriesByVoucher[String(voucher._id)] || [],
      },
    ];

    res.json({
      success: true,
      message: `Opening balance voucher for account retrieved successfully`,
      vouchers: vouchersWithEntries,
      total: 1,
    });

  } catch (error) {
    if (error.message.includes("ETIMEOUT") || error.message.includes("timeout")) {
      return res.status(503).json({
        success: false,
        message: "Database connection timeout. Please try again.",
        error: "Connection timeout",
      });
    }

    if (error.message.includes("ENOTFOUND") || error.message.includes("querySrv")) {
      return res.status(503).json({
        success: false,
        message: "Unable to connect to database. Please check connection.",
        error: "Database connection failed",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error fetching opening balance voucher by account",
      error: error.message,
    });
  }
};


// Utility function
function getVoucherCode(type) {
  return (
    {
      cash: "CV",
      journal: "JV",
      openingbalance: "OBV",
      visa: "VV",
      receipt: "RV",
      hotel: "HV",
      ticket: "TV",
      other: "OTV",
      purchase: "PV",
      sales: "SV",
    }[type] || "XV"
  );
}
