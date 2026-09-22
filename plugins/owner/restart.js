module.exports = {
    name: 'restart',
    aliases: ['reboot'],
    category: 'owner',
    description: 'Restart bot process',

    async execute(ctx) {
        const { reply, isMainOwner, FOOTER } = ctx;
        if (!isMainOwner) return reply(`⚠️ *Main Owner Only!*${FOOTER}`);

        await reply(`🔄 *Restarting bot...*\n\n⏱️ Back in ~10 seconds${FOOTER}`);

        setTimeout(() => {
            process.exit(0);
        }, 2000);
    }
};
