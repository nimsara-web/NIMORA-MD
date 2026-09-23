/**
 * NIMORA MD - Status Auto-Save Toggle
 * Category: owner
 * 
 * Toggle auto-save of statuses.
 */

module.exports = {
    name: 'statusauto',
    aliases: ['autostatus', 'statusautosave'],
    category: 'owner',
    description: 'Toggle auto-save for statuses',

    async execute(ctx) {
        const { args, reply, number, isOwner, isMainOwner, get, input, handleSettingUpdate, FOOTER } = ctx;

        if (!isOwner && !isMainOwner) {
            return reply(`⚠️ *Only Bot Owner!*${FOOTER}`);
        }

        const action = args[0]?.toLowerCase();

        // ==========================================
        // 📊 STATUS (no args)
        // ==========================================
        if (!action || !['on', 'off'].includes(action)) {
            const current = await get('STATUS_AUTO', number) || 'off';
            const emoji = await get('STATUS_EMOJI', number) || '👀';

            return reply(`📊 *STATUS AUTO-SAVE*

📥 *Status:* ${current === 'on' ? '✅ ON' : '❌ OFF'}
🎯 *Emoji:* ${emoji}

*Usage:*
• \`.statusauto on\` - Enable
• \`.statusauto off\` - Disable

💡 When ON, every status the bot views will be auto-saved to bot self-chat.

⚠️ *Requirements:*
• Bot must have \`.autoview on\` enabled
• Bot must be online when status is posted
• Bot must have viewed the status${FOOTER}`);
        }

        // ==========================================
        // 💾 UPDATE
        // ==========================================
        try {
            await handleSettingUpdate('STATUS_AUTO', action, reply, number);

            if (action === 'on') {
                await reply(`✅ *STATUS AUTO-SAVE ENABLED*

📥 Status: *ON*
🎯 Emoji: 👀

💡 How it works:
1. Bot auto-views statuses (if autoview ON)
2. Each status is silently saved
3. Media appears in bot's self-chat (${number})
4. Sender is NOT notified

⚠️ *Important:* Enable \`.autoview on\` for auto-viewing!${FOOTER}`);
            } else {
                await reply(`❌ *STATUS AUTO-SAVE DISABLED*${FOOTER}`);
            }
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
