const { downloadQuoted } = require('./_helper');

module.exports = {
    name: 'toaudio',
    aliases: ['tomp3'],
    category: 'convert',
    description: 'Convert video to audio',

    async execute(ctx) {
        const { reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const media = await downloadQuoted(ctx);
        if (!media || media.type !== 'videoMessage') {
            return reply(`⚠️ Reply to a video!${FOOTER}`);
        }

        await reply(`🎵 Converting to audio... ⏳${FOOTER}`);

        try {
            await socket.sendMessage(sender, {
                audio: media.buffer,
                mimetype: 'audio/mpeg',
                ptt: false,
                contextInfo: channelContext
            }, { quoted: msg });
        } catch (e) {
            await reply(`❌ Conversion failed!${FOOTER}`);
        }
    }
};
