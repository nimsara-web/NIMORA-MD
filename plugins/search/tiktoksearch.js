const axios = require('axios');
const config = require('../../config');

module.exports = {
    name: 'tiktoksearch',
    aliases: ['ttsearch', 'findtiktok'],
    category: 'search',
    description: 'Search TikTok videos',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const query = args.join(' ');
        if (!query) return reply(`⚠️ Usage: .tiktoksearch [query]${FOOTER}`);

        await reply(`🔍 Searching TikTok for *${query}*... ⏳${FOOTER}`);

        try {
            const res = await axios.get(`${config.nimApiBase}/api/tiktok-search?apiKey=${config.nimApiKey}&q=${encodeURIComponent(query)}`, { timeout: 20000 });
            const results = res.data?.result || res.data?.data || [];

            if (!Array.isArray(results) || results.length === 0) {
                return reply(`❌ No TikTok results!${FOOTER}`);
            }

            let text = `🎵 *TIKTOK SEARCH*\n\n📝 Query: *${query}*\n\n`;
            results.slice(0, 5).forEach((v, i) => {
                text += `${i + 1}. *${(v.title || v.desc || '').substring(0, 60)}*\n`;
                text += `   👤 @${v.author?.unique_id || v.author || 'unknown'}\n`;
                text += `   🔗 ${v.url || v.link || ''}\n\n`;
            });

            await reply(text + FOOTER);
        } catch (e) {
            await reply(`❌ TikTok search failed!${FOOTER}`);
        }
    }
};
