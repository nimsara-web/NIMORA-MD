/**
 * NIMORA MD - All JIDs
 * Category: owner
 * 
 * List all groups bot is in.
 * BOT OWNER + MAIN OWNER can use.
 */

module.exports = {
    name: 'alljid',
    aliases: ['mygroups', 'listjid', 'groups'],
    category: 'owner',
    description: 'List all groups bot is in (owner only)',

    async execute(ctx) {
        const { reply, isOwner, isMainOwner, socket, FOOTER } = ctx;

        if (!isOwner && !isMainOwner) {
            return reply(`⚠️ *Owner Only!*${FOOTER}`);
        }

        try {
            const chats = await socket.groupFetchAllParticipating();
            const groups = Object.values(chats);

            if (groups.length === 0) {
                return reply(`📋 *No groups found!*

💡 Bot is not in any group${FOOTER}`);
            }

            let text = `📋 *ALL GROUPS* (${groups.length})\n\n`;

            groups.slice(0, 20).forEach((g, i) => {
                text += `${i + 1}. *${g.subject}*\n`;
                text += `   🆔 \`${g.id}\`\n`;
                text += `   👥 ${g.participants.length} members\n\n`;
            });

            if (groups.length > 20) {
                text += `\n⏭️ ... and ${groups.length - 20} more`;
            }

            text += `\n📊 *Total:* ${groups.length}`;

            await reply(text + FOOTER);
            console.log(`[ALLJID] Listed ${groups.length} groups`);
        } catch (e) {
            console.error('[ALLJID] Error:', e.message);
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
