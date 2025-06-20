// utils/dbConnector.js
const mongoose = require("mongoose");

// Store all tenant connections
const connections = {};

/**
 * Returns a Mongoose connection for a given tenant (dbprefix).
 * Reuses existing connections or creates a new one if needed.
 *
 * @param {string} dbprefix - The database name (tenant identifier).
 * @returns {Promise<mongoose.Connection>}
 */
const getDbConnection = async (dbprefix) => {
  if (!dbprefix) {
    throw new Error("dbprefix (database name) is required.");
  }

  if (connections[dbprefix]) {
    return connections[dbprefix];
  }

  // Replace with your actual MongoDB URI prefix
  const DB_URI = `mongodb://127.0.0.1:27017/${dbprefix}`;

  // Optional: advanced connection options
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  // Create a new connection instance
  const connection = await mongoose.createConnection(DB_URI, options).asPromise();

  console.log(`🟢 Connected to DB: ${dbprefix}`);

  // Cache and return the connection
  connections[dbprefix] = connection;
  return connection;
};

module.exports = getDbConnection;
