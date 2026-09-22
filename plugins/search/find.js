const axios = require('axios');

module.exports = {
    name: 'find',
    aliases: ['google', 'search'],
    category: 'search',
    description: 'Search the web',

    async execute(ctx) {
        const { args, reply, FOOTER } = ctx;

        const query = args.join(' ');
        if (!query) return reply(`⚠️ Usage: .find [query]${FOOTER}`);

        await reply(`🔍 Searching *${query}*... ⏳${FOOTER}`);

        try {
            // Use DuckDuckGo instant answer API
            const res = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`, { timeout: 15000 });
            const d = res.data;

            let text = `🔍 *SEARCH RESULTS*\n\n📝 *Query:* ${query}\n\n`;

            if (d.AbstractText) {
                text += `📖 *${d.AbstractSource || 'Summary'}:*\n${d.AbstractText}\n\n`;
                if (d.AbstractURL) text += `🔗 ${d.AbstractURL}\n`;
            } else if (d.Answer) {
                text += `💡 *Answer:* ${d.Answer}\n`;
            } else if (d.RelatedTopics?.length > 0) {
                text += `📌 *Related:*\n`;
                d.RelatedTopics.slice(0, 5).forEach((t, i) => {
                    if (t.Text) text += `${i + 1}. ${t.Text}\n`;
                });
            } else {
                text += `❌ No results found.\n\n💡 Try:\n• Different keywords\n• \`.ai [question]\` for AI`;
            }

            await reply(text + FOOTER);
        } catch (e) {
            await reply(`❌ Search failed!${FOOTER}`);
        }
    }
};
