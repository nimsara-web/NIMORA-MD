const { isGroupAdmin, isBotAdmin } = require('./_helper');

module.exports = {
    name: 'kick',
    aliases: ['remove'],
    category: 'group',
    description: 'Kick a member',

    async execute(ctx) {
        const { reply, socket, sender, msg, channelContext, FOOTER } = ctx;
        if (!sender.endsWith('@g.us')) return reply(`⚠️ Group only!${FOOTER}`);

        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted?.participant) return reply(`⚠️ Reply to a user to kick!${FOOTER}`);

        const isAdmin = await isGroupAdmin(socket, sender, msg.key.participant);
        const botAdmin = await isBotAdmin(socket, sender);

        if (!isAdmin && !msg.key.fromMe) return reply(`⚠️ Only admins can kick!${FOOTER}`);
        if (!botAdmin) return reply(`⚠️ Bot must be admin!${FOOTER}`);

        try {
            await socket.groupParticipantsUpdate(sender, [quoted.participant], 'remove');
            await reply(`✅ Kicked: @${quoted.participant.split('@')[0]}${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
