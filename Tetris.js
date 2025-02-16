const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");
const ROWS = 20, COLS = 10, SIZE = 20;

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[0, 1, 0], [1, 1, 1]], // T
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]], // Z
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]] // J
];

let piece = { shape: [], x: 3, y: 0 };
let holdPiece = null; // **ホールド用**
let canHold = true; // **1回の落下ごとに1回だけホールド可能**

function newPiece() {
    piece = { shape: JSON.parse(JSON.stringify(SHAPES[Math.floor(Math.random() * SHAPES.length)])), x: 3, y: 0 };
    canHold = true;
}

function rotate(shape) {
    return shape[0].map((_, i) => shape.map(row => row[i])).reverse();
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    board.forEach((row, y) =>
        row.forEach((cell, x) => {
            if (cell) {
                ctx.fillStyle = "cyan";
                ctx.fillRect(x * SIZE, y * SIZE, SIZE, SIZE);
                ctx.strokeStyle = "black";
                ctx.strokeRect(x * SIZE, y * SIZE, SIZE, SIZE);
            }
        })
    );
}

function drawPiece() {
    piece.shape.forEach((row, dy) =>
        row.forEach((cell, dx) => {
            if (cell) {
                ctx.fillStyle = "yellow";
                ctx.fillRect((piece.x + dx) * SIZE, (piece.y + dy) * SIZE, SIZE, SIZE);
                ctx.strokeStyle = "black";
                ctx.strokeRect((piece.x + dx) * SIZE, (piece.y + dy) * SIZE, SIZE, SIZE);
            }
        })
    );
}

function movePiece() {
    piece.y++;
    if (collision()) {
        piece.y--;
        mergePiece();
        newPiece();
    }
}

function collision() {
    return piece.shape.some((row, dy) =>
        row.some((cell, dx) => cell && (board[piece.y + dy]?.[piece.x + dx] !== 0 || piece.y + dy >= ROWS))
    );
}

function mergePiece() {
    piece.shape.forEach((row, dy) =>
        row.forEach((cell, dx) => {
            if (cell) board[piece.y + dy][piece.x + dx] = 1;
        })
    );
}

function clearLines() {
    board = board.filter(row => row.some(cell => cell === 0));
    while (board.length < ROWS) board.unshift(Array(COLS).fill(0));
}

// **ホールド機能**
function holdBlock() {
    if (!canHold) return;

    if (holdPiece) {
        let temp = holdPiece;
        holdPiece = piece.shape;
        piece.shape = temp;
        piece.x = 3;
        piece.y = 0;
    } else {
        holdPiece = piece.shape;
        newPiece();
    }

    canHold = false;
}

// **ゲームループ**
function gameLoop() {
    movePiece();
    clearLines();
    drawBoard();
    drawPiece();
    setTimeout(gameLoop, 500);
}

// **キー操作**
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") piece.x--;
    if (e.key === "ArrowRight") piece.x++;
    if (e.key === "ArrowDown") movePiece();
    if (e.key === "ArrowUp") piece.shape = rotate(piece.shape);
    if (e.key === " ") holdBlock();
});

// **ボタン操作**
document.getElementById("hold-btn").addEventListener("click", holdBlock);
document.getElementById("save-btn").addEventListener("click", saveGame);
document.getElementById("load-btn").addEventListener("click", loadGame);

// **セーブ機能**
function saveGame() {
    localStorage.setItem("tetris_board", JSON.stringify(board));
    localStorage.setItem("tetris_piece", JSON.stringify(piece));
    localStorage.setItem("tetris_holdPiece", JSON.stringify(holdPiece));
    localStorage.setItem("tetris_canHold", JSON.stringify(canHold));
    alert("ゲームをセーブしました！");
}

function loadGame() {
    let savedBoard = localStorage.getItem("tetris_board");
    let savedPiece = localStorage.getItem("tetris_piece");
    let savedHoldPiece = localStorage.getItem("tetris_holdPiece");
    let savedCanHold = localStorage.getItem("tetris_canHold");

    if (savedBoard && savedPiece) {
        board = JSON.parse(savedBoard);
        piece = JSON.parse(savedPiece);
        holdPiece = JSON.parse(savedHoldPiece);
        canHold = JSON.parse(savedCanHold);
        alert("ゲームをロードしました！");
    } else {
        alert("セーブデータがありません！");
    }
}

// **ゲーム開始**
newPiece();
loadGame();
gameLoop();
