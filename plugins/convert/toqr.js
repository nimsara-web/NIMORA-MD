// Same as img2qr - alias plugin
module.exports = {
    name: 'toqr',
    aliases: ['qr', 'qrcode'],
    category: 'convert',
    description: 'Generate QR code',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const text = args.join(' ');
        if (!text) return reply(`⚠️ Usage: .toqr [text]${FOOTER}`);

        try {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`;

            await socket.sendMessage(sender, {
                image: { url: qrUrl },
                caption: `📱 *QR Code*\n\n📝 ${text}${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });
        } catch (e) {
            await reply(`❌ QR failed!${FOOTER}`);
        }
    }
};
