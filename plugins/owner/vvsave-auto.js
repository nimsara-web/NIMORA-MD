/**
 * NIMORA MD - Auto ViewOnce Saver
 * Category: owner
 * 
 * Automatically saves ALL view-once media received to bot's self-chat.
 * Controlled by VVSAVE_AUTO setting (on/off).
 */

const pino = require('pino');
const { downloadMediaMessage } = require('baileys');

module.exports = {
    name: 'vvsaveauto',
    aliases: ['autovv', 'vvauto'],
    category: 'owner',
    description: 'Toggle auto-save for all view-once media',

    async execute(ctx) {
        const { reply, number, isOwner, get, handleSettingUpdate, FOOTER } = ctx;

        if (!isOwner) return reply(`⚠️ *Only Bot Owner!*${FOOTER}`);

        const action = ctx.args?.[0]?.toLowerCase();

        if (action === 'on' || action === 'off') {
            await handleSettingUpdate('VVSAVE_AUTO', action, reply, number);
            if (action === 'on') {
                await reply(`✅ *Auto VVSave ENABLED*

💾 ALL view-once media will be silently saved to bot's self-chat.
👤 Senders will NOT be notified.
🎯 Emoji reaction: 👀 (auto)

⚠️ *Warning:* This runs on every view-once message!${FOOTER}`);
            }
            return;
        }

        const current = await get('VVSAVE_AUTO', number) || 'off';
        await reply(`📊 *AUTO VVSAVE*

🔘 *Status:* ${current === 'on' ? '✅ ON' : '❌ OFF'}

*Commands:*
• \`.vvsaveauto on\` - Enable auto-save
• \`.vvsaveauto off\` - Disable

💡 When ON, every view-once media is auto-saved silently.${FOOTER}`);
    }
};
