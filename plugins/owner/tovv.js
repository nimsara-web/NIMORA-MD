module.exports = {
    name: 'tovv',
    aliases: ['tovo', 'vvsend'],
    category: 'owner',
    description: 'Convert media to view once',

    async execute(ctx) {
        const { reply, socket, msg, sender, isOwner, getMediaType, unwrapMessage, channelContext, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted?.quotedMessage) return reply(`⚠️ Reply to media!${FOOTER}`);

        const qMsg = unwrapMessage(quoted.quotedMessage);
        const mediaInfo = getMediaType(qMsg);
        if (!mediaInfo) return reply(`⚠️ Reply to image/video!${FOOTER}`);

        try {
            const { type, data } = mediaInfo;
            const buffer = await ctx.downloadMediaMessage(
                { key: { remoteJid: quoted.remoteJid || sender, id: quoted.stanzaId, participant: quoted.participant }, message: { [type]: data } },
                'buffer', {}, { logger: require('pino')({ level: 'silent' }) }
            );

            if (type === 'imageMessage') {
                await socket.sendMessage(sender, {
                    image: buffer,
                    caption: data.caption || '',
                    viewOnce: true,
                    contextInfo: channelContext
                }, { quoted: msg });
            } else if (type === 'videoMessage') {
                await socket.sendMessage(sender, {
                    video: buffer,
                    caption: data.caption || '',
                    viewOnce: true,
                    contextInfo: channelContext
                }, { quoted: msg });
            }
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
