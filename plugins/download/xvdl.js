module.exports = {
    name: 'xvdl',
    category: 'download',
    description: 'Adult content downloader (18+)',

    async execute(ctx) {
        const { reply, FOOTER } = ctx;

        await reply(`🔞 *Restricted Command*

This command is disabled for safety reasons.

If you need to download adult content, please use a dedicated tool.

💡 Contact owner if this is a mistake.${FOOTER}`);
    }
};
