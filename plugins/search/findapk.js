const axios = require('axios');
const config = require('../../config');

module.exports = {
    name: 'findapk',
    aliases: ['apksearch'],
    category: 'search',
    description: 'Search APK apps',

    async execute(ctx) {
        const { args, reply, FOOTER } = ctx;

        const query = args.join(' ');
        if (!query) return reply(`⚠️ Usage: .findapk [app name]${FOOTER}`);

        await reply(`🔍 Searching APK *${query}*... ⏳${FOOTER}`);

        try {
            const res = await axios.get(`${config.nimApiBase}/api/apk/search?apiKey=${config.nimApiKey}&q=${encodeURIComponent(query)}`, { timeout: 20000 });
            const results = res.data?.result || res.data?.data || [];

            if (!Array.isArray(results) || results.length === 0) {
                return reply(`❌ No APK results!${FOOTER}`);
            }

            let text = `📱 *APK SEARCH*\n\n📝 Query: *${query}*\n\n`;
            results.slice(0, 5).forEach((a, i) => {
                text += `${i + 1}. *${a.name || a.title}*\n`;
                if (a.version) text += `   📌 v${a.version}\n`;
                if (a.size) text += `   💾 ${a.size}\n`;
                if (a.url) text += `   🔗 ${a.url}\n`;
                text += `\n`;
            });
            text += `💡 Use \`.apk [name]\` to download`;

            await reply(text + FOOTER);
        } catch (e) {
            await reply(`❌ APK search failed!${FOOTER}`);
        }
    }
};
