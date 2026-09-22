// Store XO games per chat
const xoGames = new Map();

function createBoard() {
    return ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
}

function renderBoard(board) {
    let out = '';
    for (let i = 0; i < 9; i += 3) {
        out += `${board[i]}  │  ${board[i + 1]}  │  ${board[i + 2]}\n`;
        if (i < 6) out += `───┼─────┼───\n`;
    }
    return out;
}

function checkWin(board, mark) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    return lines.some(([a, b, c]) => board[a] === mark && board[b] === mark && board[c] === mark);
}

function botMove(board) {
    const empty = board.map((v, i) => v.match(/[1-9]/) ? i : -1).filter(i => i !== -1);
    if (empty.length === 0) return -1;
    return empty[Math.floor(Math.random() * empty.length)];
}

module.exports = {
    name: 'xo',
    category: 'game',
    description: 'Play Tic-Tac-Toe vs bot',

    async execute(ctx) {
        const { args, reply, sender, FOOTER } = ctx;

        const move = args[0];

        // Start new game
        if (!move) {
            xoGames.set(sender, { board: createBoard(), player: '❌', bot: '⭕', turn: 'player' });
            const board = xoGames.get(sender).board;

            return reply(`🎮 *XO GAME - You vs Bot*

You = ❌ | Bot = ⭕

\`\`\`
${renderBoard(board)}
\`\`\`

💡 Reply with a number (1-9) to make your move!${FOOTER}`);
        }

        const game = xoGames.get(sender);
        if (!game) return reply(`⚠️ No active game! Start with \`.xo\`${FOOTER}`);

        const pos = parseInt(move) - 1;
        if (pos < 0 || pos > 8 || !game.board[pos].match(/[1-9]/)) {
            return reply(`❌ Invalid move! Pick a number from the board.${FOOTER}`);
        }

        // Player move
        game.board[pos] = game.player;

        if (checkWin(game.board, game.player)) {
            xoGames.delete(sender);
            return reply(`🎉 *YOU WON!*

\`\`\`
${renderBoard(game.board)}
\`\`\`

🏆 Congratulations!${FOOTER}`);
        }

        if (!game.board.some(v => v.match(/[1-9]/))) {
            xoGames.delete(sender);
            return reply(`🤝 *DRAW!*

\`\`\`
${renderBoard(game.board)}
\`\`\``);
        }

        // Bot move
        const botPos = botMove(game.board);
        if (botPos !== -1) {
            game.board[botPos] = game.bot;
        }

        if (checkWin(game.board, game.bot)) {
            xoGames.delete(sender);
            return reply(`😢 *BOT WON!*

\`\`\`
${renderBoard(game.board)}
\`\`\`

💡 Try again!${FOOTER}`);
        }

        if (!game.board.some(v => v.match(/[1-9]/))) {
            xoGames.delete(sender);
            return reply(`🤝 *DRAW!*

\`\`\`
${renderBoard(game.board)}
\`\`\``);
        }

        await reply(`🎮 *YOUR TURN*

\`\`\`
${renderBoard(game.board)}
\`\`\`

💡 Reply with a number (1-9)${FOOTER}`);
    }
};
