const { uploadToCatbox, downloadQuoted } = require('./_helper');

module.exports = {
    name: 'img2url',
    aliases: ['tourl', 'url'],
    category: 'convert',
    description: 'Convert media to URL',

    async execute(ctx) {
        const { reply, FOOTER } = ctx;

        const media = await downloadQuoted(ctx);
        if (!media) return reply(`⚠️ Reply to media!${FOOTER}`);

        await reply(`⏳ Uploading...${FOOTER}`);

        try {
            const ext = media.type.replace('Message', '');
            const url = await uploadToCatbox(media.buffer, `media.${ext}`);
            if (!url) return reply(`❌ Upload failed!${FOOTER}`);
            await reply(`🔗 *MEDIA URL*\n\n${url}${FOOTER}`);
        } catch (e) {
            await reply(`❌ Error: ${e.message}${FOOTER}`);
        }
    }
};
