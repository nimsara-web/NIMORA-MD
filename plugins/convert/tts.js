const axios = require('axios');

module.exports = {
    name: 'tts',
    aliases: ['say', 'speak'],
    category: 'convert',
    description: 'Text to speech',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const text = args.join(' ');
        if (!text) return reply(`⚠️ Usage: .tts [text]${FOOTER}`);

        await reply(`🎤 Generating voice... ⏳${FOOTER}`);

        try {
            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.substring(0, 180))}&tl=en&client=tw-ob`;

            const res = await axios.get(ttsUrl, {
                responseType: 'arraybuffer',
                timeout: 20000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://translate.google.com/'
                }
            });

            const buffer = Buffer.from(res.data);
            if (buffer.length < 500) return reply(`❌ TTS failed!${FOOTER}`);

            await socket.sendMessage(sender, {
                audio: buffer,
                mimetype: 'audio/mpeg',
                ptt: true,
                contextInfo: channelContext
            }, { quoted: msg });

        } catch (e) {
            await reply(`❌ TTS failed: ${e.message}${FOOTER}`);
        }
    }
};
