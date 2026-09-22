const axios = require('axios');
const config = require('../../config');

module.exports = {
    name: 'ctiktok',
    aliases: ['channeltiktok'],
    category: 'channel',
    description: 'Send TikTok to channel (owner only)',

    async execute(ctx) {
        const { args, reply, isOwner, socket, channelContext, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const url = args[0];
        if (!url || !url.includes('tiktok.com')) {
            return reply(`⚠️ Usage: .ctiktok [TikTok URL]${FOOTER}`);
        }

        await reply(`📥 Processing... ⏳${FOOTER}`);

        try {
            const res = await axios.get(`${config.nimApiBase}/api/tiktok?apiKey=${config.nimApiKey}&url=${encodeURIComponent(url)}`, { timeout: 45000 });
            const videoUrl = res.data?.result?.video || res.data?.data?.video || res.data?.video;

            if (!videoUrl) return reply(`❌ Download failed!${FOOTER}`);

            await socket.sendMessage(config.channelJid, {
                video: { url: videoUrl },
                caption: `🎵 *TikTok Video*\n\n🔗 ${url}`,
                contextInfo: channelContext
            });

            await reply(`✅ Sent to channel!${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
