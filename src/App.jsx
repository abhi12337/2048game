import { useState, useEffect, useCallback } from 'react';
import './App.css';

const Game2048 = () => {
    const SIZE = 4;
    
    const [grid, setGrid] = useState([]);
    const [score, setScore] = useState(0);
    const [best, setBest] = useState(() => parseInt(localStorage.getItem('best2048')) || 0);
    const [gameWon, setGameWon] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState({ show: false, text: '', type: '' });

    // Initialize grid
    const initGrid = useCallback(() => {
        const newGrid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
        return newGrid;
    }, []);

    // Add random tile
    const addRandomTile = useCallback((currentGrid) => {
        const emptyCells = [];
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (currentGrid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const newGrid = currentGrid.map(row => [...row]);
            newGrid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
            return newGrid;
        }
        return currentGrid;
    }, []);

    // Initialize game
    useEffect(() => {
        let newGrid = initGrid();
        newGrid = addRandomTile(newGrid);
        newGrid = addRandomTile(newGrid);
        setGrid(newGrid);
    }, [initGrid, addRandomTile]);

    // Move functions
    const moveLeft = useCallback((currentGrid) => {
        let newGrid = currentGrid.map(row => [...row]);
        let newScore = 0;
        let moved = false;

        for (let i = 0; i < SIZE; i++) {
            const row = newGrid[i].filter(cell => cell !== 0);
            const merged = [];
            
            for (let j = 0; j < row.length; j++) {
                if (j < row.length - 1 && row[j] === row[j + 1]) {
                    merged.push(row[j] * 2);
                    newScore += row[j] * 2;
                    j++;
                } else {
                    merged.push(row[j]);
                }
            }
            
            while (merged.length < SIZE) {
                merged.push(0);
            }
            
            if (JSON.stringify(newGrid[i]) !== JSON.stringify(merged)) {
                moved = true;
            }
            
            newGrid[i] = merged;
        }
        
        return { grid: newGrid, score: newScore, moved };
    }, []);

    const moveRight = useCallback((currentGrid) => {
        let newGrid = currentGrid.map(row => [...row]);
        let newScore = 0;
        let moved = false;

        for (let i = 0; i < SIZE; i++) {
            const row = newGrid[i].filter(cell => cell !== 0);
            const merged = [];
            
            for (let j = row.length - 1; j >= 0; j--) {
                if (j > 0 && row[j] === row[j - 1]) {
                    merged.unshift(row[j] * 2);
                    newScore += row[j] * 2;
                    j--;
                } else {
                    merged.unshift(row[j]);
                }
            }
            
            while (merged.length < SIZE) {
                merged.unshift(0);
            }
            
            if (JSON.stringify(newGrid[i]) !== JSON.stringify(merged)) {
                moved = true;
            }
            
            newGrid[i] = merged;
        }
        
        return { grid: newGrid, score: newScore, moved };
    }, []);

    const moveUp = useCallback((currentGrid) => {
        let newGrid = currentGrid.map(row => [...row]);
        let newScore = 0;
        let moved = false;

        for (let j = 0; j < SIZE; j++) {
            const col = [];
            for (let i = 0; i < SIZE; i++) {
                if (newGrid[i][j] !== 0) {
                    col.push(newGrid[i][j]);
                }
            }
            
            const merged = [];
            for (let i = 0; i < col.length; i++) {
                if (i < col.length - 1 && col[i] === col[i + 1]) {
                    merged.push(col[i] * 2);
                    newScore += col[i] * 2;
                    i++;
                } else {
                    merged.push(col[i]);
                }
            }
            
            while (merged.length < SIZE) {
                merged.push(0);
            }
            
            for (let i = 0; i < SIZE; i++) {
                if (newGrid[i][j] !== merged[i]) {
                    moved = true;
                }
                newGrid[i][j] = merged[i];
            }
        }
        
        return { grid: newGrid, score: newScore, moved };
    }, []);

    const moveDown = useCallback((currentGrid) => {
        let newGrid = currentGrid.map(row => [...row]);
        let newScore = 0;
        let moved = false;

        for (let j = 0; j < SIZE; j++) {
            const col = [];
            for (let i = 0; i < SIZE; i++) {
                if (newGrid[i][j] !== 0) {
                    col.push(newGrid[i][j]);
                }
            }
            
            const merged = [];
            for (let i = col.length - 1; i >= 0; i--) {
                if (i > 0 && col[i] === col[i - 1]) {
                    merged.unshift(col[i] * 2);
                    newScore += col[i] * 2;
                    i--;
                } else {
                    merged.unshift(col[i]);
                }
            }
            
            while (merged.length < SIZE) {
                merged.unshift(0);
            }
            
            for (let i = 0; i < SIZE; i++) {
                if (newGrid[i][j] !== merged[i]) {
                    moved = true;
                }
                newGrid[i][j] = merged[i];
            }
        }
        
        return { grid: newGrid, score: newScore, moved };
    }, []);

    // Check win
    const checkWin = useCallback((currentGrid) => {
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (currentGrid[i][j] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }, []);

    // Check game over
    const checkGameOver = useCallback((currentGrid) => {
        // Check for empty cells
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (currentGrid[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // Check for possible merges
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                const current = currentGrid[i][j];
                
                if (j < SIZE - 1 && currentGrid[i][j + 1] === current) {
                    return false;
                }
                
                if (i < SIZE - 1 && currentGrid[i + 1][j] === current) {
                    return false;
                }
            }
        }
        
        return true;
    }, []);

    // Handle move
    const handleMove = useCallback((direction) => {
        setGrid((currentGrid) => {
            if (gameOver || currentGrid.length === 0) return currentGrid;

            let result;
            switch (direction) {
                case 'left':
                    result = moveLeft(currentGrid);
                    break;
                case 'right':
                    result = moveRight(currentGrid);
                    break;
                case 'up':
                    result = moveUp(currentGrid);
                    break;
                case 'down':
                    result = moveDown(currentGrid);
                    break;
                default:
                    return currentGrid;
            }

            if (result.moved) {
                const newGrid = addRandomTile(result.grid);
                
                setScore((currentScore) => {
                    const newScore = currentScore + result.score;
                    if (newScore > best) {
                        setBest(newScore);
                        localStorage.setItem('best2048', newScore);
                    }
                    return newScore;
                });

                if (checkWin(newGrid) && !gameWon) {
                    setGameWon(true);
                    setMessage({ show: true, text: 'You Win!', type: 'game-won' });
                } else if (checkGameOver(newGrid)) {
                    setGameOver(true);
                    setMessage({ show: true, text: 'Game Over!', type: 'game-over' });
                }
                
                return newGrid;
            }
            
            return currentGrid;
        });
    }, [gameOver, gameWon, best, moveLeft, moveRight, moveUp, moveDown, addRandomTile, checkWin, checkGameOver]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                
                switch (e.key) {
                    case 'ArrowUp':
                        handleMove('up');
                        break;
                    case 'ArrowDown':
                        handleMove('down');
                        break;
                    case 'ArrowLeft':
                        handleMove('left');
                        break;
                    case 'ArrowRight':
                        handleMove('right');
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleMove]);

    // Touch controls for mobile
    useEffect(() => {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        const handleTouchStart = (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        };

        const handleTouchEnd = (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        };

        const handleSwipe = () => {
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const minSwipeDistance = 50;

            // Determine if swipe was horizontal or vertical
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        handleMove('right');
                    } else {
                        handleMove('left');
                    }
                }
            } else {
                // Vertical swipe
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        handleMove('down');
                    } else {
                        handleMove('up');
                    }
                }
            }
        };

        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.addEventListener('touchstart', handleTouchStart);
            gameContainer.addEventListener('touchend', handleTouchEnd);

            return () => {
                gameContainer.removeEventListener('touchstart', handleTouchStart);
                gameContainer.removeEventListener('touchend', handleTouchEnd);
            };
        }
    }, [handleMove]);

    // Restart game
    const restart = useCallback(() => {
        let newGrid = initGrid();
        newGrid = addRandomTile(newGrid);
        newGrid = addRandomTile(newGrid);
        setGrid(newGrid);
        setScore(0);
        setGameWon(false);
        setGameOver(false);
        setMessage({ show: false, text: '', type: '' });
    }, [initGrid, addRandomTile]);

    // Get tile class
    const getTileClass = (value) => {
        if (value === 0) return '';
        if (value > 2048) return 'tile tile-super';
        return `tile tile-${value}`;
    };

    // Calculate tile position based on viewport
    const getTilePosition = (row, col) => {
        const isMobile = window.innerWidth <= 520;
        if (isMobile) {
            // Match CSS: (100vw - 64px) / 4 for cell size, 8px gap
            const viewportWidth = window.innerWidth;
            const cellSize = Math.min(90, (viewportWidth - 64) / 4);
            const gap = 8;
            return {
                left: `${col * (cellSize + gap)}px`,
                top: `${row * (cellSize + gap)}px`,
            };
        }
        return {
            left: `${col * 121.25}px`,
            top: `${row * 121.25}px`,
        };
    };

    return (
        <div className="app">
            <div className="container">
                <div className="header">
                    <h1>2048</h1>
                    <div className="score-container">
                        <div className="score-box">
                            <div className="score-label">SCORE</div>
                            <div className="score">{score}</div>
                        </div>
                        <div className="score-box">
                            <div className="score-label">BEST</div>
                            <div className="score">{best}</div>
                        </div>
                    </div>
                </div>
                
                <div className="above-game">
                    <p className="game-intro">
                        Join the numbers and get to the <strong>2048 tile!</strong>
                    </p>
                    <button className="new-game-button" onClick={restart}>
                        New Game
                    </button>
                </div>
                
                <div className="game-container">
                    <div className="grid-container">
                        {Array(SIZE).fill(null).map((_, i) => (
                            <div key={i} className="grid-row">
                                {Array(SIZE).fill(null).map((_, j) => (
                                    <div key={j} className="grid-cell"></div>
                                ))}
                            </div>
                        ))}
                    </div>
                    
                    <div className="tile-container">
                        {grid.length > 0 && grid.map((row, i) =>
                            row.map((value, j) =>
                                value !== 0 ? (
                                    <div
                                        key={`${i}-${j}-${value}`}
                                        className={getTileClass(value)}
                                        style={getTilePosition(i, j)}
                                    >
                                        {value}
                                    </div>
                                ) : null
                            )
                        )}
                    </div>
                    
                    {message.show && (
                        <div className={`game-message ${message.type}`}>
                            <p>{message.text}</p>
                            <button className="retry-button" onClick={restart}>
                                Try again
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="game-explanation">
                    <p>
                        <strong>HOW TO PLAY:</strong> Use your <strong>arrow keys</strong> to move the tiles. 
                        When two tiles with the same number touch, they <strong>merge into one!</strong>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Game2048;
