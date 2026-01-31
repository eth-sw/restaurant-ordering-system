require('dotenv').config(); // Load variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

app.get('/api/status', (req, res) => {
    res.json({ message: "Backend is running and DB is connected!" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});