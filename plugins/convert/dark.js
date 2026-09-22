const { downloadQuoted } = require('./_helper');
const sharp = require('sharp');

module.exports = {
    name: 'dark',
    aliases: ['darkimg'],
    category: 'convert',
    description: 'Darken an image',

    async execute(ctx) {
        const { reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const media = await downloadQuoted(ctx);
        if (!media || media.type !== 'imageMessage') {
            return reply(`⚠️ Reply to an image!${FOOTER}`);
        }

        await reply(`🌑 Darkening... ⏳${FOOTER}`);

        try {
            const darkened = await sharp(media.buffer).modulate({ brightness: 0.5 }).toBuffer();

            await socket.sendMessage(sender, {
                image: darkened,
                caption: `🌑 *Darkened Image*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });
        } catch (e) {
            await reply(`❌ Dark failed!${FOOTER}`);
        }
    }
};
