const config = require('../../config');

module.exports = {
    name: 'creact',
    aliases: ['channelreact'],
    category: 'channel',
    description: 'React to channel message (owner only)',

    async execute(ctx) {
        const { args, reply, isOwner, socket, msg, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const emoji = args[0] || '❤️';
        const quoted = msg.message?.extendedTextMessage?.contextInfo;

        if (!quoted?.stanzaId) {
            return reply(`⚠️ Reply to a channel message to react!${FOOTER}`);
        }

        try {
            await socket.sendMessage(quoted.remoteJid || config.channelJid, {
                react: { text: emoji, key: { remoteJid: quoted.remoteJid || config.channelJid, id: quoted.stanzaId } }
            });
            await reply(`✅ Reacted with ${emoji}${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
