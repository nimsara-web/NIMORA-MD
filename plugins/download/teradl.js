const { nimFetch, extractUrl, tryApis } = require('./_helper');

module.exports = {
    name: 'teradl',
    aliases: ['tera'],
    category: 'download',
    description: 'Download Terabox file',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const url = args[0];
        if (!url || (!url.includes('terabox') && !url.includes('1024tera'))) {
            return reply(`⚠️ Usage: .teradl [Terabox URL]${FOOTER}`);
        }

        await reply(`📥 Processing Terabox... ⏳${FOOTER}`);

        try {
            let dlUrl = null;
            try {
                const data = await nimFetch('/api/terabox', { url });
                dlUrl = extractUrl(data, ['result.url', 'data.url', 'url']);
            } catch (e) {}

            if (!dlUrl) {
                dlUrl = await tryApis([
                    { name: 'siputzx', url: `https://api.siputzx.my.id/api/d/terabox?url=${encodeURIComponent(url)}`, extract: d => d?.data?.url || d?.url }
                ]);
            }

            if (!dlUrl) return reply(`❌ Terabox download failed!${FOOTER}`);

            await socket.sendMessage(sender, {
                document: { url: dlUrl },
                mimetype: 'application/octet-stream',
                fileName: `terabox-file`,
                caption: `📦 *Terabox File*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });

        } catch (e) {
            await reply(`❌ Error: ${e.message}${FOOTER}`);
        }
    }
};
