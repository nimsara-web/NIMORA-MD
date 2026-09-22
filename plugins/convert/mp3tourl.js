const { uploadToCatbox, downloadQuoted } = require('./_helper');

module.exports = {
    name: 'mp3tourl',
    aliases: ['audiotourl'],
    category: 'convert',
    description: 'Convert audio to URL',

    async execute(ctx) {
        const { reply, FOOTER } = ctx;

        const media = await downloadQuoted(ctx);
        if (!media || media.type !== 'audioMessage') {
            return reply(`⚠️ Reply to an audio message!${FOOTER}`);
        }

        await reply(`⏳ Uploading...${FOOTER}`);

        try {
            const url = await uploadToCatbox(media.buffer, 'audio.mp3');
            if (!url) return reply(`❌ Upload failed!${FOOTER}`);
            await reply(`🔗 *AUDIO URL*\n\n${url}${FOOTER}`);
        } catch (e) {
            await reply(`❌ Error: ${e.message}${FOOTER}`);
        }
    }
};
