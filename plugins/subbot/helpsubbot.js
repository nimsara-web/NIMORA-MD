module.exports = {
    name: 'helpsubbot',
    aliases: ['subhelp'],
    category: 'subbot',
    description: 'Sub-bot help',

    async execute(ctx) {
        const { reply, FOOTER } = ctx;

        await reply(`🤖 *SUB-BOT HELP*

*For Users:*
• \`.subbot\` - Request sub-bot
• \`.getsubbot\` - Check your sub-bot
• \`.delsubbot [num]\` - Delete your sub-bot

*For Main Owner:*
• \`.subcheck [num]\` - Check status
• \`.restartsubbot [num]\` - Restart one
• \`.restartallsubbot\` - Restart all
• \`.delsubbot [num]\` - Delete one
• \`.delallsubbot confirm\` - Delete all${FOOTER}`);
    }
};
