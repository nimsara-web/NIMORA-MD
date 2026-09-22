const axios = require('axios');
const FormData = require('form-data');
const { downloadMediaMessage } = require('baileys');
const pino = require('pino');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function uploadToCatbox(buffer, filename = 'file.bin') {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename });
    const res = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders(), timeout: 60000 });
    return res.data?.trim() || null;
}

async function downloadQuoted(ctx) {
    const quoted = ctx.msg.message?.extendedTextMessage?.contextInfo;
    if (!quoted?.quotedMessage) return null;

    const qMsg = ctx.unwrapMessage(quoted.quotedMessage);
    const mediaInfo = ctx.getMediaType(qMsg);
    if (!mediaInfo) return null;

    const { type, data } = mediaInfo;
    const buffer = await downloadMediaMessage(
        { key: { remoteJid: quoted.remoteJid || ctx.sender, id: quoted.stanzaId, participant: quoted.participant }, message: { [type]: data } },
        'buffer', {}, { logger: pino({ level: 'silent' }) }
    );
    return { buffer, type, data };
}

module.exports = { uploadToCatbox, downloadQuoted, execPromise, fs, path };
