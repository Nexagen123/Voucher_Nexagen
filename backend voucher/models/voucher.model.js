// models/voucher.model.js
const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    voucher_id: { type: String, unique: true },
    date: { type: Date, required: true },
    type: { type: String, required: true },
    created_by: { type: String, default: "admin" },
    updated_by: { type: String, default: "admin" },
    accounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
      },
    ],
    is_void: { type: Boolean, default: false },
    is_posted: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    branch: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = { voucherSchema };
