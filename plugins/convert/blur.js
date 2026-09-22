const { downloadQuoted } = require('./_helper');
const sharp = require('sharp');

module.exports = {
    name: 'blur',
    aliases: ['blurimg'],
    category: 'convert',
    description: 'Blur an image',

    async execute(ctx) {
        const { reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const media = await downloadQuoted(ctx);
        if (!media || media.type !== 'imageMessage') {
            return reply(`⚠️ Reply to an image!${FOOTER}`);
        }

        await reply(`🌀 Blurring... ⏳${FOOTER}`);

        try {
            const blurred = await sharp(media.buffer).blur(15).toBuffer();

            await socket.sendMessage(sender, {
                image: blurred,
                caption: `🌀 *Blurred Image*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });
        } catch (e) {
            await reply(`❌ Blur failed!${FOOTER}`);
        }
    }
};
