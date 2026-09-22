const { nimFetch, extractUrl, tryApis } = require('./_helper');

module.exports = {
    name: 'twitter',
    aliases: ['x', 'twdl'],
    category: 'download',
    description: 'Download Twitter/X video',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const url = args[0];
        if (!url || (!url.includes('twitter.com') && !url.includes('x.com'))) {
            return reply(`⚠️ Usage: .twitter [URL]${FOOTER}`);
        }

        await reply(`📥 Processing Twitter... ⏳${FOOTER}`);

        try {
            let videoUrl = null;

            try {
                const data = await nimFetch('/api/twitter', { url });
                videoUrl = extractUrl(data, ['result.url', 'data.url', 'url']);
            } catch (e) {}

            if (!videoUrl) {
                videoUrl = await tryApis([
                    { name: 'siputzx', url: `https://api.siputzx.my.id/api/d/twitter?url=${encodeURIComponent(url)}`, extract: d => d?.data?.url || d?.url }
                ]);
            }

            if (!videoUrl) return reply(`❌ Twitter download failed!${FOOTER}`);

            await socket.sendMessage(sender, {
                video: { url: videoUrl },
                caption: `🐦 *Twitter Video*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });

        } catch (e) {
            await reply(`❌ Error: ${e.message}${FOOTER}`);
        }
    }
};
