const { convertToSticker, getQuotedMedia } = require('./_helper');

module.exports = {
    name: 'steal',
    aliases: ['take', 'stealsticker'],
    category: 'sticker',
    description: 'Steal sticker with custom pack name',

    async execute(ctx) {
        const { reply, socket, msg, sender, args, channelContext, FOOTER } = ctx;

        const media = await getQuotedMedia(ctx);
        if (!media || media.type !== 'stickerMessage') {
            return reply(`⚠️ Reply to a sticker with .steal [packname|author]${FOOTER}`);
        }

        const packArg = args.join(' ') || 'NIMORA MD|Nimsara';
        const [packname, author] = packArg.split('|').map(s => s.trim());

        try {
            await socket.sendMessage(sender, {
                sticker: media.buffer
            }, { quoted: msg });

            await reply(`✅ *Sticker Sent!*

📦 Pack: ${packname || 'NIMORA MD'}
👤 Author: ${author || 'Nimsara'}${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
