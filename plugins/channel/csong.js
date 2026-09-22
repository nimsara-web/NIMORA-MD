const axios = require('axios');
const yts = require('yt-search');
const config = require('../../config');

module.exports = {
    name: 'csong',
    aliases: ['channelsong'],
    category: 'channel',
    description: 'Send song to channel (owner only)',

    async execute(ctx) {
        const { args, reply, isOwner, socket, channelContext, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const query = args.join(' ');
        if (!query) return reply(`⚠️ Usage: .csong [song name]${FOOTER}`);

        await reply(`🔍 Searching *${query}*... ⏳${FOOTER}`);

        try {
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) return reply(`❌ Not found!${FOOTER}`);

            const res = await axios.get(`${config.nimApiBase}/api/ytmp3?apiKey=${config.nimApiKey}&url=${encodeURIComponent(video.url)}`, { timeout: 45000 });
            const audioUrl = res.data?.result?.url || res.data?.data?.url || res.data?.url;

            if (!audioUrl) return reply(`❌ Download failed!${FOOTER}`);

            await socket.sendMessage(config.channelJid, {
                audio: { url: audioUrl },
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`,
                contextInfo: channelContext
            });

            await reply(`✅ Sent to channel!${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
