require('dotenv').config();
const express = require('express');
const cors = require('cors');
const votingRoutes = require('./src/routes/votingRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', votingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running cleanly on port ${PORT}`);
});