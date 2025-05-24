const express = require('express');
const route = require('./routes/router.js'); // adjust the path accordingly
require('dotenv').config();
const cors = require("cors");
const { default: mongoose } = require('mongoose');


const app = express();
app.use(cors());
app.use(express.json())
const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MONGO DB connected")
})

// Routes
app.use('/api', route);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
