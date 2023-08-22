// import express 
const express = require("express");

// creating exress app/server instance
const app = express();
app.use(express.json());

// logging all requests
app.use((req, res, next) => {
    console.log("REQ : " + req.url);
    next();
});

// defining static server route
app.use(express.static("public"));

// global board state
turn = "player" // ai or player
board = [" ", " ", " ", " ", " ", " ", " ", " ", " "];


// checks for a winner on the board
function checkWin() {
    console.log("looking for a winner", board);
    // checking wins on rows
    if (board[0] == board[1] && board[1] == board[2] && board[0] != " ") {
        return [0,1,2];
    }
    else if (board[3] == board[4] && board[4] == board[5] && board[3] != " ") {
        return [3,4,5];
    } 
    else if (board[6] == board[7] && board[7] == board[8] && board[6] != " ") {
        return [6,7,8];
    }
    // cehcking wins on columns
    else if (board[0] == board[3] && board[3] == board[6] && board[0] != " ") {
        return [0,3,6];
    }
    else if (board[1] == board[4] && board[4] == board[7] && board[1] != " ") {
        return [1,4,7];
    }
    else if (board[2] == board[5] && board[5] == board[8] && board[2] != " ") {
        return [2,5,8];
    }
    // checking diagonal win
    else if (board[0] == board[4] && board[4] == board[8] && board[0] != " ") {
        return [0,4,8];
    }
    else if (board[2] == board[4] && board[4] == board[6] && board[2] != " ") {
        return [2,4,6];
    }
    // no winner found
    else {
        return null;
    }
}

// checks that a given move is valid
// move is an int 0-8 inclusive
function isValidMove(move) {
    return board[move] == " ";
}

// generating move via python
function genAndSendMove(res) {
    console.log("AI GENERATING MOVE");
    // child_process is required to run python scripts
    var spawner = require("child_process").spawn;
    // runs python script and saves output to py_process
    var py_process = spawner("python", ["generate_move.py", JSON.stringify(board)]);    
    py_process.stdout.on("data", (data) => {
        data = JSON.parse(data);
        console.log("AI GENERATED CELL ID", data);
        charCount = 0;
        cur = 0;
        i = 0;
        // converts the output of the program to the proper index
        while (cur <= data) {
            if (board[i] == " "){
                cur += 1;
            }
            else{
                charCount += 1;
            }
            i++;
        }
        // actual is the index of the cell that the computer wants to play 
        actual = data + charCount
        draw = false;
        // if actual is -1, there are no more spaces that can be played
        if (actual == -1) {
            draw = true;
        }
        // places the computer move
        board[actual] = "O";

        cellsInARow = checkWin();
        console.log("cellsInARow", cellsInARow);
        // resets the board in the case of a tie or a win
        if (cellsInARow != null || draw) {
            board = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
        }

        console.log("SENDING AI CELL ID RESPONSE :", actual);
        res.send(JSON.stringify({ "valid": true, "board": board, "turn": turn, "win": cellsInARow, "draw": draw }));
    });
}

// defining translation api route
app.put("/put/reset", (req, res) => {
    board = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
    res.end();
});

// defining translation api route
app.get("/get/state", (req, res) => {
    res.send(JSON.stringify({ "board": board, "turn": turn }));
});

// call before 
app.put("/put/isValidMove", (req, res) => {
    if (turn != "player") {
        res.send(JSON.stringify({ "valid": false, "board": board, "turn": turn}));
        return;
    }
    move = req.body.move;
    valid = isValidMove(move);
    res.send(JSON.stringify({ "valid": valid, "board": board, "turn": turn}));
});



// defining translation api route
app.put("/put/move", (req, res) => {
    // return invalid if not player"s turn
    if (turn != "player") {
        res.send(JSON.stringify({ "valid": false, "board": board, "turn": turn}));
        return;
    }
    
    // checking given move
    move = req.body.move;
    valid = isValidMove(move);

    // return if invalid 
    if (!valid) {
        res.send(JSON.stringify({ "valid": false, "board": board, "turn": turn}));
        return;
    }

    // changed to ai"s turn
    turn = "ai";

    // update board using given move
    board[move] = "X";

    // ai generate move, apply to board, send response
    genAndSendMove(res);
    
    // back to player"s turn
    turn = "player";
});

// do this last
const PORT = 5000; // 80
const HOST = "127.0.0.1"; // get from server host
app.listen(PORT, HOST, () => {
    addr = "http://" + HOST + ":" + PORT;
    console.log("NODE SERVER RUNNING @ " + addr);
});
