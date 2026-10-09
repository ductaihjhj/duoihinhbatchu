/* ============================================
   GAME LOGIC - LOGIC GAME
   Xử lý toàn bộ logic chơi game
   ============================================ */

// =================== STATE ===================
let gameState = {
    currentLevel: 0,
    score: 0,
    hints: GAME_CONFIG.totalHints,
    correctAnswers: 0,
    selectedLetters: [],
    shuffledLevels: [],
    isChecking: false
};

// =================== DOM ELEMENTS ===================
const DOM = {
    // Screens
    startScreen: document.getElementById('startScreen'),
    gameScreen: document.getElementById('gameScreen'),
    statsBar: document.getElementById('statsBar'),
    gameContainer: document.getElementById('gameContainer'),
    successOverlay: document.getElementById('successOverlay'),
    gameOverScreen: document.getElementById('gameOverScreen'),

    // Stats
    scoreValue: document.getElementById('scoreValue'),
    currentQ: document.getElementById('currentQ'),
    totalQ: document.getElementById('totalQ'),
    hintsLeft: document.getElementById('hintsLeft'),
    hintCountBtn: document.getElementById('hintCountBtn'),

    // Game area
    progressFill: document.getElementById('progressFill'),
    levelBadge: document.getElementById('levelBadge'),
    imageArea: document.getElementById('imageArea'),
    hintBubble: document.getElementById('hintBubble'),
    answerBoxes: document.getElementById('answerBoxes'),
    lettersGrid: document.getElementById('lettersGrid'),
    actionButtons: document.getElementById('actionButtons'),

    // Success
    successText: document.getElementById('successText'),
    successAnswer: document.getElementById('successAnswer'),
    successPoints: document.getElementById('successPoints'),

    // Game Over
    finalScore: document.getElementById('finalScore'),
    correctCount: document.getElementById('correctCount'),
    accuracy: document.getElementById('accuracy'),

    // Confetti
    confettiContainer: document.getElementById('confettiContainer')
};

// =================== UTILITY ===================
function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function createConfetti() {
    DOM.confettiContainer.innerHTML = '';
    const colors = ['#FFD54F', '#FF9800', '#4CAF50', '#66BB6A', '#42A5F5', 
                    '#EF5350', '#F48FB1', '#AB47BC', '#26C6DA', '#FFF176'];
    const shapes = ['circle', 'rect', 'triangle'];
    
    for (let i = 0; i < 70; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
        piece.style.animationDelay = Math.random() * 0.8 + 's';
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        
        if (shape === 'circle') {
            const size = Math.random() * 10 + 6;
            piece.style.width = size + 'px';
            piece.style.height = size + 'px';
            piece.style.borderRadius = '50%';
            piece.style.background = color;
        } else if (shape === 'rect') {
            piece.style.width = (Math.random() * 8 + 6) + 'px';
            piece.style.height = (Math.random() * 14 + 8) + 'px';
            piece.style.borderRadius = '2px';
            piece.style.background = color;
        } else {
            piece.style.width = '0';
            piece.style.height = '0';
            piece.style.borderLeft = '6px solid transparent';
            piece.style.borderRight = '6px solid transparent';
            piece.style.borderBottom = '12px solid ' + color;
        }
        
        DOM.confettiContainer.appendChild(piece);
    }
    setTimeout(() => DOM.confettiContainer.innerHTML = '', 4000);
}

function playSound(type) {
    // Placeholder cho âm thanh - có thể thêm sau
    // const audio = new Audio(`sounds/${type}.mp3`);
    // audio.volume = 0.5;
    // audio.play().catch(() => {});
}

function getActiveLevels() {
    if (window.cloudLevels && Array.isArray(window.cloudLevels) && window.cloudLevels.length > 0) {
        return window.cloudLevels;
    }
    if (typeof getLocalFallbackLevels === 'function') {
        return getLocalFallbackLevels();
    }
    return (typeof LEVELS !== 'undefined') ? LEVELS : [];
}

