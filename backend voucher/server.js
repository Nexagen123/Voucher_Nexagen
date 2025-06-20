const express  = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const index = require('./route/route')
const voucherRoutes = require('./route/voucherRoutes'); // 👈 add this
const dbConnection = require('./config/dbConnection')

// Load environment variables from .env file
dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

// Middleware
app.use(cors());
dbConnection(); // Connect to the database
app.use(express.json());

// Example route
app.use('/', index)
app.use('/vouchers', voucherRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})