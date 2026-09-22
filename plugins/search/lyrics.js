const axios = require('axios');

module.exports = {
    name: 'lyrics',
    aliases: ['lyric', 'lrc'],
    category: 'search',
    description: 'Search song lyrics',

    async execute(ctx) {
        const { args, reply, FOOTER } = ctx;

        const query = args.join(' ');
        if (!query) return reply(`⚠️ Usage: .lyrics [song name]${FOOTER}`);

        await reply(`🔍 Searching lyrics for *${query}*... ⏳${FOOTER}`);

        try {
            // Try lyrics.ovh style via search
            const search = await axios.get(`https://api.lyrics.ovh/suggest/${encodeURIComponent(query)}`, { timeout: 15000 });
            const first = search.data?.data?.[0];
            if (!first) return reply(`❌ Lyrics not found!${FOOTER}`);

            const lyricsRes = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(first.artist.name)}/${encodeURIComponent(first.title)}`, { timeout: 15000 });
            const lyrics = lyricsRes.data?.lyrics;

            if (!lyrics) return reply(`❌ Lyrics not found!${FOOTER}`);

            const trimmed = lyrics.length > 3500 ? lyrics.substring(0, 3500) + '\n\n... (truncated)' : lyrics;

            await reply(`🎵 *${first.title}*\n👤 *${first.artist.name}*\n\n${trimmed}${FOOTER}`);
        } catch (e) {
            await reply(`❌ Lyrics failed: ${e.message}${FOOTER}`);
        }
    }
};
