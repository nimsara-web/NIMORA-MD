const axios = require('axios');
const { convertToSticker } = require('./_helper');

module.exports = {
    name: 'attp',
    aliases: ['textsticker', 'animatedtext'],
    category: 'sticker',
    description: 'Animated text sticker',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const text = args.join(' ');
        if (!text) return reply(`⚠️ Usage: .attp [text]${FOOTER}`);

        await reply(`🎨 Creating animated text sticker... ⏳${FOOTER}`);

        try {
            const url = `https://api.siputzx.my.id/api/m/attp?text=${encodeURIComponent(text)}`;
            const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
            const buffer = Buffer.from(res.data);

            if (buffer.length < 500) return reply(`❌ Failed to generate!${FOOTER}`);

            const sticker = await convertToSticker(buffer, true);

            await socket.sendMessage(sender, { sticker }, { quoted: msg });
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
