const { nimFetch, extractUrl, tryApis } = require('./_helper');

module.exports = {
    name: 'video',
    aliases: ['dl', 'download'],
    category: 'download',
    description: 'Universal video downloader',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const url = args[0];
        if (!url || !url.startsWith('http')) {
            return reply(`⚠️ Usage: .video [URL]\n\nSupports: TikTok, FB, IG, Twitter, YouTube${FOOTER}`);
        }

        await reply(`📥 Auto-detecting and downloading... ⏳${FOOTER}`);

        try {
            let videoUrl = null;

            // Detect platform
            if (url.includes('tiktok.com')) {
                try {
                    const data = await nimFetch('/api/tiktok', { url });
                    videoUrl = extractUrl(data, ['result.video', 'data.video', 'video']);
                } catch (e) {}
            } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
                try {
                    const data = await nimFetch('/api/facebook', { url });
                    videoUrl = extractUrl(data, ['result.hd', 'result.sd', 'result.url']);
                } catch (e) {}
            } else if (url.includes('instagram.com')) {
                try {
                    const data = await nimFetch('/api/instagram', { url });
                    const media = data?.result || data?.data;
                    if (Array.isArray(media) && media.length > 0) {
                        videoUrl = media[0]?.url;
                    }
                } catch (e) {}
            } else if (url.includes('twitter.com') || url.includes('x.com')) {
                try {
                    const data = await nimFetch('/api/twitter', { url });
                    videoUrl = extractUrl(data, ['result.url', 'data.url']);
                } catch (e) {}
            } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
                try {
                    const data = await nimFetch('/api/ytmp4-v2', { url });
                    videoUrl = extractUrl(data, ['result.url', 'data.url']);
                } catch (e) {}
            }

            if (!videoUrl) return reply(`❌ Unsupported URL or download failed!${FOOTER}`);

            await socket.sendMessage(sender, {
                video: { url: videoUrl },
                caption: `🎬 *Downloaded Video*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });

        } catch (e) {
            await reply(`❌ Error: ${e.message}${FOOTER}`);
        }
    }
};
