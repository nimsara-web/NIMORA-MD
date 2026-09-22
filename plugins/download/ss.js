module.exports = {
    name: 'ss',
    aliases: ['screenshot', 'webshot'],
    category: 'download',
    description: 'Take website screenshot',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const url = args[0];
        if (!url) return reply(`⚠️ Usage: .ss [URL]${FOOTER}`);

        const fullUrl = url.startsWith('http') ? url : `https://${url}`;

        try {
            const ssUrl = `https://api.microlink.io/?url=${encodeURIComponent(fullUrl)}&screenshot=true&meta=false&embed=screenshot.url`;

            await socket.sendMessage(sender, {
                image: { url: ssUrl },
                caption: `📸 *Screenshot*\n\n🔗 ${fullUrl}${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });

        } catch (e) {
            try {
                const fallback = `https://image.thum.io/get/width/1200/${fullUrl}`;
                await socket.sendMessage(sender, {
                    image: { url: fallback },
                    caption: `📸 *Screenshot*${FOOTER}`,
                    contextInfo: channelContext
                }, { quoted: msg });
            } catch (e2) {
                await reply(`❌ Screenshot failed!${FOOTER}`);
            }
        }
    }
};
