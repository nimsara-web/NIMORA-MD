const axios = require('axios');
const FormData = require('form-data');
const { downloadMediaMessage } = require('baileys');
const pino = require('pino');

module.exports = {
    name: 'tgup',
    aliases: ['tgupload'],
    category: 'download',
    description: 'Upload media (returns URL)',

    async execute(ctx) {
        const { socket, msg, reply, sender, getMediaType, unwrapMessage, channelContext, FOOTER } = ctx;

        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted?.quotedMessage) {
            return reply(`⚠️ Reply to media with .tgup${FOOTER}`);
        }

        const qMsg = unwrapMessage(quoted.quotedMessage);
        const mediaInfo = getMediaType(qMsg);
        if (!mediaInfo) return reply(`❌ Reply to media!${FOOTER}`);

        await reply(`⏳ Uploading...${FOOTER}`);

        try {
            const { type, data } = mediaInfo;
            const buffer = await downloadMediaMessage(
                { key: { remoteJid: quoted.remoteJid || sender, id: quoted.stanzaId, participant: quoted.participant }, message: { [type]: data } },
                'buffer', {}, { logger: pino({ level: 'silent' }) }
            );

            const form = new FormData();
            form.append('reqtype', 'fileupload');
            form.append('fileToUpload', buffer, { filename: 'file.bin' });

            const res = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders() });

            if (res.data && res.data.startsWith('http')) {
                await reply(`✅ *Uploaded!*\n\n🔗 ${res.data.trim()}${FOOTER}`);
            } else {
                await reply(`❌ Upload failed!${FOOTER}`);
            }
        } catch (e) {
            await reply(`❌ Error: ${e.message}${FOOTER}`);
        }
    }
};
