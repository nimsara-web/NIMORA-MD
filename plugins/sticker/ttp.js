const axios = require('axios');
const { convertToSticker } = require('./_helper');

module.exports = {
    name: 'ttp',
    aliases: ['textimage', 'staticsticker'],
    category: 'sticker',
    description: 'Static text sticker',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const text = args.join(' ');
        if (!text) return reply(`⚠️ Usage: .ttp [text]${FOOTER}`);

        await reply(`🎨 Creating text sticker... ⏳${FOOTER}`);

        try {
            const url = `https://api.siputzx.my.id/api/m/ttp?text=${encodeURIComponent(text)}`;
            const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
            const buffer = Buffer.from(res.data);

            if (buffer.length < 500) return reply(`❌ Failed to generate!${FOOTER}`);

            const sticker = await convertToSticker(buffer, false);

            await socket.sendMessage(sender, { sticker }, { quoted: msg });
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
