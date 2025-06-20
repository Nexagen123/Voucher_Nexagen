const express = require("express");
const router = express.Router();
// const verifyToken = require("../middleware/auth");
const {
  addSalesVoucher,
  getSalesVoucherById,
  getAllSalesVouchers,
  updateSalesVoucher,
  toggleSalesVoucherVoid,
  deleteSalesVoucher,
  entriesTotal,
  getAccountWiseTotals,
  getOpeningBalanceByAccount,
} = require("../controller/salesVoucherController");
// const multer = require("multer");
// const upload = multer({ storage: multer.memoryStorage() });

// Define routes
router.post("/addSalesVoucher", 
  // verifyToken, upload.array("files"), 
  addSalesVoucher);
router.get("/getSalesVouchers",
  // verifyToken, 
  getAllSalesVouchers);
// router.get("/sales/:id", 
//   /*verifyToken,*/ 
//   getSalesVoucherById);
// router.put("/sales/:id", 
//   // verifyToken, 
//   // upload.single("file"), 
//   updateSalesVoucher);
// router.patch("/sales/:voucherId/void", 
//   // verifyToken, 
//   toggleSalesVoucherVoid);
// router.delete("/sales/:id", 
//   // verifyToken, 
//   deleteSalesVoucher);
// router.get("/sales/total/:id", 
//   // verifyToken, 
//   entriesTotal);
// router.post("/sales/get-account-wise-totals", 
//   // verifyToken, 
//   getAccountWiseTotals);
// router.get(
//   "/sales/getOpeningVoucher/:accountId",
//   // verifyToken,
//   getOpeningBalanceByAccount
// );

module.exports = router;
