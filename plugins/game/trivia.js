const axios = require('axios');

const triviaGames = new Map();

module.exports = {
    name: 'trivia',
    aliases: ['quiz'],
    category: 'game',
    description: 'Trivia quiz game',

    async execute(ctx) {
        const { args, reply, sender, socket, msg, channelContext, FOOTER } = ctx;

        const answer = args[0]?.toLowerCase();

        // If answer given and game active
        if (answer && triviaGames.has(sender)) {
            const game = triviaGames.get(sender);
            triviaGames.delete(sender);

            const correct = game.correct.toLowerCase();
            const isCorrect = answer === correct || answer === game.correctIndex;

            if (isCorrect) {
                return reply(`🎉 *CORRECT!*

✅ Answer: *${game.correct}*
🎯 Nice one!${FOOTER}`);
            } else {
                return reply(`❌ *WRONG!*

✅ Correct answer: *${game.correct}*
💡 Better luck next time!${FOOTER}`);
            }
        }

        // New question
        await reply(`🎯 Fetching trivia question... ⏳${FOOTER}`);

        try {
            const res = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple', { timeout: 15000 });
            const q = res.data.results[0];

            const options = [...q.incorrect_answers, q.correct_answer]
                .map(decodeHtml)
                .sort(() => Math.random() - 0.5);

            const correctText = decodeHtml(q.correct_answer);
            const correctIndex = String(options.indexOf(correctText) + 1);

            triviaGames.set(sender, {
                correct: correctText,
                correctIndex,
                timestamp: Date.now()
            });

            let text = `🎯 *TRIVIA QUIZ*\n\n`;
            text += `📂 Category: ${q.category}\n`;
            text += `⭐ Difficulty: ${q.difficulty.toUpperCase()}\n\n`;
            text += `❓ *${decodeHtml(q.question)}*\n\n`;
            options.forEach((opt, i) => {
                text += `${i + 1}. ${opt}\n`;
            });
            text += `\n💡 Reply with number or answer!`;

            await reply(text + FOOTER);

            // Auto-clear after 60s
            setTimeout(() => triviaGames.delete(sender), 60000);
        } catch (e) {
            await reply(`❌ Trivia failed!${FOOTER}`);
        }
    }
};

function decodeHtml(str) {
    return str.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
