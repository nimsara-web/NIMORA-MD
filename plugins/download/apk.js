const { nimFetch, extractUrl, tryApis } = require('./_helper');

module.exports = {
    name: 'apk',
    aliases: ['apkdl'],
    category: 'download',
    description: 'Download APK',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const query = args.join(' ');
        if (!query) return reply(`⚠️ Usage: .apk [app name]${FOOTER}`);

        await reply(`🔍 Searching APK *${query}*... ⏳${FOOTER}`);

        try {
            let dlUrl = null;
            try {
                const data = await nimFetch('/api/apk', { q: query });
                dlUrl = extractUrl(data, ['result.url', 'data.url', 'url', 'result.dl_url']);
            } catch (e) {}

            if (!dlUrl) {
                dlUrl = await tryApis([
                    { name: 'siputzx', url: `https://api.siputzx.my.id/api/apk/search?q=${encodeURIComponent(query)}`, extract: d => d?.data?.[0]?.download || d?.data?.download }
                ]);
            }

            if (!dlUrl) return reply(`❌ APK not found!${FOOTER}`);

            await socket.sendMessage(sender, {
                document: { url: dlUrl },
                mimetype: 'application/vnd.android.package-archive',
                fileName: `${query}.apk`,
                caption: `📱 *${query}.apk*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });

        } catch (e) {
            await reply(`❌ Error: ${e.message}${FOOTER}`);
        }
    }
};
