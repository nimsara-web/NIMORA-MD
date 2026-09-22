const axios = require('axios');

module.exports = {
    name: 'wabeta',
    aliases: ['whatsappbeta', 'wabetainfo'],
    category: 'search',
    description: 'Latest WhatsApp beta news',

    async execute(ctx) {
        const { reply, FOOTER } = ctx;

        try {
            const res = await axios.get('https://wabetainfo.com/feed/', { timeout: 15000 });
            const xml = res.data;

            // Simple XML parse for <item>
            const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 5);

            if (items.length === 0) return reply(`❌ No news found!${FOOTER}`);

            let text = `📰 *WABETAINFO - LATEST NEWS*\n\n`;
            items.forEach((m, i) => {
                const item = m[1];
                const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1] || 'No title';
                const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
                const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';

                text += `${i + 1}. *${title.trim()}*\n`;
                if (pubDate) text += `   📅 ${new Date(pubDate).toLocaleDateString()}\n`;
                if (link) text += `   🔗 ${link.trim()}\n`;
                text += `\n`;
            });

            await reply(text + FOOTER);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
