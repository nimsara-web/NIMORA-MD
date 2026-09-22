const yts = require('yt-search');

module.exports = {
    name: 'yts',
    aliases: ['ytsearch'],
    category: 'search',
    description: 'Search YouTube',

    async execute(ctx) {
        const { args, reply, FOOTER } = ctx;

        const query = args.join(' ');
        if (!query) return reply(`⚠️ Usage: .yts [query]${FOOTER}`);

        try {
            const search = await yts(query);
            const videos = search.videos.slice(0, 5);

            if (videos.length === 0) return reply(`❌ No results!${FOOTER}`);

            let list = `🔍 *YOUTUBE SEARCH*\n\n📝 Query: *${query}*\n\n`;
            videos.forEach((v, i) => {
                list += `${i + 1}. *${v.title}*\n`;
                list += `   ⏱️ ${v.timestamp} | 👁️ ${v.views?.toLocaleString() || 'N/A'}\n`;
                list += `   👤 ${v.author.name}\n`;
                list += `   🔗 ${v.url}\n\n`;
            });

            await reply(list + FOOTER);
        } catch (e) {
            await reply(`❌ Search failed: ${e.message}${FOOTER}`);
        }
    }
};
