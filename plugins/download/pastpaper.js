const { nimFetch, extractUrl } = require('./_helper');

module.exports = {
    name: 'pastpaper',
    aliases: ['pp'],
    category: 'download',
    description: 'Download past papers',

    async execute(ctx) {
        const { args, reply, FOOTER } = ctx;

        const query = args.join(' ');
        if (!query) return reply(`⚠️ Usage: .pastpaper [subject/grade]${FOOTER}`);

        await reply(`🔍 Searching past papers *${query}*... ⏳${FOOTER}`);

        try {
            const data = await nimFetch('/api/pastpaper/search', { q: query });
            const results = data?.result || data?.data;

            if (!results || results.length === 0) {
                return reply(`❌ Not found!${FOOTER}`);
            }

            let list = `📚 *PAST PAPERS*\n\n`;
            results.slice(0, 5).forEach((p, i) => {
                list += `${i + 1}. *${p.title}*\n`;
                if (p.year) list += `   📅 ${p.year}\n`;
                list += `\n`;
            });

            await reply(list + FOOTER);

        } catch (e) {
            await reply(`❌ Search failed: ${e.message}${FOOTER}`);
        }
    }
};
