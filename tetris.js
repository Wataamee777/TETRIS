const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");
const ROWS = 20, COLS = 10, SIZE = 20;

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const SHAPES = [
    { shape: [[1, 1, 1, 1]], color: "cyan" }, // I
    { shape: [[1, 1], [1, 1]], color: "yellow" }, // O
    { shape: [[0, 1, 0], [1, 1, 1]], color: "purple" }, // T
    { shape: [[1, 1, 0], [0, 1, 1]], color: "green" }, // S
    { shape: [[0, 1, 1], [1, 1, 0]], color: "red" }, // Z
    { shape: [[1, 1, 1], [1, 0, 0]], color: "orange" }, // L
    { shape: [[1, 1, 1], [0, 0, 1]], color: "blue" } // J
];

let piece = { shape: [], color: "", x: 3, y: 0 };
let holdPiece = null;
let canHold = true;

function newPiece() {
    let rand = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    piece = { shape: JSON.parse(JSON.stringify(rand.shape)), color: rand.color, x: 3, y: 0 };
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
                ctx.fillStyle = cell.color;
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
                ctx.fillStyle = piece.color;
                ctx.fillRect((piece.x + dx) * SIZE, (piece.y + dy) * SIZE, SIZE, SIZE);
                ctx.strokeStyle = "black";
                ctx.strokeRect((piece.x + dx) * SIZE, (piece.y + dy) * SIZE, SIZE, SIZE);
            }
        })
    );
}

// **ホールドブロックの表示**
function drawHoldPiece() {
    if (!holdPiece) return;

    holdPiece.shape.forEach((row, dy) =>
        row.forEach((cell, dx) => {
            if (cell) {
                ctx.fillStyle = holdPiece.color;
                ctx.fillRect(dx * SIZE, dy * SIZE, SIZE, SIZE);
                ctx.strokeStyle = "black";
                ctx.strokeRect(dx * SIZE, dy * SIZE, SIZE, SIZE);
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
        row.some((cell, dx) => cell && (board[piece.y + dy]?.[piece.x + dx] !== null || piece.y + dy >= ROWS))
    );
}

function mergePiece() {
    piece.shape.forEach((row, dy) =>
        row.forEach((cell, dx) => {
            if (cell) board[piece.y + dy][piece.x + dx] = { color: piece.color };
        })
    );
}

function clearLines() {
    board = board.filter(row => row.some(cell => cell === null));
    while (board.length < ROWS) board.unshift(Array(COLS).fill(null));
}

// **ホールド機能**
function holdBlock() {
    if (!canHold) return;

    if (holdPiece) {
        let temp = holdPiece;
        holdPiece = { shape: piece.shape, color: piece.color };
        piece = { shape: temp.shape, color: temp.color, x: 3, y: 0 };
    } else {
        holdPiece = { shape: piece.shape, color: piece.color };
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
    drawHoldPiece();  // ホールドしたブロックを表示
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

// **ゲーム開始**
newPiece();
gameLoop();
