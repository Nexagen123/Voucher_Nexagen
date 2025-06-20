const mongoose = require('mongoose');
const colors = require('colors');

const dbConnection = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Database connected successfully: ${conn.connection.host}`.bgMagenta.white);
    } catch (error) {
        console.error(`Error in DB Connection: ${error.message}`.bgRed.white);
    }
}

module.exports = dbConnection;
