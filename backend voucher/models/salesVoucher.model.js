const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  dzn: { type: Number, default: 0 },
  pcs: { type: Number, default: 0 },
  rate: { type: Number, default: 0 },
  category: { type: String },
  detail: { type: String },
  disc: { type: Number, default: 0 },
  disc_percent: { type: Number, default: 0 },
  ex_disc_percent: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  metadata: { type: Object, default: {} }
});

const salesVoucherSchema = new mongoose.Schema({
  voucher_id: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  type: { type: String, required: true },
  party: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true
  },
  carton: { type: Number, default: 0 },
  closing_balance: { type: Number, default: 0 },
  items: [itemSchema],
  is_void: { type: Boolean, default: false },
  is_posted: { type: Boolean, default: true },
  metadata: { type: Object, default: {} },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = { salesVoucherSchema };
