const { uploadToCatbox, downloadQuoted } = require('./_helper');

module.exports = {
    name: 'wame',
    aliases: ['wasticker', 'stickertowa'],
    category: 'convert',
    description: 'Convert sticker to WhatsApp-compatible image',

    async execute(ctx) {
        const { reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const media = await downloadQuoted(ctx);
        if (!media || media.type !== 'stickerMessage') {
            return reply(`⚠️ Reply to a sticker!${FOOTER}`);
        }

        try {
            await socket.sendMessage(sender, {
                image: media.buffer,
                caption: `🖼️ *WA Compatible Image*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });
        } catch (e) {
            await reply(`❌ Failed!${FOOTER}`);
        }
    }
};
