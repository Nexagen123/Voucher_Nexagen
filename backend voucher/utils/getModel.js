/**
 * Returns an existing model if already registered on the given connection,
 * otherwise creates and registers it using the provided schema.
 *
 * @param {mongoose.Connection} connection - The mongoose connection object.
 * @param {string} modelName - The name of the model.
 * @param {mongoose.Schema} schema - The mongoose schema object.
 * @returns {mongoose.Model} - The mongoose model.
 */
const getModel = (connection, modelName, schema) => {
  if (connection.models[modelName]) {
    return connection.models[modelName];
  }

  return connection.model(modelName, schema);
};

module.exports = getModel;
