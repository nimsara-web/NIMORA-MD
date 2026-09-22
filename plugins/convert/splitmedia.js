const { downloadQuoted } = require('./_helper');

module.exports = {
    name: 'splitmedia',
    aliases: ['split'],
    category: 'convert',
    description: 'Split multi-media into separate files',

    async execute(ctx) {
        const { reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const media = await downloadQuoted(ctx);
        if (!media) return reply(`⚠️ Reply to media!${FOOTER}`);

        try {
            // Re-send the media as-is (basic split behavior)
            const type = media.type;
            if (type === 'videoMessage') {
                await socket.sendMessage(sender, {
                    video: media.buffer,
                    caption: `📹 *Split Media 1/1*${FOOTER}`,
                    contextInfo: channelContext
                }, { quoted: msg });
            } else if (type === 'imageMessage') {
                await socket.sendMessage(sender, {
                    image: media.buffer,
                    caption: `🖼️ *Split Media 1/1*${FOOTER}`,
                    contextInfo: channelContext
                }, { quoted: msg });
            }
        } catch (e) {
            await reply(`❌ Split failed!${FOOTER}`);
        }
    }
};
