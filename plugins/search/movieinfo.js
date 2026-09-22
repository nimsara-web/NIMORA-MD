const axios = require('axios');
const config = require('../../config');

module.exports = {
    name: 'movieinfo',
    aliases: ['imdb', 'film'],
    category: 'search',
    description: 'Get movie information',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const query = args.join(' ');
        if (!query) return reply(`⚠️ Usage: .movieinfo [movie name]${FOOTER}`);

        await reply(`🔍 Searching *${query}*... ⏳${FOOTER}`);

        try {
            const res = await axios.get(`${config.nimApiBase}/api/imdb?apiKey=${config.nimApiKey}&q=${encodeURIComponent(query)}`, { timeout: 20000 });
            const d = res.data?.result || res.data?.data;

            if (!d) return reply(`❌ Movie not found!${FOOTER}`);

            let text = `🎬 *MOVIE INFO*\n\n`;
            text += `📛 *Title:* ${d.title || d.name || query}\n`;
            if (d.year) text += `📅 *Year:* ${d.year}\n`;
            if (d.rated) text += `🔞 *Rated:* ${d.rated}\n`;
            if (d.released) text += `📆 *Released:* ${d.released}\n`;
            if (d.runtime) text += `⏱️ *Runtime:* ${d.runtime}\n`;
            if (d.genre) text += `🎭 *Genre:* ${d.genre}\n`;
            if (d.director) text += `🎬 *Director:* ${d.director}\n`;
            if (d.actors) text += `👥 *Actors:* ${d.actors}\n`;
            if (d.imdbRating) text += `⭐ *Rating:* ${d.imdbRating}/10\n`;
            if (d.plot) text += `\n📝 *Plot:*\n${d.plot}\n`;

            if (d.poster && d.poster.startsWith('http')) {
                await socket.sendMessage(sender, {
                    image: { url: d.poster },
                    caption: text + FOOTER,
                    contextInfo: channelContext
                }, { quoted: msg });
            } else {
                await reply(text + FOOTER);
            }
        } catch (e) {
            await reply(`❌ Movie info failed!${FOOTER}`);
        }
    }
};
