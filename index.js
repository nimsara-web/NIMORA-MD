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
    console.error('❌ [UNCAUGHT]', err.message);
    console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ [UNHANDLED] Reason:', reason);
});

// ==========================================
// 🚀 EXPRESS APP
// ==========================================
const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 🌐 MIDDLEWARE
// ==========================================
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 🎯 LARGE FILE SUPPORT (500MB)
app.use(bodyParser.json({
    limit: '500mb',
    parameterLimit: 100000
}));

app.use(bodyParser.urlencoded({
    extended: true,
    limit: '500mb',
    parameterLimit: 100000
}));

// Static files
app.use(express.static(path.join(__dirname, '/')));

// ==========================================
// ⏱️ SERVER TIMEOUT (for large file uploads)
// ==========================================
app.use((req, res, next) => {
    // 10 minutes timeout for large files
    req.setTimeout(600000);
    res.setTimeout(600000);
    next();
});

// ==========================================
// 📦 MONGODB CONNECTION
// ==========================================
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI is not set in .env file!');
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("📦 Connected to MongoDB successfully!");
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
    });

// ==========================================
// 🛣️ ROUTES
// ==========================================
const pairRouter = require('./pair');
app.use('/pair', pairRouter);

// Main website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// Ping endpoint (keep Render awake)
app.get('/ping', (req, res) => {
    res.send('Pong! NIM OFFICIAL is active 🚀');
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        bot: config.botName,
        creator: config.ownerName,
        time: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
        }
    });
});

// Sessions endpoint (for debugging)
app.get('/api/sessions', async (req, res) => {
    try {
        const Session = require('./Id');
        const all = await Session.find({});
        res.json({
            total: all.length,
            sessions: all.map(s => ({
                number: s.number,
                createdAt: s.createdAt,
                lastSeen: s.lastSeen
            }))
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('404 - Not Found');
});

// ==========================================
// 🚀 START SERVER
// ==========================================
const server = app.listen(PORT, () => {
    console.log(`\n🚀 ${config.botName} Server is running on port ${PORT}`);
    console.log(`👑 Creator: ${config.ownerName}`);
    console.log(`🌐 Website: ${config.websiteUrl}`);
    console.log(`📦 MongoDB: ${MONGO_URI ? '✅ Configured' : '❌ Missing'}`);
    console.log(`⏱️  Started: ${new Date().toLocaleString()}\n`);
});

// Increase server timeout for large files
server.timeout = 600000; // 10 minutes
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// ==========================================
// 📤 EXPORT
// ==========================================
module.exports = app;
