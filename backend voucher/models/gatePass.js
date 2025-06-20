const mongoose = require("mongoose");

const productRowSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    productName: { type: String, required: true },
    detail: { type: String, required: true },
    qty: { type: String, required: true }, // number or ""
    unit: { type: String, required: true },
  },
  { _id: false }
);

const gatePassSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    party: { type: String, required: true },
    orderNo: { type: String, required: true },
    type: { type: String, required: true },
    rows: { type: [productRowSchema], required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GatePass", gatePassSchema);