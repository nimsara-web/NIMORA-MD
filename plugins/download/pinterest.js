const { nimFetch, extractUrl, tryApis } = require('./_helper');

module.exports = {
    name: 'pinterest',
    aliases: ['pin'],
    category: 'download',
    description: 'Download Pinterest image/video',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const url = args[0];
        if (!url || !url.includes('pinterest.')) {
            return reply(`⚠️ Usage: .pinterest [URL]${FOOTER}`);
        }

        await reply(`📥 Processing Pinterest... ⏳${FOOTER}`);

        try {
            let mediaUrl = null;
            try {
                const data = await nimFetch('/api/pinterest', { url });
                mediaUrl = extractUrl(data, ['result.url', 'data.url', 'url']);
            } catch (e) {}

            if (!mediaUrl) {
                mediaUrl = await tryApis([
                    { name: 'siputzx', url: `https://api.siputzx.my.id/api/d/pinterest?url=${encodeURIComponent(url)}`, extract: d => d?.data?.url || d?.url }
                ]);
            }

            if (!mediaUrl) return reply(`❌ Pinterest download failed!${FOOTER}`);

            const isVideo = mediaUrl.includes('.mp4');

            await socket.sendMessage(sender, isVideo ? {
                video: { url: mediaUrl },
                caption: `📌 *Pinterest Video*${FOOTER}`,
                contextInfo: channelContext
            } : {
                image: { url: mediaUrl },
                caption: `📌 *Pinterest Image*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });

        } catch (e) {
            await reply(`❌ Error: ${e.message}${FOOTER}`);
        }
    }
};
