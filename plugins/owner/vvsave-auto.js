/**
 * NIMORA MD - Auto ViewOnce Saver
 * Category: owner
 * 
 * Automatically saves ALL view-once media to bot's self-chat.
 * Toggle: .vvsaveauto on/off
 */

module.exports = {
    name: 'vvsaveauto',
    aliases: ['autovv', 'vvauto', 'autovvsave'],
    category: 'owner',
    description: 'Toggle auto-save for view-once media',

    async execute(ctx) {
        const { args, reply, number, isOwner, isMainOwner, get, handleSettingUpdate, FOOTER } = ctx;

        // ==========================================
        // 👑 OWNER CHECK
        // ==========================================
        if (!isOwner && !isMainOwner) {
            return reply(`⚠️ *Only Bot Owner!*${FOOTER}`);
        }

        const action = args[0]?.toLowerCase();

        // ==========================================
        // 📊 STATUS (no args)
        // ==========================================
        if (!action || !['on', 'off'].includes(action)) {
            const current = await get('VVSAVE_AUTO', number) || 'off';
            const emoji = await get('VVSAVE_EMOJI', number) || '👀';

            return reply(`🔒 *AUTO VVSAVE STATUS*

📊 *Status:* ${current === 'on' ? '✅ ON' : '❌ OFF'}
🎯 *Emoji:* ${emoji}

*Commands:*
• \`.vvsaveauto on\` - Enable
• \`.vvsaveauto off\` - Disable

💡 When ON, every view-once media is auto-saved silently to bot's self-chat.${FOOTER}`);
        }

        // ==========================================
        // 💾 UPDATE SETTING
        // ==========================================
        try {
            await handleSettingUpdate('VVSAVE_AUTO', action, reply, number);

            if (action === 'on') {
                await reply(`✅ *AUTO VVSAVE ENABLED*

📊 Status: *ON*
🎯 Emoji: 👀

💾 How it works:
1. Someone sends a view-once photo/video
2. Bot silently reacts with 👀
3. Media is auto-saved to YOUR self-chat (bot number)
4. Sender will NOT be notified

⚠️ *Important:* Bot must be online when the view-once is received!${FOOTER}`);
            } else {
                await reply(`❌ *AUTO VVSAVE DISABLED*${FOOTER}`);
            }
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
