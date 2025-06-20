const mongoose = require("mongoose");

// Entry subdocument
const EntrySchema = new mongoose.Schema(
  {
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      required: true,
    },
    type: {
      type: String,
      required: true,
      default: "Voucher",
    },
    credit: Number,
    debit: Number,
    description: {
      type: String,
      required: true,
    },
    chequeNo: String,
    file: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    date: {
      type: Date,
      default: Date.now,
    },
    isVoid: {
      type: Boolean,
      default: false,
    },
    isPosted: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: String,
      default: "admin",
    },
    updatedBy: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

const entriesSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    entries: [EntrySchema],
    isDeleted: { type: Boolean, default: false },
    branch: String,
    addedBy: { type: String, default: "admin" },
    updatedBy: { type: String, default: "admin" },
  },
  {
    timestamps: true,
  }
);

module.exports = { entriesSchema }; // ✅ Export ONLY schema
