const { convertToSticker, getQuotedMedia } = require('./_helper');

module.exports = {
    name: 'sticker',
    aliases: ['s', 'stiker', 'stikerpack'],
    category: 'sticker',
    description: 'Convert image/video to sticker',

    async execute(ctx) {
        const { reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const media = await getQuotedMedia(ctx);
        if (!media) return reply(`⚠️ Reply to an image/video with .sticker${FOOTER}`);

        // If already a sticker, re-send it
        if (media.type === 'stickerMessage') {
            await socket.sendMessage(sender, { sticker: media.buffer }, { quoted: msg });
            return;
        }

        if (!['imageMessage', 'videoMessage'].includes(media.type)) {
            return reply(`⚠️ Reply to image or video only!${FOOTER}`);
        }

        await reply(`🎨 Creating sticker... ⏳${FOOTER}`);

        try {
            const isVideo = media.type === 'videoMessage';
            const sticker = await convertToSticker(media.buffer, isVideo);

            if (!sticker || sticker.length === 0) {
                return reply(`❌ Sticker conversion failed!${FOOTER}`);
            }

            await socket.sendMessage(sender, {
                sticker
            }, { quoted: msg });

            console.log(`[STICKER] ✅ ${isVideo ? 'video' : 'image'} → ${sticker.length} bytes`);
        } catch (e) {
            console.error('[STICKER]', e);
            await reply(`❌ Sticker failed: ${e.message}${FOOTER}`);
        }
    }
};
