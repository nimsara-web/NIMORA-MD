const { nimFetch } = require('./_helper');

module.exports = {
    name: 'anime',
    aliases: ['anidl'],
    category: 'download',
    description: 'Search & download anime',

    async execute(ctx) {
        const { args, reply, FOOTER } = ctx;

        const query = args.join(' ');
        if (!query) return reply(`⚠️ Usage: .anime [anime name]${FOOTER}`);

        await reply(`🔍 Searching anime *${query}*... ⏳${FOOTER}`);

        try {
            const data = await nimFetch('/api/anime/search', { q: query });
            const results = data?.result || data?.data;

            if (!results || results.length === 0) {
                return reply(`❌ Anime not found!${FOOTER}`);
            }

            let list = `🎌 *ANIME SEARCH RESULTS*\n\n`;
            results.slice(0, 5).forEach((a, i) => {
                list += `${i + 1}. *${a.title}*\n`;
                if (a.year) list += `   📅 ${a.year}\n`;
                if (a.episodes) list += `   🎬 ${a.episodes} eps\n`;
                list += `\n`;
            });
            list += `💡 Use \`.sisub [name]\` for Sinhala subs`;

            await reply(list + FOOTER);

        } catch (e) {
            await reply(`❌ Search failed: ${e.message}${FOOTER}`);
        }
    }
};
