const { nimFetch, extractUrl, tryApis } = require('./_helper');

module.exports = {
    name: 'fb',
    aliases: ['facebook'],
    category: 'download',
    description: 'Download Facebook video',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const url = args[0];
        if (!url || (!url.includes('facebook.com') && !url.includes('fb.watch') && !url.includes('fb.me'))) {
            return reply(`⚠️ Usage: .fb [facebook URL]${FOOTER}`);
        }

        await reply(`📥 Processing Facebook... ⏳${FOOTER}`);

        try {
            let videoUrl = null;

            try {
                const data = await nimFetch('/api/facebook', { url });
                videoUrl = extractUrl(data, ['result.hd', 'result.sd', 'result.url', 'data.url', 'hd', 'sd']);
            } catch (e) {}

            if (!videoUrl) {
                videoUrl = await tryApis([
                    { name: 'siputzx', url: `https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(url)}`, extract: d => d?.data?.hd || d?.data?.sd || d?.url }
                ]);
            }

            if (!videoUrl) return reply(`❌ Facebook download failed!${FOOTER}`);

            await socket.sendMessage(sender, {
                video: { url: videoUrl },
                caption: `🎬 *Facebook Video*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });

        } catch (e) {
            await reply(`❌ Error: ${e.message}${FOOTER}`);
        }
    }
};
