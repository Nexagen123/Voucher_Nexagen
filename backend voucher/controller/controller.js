const categorySchema = require("../models/category");
const gatePassSchema = require("../models/gatePass");
const stockSchema = require("../models/stock");
const userSchema = require("../models/user");
const accountSchema = require("../models/account");
// Create a new gate pass
// ...existing code...
exports.gatePassController = async (req, res) => {
  try {
    const { date, party, orderNo, type, rows } = req.body;

    if (!date || !party || !orderNo || !type || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).send({ message: "All fields are required and rows must be a non-empty array" });
    }

    // Validate each row
    for (const row of rows) {
      if (
        !row.id ||
        !row.productName ||
        !row.detail ||
        !row.qty ||
        !row.unit
      ) {
        return res.status(400).send({ message: "Each row must have id, productName, detail, qty, and unit" });
      }
    }

    const gatePass = await new gatePassSchema({
      date,
      party,
      orderNo,
      type,
      rows,
    }).save();

    res.status(201).send({
      success: true,
      message: "Gate pass created successfully",
      gatePass,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while adding a gate pass",
      error,
    });
    console.log(error);
  }
};
// ...existing code...
// Create a new category
exports.categoryController = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).send({ message: "Category name is required" });
    }

    const category = await new categorySchema({
      name,
    }).save();

    res.status(201).send({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while adding a category",
      error,
    });
    console.log(error);
  }
};
// Create a new stock for inventory
exports.stockController = async (req, res) => {
  try {
    const { itemName, itemCode, quantity, category, unit, rate, total } = req.body;

    if (!itemName || !itemCode || !quantity || !category || !unit || !rate || !total) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const stock = await new stockSchema({
      itemName,
      itemCode,
      quantity,
      category,
      unit,
      rate,
      total,
    }).save();

    res.status(201).send({
      success: true,
      message: "Stock created successfully",
      stock,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while adding a stock",
      error,
    });
    console.log(error);
  }
};

// Get all gate passes
exports.getAllGatePassController = async (req, res) => {
  try {
    let gatePasses = await gatePassSchema.find();
    if (gatePasses.length > 0) {
      res.send(gatePasses);
    }else{
      res.send({
        success: false,
        message: "No gate passes found"
      })
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while fetching gate passes",
      error,
    });
    console.log(error);
  }
};

// Get all categories
exports.getAllCategoryController = async (req, res) => {
  try {
    let catehory = await categorySchema.find();
    if (catehory.length > 0) {
      res.send(catehory);
    }else{
      res.send({
        success: false,
        message: "No category found"
      })
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while fetching categories",
      error,
    });
    console.log(error);
  }
};
// Get all stock
exports.getAllStockController = async (req, res) => {
  try {
    let stock = await stockSchema.find();
    if (stock.length > 0) {
      res.send(stock);
    }else{
      res.send({
        success: false,
        message: "No stock item found"
      })
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while fetching stock",
      error,
    });
    console.log(error);
  }
};

// testing purpose only 
// Create a new user
exports.userController = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).send({ message: "User name is required" });
    }

    const user = await new userSchema({
      name,
    }).save();

    res.status(201).send({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while adding a user",
      error,
    });
    console.log(error);
  }
};
// Create a new account
exports.accountController = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).send({ message: "Account name is required" });
    }

    const account = await new accountSchema({
      name,
    }).save();

    res.status(201).send({
      success: true,
      message: "account created successfully",
      account,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while adding a account",
      error,
    });
    console.log(error);
  }
};

// Get all users for testing purpose 
exports.getAllUserController = async (req, res) => {
  try {
    let user = await userSchema.find();
    if (user.length > 0) {
      res.send(user);
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while fetching user",
      error,
    });
    console.log(error);
  }
};
// Get all accounts for testing purpose 
exports.getAllAccountController = async (req, res) => {
  try {
    let account = await accountSchema.find();
    if (account.length > 0) {
      res.send(account);
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while fetching account",
      error,
    });
    console.log(error);
  }
};