// Tự động đồng bộ từ Firebase Cloud khi mở trang
window.addEventListener('DOMContentLoaded', async () => {
    if (typeof fetchCloudLevels === 'function') {
        try {
            window.cloudLevels = await fetchCloudLevels();
        } catch (e) {
            window.cloudLevels = getActiveLevels();
        }
    }
});

// =================== GAME FLOW ===================
function startGame() {
    // Hide start, show game
    DOM.startScreen.classList.add('hidden');
    DOM.statsBar.classList.remove('hidden');
    DOM.gameContainer.classList.remove('hidden');
    DOM.gameOverScreen.classList.add('hidden');
    DOM.gameOverScreen.classList.remove('show');

    const activeLevels = getActiveLevels();
    const roundCount = Math.min(GAME_CONFIG.questionsPerRound, activeLevels.length);

    // Reset state
    gameState = {
        currentLevel: 0,
        score: 0,
        hints: GAME_CONFIG.totalHints,
        correctAnswers: 0,
        selectedLetters: [],
        shuffledLevels: shuffleArray(activeLevels).slice(0, roundCount),
        isChecking: false
    };

    DOM.totalQ.textContent = gameState.shuffledLevels.length;
    updateStats();
    loadLevel();
}

function loadLevel() {
    if (gameState.currentLevel >= gameState.shuffledLevels.length) {
        showGameOver();
        return;
    }

    const level = gameState.shuffledLevels[gameState.currentLevel];
    gameState.selectedLetters = [];
    gameState.isChecking = false;

    // Update UI info
    DOM.levelBadge.innerHTML = '<i data-lucide="star" class="icon-badge"></i><span>Câu ' + (gameState.currentLevel + 1) + '</span>';
    DOM.hintBubble.textContent = '';
    DOM.hintBubble.classList.remove('show');
    DOM.progressFill.style.width = 
        (gameState.currentLevel / gameState.shuffledLevels.length * 100) + '%';

    // Load image
    loadImage(level);

    // Create answer boxes
    createAnswerBoxes(level);

    // Create letter tiles
    createLetterTiles(level);

    // Show action buttons
    DOM.actionButtons.classList.remove('hidden');
    updateStats();

    // Re-initialize Lucide icons for new DOM elements
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function loadImage(level) {
    DOM.imageArea.innerHTML = '';

    const img = document.createElement('img');
    img.src = level.image;
    img.alt = level.hint;
    img.draggable = false;

    img.onerror = function () {
        // Fallback to emoji if image fails
        if (GAME_CONFIG.showImageFallback && level.emoji) {
            DOM.imageArea.innerHTML = 
                '<div class="image-emoji-fallback">' + level.emoji + '</div>';
        } else {
            DOM.imageArea.innerHTML = 
                '<div class="image-emoji-fallback">🖼️</div>';
        }
    };

    DOM.imageArea.appendChild(img);
}

function stripDiacritics(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').replace(/Đ/g, 'D');
}

function createAnswerBoxes(level) {
    DOM.answerBoxes.innerHTML = '';
    const chars = level.answer.normalize('NFC').split('');

    chars.forEach((char, index) => {
        if (char === ' ') {
            const spacer = document.createElement('div');
            spacer.className = 'answer-spacer';
            DOM.answerBoxes.appendChild(spacer);
        } else {
            const box = document.createElement('div');
            box.className = 'answer-box';
            box.dataset.index = index;
            box.addEventListener('click', () => removeLetterFromBox(index));
            DOM.answerBoxes.appendChild(box);
        }
    });
}

function createLetterTiles(level) {
    DOM.lettersGrid.innerHTML = '';
    const answerLetters = level.answer.normalize('NFC').replace(/\s/g, '').split('');
    const extraLetters = level.extraLetters.normalize('NFC').split('');
    const allLetters = shuffleArray([...answerLetters, ...extraLetters]);

    allLetters.forEach((letter, index) => {
        const tile = document.createElement('div');
        tile.className = 'letter-tile';
        tile.textContent = letter;
        tile.dataset.index = index;
        tile.addEventListener('click', () => selectLetter(index, letter));
        DOM.lettersGrid.appendChild(tile);
    });
}

// =================== LETTER SELECTION ===================
function selectLetter(tileIndex, letter) {
    if (gameState.isChecking) return;

    const level = gameState.shuffledLevels[gameState.currentLevel];
    const answerChars = level.answer.normalize('NFC').split('');
    const boxCount = answerChars.filter(c => c !== ' ').length;

    if (gameState.selectedLetters.length >= boxCount) return;

    const tile = document.querySelector('.letter-tile[data-index="' + tileIndex + '"]');
    if (!tile || tile.classList.contains('used')) return;
    tile.classList.add('used');

    // Find next empty box
    let boxIndex = -1;
    for (let i = 0; i < answerChars.length; i++) {
        if (answerChars[i] === ' ') continue;
        const box = document.querySelector('.answer-box[data-index="' + i + '"]');
        if (box && !box.classList.contains('filled')) {
            boxIndex = i;
            break;
        }
    }

    if (boxIndex === -1) return;

    gameState.selectedLetters.push({ tileIndex, letter, boxIndex });

    const box = document.querySelector('.answer-box[data-index="' + boxIndex + '"]');
    box.textContent = letter;
    box.classList.add('filled');
    box.dataset.tileIndex = tileIndex;

    playSound('tap');

    // Check if all filled
    if (gameState.selectedLetters.length === boxCount) {
        checkAnswer();
    }
}

function removeLetterFromBox(boxIndex) {
    if (gameState.isChecking) return;

    const box = document.querySelector('.answer-box[data-index="' + boxIndex + '"]');
    if (!box || !box.classList.contains('filled')) return;

    const tileIndex = parseInt(box.dataset.tileIndex);
    gameState.selectedLetters = gameState.selectedLetters.filter(s => s.boxIndex !== boxIndex);

    box.textContent = '';
    box.classList.remove('filled', 'correct', 'wrong');
    box.removeAttribute('data-tile-index');

    const tile = document.querySelector('.letter-tile[data-index="' + tileIndex + '"]');
    if (tile) tile.classList.remove('used');
}

// =================== CHECK ANSWER ===================
function checkAnswer() {
    gameState.isChecking = true;

    const level = gameState.shuffledLevels[gameState.currentLevel];
    const answerChars = level.answer.normalize('NFC').split('');
    let userAnswer = '';

    for (let i = 0; i < answerChars.length; i++) {
        if (answerChars[i] === ' ') {
            userAnswer += ' ';
        } else {
            const box = document.querySelector('.answer-box[data-index="' + i + '"]');
            userAnswer += box ? box.textContent : '';
        }
    }

    if (userAnswer.normalize('NFC').toUpperCase() === level.answer.normalize('NFC').toUpperCase()) {
        // ✅ CORRECT
        gameState.correctAnswers++;
        const points = GAME_CONFIG.pointsPerCorrect;
        gameState.score += points;

        playSound('correct');

        const boxes = document.querySelectorAll('.answer-box');
        boxes.forEach((box, i) => {
            setTimeout(() => box.classList.add('correct'), i * 120);
        });

        setTimeout(() => {
            showSuccess(level.answer, points);
            createConfetti();
        }, boxes.length * 120 + 400);

    } else {
        // ❌ WRONG
        playSound('wrong');

        const boxes = document.querySelectorAll('.answer-box.filled');
        boxes.forEach(box => box.classList.add('wrong'));

        setTimeout(() => {
            clearAnswer(true);
            gameState.isChecking = false;
        }, 800);
    }
}

// =================== HINT ===================
function useHint() {
    if (gameState.hints <= 0 || gameState.isChecking) return;

    const level = gameState.shuffledLevels[gameState.currentLevel];
    const answerChars = level.answer.normalize('NFC').split('');

    // Find first slot that is either empty or contains a wrong letter
    let targetIndex = -1;
    for (let i = 0; i < answerChars.length; i++) {
        if (answerChars[i] === ' ') continue;
        const box = document.querySelector('.answer-box[data-index="' + i + '"]');
        if (!box) continue;
        if (!box.classList.contains('filled') || box.textContent.normalize('NFC').toUpperCase() !== answerChars[i].normalize('NFC').toUpperCase()) {
            targetIndex = i;
            break;
        }
    }

    if (targetIndex === -1) return; // All slots already have the correct letters

    const correctLetter = answerChars[targetIndex].normalize('NFC').toUpperCase();

    // If target box has an incorrect letter, remove it
    const targetBox = document.querySelector('.answer-box[data-index="' + targetIndex + '"]');
    if (targetBox && targetBox.classList.contains('filled')) {
        removeLetterFromBox(targetIndex);
    }

    // Find an unused tile with the correct letter
    let availableTile = null;
    const unusedTiles = document.querySelectorAll('.letter-tile:not(.used)');
    for (const tile of unusedTiles) {
        if (tile.textContent.normalize('NFC').toUpperCase() === correctLetter) {
            availableTile = tile;
            break;
        }
    }

    // If no unused tile found, it's placed in another box incorrectly
    if (!availableTile) {
        for (let j = 0; j < answerChars.length; j++) {
            if (j === targetIndex || answerChars[j] === ' ') continue;
            const otherBox = document.querySelector('.answer-box[data-index="' + j + '"]');
            if (otherBox && otherBox.classList.contains('filled') && otherBox.textContent.normalize('NFC').toUpperCase() === correctLetter) {
                if (answerChars[j].normalize('NFC').toUpperCase() !== correctLetter) {
                    removeLetterFromBox(j);
                    break;
                }
            }
        }
        const recheckTiles = document.querySelectorAll('.letter-tile:not(.used)');
        for (const tile of recheckTiles) {
            if (tile.textContent.normalize('NFC').toUpperCase() === correctLetter) {
                availableTile = tile;
                break;
            }
        }
    }

    if (!availableTile) return;

    // Deduct hint & update stats
    gameState.hints--;
    gameState.score = Math.max(0, gameState.score - GAME_CONFIG.hintPenalty);
    updateStats();

    // Show hint text
    DOM.hintBubble.innerHTML = '<i data-lucide="lightbulb" class="icon-stat"></i><span>' + level.hint + '</span>';
    DOM.hintBubble.classList.add('show');
    if (typeof lucide !== 'undefined') lucide.createIcons();

    playSound('hint');
    availableTile.click();
}

// =================== CLEAR ===================
function clearAnswer(force = false) {
    if (gameState.isChecking && !force) return;

    const boxes = document.querySelectorAll('.answer-box.filled');
    boxes.forEach(box => {
        const tileIndex = parseInt(box.dataset.tileIndex);
        const tile = document.querySelector('.letter-tile[data-index="' + tileIndex + '"]');
        if (tile) tile.classList.remove('used');

        box.textContent = '';
        box.classList.remove('filled', 'correct', 'wrong');
        box.removeAttribute('data-tile-index');
    });
    gameState.selectedLetters = [];
}

// =================== SKIP ===================
function skipLevel() {
    if (gameState.isChecking) return;
    gameState.currentLevel++;
    loadLevel();
}

// =================== SUCCESS ===================
function showSuccess(answer, points) {
    const messages = [
        'Tuyệt vời!', 
        'Xuất sắc!', 
        'Chính xác!', 
        'Giỏi lắm!', 
        'Đỉnh cao!',
        'Quá đỉnh!',
        'Thông minh!'
    ];
    DOM.successText.textContent = messages[Math.floor(Math.random() * messages.length)];
    DOM.successAnswer.textContent = 'Đáp án: ' + answer;
    DOM.successPoints.textContent = '+' + points + ' điểm';
    DOM.successOverlay.classList.add('show');
    updateStats();
}

function nextLevel() {
    DOM.successOverlay.classList.remove('show');
    gameState.currentLevel++;
    gameState.isChecking = false;
    loadLevel();
}

// =================== GAME OVER ===================
function showGameOver() {
    DOM.gameContainer.classList.add('hidden');
    DOM.gameOverScreen.classList.remove('hidden');
    DOM.gameOverScreen.classList.add('show');

    DOM.finalScore.textContent = gameState.score;
    DOM.correctCount.textContent = gameState.correctAnswers + '/' + gameState.shuffledLevels.length;
    DOM.accuracy.textContent = 
        Math.round(gameState.correctAnswers / gameState.shuffledLevels.length * 100) + '%';

    createConfetti();
    setTimeout(createConfetti, 1500);

    // Re-initialize icons
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function restartGame() {
    DOM.gameOverScreen.classList.add('hidden');
    DOM.gameOverScreen.classList.remove('show');
    startGame();
}

function backToMenu() {
    DOM.gameOverScreen.classList.add('hidden');
    DOM.gameOverScreen.classList.remove('show');
    DOM.gameContainer.classList.add('hidden');
    DOM.statsBar.classList.add('hidden');
    DOM.startScreen.classList.remove('hidden');
}

// =================== UPDATE STATS ===================
function updateStats() {
    DOM.scoreValue.textContent = gameState.score;
    DOM.currentQ.textContent = Math.min(gameState.currentLevel + 1, gameState.shuffledLevels.length);
    DOM.hintsLeft.textContent = gameState.hints;
    DOM.hintCountBtn.textContent = gameState.hints;

    // Dim hint button when out of hints
    const hintBtn = document.querySelector('.btn-hint');
    if (hintBtn) {
        hintBtn.style.opacity = gameState.hints <= 0 ? '0.5' : '1';
        hintBtn.style.cursor = gameState.hints <= 0 ? 'not-allowed' : 'pointer';
    }
}

// =================== KEYBOARD SUPPORT ===================
document.addEventListener('keydown', (e) => {
    // Ignore when focus is in an input or select element
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;

    // Enter to proceed to next level when success overlay is showing
    if (e.key === 'Enter' && DOM.successOverlay.classList.contains('show')) {
        nextLevel();
        return;
    }

    // Do not process letter keystrokes if not in active gameplay
    if (DOM.gameContainer.classList.contains('hidden')) return;
    if (DOM.successOverlay.classList.contains('show')) return;
    if (DOM.gameOverScreen.classList.contains('show')) return;
    if (gameState.isChecking) return;

    // Allow typing letters (Unicode letters including Vietnamese diacritics)
    if (e.key.length === 1 && /^[\p{L}]$/u.test(e.key)) {
        const inputKey = e.key.normalize('NFC').toUpperCase();
        const unusedTiles = Array.from(document.querySelectorAll('.letter-tile:not(.used)'));
        
        // 1. Exact match (Telex/VNI directly outputs accented letter like 'Ó')
        let matchedTile = unusedTiles.find(t => t.textContent.normalize('NFC').toUpperCase() === inputKey);
        
        // 2. Fallback to unaccented match (user types English 'O' on keyboard, can match 'Ó' tile)
        if (!matchedTile) {
            const strippedKey = stripDiacritics(inputKey);
            matchedTile = unusedTiles.find(t => stripDiacritics(t.textContent).toUpperCase() === strippedKey);
        }

        if (matchedTile) {
            matchedTile.click();
        }
    }
    
    // Backspace to remove last letter
    if (e.key === 'Backspace' && gameState.selectedLetters.length > 0) {
        e.preventDefault();
        const last = gameState.selectedLetters[gameState.selectedLetters.length - 1];
        removeLetterFromBox(last.boxIndex);
    }
});
