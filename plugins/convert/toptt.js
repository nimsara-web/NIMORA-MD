const { downloadQuoted } = require('./_helper');

module.exports = {
    name: 'toptt',
    aliases: ['voice', 'voicenote'],
    category: 'convert',
    description: 'Convert audio to voice note',

    async execute(ctx) {
        const { reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const media = await downloadQuoted(ctx);
        if (!media || media.type !== 'audioMessage') {
            return reply(`⚠️ Reply to audio!${FOOTER}`);
        }

        await reply(`🎤 Converting to voice note... ⏳${FOOTER}`);

        try {
            await socket.sendMessage(sender, {
                audio: media.buffer,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true,
                contextInfo: channelContext
            }, { quoted: msg });
        } catch (e) {
            await reply(`❌ Conversion failed!${FOOTER}`);
        }
    }
};
