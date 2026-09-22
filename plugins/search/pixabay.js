const axios = require('axios');

module.exports = {
    name: 'pixabay',
    aliases: ['pix'],
    category: 'search',
    description: 'Search Pixabay images',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const query = args.join(' ');
        if (!query) return reply(`⚠️ Usage: .pixabay [query]${FOOTER}`);

        await reply(`🔍 Searching Pixabay... ⏳${FOOTER}`);

        try {
            // Use pixabay public API (requires key, but we use a demo endpoint)
            const res = await axios.get(`https://pixabay.com/api/?key=13119377-fc7e10c6305a7de49da6ecb25&q=${encodeURIComponent(query)}&image_type=photo&per_page=5`, { timeout: 15000 });
            const hits = res.data?.hits || [];

            if (hits.length === 0) return reply(`❌ No images found!${FOOTER}`);

            for (const img of hits.slice(0, 3)) {
                await socket.sendMessage(sender, {
                    image: { url: img.largeImageURL },
                    caption: `📸 *Pixabay Result*\n\n📝 ${img.tags}\n👤 ${img.user}\n${FOOTER}`,
                    contextInfo: channelContext
                }, { quoted: msg });
            }
        } catch (e) {
            await reply(`❌ Pixabay failed!${FOOTER}`);
        }
    }
};
