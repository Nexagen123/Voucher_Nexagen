const getDbConnection = require("../utils/dbConnector.js");
const { salesVoucherSchema } = require("../models/salesVoucher.model.js");
const { entriesSchema } = require("../models/entries.model");
const { activityLogSchema } = require("../models/activity.model");
const getModel = require("../utils/getModel");
const { accountSchema } = require("../models/account");
const mongoose = require("mongoose");
exports.addSalesVoucher = async (req, res) => {
  try {
    console.log("Adding Sales Voucher");

    const dbprefix = req.headers.dbprefix;
    const connection = await getDbConnection(dbprefix);

    const SalesVoucher = getModel(connection, "SalesVoucher", salesVoucherSchema);
    const Entries = getModel(connection, "Entries", entriesSchema);
    const ActivityLog = getModel(connection, "ActivityLog", activityLogSchema);

    const { date, party, carton, closing_balance, items, type, metadata } = req.body;
    const created_by = "6854f7e5b549c50f7e34ac75"; // Replace with `req.user?.id` in production
    console.log("Creating Sales Voucher:", {
      date,
      party,
      carton,
      closing_balance,
      items,
      type,
      metadata,
    });
    // Get voucher number
    let nextVoucherNumber = 1;
    const latest = await SalesVoucher.find({ type }).sort({ created_at: -1 }).limit(1);
    if (latest.length) {
      const last = parseInt(latest[0].voucher_id.split("-")[1]);
      if (!isNaN(last)) nextVoucherNumber = last + 1;
    }

    const voucherCode = "SV"; // Sales Voucher prefix
    let newVoucherId = `${voucherCode}-${nextVoucherNumber}`;
    while (await SalesVoucher.findOne({ voucher_id: newVoucherId })) {
      nextVoucherNumber++;
      newVoucherId = `${voucherCode}-${nextVoucherNumber}`;
    }

    // Create and save the voucher
    const newVoucher = new SalesVoucher({
      voucher_id: newVoucherId,
      date,
      type,
      party,
      carton,
      closing_balance,
      created_by,
      updated_by: created_by,
      items,
      is_void: false,
      is_posted: true,
      metadata: metadata || {},
    });

    const savedVoucher = await newVoucher.save();

    // Prepare entries (optional)
    const entries = items?.map((item) => ({
      accountId: party,
      entries: [{
        voucherId: savedVoucher._id,
        type,
        description: item.detail,
        credit: item.credit,
        debit: item.debit,
        isVoid: false,
        isPosted: true,
        date,
        metadata: item.metadata || {},
      }],
    }));

    await Entries.insertMany(entries);

    await ActivityLog.create({
      action: "create",
      user_id: created_by,
      details: `Created Sales Voucher ${savedVoucher.voucher_id}`,
      entity_type: "SalesVoucher",
      entity_id: savedVoucher._id,
    });

    res.status(201).json({
      message: "Sales Voucher created successfully",
      voucher: savedVoucher,
      entries,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating Sales Voucher", error: error.message });
  }
};




exports.getAllSalesVouchers = async (req, res) => {
  try {
    const {
      type,
      entries,
      is_void,
      date,
      startDate,
      endDate,
      search,
      party,
      accountid,
      page = 1,
      limit = 25,
      sort = "created_at",
      order = "desc",
    } = req.query;

    const connection = await getDbConnection(req.headers.dbprefix);

    // ✅ Register all necessary models
    const SalesVoucher = getModel(connection, "SalesVoucher", salesVoucherSchema);
    const Entries = getModel(connection, "Entries", entriesSchema);
    
    // Fix: Register Account model properly
    let Account;
    try {
      // Try to get the model if it's already registered
      Account = connection.model("Account");
    } catch (error) {
      // If not registered, get the schema from your account.js module
      // and register it with this connection
      const AccountModel = require("../models/account");
      // Extract schema from the model
      const accountSchema = AccountModel.schema;
      // Register with this connection
      Account = connection.model("Account", accountSchema);
    }

    console.log("Fetching Sales Vouchers with filters:");


    // 🔎 Build dynamic filter
    const filter = { type: "Sales" };

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
        { "items.detail": { $regex: search, $options: "i" } }, // optional match on item detail
      ];
    }

    if (party) {
      filter.party = party;
      console.log("Filtering by party:", party);
    }

    if (accountid) {
      filter.accounts = { $in: [accountid] };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortOption = {};
    sortOption[sort] = order === "asc" ? 1 : -1;

    // 🚀 Fetch vouchers WITH party populated
    const vouchers = await SalesVoucher.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate({
        path: "party",
        select: "name phone email", // ✅ Correct usage
      })
      .lean();

    // 🧾 Handle entries if requested
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

      const totalCount = await SalesVoucher.countDocuments(filter);
      return res.json({
        items: vouchersWithEntries,
        totalCount: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      });
    }

    // 🟩 Basic response without entries
    const totalCount = await SalesVoucher.countDocuments(filter);
    res.json({
      items: vouchers,
      totalCount: totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    console.error("Error in getAllSalesVouchers:", error);
    res.status(500).json({
      message: "Error fetching sales vouchers",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};



