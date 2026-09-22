const axios = require('axios');
const config = require('../../config');

module.exports = {
    name: 'searchsticker',
    aliases: ['findsticker', 'stickersearch'],
    category: 'sticker',
    description: 'Search stickers',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const query = args.join(' ');
        if (!query) return reply(`⚠️ Usage: .searchsticker [query]${FOOTER}`);

        await reply(`🔍 Searching stickers for *${query}*... ⏳${FOOTER}`);

        try {
            const res = await axios.get(`${config.nimApiBase}/api/stickerly/search?apiKey=${config.nimApiKey}&q=${encodeURIComponent(query)}`, { timeout: 20000 });
            const results = res.data?.result || res.data?.data;

            if (!results || results.length === 0) {
                return reply(`❌ No stickers found!${FOOTER}`);
            }

            // Send up to 3 stickers
            for (const s of results.slice(0, 3)) {
                const stickerUrl = s.url || s.image || s.sticker;
                if (!stickerUrl) continue;

                try {
                    await socket.sendMessage(sender, {
                        sticker: { url: stickerUrl }
                    }, { quoted: msg });
                    await ctx.delay(500);
                } catch (e) {}
            }
        } catch (e) {
            await reply(`❌ Search failed: ${e.message}${FOOTER}`);
        }
    }
};
