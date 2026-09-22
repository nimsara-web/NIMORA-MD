const { nimFetch, tryApis } = require('./_helper');

module.exports = {
    name: 'ig',
    aliases: ['instagram', 'insta'],
    category: 'download',
    description: 'Download Instagram media',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const url = args[0];
        if (!url || !url.includes('instagram.com')) {
            return reply(`⚠️ Usage: .ig [instagram URL]${FOOTER}`);
        }

        await reply(`📥 Downloading Instagram... ⏳${FOOTER}`);

        try {
            let mediaData = null;

            try {
                const data = await nimFetch('/api/instagram', { url });
                mediaData = data?.result || data?.data || data?.medias;
            } catch (e) {}

            if (!mediaData || !Array.isArray(mediaData)) {
                mediaData = await tryApis([
                    { name: 'siputzx', url: `https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(url)}`, extract: d => d?.data }
                ]);
            }

            if (!mediaData || mediaData.length === 0) {
                return reply(`❌ Instagram download failed!${FOOTER}`);
            }

            for (const media of mediaData) {
                const mediaUrl = media.url || media.download_url || media.src;
                const isVideo = media.type === 'video' || (mediaUrl && mediaUrl.includes('.mp4'));

                if (isVideo) {
                    await socket.sendMessage(sender, {
                        video: { url: mediaUrl },
                        caption: `📸 *Instagram Video*${FOOTER}`,
                        contextInfo: channelContext
                    }, { quoted: msg });
                } else {
                    await socket.sendMessage(sender, {
                        image: { url: mediaUrl },
                        caption: `📸 *Instagram Image*${FOOTER}`,
                        contextInfo: channelContext
                    }, { quoted: msg });
                }
            }
        } catch (e) {
            await reply(`❌ Error: ${e.message}${FOOTER}`);
        }
    }
};
