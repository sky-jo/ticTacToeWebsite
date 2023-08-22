turn = "";
board = [];
gameOver = false;
cellsMemory = null;
numWins = 0;
numLosses = 0;
numDraws = 0;

// updates board after players make moves
function updateBoardDisplay(cells) {
    console.log("cells:", cells);
    for (let i = 0; i < 9; i++) {
        squareObj = document.getElementById(i.toString());
        squareObj.bgColor = "Black";
        squareObj.innerHTML = board[i];
        // if there is a winner
        if (cells != null) {
            // makes the three symbols in a row yellow
            if (i == cells[0] || i == cells[1] || i == cells[2]) {
                squareObj.innerHTML = "O";
                squareObj.bgColor = "Yellow";
            }
        }
    }
    if (cells != null) {
        gameOver = true;
    }
    else {
        gameOver = false;
    }
}

// 
function fetchState() {
    fetch('/get/state', { method: "get" })
        .then(res => {
            console.log("running fetchState...");
            return res.json();
        })
        .then(res => {
            console.log("res from fetchState", res);
            turn = res.turn;
            board = res.board;
            cells = res.win;
            updateBoardDisplay(cells);
        })
        .catch((err) => {
            console.log(err);
        });
}

// 
function putMove(move) {
    fetch('/put/move', {
        method: "put",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            move: move
        })
        })
        .then((res) => {
            return res.json();
        })
        .then((res) => {
            console.log("PUTTING MOVE")
            console.log("res for putMove", res);
            // if the move is valid, the array board is updated
            if (res.valid == true) {
                board = res.board;
                turn = res.turn;
                win = res.win;
                if (res.draw == true) {
                    numDraws++;
                    document.getElementById("draws").innerHTML = "Draws: " + numDraws.toString();
                }
                else if (res.win != null) {
                    numLosses++;
                    document.getElementById("losses").innerHTML = "Losses: " + numLosses.toString();
                }
                updateBoardDisplay(win);
            }
        })
        .catch((err) => {
            console.log(err);
        });
}

// trys a move
function tryMove(move) {
    fetch('/put/isValidMove', {
        method: "put",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            move: move
        })
    })
        .then((res) => {
            return res.json();
        })
        .then((res) => {
            console.log("res for tryMove", res);
            turn = res.turn;
            if (res.valid == true) {
                board[move] = 'X';
                updateBoardDisplay(res.cells);
                putMove(move);
            }
        })
        .catch((err) => {
            console.log(err);
        });
}

// init the game board, all cells are empty, then after a click
// the move is attempted. If the move is valid the board is updated 
// and the computer move is played, otherwise the user needs to click again.
function init() {
    for (let i = 0; i < 9; i++) {
        squareObj = document.getElementById(i.toString());
        squareObj.onclick = () => {
            if (gameOver) {
                board = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
                gameOver = false;
            }
            tryMove(i);
        }
    }
    fetchState();
}

init();