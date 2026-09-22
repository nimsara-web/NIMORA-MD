const { nimFetch, extractUrl } = require('./_helper');

module.exports = {
    name: 'sisub',
    aliases: ['sinhalasub'],
    category: 'download',
    description: 'Download Sinhala subtitled anime',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const query = args.join(' ');
        if (!query) return reply(`⚠️ Usage: .sisub [anime name]${FOOTER}`);

        await reply(`🔍 Searching Sinhala sub anime *${query}*... ⏳${FOOTER}`);

        try {
            const data = await nimFetch('/api/sisub/search', { q: query });
            const results = data?.result || data?.data;

            if (!results || results.length === 0) {
                return reply(`❌ Not found!${FOOTER}`);
            }

            let list = `🎌 *SINHALA SUB RESULTS*\n\n`;
            results.slice(0, 5).forEach((a, i) => {
                list += `${i + 1}. *${a.title}*\n`;
                if (a.link) list += `   🔗 ${a.link}\n`;
                list += `\n`;
            });

            await reply(list + FOOTER);

        } catch (e) {
            await reply(`❌ Search failed: ${e.message}${FOOTER}`);
        }
    }
};
