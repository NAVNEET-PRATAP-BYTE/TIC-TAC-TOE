document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const cells = document.querySelectorAll('.cell');
    const statusDisplay = document.getElementById('status');
    const resetButton = document.getElementById('reset-btn');
    const vsComputerBtn = document.getElementById('vs-computer');
    const vsPlayerBtn = document.getElementById('vs-player');
    const xScoreDisplay = document.getElementById('x-score');
    const oScoreDisplay = document.getElementById('o-score');

    // Game state variables
    let gameActive = true;
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let vsComputer = true;
    let scores = { X: 0, O: 0 };

    // Winning combinations
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    // Messages
    const winMessage = () => `Player ${currentPlayer} wins!`;
    const drawMessage = () => `Game ended in a draw!`;
    const currentPlayerTurn = () => `${currentPlayer}'s turn`;

    // Initialize the game
    statusDisplay.textContent = currentPlayerTurn();

    // Mode selection
    vsComputerBtn.addEventListener('click', () => {
        vsComputer = true;
        vsComputerBtn.classList.add('active');
        vsPlayerBtn.classList.remove('active');
        resetGame();
    });

    vsPlayerBtn.addEventListener('click', () => {
        vsComputer = false;
        vsPlayerBtn.classList.add('active');
        vsComputerBtn.classList.remove('active');
        resetGame();
    });

    // Handle cell click
    function handleCellClick(clickedCellEvent) {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        // Check if cell is already played or game is inactive
        if (gameState[clickedCellIndex] !== '' || !gameActive) {
            return;
        }

        // Update game state
        handleCellPlayed(clickedCell, clickedCellIndex);
        handleResultValidation();

        // If playing against computer and game is still active, make computer move
        if (vsComputer && gameActive && currentPlayer === 'O') {
            setTimeout(makeComputerMove, 700);
        }
    }

    // Update cell and game state
    function handleCellPlayed(clickedCell, clickedCellIndex) {
        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.textContent = currentPlayer;
        clickedCell.classList.add(currentPlayer.toLowerCase());
    }

    // Check for win or draw
    function handleResultValidation() {
        let roundWon = false;
        let winningCombo = [];

        // Check all winning combinations
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            const condition = gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c];
            
            if (condition) {
                roundWon = true;
                winningCombo = [a, b, c];
                break;
            }
        }

        if (roundWon) {
            highlightWinningCells(winningCombo);
            statusDisplay.textContent = winMessage();
            gameActive = false;
            updateScore(currentPlayer);
            return;
        }

        // Check for draw
        const roundDraw = !gameState.includes('');
        if (roundDraw) {
            statusDisplay.textContent = drawMessage();
            gameActive = false;
            return;
        }

        // Continue game with next player
        changePlayer();
    }

    // Highlight winning cells
    function highlightWinningCells(combo) {
        combo.forEach(index => {
            cells[index].classList.add('winning-cell');
        });
    }

    // Update score
    function updateScore(player) {
        scores[player]++;
        xScoreDisplay.textContent = `X: ${scores.X}`;
        oScoreDisplay.textContent = `O: ${scores.O}`;
    }

    // Switch player
    function changePlayer() {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusDisplay.textContent = currentPlayerTurn();
    }

    // Computer move
    function makeComputerMove() {
        if (!gameActive) return;

        // Try to win
        const winMove = findBestMove('O');
        if (winMove !== -1) {
            handleCellMove(winMove);
            return;
        }

        // Try to block
        const blockMove = findBestMove('X');
        if (blockMove !== -1) {
            handleCellMove(blockMove);
            return;
        }

        // Try center
        if (gameState[4] === '') {
            handleCellMove(4);
            return;
        }

        // Try corners
        const corners = [0, 2, 6, 8].filter(i => gameState[i] === '');
        if (corners.length > 0) {
            const randomCorner = corners[Math.floor(Math.random() * corners.length)];
            handleCellMove(randomCorner);
            return;
        }

        // Try any available cell
        const availableCells = gameState.map((cell, index) => cell === '' ? index : null).filter(cell => cell !== null);
        if (availableCells.length > 0) {
            const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
            handleCellMove(randomCell);
        }
    }

    // Find best move for computer
    function findBestMove(player) {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            // Check if we can win or block in this line
            if (gameState[a] === player && gameState[b] === player && gameState[c] === '') {
                return c;
            }
            if (gameState[a] === player && gameState[c] === player && gameState[b] === '') {
                return b;
            }
            if (gameState[b] === player && gameState[c] === player && gameState[a] === '') {
                return a;
            }
        }
        return -1;
    }

    // Handle computer move
    function handleCellMove(index) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        handleCellPlayed(cell, index);
        handleResultValidation();
    }

    // Reset game
    function resetGame() {
        gameActive = true;
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        statusDisplay.textContent = currentPlayerTurn();
        
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winning-cell');
        });
    }

    // Event listeners
    resetButton.addEventListener('click', resetGame);
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
});