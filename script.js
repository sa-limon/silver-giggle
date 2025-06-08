document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const gameStatus = document.getElementById('game-status');
    const resetButton = document.getElementById('reset-btn');
    const pvpBtn = document.getElementById('pvp-btn');
    const pvcBtn = document.getElementById('pvc-btn');
    const body = document.body;
    
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let gameMode = 'pvp';
    
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    // Color themes for players
    const themes = {
        pvp: {
            x: '#6c5ce7',
            o: '#fd79a8'
        },
        pvc: {
            x: '#00b894',
            o: '#e84393'
        }
    };
    
    // Switch game mode
    const switchMode = (mode) => {
        gameMode = mode;
        pvpBtn.classList.toggle('active', mode === 'pvp');
        pvcBtn.classList.toggle('active', mode === 'pvc');
        
        // Change background based on mode
        if (mode === 'pvp') {
            body.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
        } else {
            body.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #a8e6cf 100%)';
        }
        
        resetGame();
    };
    
    pvpBtn.addEventListener('click', () => switchMode('pvp'));
    pvcBtn.addEventListener('click', () => switchMode('pvc'));
    
    // Handle cell click with animation
    const handleCellClick = (e) => {
        if (!gameActive) return;
        
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        if (gameState[clickedCellIndex] !== '') return;
        
        // Add click animation
        clickedCell.style.transform = 'scale(0.9)';
        setTimeout(() => {
            clickedCell.style.transform = 'scale(1)';
        }, 100);
        
        makeMove(clickedCellIndex, currentPlayer);
        
        if (!gameActive) return;
        
        if (gameMode === 'pvc' && currentPlayer === 'O') {
            setTimeout(makeComputerMove, 800); // Longer delay for "thinking" effect
        }
    };
    
    // Make a move with visual feedback
    const makeMove = (cellIndex, player) => {
        gameState[cellIndex] = player;
        const cell = cells[cellIndex];
        
        // Add player class for color
        cell.classList.add(player.toLowerCase());
        
        // Animate the appearance
        cell.style.opacity = '0';
        cell.textContent = player;
        
        // Animate fade in
        let opacity = 0;
        const fadeIn = setInterval(() => {
            opacity += 0.1;
            cell.style.opacity = opacity;
            if (opacity >= 1) clearInterval(fadeIn);
        }, 30);
        
        checkResult();
        
        if (gameActive) {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateGameStatus();
        }
    };
    
    // Enhanced computer move with "thinking" animation
    const makeComputerMove = () => {
        if (!gameActive || currentPlayer !== 'O') return;
        
        // Show "thinking" animation
        gameStatus.textContent = 'Computer is thinking...';
        gameStatus.style.fontStyle = 'italic';
        
        setTimeout(() => {
            let move = findWinningMove('O') || 
                       findWinningMove('X') || 
                       findRandomMove();
            
            if (move !== null) {
                makeMove(move, 'O');
            }
            
            // Reset status style
            gameStatus.style.fontStyle = 'normal';
        }, 1000); // Simulate thinking time
    };
    
    // Find a winning move for the given player
    const findWinningMove = (player) => {
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            if (gameState[a] === player && gameState[b] === player && gameState[c] === '') return c;
            if (gameState[a] === player && gameState[c] === player && gameState[b] === '') return b;
            if (gameState[b] === player && gameState[c] === player && gameState[a] === '') return a;
        }
        return null;
    };
    
    // Find a random available move
    const findRandomMove = () => {
        const availableMoves = [];
        gameState.forEach((cell, index) => {
            if (cell === '') availableMoves.push(index);
        });
        return availableMoves.length > 0 ? 
            availableMoves[Math.floor(Math.random() * availableMoves.length)] : 
            null;
    };
    
    // Check if current player won
    const checkResult = () => {
        let roundWon = false;
        
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            
            if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') continue;
            
            if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
                roundWon = true;
                highlightWinningCells(condition);
                break;
            }
        }
        
        if (roundWon) {
            const winner = currentPlayer;
            gameStatus.textContent = gameMode === 'pvp' ? 
                `Player ${winner} wins! 🎉` : 
                (winner === 'X' ? 'You win! 🎉' : 'Computer wins! 🤖');
            gameActive = false;
            
            // Celebration effect
            if (gameMode === 'pvp' || (gameMode === 'pvc' && winner === 'X')) {
                body.style.animation = 'celebrate 0.5s';
                setTimeout(() => {
                    body.style.animation = '';
                }, 500);
            }
            return;
        }
        
        // Check for draw
        if (!gameState.includes('')) {
            gameStatus.textContent = "Game ended in a draw! 🤝";
            gameActive = false;
            return;
        }
    };
    
    // Update game status text with animation
    const updateGameStatus = () => {
        gameStatus.style.transform = 'scale(0.9)';
        gameStatus.style.opacity = '0.8';
        
        setTimeout(() => {
            if (gameMode === 'pvp') {
                gameStatus.textContent = `Player ${currentPlayer}'s turn`;
            } else {
                gameStatus.textContent = currentPlayer === 'X' ? 
                    'Your turn (X)' : 
                    'Computer thinking...';
            }
            
            gameStatus.style.transform = 'scale(1)';
            gameStatus.style.opacity = '1';
        }, 200);
    };
    
    // Highlight winning cells with animation
    const highlightWinningCells = (cellsToHighlight) => {
        cellsToHighlight.forEach(index => {
            const cell = cells[index];
            cell.classList.add('winner');
            
            // Bounce animation
            cell.style.animation = 'bounce 0.5s';
            setTimeout(() => {
                cell.style.animation = '';
            }, 500);
        });
    };
    
    // Reset game with animation
    const resetGame = () => {
        // Fade out animation
        gameStatus.style.opacity = '0';
        cells.forEach(cell => {
            cell.style.opacity = '0.5';
            cell.style.transform = 'scale(0.9)';
        });
        
        setTimeout(() => {
            currentPlayer = 'X';
            gameState = ['', '', '', '', '', '', '', '', ''];
            gameActive = true;
            
            cells.forEach(cell => {
                cell.textContent = '';
                cell.className = 'cell';
                cell.style.opacity = '1';
                cell.style.transform = 'scale(1)';
            });
            
            updateGameStatus();
        }, 300);
    };
    
    // Event listeners
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    
    resetButton.addEventListener('click', resetGame);
    
    // Initialize
    switchMode('pvp');
    
    // Add keyframe animations dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        @keyframes celebrate {
            0% { background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); }
            25% { background: linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%); }
            50% { background: linear-gradient(135deg, #ffd3b6 0%, #ffaaa5 100%); }
            75% { background: linear-gradient(135deg, #ff8b94 0%, #ffaaa5 100%); }
            100% { background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); }
        }
    `;
    document.head.appendChild(style);
});
