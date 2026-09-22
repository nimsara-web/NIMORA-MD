const { nimFetch, extractUrl } = require('./_helper');

module.exports = {
    name: 'movie',
    aliases: ['film'],
    category: 'download',
    description: 'Search & download movies',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, pendingSelection, channelContext, FOOTER } = ctx;

        const query = args.join(' ');
        if (!query) return reply(`⚠️ Usage: .movie [movie name]${FOOTER}`);

        await reply(`🎬 Searching *${query}*... ⏳${FOOTER}`);

        try {
            const data = await nimFetch('/api/movie/search', { q: query });
            const results = data?.result || data?.data || data?.results;

            if (!results || !Array.isArray(results) || results.length === 0) {
                return reply(`❌ Movie not found!${FOOTER}`);
            }

            const top = results.slice(0, 5);
            let list = `🎬 *MOVIE SEARCH RESULTS*\n\n`;
            top.forEach((m, i) => {
                list += `${i + 1}. *${m.title || m.name}*\n`;
                if (m.year) list += `   📅 ${m.year}\n`;
                if (m.quality) list += `   🎞️ ${m.quality}\n`;
                list += `\n`;
            });
            list += `*Reply with a number to download*\n💡 _Within 2 minutes_`;

            pendingSelection.set(sender, {
                type: 'movie_select',
                results: top,
                timestamp: Date.now(),
                handler: async (choice, sock, origMsg, replyFn) => {
                    await handleMovieDownload(choice, top, sock, sender, origMsg, replyFn, channelContext, FOOTER);
                }
            });

            await reply(list + FOOTER);

        } catch (e) {
            await reply(`❌ Search failed: ${e.message}${FOOTER}`);
        }
    }
};

async function handleMovieDownload(choice, results, socket, sender, msg, reply, channelContext, FOOTER) {
    const movie = results[choice - 1];
    if (!movie) return reply(`❌ Invalid selection!${FOOTER}`);

    await reply(`📥 Downloading *${movie.title || movie.name}*... ⏳${FOOTER}`);

    try {
        const data = await nimFetch('/api/movie/download', { id: movie.id || movie.movieId });
        const dlUrl = extractUrl(data, ['result.url', 'data.url', 'url', 'downloadUrl']);

        if (!dlUrl) return reply(`❌ Download link not found!${FOOTER}`);

        await socket.sendMessage(sender, {
            document: { url: dlUrl },
            mimetype: 'video/mp4',
            fileName: `${movie.title || 'movie'}.mp4`,
            caption: `🎬 *${movie.title || movie.name}*${FOOTER}`,
            contextInfo: channelContext
        }, { quoted: msg });

    } catch (e) {
        await reply(`❌ Download failed: ${e.message}${FOOTER}`);
    }
}
