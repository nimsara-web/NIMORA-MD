const { nimFetch, extractUrl } = require('./_helper');

module.exports = {
    name: 'gdrive',
    aliases: ['gd'],
    category: 'download',
    description: 'Download Google Drive file',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const url = args[0];
        if (!url || !url.includes('drive.google.com')) {
            return reply(`⚠️ Usage: .gdrive [Google Drive URL]${FOOTER}`);
        }

        await reply(`📥 Processing Google Drive... ⏳${FOOTER}`);

        try {
            let dlUrl = null;
            try {
                const data = await nimFetch('/api/gdrive', { url });
                dlUrl = extractUrl(data, ['result.url', 'data.url', 'url']);
            } catch (e) {}

            if (!dlUrl) return reply(`❌ Download link not found!${FOOTER}`);

            await socket.sendMessage(sender, {
                document: { url: dlUrl },
                mimetype: 'application/octet-stream',
                fileName: `gdrive-file`,
                caption: `📁 *Google Drive File*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });

        } catch (e) {
            await reply(`❌ Error: ${e.message}${FOOTER}`);
        }
    }
};
