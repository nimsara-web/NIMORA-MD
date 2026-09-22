const { nimFetch, extractUrl } = require('./_helper');

module.exports = {
    name: 'mediafire',
    aliases: ['mf'],
    category: 'download',
    description: 'Download MediaFire file',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const url = args[0];
        if (!url || !url.includes('mediafire.com')) {
            return reply(`⚠️ Usage: .mediafire [URL]${FOOTER}`);
        }

        await reply(`📥 Processing MediaFire... ⏳${FOOTER}`);

        try {
            let dlUrl = null;
            try {
                const data = await nimFetch('/api/mediafire', { url });
                dlUrl = extractUrl(data, ['result.url', 'data.url', 'url']);
            } catch (e) {}

            if (!dlUrl) return reply(`❌ Download failed!${FOOTER}`);

            await socket.sendMessage(sender, {
                document: { url: dlUrl },
                mimetype: 'application/octet-stream',
                fileName: `mediafire-file`,
                caption: `📁 *MediaFire File*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });

        } catch (e) {
            await reply(`❌ Error: ${e.message}${FOOTER}`);
        }
    }
};
