const { nimFetch, extractUrl, tryApis } = require('./_helper');

module.exports = {
    name: 'threads',
    category: 'download',
    description: 'Download Threads media',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const url = args[0];
        if (!url || !url.includes('threads.net')) {
            return reply(`⚠️ Usage: .threads [URL]${FOOTER}`);
        }

        await reply(`📥 Processing Threads... ⏳${FOOTER}`);

        try {
            let mediaUrl = null;
            try {
                const data = await nimFetch('/api/threads', { url });
                mediaUrl = extractUrl(data, ['result.url', 'data.url', 'url']);
            } catch (e) {}

            if (!mediaUrl) {
                mediaUrl = await tryApis([
                    { name: 'siputzx', url: `https://api.siputzx.my.id/api/d/threads?url=${encodeURIComponent(url)}`, extract: d => d?.data?.video || d?.data?.image || d?.url }
                ]);
            }

            if (!mediaUrl) return reply(`❌ Threads download failed!${FOOTER}`);

            const isVideo = mediaUrl.includes('.mp4');

            await socket.sendMessage(sender, isVideo ? {
                video: { url: mediaUrl },
                caption: `🧵 *Threads Video*${FOOTER}`,
                contextInfo: channelContext
            } : {
                image: { url: mediaUrl },
                caption: `🧵 *Threads Image*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });

        } catch (e) {
            await reply(`❌ Error: ${e.message}${FOOTER}`);
        }
    }
};
