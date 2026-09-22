/**
 * Project: NIMORA MD - Main Server
 * Creator: Nimsara
 * Website: https://nimsara-official.vercel.app/
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const config = require('./config');

// ==========================================
// 🛡️ GLOBAL ERROR HANDLERS
// ==========================================
process.on('uncaughtException', (err) => {
    console.error('❌ Caught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// ==========================================
// 🚀 EXPRESS APP
// ==========================================
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '/')));

// ==========================================
// 📦 MONGODB CONNECTION
// ==========================================
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI is not set in .env file!');
    process.exit(1);
}

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("📦 Connected to MongoDB successfully!");
}).catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
});

// ==========================================
// 🛣️ ROUTES
// ==========================================
const pairRouter = require('./pair');
app.use('/pair', pairRouter);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// Ping endpoint (keep Render awake)
app.get('/ping', (req, res) => {
    res.send('Pong! NIMORA MD is active 🚀');
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        bot: config.botName,
        creator: config.ownerName,
        time: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('404 - Not Found');
});

// ==========================================
// 🚀 START SERVER
// ==========================================
app.listen(PORT, () => {
    console.log(`\n🚀 ${config.botName} Server is running on port ${PORT}`);
    console.log(`👑 Creator: ${config.ownerName}`);
    console.log(`🌐 Website: ${config.websiteUrl}\n`);
});

module.exports = app;
