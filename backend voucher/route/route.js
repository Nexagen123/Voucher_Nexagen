const express = require('express');
const { gatePassController, getAllGatePassController, getAllCategoryController, categoryController, stockController, getAllStockController, getAllUserController, getAllAccountController, accountController, userController } = require('../controller/controller');
const router = express.Router();

router.get('/get', (req, res) => {
  res.send('Welcome to the API');
});

// gate pass routes
router.post('/gatepass', gatePassController);
router.get('/allgatepass', getAllGatePassController);

// inventory category routes
router.post('/createcategory', categoryController);
router.get('/showallcategory', getAllCategoryController);
// inventory stock routes
router.post('/createstock',stockController)
router.get('/showallstock', getAllStockController);

// for mock data only
router.post('/createuser',userController)
router.post('/createaccount',accountController)
router.get('/showalluser', getAllUserController);
router.get('/showallaccount', getAllAccountController);


module.exports = router;