const mongoose = require('mongoose');
const colors = require('colors');

const dbConnection = async () => {
    try {
        // Build MongoDB URI from new environment variables
        const MONGODB_URI = `${process.env.ATLAS_URI_PREFIX}/?retryWrites=true&w=majority&appName=${process.env.ATLAS_APP_NAME}`;

        const conn = await mongoose.connect(MONGODB_URI);
        console.log(`Database connected successfully: ${conn.connection.host}`.bgMagenta.white);
    } catch (error) {
        console.error(`Error in DB Connection: ${error.message}`.bgRed.white);
    }
}

module.exports = dbConnection;
