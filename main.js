/**
 * Project: NIMORA MD - Manual Bot Starter
 * Usage: node main.js 94784280074
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { StartBot } = require('./pair');

const number = process.argv[2];

if (!number) {
    console.log('❌ Usage: node main.js [number]');
    process.exit(1);
}

(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 MongoDB connected');
    await StartBot(number);
})();
