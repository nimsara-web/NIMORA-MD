const axios = require('axios');

module.exports = {
    name: 'unsplash',
    aliases: ['unsplashimg'],
    category: 'search',
    description: 'Search Unsplash images',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const query = args.join(' ');
        if (!query) return reply(`⚠️ Usage: .unsplash [query]${FOOTER}`);

        await reply(`🔍 Searching Unsplash... ⏳${FOOTER}`);

        try {
            const res = await axios.get(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&client_id=YOUR_UNSPLASH_KEY`, { timeout: 15000 });
            const results = res.data?.results || [];

            if (results.length === 0) return reply(`❌ No images!${FOOTER}`);

            for (const img of results) {
                await socket.sendMessage(sender, {
                    image: { url: img.urls.regular },
                    caption: `📸 *Unsplash*\n\n📝 ${img.alt_description || query}\n👤 ${img.user.name}${FOOTER}`,
                    contextInfo: channelContext
                }, { quoted: msg });
            }
        } catch (e) {
            // Fallback: Use source.unsplash.com
            try {
                const url = `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}`;
                await socket.sendMessage(sender, {
                    image: { url },
                    caption: `📸 *Unsplash* - ${query}${FOOTER}`,
                    contextInfo: channelContext
                }, { quoted: msg });
            } catch (e2) {
                await reply(`❌ Unsplash failed!${FOOTER}`);
            }
        }
    }
};
