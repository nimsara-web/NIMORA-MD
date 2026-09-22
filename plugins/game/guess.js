const { guessGames } = require('./_state');

const WORDS = ['apple', 'banana', 'orange', 'mango', 'grape', 'pineapple', 'strawberry', 'watermelon'];

module.exports = {
    name: 'guess',
    aliases: ['guessword', 'wordguess'],
    category: 'game',
    description: 'Guess the word game',

    async execute(ctx) {
        const { args, reply, sender, FOOTER } = ctx;

        const guess = args[0]?.toLowerCase();

        // No guess → start new game
        if (!guess) {
            const word = WORDS[Math.floor(Math.random() * WORDS.length)];
            const hint = word[0] + '_'.repeat(word.length - 1);

            guessGames.set(sender, { word, attempts: 0, startTime: Date.now() });

            return reply(`🎮 *GUESS THE WORD*

🔤 *Hint:* \`${hint}\`
📏 *Length:* ${word.length}
⏱️ *Time:* 2 minutes

💡 Reply with your guess!${FOOTER}`);
        }

        const game = guessGames.get(sender);
        if (!game) return reply(`⚠️ No active game! Start with \`.guess\`${FOOTER}`);

        // Time check
        if (Date.now() - game.startTime > 120000) {
            guessGames.delete(sender);
            return reply(`⏰ Time's up! The word was: *${game.word}*${FOOTER}`);
        }

        game.attempts++;

        if (guess === game.word) {
            guessGames.delete(sender);
            return reply(`🎉 *CORRECT!*

✅ Word: *${game.word}*
🎯 Attempts: ${game.attempts}${FOOTER}`);
        }

        const hint = game.word[0] + '_'.repeat(game.word.length - 1);
        await reply(`❌ Wrong!

🔤 *Hint:* \`${hint}\`
🎯 Attempts: ${game.attempts}${FOOTER}`);
    }
};
