/**
 * NIMORA MD - Restart Command
 * Category: owner
 * 
 * Restart bot process.
 * MAIN OWNER ONLY.
 * 
 * ⚠️ On Render: Bot will auto-restart after process.exit(0)
 */

module.exports = {
    name: 'restart',
    aliases: ['reboot'],
    category: 'owner',
    description: 'Restart bot process (main owner only)',

    async execute(ctx) {
        const { reply, isMainOwner, isOwner, senderNumber, FOOTER } = ctx;

        // ==========================================
        // 🔒 MAIN OWNER ONLY
        // ==========================================
        if (!isMainOwner) {
            return reply(`⚠️ *Access Denied!*

💡 Only MAIN bot owner can restart the bot.

📞 Contact: 0784280074

🔍 *Your status:*
• isOwner: ${isOwner ? '✅' : '❌'}
• isMainOwner: ${isMainOwner ? '✅' : '❌'}${FOOTER}`);
        }

        await reply(`🔄 *Restarting bot...*

⏱️ Back online in ~10 seconds
👤 *By:* ${senderNumber}
🕐 *Time:* ${new Date().toLocaleString()}${FOOTER}`);

        console.log(`[RESTART] 🔄 Restart requested by ${senderNumber}`);

        // Delay for message to send
        setTimeout(() => {
            console.log(`[RESTART] ✅ Exiting process...`);
            process.exit(0);
        }, 2000);
    }
};
