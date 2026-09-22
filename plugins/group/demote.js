const { isBotAdmin } = require('./_helper');

module.exports = {
    name: 'demote',
    aliases: ['unadmin'],
    category: 'group',
    description: 'Demote an admin',

    async execute(ctx) {
        const { reply, socket, sender, msg, FOOTER } = ctx;
        if (!sender.endsWith('@g.us')) return reply(`⚠️ Group only!${FOOTER}`);

        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted?.participant) return reply(`⚠️ Reply to a user!${FOOTER}`);

        const botAdmin = await isBotAdmin(socket, sender);
        if (!botAdmin) return reply(`⚠️ Bot must be admin!${FOOTER}`);

        try {
            await socket.groupParticipantsUpdate(sender, [quoted.participant], 'demote');
            await reply(`✅ Demoted: @${quoted.participant.split('@')[0]}${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
