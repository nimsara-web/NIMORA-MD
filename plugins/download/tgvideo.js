const { nimFetch, extractUrl } = require('./_helper');

module.exports = {
    name: 'tgvideo',
    aliases: ['tgdl'],
    category: 'download',
    description: 'Download Telegram video',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const url = args[0];
        if (!url || !url.includes('t.me')) {
            return reply(`⚠️ Usage: .tgvideo [telegram URL]${FOOTER}`);
        }

        await reply(`📥 Processing Telegram... ⏳${FOOTER}`);

        try {
            let videoUrl = null;
            try {
                const data = await nimFetch('/api/telegram', { url });
                videoUrl = extractUrl(data, ['result.url', 'data.url', 'url']);
            } catch (e) {}

            if (!videoUrl) return reply(`❌ Telegram download failed!${FOOTER}`);

            await socket.sendMessage(sender, {
                video: { url: videoUrl },
                caption: `✈️ *Telegram Video*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });

        } catch (e) {
            await reply(`❌ Error: ${e.message}${FOOTER}`);
        }
    }
};
