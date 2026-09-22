const axios = require('axios');

module.exports = {
    name: 'subtr',
    aliases: ['subtitle', 'subtranslate'],
    category: 'convert',
    description: 'Translate text with target lang',

    async execute(ctx) {
        const { args, reply, FOOTER } = ctx;

        const targetLang = args[0] || 'si';
        const quoted = ctx.msg.message?.extendedTextMessage?.contextInfo;

        let text = '';
        if (quoted?.quotedMessage) {
            const qm = quoted.quotedMessage;
            text = qm.conversation || qm.extendedTextMessage?.text || '';
        } else {
            text = args.slice(1).join(' ');
        }

        if (!text) return reply(`⚠️ Usage: .subtr [lang] [text]${FOOTER}`);

        try {
            const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
            const translated = res.data[0].map(i => i[0]).join('');
            await reply(`🌐 *TRANSLATED (${targetLang.toUpperCase()})*\n\n${translated}${FOOTER}`);
        } catch (e) {
            await reply(`❌ Translation failed!${FOOTER}`);
        }
    }
};
