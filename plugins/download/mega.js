const { nimFetch, extractUrl } = require('./_helper');

module.exports = {
    name: 'mega',
    aliases: ['megadl'],
    category: 'download',
    description: 'Download Mega.nz file',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const url = args[0];
        if (!url || !url.includes('mega.nz')) {
            return reply(`⚠️ Usage: .mega [Mega URL]${FOOTER}`);
        }

        await reply(`📥 Processing Mega.nz... ⏳${FOOTER}`);

        try {
            let dlUrl = null;
            try {
                const data = await nimFetch('/api/mega', { url });
                dlUrl = extractUrl(data, ['result.url', 'data.url', 'url']);
            } catch (e) {}

            if (!dlUrl) return reply(`❌ Download failed!${FOOTER}`);

            await socket.sendMessage(sender, {
                document: { url: dlUrl },
                mimetype: 'application/octet-stream',
                fileName: `mega-file`,
                caption: `☁️ *Mega.nz File*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });

        } catch (e) {
            await reply(`❌ Error: ${e.message}${FOOTER}`);
        }
    }
};
