module.exports = {
    name: 'chess',
    aliases: ['playchess'],
    category: 'game',
    description: 'Chess game (coming soon)',

    async execute(ctx) {
        const { reply, FOOTER } = ctx;

        await reply(`♟️ *CHESS*

🚧 Chess game is currently in development!

💡 In the meantime, try:
• .xo - Tic Tac Toe
• .trivia - Quiz
• .hangman - Word game
• .scramble - Word scramble${FOOTER}`);
    }
};
