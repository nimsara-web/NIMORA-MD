module.exports = {
    name: 'gsetting',
    aliases: ['groupsettings'],
    category: 'group',
    description: 'Group settings (edit/send)',

    async execute(ctx) {
        const { args, reply, socket, sender, FOOTER } = ctx;
        if (!sender.endsWith('@g.us')) return reply(`⚠️ Group only!${FOOTER}`);

        const option = args[0]?.toLowerCase();
        if (!['edit', 'send', 'locked', 'unlocked'].includes(option)) {
            return reply(`⚙️ *GROUP SETTINGS*

*Usage:* .gsetting [option]

Options:
• edit - Only admins can edit group info
• send - Only admins can send (mute)
• locked - Only admins (default)
• unlocked - Everyone${FOOTER}`);
        }

        try {
            if (option === 'edit' || option === 'locked') {
                await socket.groupSettingUpdate(sender, 'locked');
            } else if (option === 'send') {
                await socket.groupSettingUpdate(sender, 'announcement');
            } else if (option === 'unlocked') {
                await socket.groupSettingUpdate(sender, 'unlocked');
            }
            await reply(`✅ Group setting updated to: *${option}*${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
