const { hangmanGames } = require('./_state');

const WORDS = ['javascript', 'whatsapp', 'programming', 'developer', 'computer', 'internet', 'elephant', 'butterfly'];

module.exports = {
    name: 'hangman',
    aliases: ['hm'],
    category: 'game',
    description: 'Hangman word game',

    async execute(ctx) {
        const { args, reply, sender, FOOTER } = ctx;

        const letter = args[0]?.toLowerCase();

        if (!hangmanGames.has(sender)) {
            const word = WORDS[Math.floor(Math.random() * WORDS.length)];
            hangmanGames.set(sender, {
                word,
                guessed: new Set(),
                wrong: 0,
                maxWrong: 6
            });

            const display = word.split('').map(() => '_').join(' ');
            return reply(`🎮 *HANGMAN*

📝 *Word:* \`${display}\`
❤️ *Lives:* 6/6

💡 Reply with a letter!${FOOTER}`);
        }

        const game = hangmanGames.get(sender);

        if (!letter || letter.length !== 1 || !/[a-z]/.test(letter)) {
            return reply(`⚠️ Send a single letter (a-z)${FOOTER}`);
        }

        if (game.guessed.has(letter)) {
            return reply(`⚠️ Already guessed: *${letter}*${FOOTER}`);
        }

        game.guessed.add(letter);

        if (game.word.includes(letter)) {
            // Correct
            const display = game.word.split('').map(c => game.guessed.has(c) ? c : '_').join(' ');

            if (!display.includes('_')) {
                hangmanGames.delete(sender);
                return reply(`🎉 *YOU WON!*

✅ Word: *${game.word}*${FOOTER}`);
            }

            return reply(`✅ *CORRECT!*

📝 *Word:* \`${display}\`
❤️ *Lives:* ${game.maxWrong - game.wrong}/6
🔤 *Guessed:* ${[...game.guessed].join(', ')}${FOOTER}`);
        } else {
            // Wrong
            game.wrong++;
            if (game.wrong >= game.maxWrong) {
                hangmanGames.delete(sender);
                return reply(`💀 *GAME OVER!*

❌ Word was: *${game.word}*${FOOTER}`);
            }

            const display = game.word.split('').map(c => game.guessed.has(c) ? c : '_').join(' ');
            return reply(`❌ *WRONG!*

📝 *Word:* \`${display}\`
❤️ *Lives:* ${game.maxWrong - game.wrong}/6
🔤 *Guessed:* ${[...game.guessed].join(', ')}${FOOTER}`);
        }
    }
};
