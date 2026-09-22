const axios = require('axios');

module.exports = {
    name: 'surl',
    aliases: ['short', 'shorturl', 'tinyurl'],
    category: 'convert',
    description: 'Shorten a URL',

    async execute(ctx) {
        const { args, reply, FOOTER } = ctx;

        const url = args[0];
        if (!url || !url.startsWith('http')) {
            return reply(`⚠️ Usage: .surl [URL]${FOOTER}`);
        }

        try {
            const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, { timeout: 10000 });
            await reply(`🔗 *SHORT URL*\n\n📎 *Original:* ${url}\n✂️ *Short:* ${res.data}${FOOTER}`);
        } catch (e) {
            await reply(`❌ Shorten failed!${FOOTER}`);
        }
    }
};
