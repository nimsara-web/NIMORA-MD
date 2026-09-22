const fs = require('fs-extra');
const path = require('path');
const config = require('../../config');

const DATA_DIR = path.join(__dirname, '../../data');

async function ensureDataDir() {
    await fs.ensureDir(DATA_DIR);
}

async function readJson(filename, fallback = {}) {
    await ensureDataDir();
    const file = path.join(DATA_DIR, filename);
    try {
        if (await fs.pathExists(file)) {
            return await fs.readJson(file);
        }
    } catch (e) {}
    return fallback;
}

async function writeJson(filename, data) {
    await ensureDataDir();
    const file = path.join(DATA_DIR, filename);
    await fs.writeJson(file, data, { spaces: 2 });
    return true;
}

module.exports = { readJson, writeJson, ensureDataDir, DATA_DIR };
