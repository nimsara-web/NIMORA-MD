module.exports = {
    name: 'setprefix',
    aliases: ['prefix'],
    category: 'main',
    description: 'Change bot prefix',

    async execute(ctx) {
        const { args, reply, isOwner, handleSettingUpdate, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const newPrefix = args[0];
        if (!newPrefix) return reply(`⚠️ Usage: .setprefix [New Prefix]${FOOTER}`);
        if (newPrefix.length > 3) return reply(`⚠️ Prefix must be 1-3 characters!${FOOTER}`);

        await handleSettingUpdate('PREFIX', newPrefix, reply, ctx.number);
    }
};
