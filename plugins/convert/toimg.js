const { downloadQuoted } = require('./_helper');

module.exports = {
    name: 'toimg',
    aliases: ['toimage'],
    category: 'convert',
    description: 'Convert sticker to image',

    async execute(ctx) {
        const { reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const media = await downloadQuoted(ctx);
        if (!media || media.type !== 'stickerMessage') {
            return reply(`⚠️ Reply to a sticker!${FOOTER}`);
        }

        await reply(`🖼️ Converting... ⏳${FOOTER}`);

        try {
            await socket.sendMessage(sender, {
                image: media.buffer,
                caption: `🖼️ *Sticker → Image*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });
        } catch (e) {
            await reply(`❌ Conversion failed!${FOOTER}`);
        }
    }
};
