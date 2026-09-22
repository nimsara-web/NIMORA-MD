module.exports = {
    name: 'pdf',
    aliases: ['topdf'],
    category: 'convert',
    description: 'Convert text to PDF',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const text = args.join(' ');
        if (!text) return reply(`⚠️ Usage: .pdf [text]${FOOTER}`);

        try {
            // Use a simple PDF generation via API
            const pdfUrl = `https://api.siputzx.my.id/api/m/text2pdf?text=${encodeURIComponent(text)}`;

            await socket.sendMessage(sender, {
                document: { url: pdfUrl },
                mimetype: 'application/pdf',
                fileName: `text_${Date.now()}.pdf`,
                caption: `📄 *PDF Generated*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });

        } catch (e) {
            await reply(`❌ PDF failed: ${e.message}${FOOTER}`);
        }
    }
};
