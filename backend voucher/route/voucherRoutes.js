const express = require("express");
const router = express.Router();
// const verifyToken = require("../middleware/auth");
const {
  addVoucher,
  getVoucherById,
  getAllVouchers,
  updateVoucher,
  toggleVoucherVoid,
  deleteVoucher,
  entriesTotal,
  getAccountWiseTotals,
  getOpeningBalanceByAccount,
} = require("../controller/voucherController");
// const multer = require("multer");
// const upload = multer({ storage: multer.memoryStorage() });

// Define routes
router.post("/addvoucher", 
  // verifyToken, upload.array("files"), 
  addVoucher);
router.get("/getvoucher",
  // verifyToken, 
  getAllVouchers);
router.get("/:id", 
  /*verifyToken,*/ 
  getVoucherById);
router.put("/:id", 
  // verifyToken, 
  // upload.single("file"), 
  updateVoucher);
router.patch("/:voucherId/void", 
  // verifyToken, 
  toggleVoucherVoid);
router.delete("/:id", 
  // verifyToken, 
  deleteVoucher);
router.get("/total/:id", 
  // verifyToken, 
  entriesTotal);
router.post("/get-account-wise-totals", 
  // verifyToken, 
  getAccountWiseTotals);
router.get(
  "/getOpeningVoucher/:accountId",
  // verifyToken,
  getOpeningBalanceByAccount
);

module.exports = router;
