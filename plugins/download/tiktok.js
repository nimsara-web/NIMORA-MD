const { nimFetch, extractUrl, tryApis } = require('./_helper');

module.exports = {
    name: 'tiktok',
    aliases: ['tt'],
    category: 'download',
    description: 'Download TikTok video',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const url = args[0];
        if (!url || !url.includes('tiktok.com')) {
            return reply(`⚠️ Usage: .tiktok [tiktok URL]${FOOTER}`);
        }

        await reply(`📥 Processing TikTok... ⏳${FOOTER}`);

        try {
            let videoUrl = null;

            // Try NIM API
            try {
                const data = await nimFetch('/api/tiktok', { url });
                videoUrl = extractUrl(data, ['result.video', 'data.video', 'video', 'result.play']);
            } catch (e) {}

            // Fallback APIs
            if (!videoUrl) {
                videoUrl = await tryApis([
                    { name: 'siputzx', url: `https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(url)}`, extract: d => d?.data?.video || d?.video || d?.data?.url },
                    { name: 'bk9', url: `https://bk9.fun/download/tiktok?url=${encodeURIComponent(url)}`, extract: d => d?.BK9?.video || d?.data?.video }
                ]);
            }

            if (!videoUrl) return reply(`❌ TikTok download failed!${FOOTER}`);

            await socket.sendMessage(sender, {
                video: { url: videoUrl },
                caption: `🎬 *TikTok Video*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });

        } catch (e) {
            await reply(`❌ Error: ${e.message}${FOOTER}`);
        }
    }
};
