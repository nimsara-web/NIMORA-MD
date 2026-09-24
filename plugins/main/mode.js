/**
 * NIMORA MD - Bot Mode
 * Category: main
 */

const config = require('../../config');

module.exports = {
    name: 'mode',
    aliases: ['botmode', 'setmode'],
    category: 'main',
    description: 'Change bot mode (owner only)',

    async execute(ctx) {
        const {
            args, reply, isOwner, isMainOwner,
            get, input, number, senderNumber, FOOTER
        } = ctx;

        // 🔒 OWNER CHECK
        if (!isOwner && !isMainOwner) {
            return reply(`⚠️ *Owner Only!*${FOOTER}`);
        }

        const option = args[0]?.toLowerCase();
        const validModes = ['public', 'group', 'inbox', 'private'];

        // Show current mode
        if (!option || !validModes.includes(option)) {
            const current = (await get('BOT_MODE', number)) || config.defaultMode;

            return reply(`⚙️ *BOT MODE*

📊 *Current:* *${current.toUpperCase()}*

*Available:*
🌐 *public* — Everyone
👥 *group* — Only groups
📥 *inbox* — Only DM (inbox)
🔒 *private* — Only owner

*Usage:*
• \`.mode public\`
• \`.mode group\`
• \`.mode inbox\`
• \`.mode private\`${FOOTER}`);
        }

        // Update mode directly (not via handleSettingUpdate)
        try {
            await input('BOT_MODE', option, number);

            await reply(`✅ *MODE UPDATED*

📊 *New Mode:* *${option.toUpperCase()}*

${option === 'public' ? '🌐 Everyone can use bot' : ''}
${option === 'group' ? '👥 Only group messages' : ''}
${option === 'inbox' ? '📥 Only DM (inbox) messages' : ''}
${option === 'private' ? '🔒 Only owner' : ''}

💡 *Verify:* Send a message in wrong place - bot should ignore.${FOOTER}`);

            console.log(`[MODE] ✅ Changed to "${option}" by ${senderNumber}`);
        } catch (e) {
            console.error('[MODE] Error:', e.message);
            await reply(`❌ *Failed:* ${e.message}${FOOTER}`);
        }
    }
};
