

// --------------------------------------------
//                   PLAYER
// --------------------------------------------

function createPlayer (num, name, symbol) {
    
    let score = 0;

    const getNum = () => num;
    const getName = () => name;
    const getSymbol = () => symbol;
    const getScore = () => score;
    const incScore = () => score++;

    return {getNum, getName, getSymbol, getScore, incScore};
}

// --------------------------------------------
//                   BOARD
// --------------------------------------------

const Board = (function () {

    // PRIVATE
    const lineSize = 3;
    const boardSize = lineSize*lineSize;
    const emptyString = " ";
    let blocks = Array(boardSize).fill(emptyString);
    let mostRecentAddIndex = -1;
    let count = 0;
    // DOM
    const blocksNodeList = document.querySelectorAll(".board-block-div");


    // HELPER FUNCTIONS

    const indexToRowCol = (index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
      
        return { row, col };
    };
    const rowColToIndex = (row, col) => {
        return (row*3 + col)
    };


    const checkRowForWin = (row) => {
        let sign = blocks[row*3];
        if (sign == '') return false;
        for (let i=1; i < lineSize; i++) {
            if (blocks[row*3 + i] != sign) return false;
        }
        return true
    }

    const checkColForWin = (col) => {
        let sign = blocks[col];
        if (sign == '') return false;
        for (let i=1; i < lineSize; i++) {
            if (blocks[i*3 + col] != sign) return false;
        }
        return true
    }

    const checkForDiagWin = () => {
        let sign = blocks[4];
        if (sign == '') return false;
        if (blocks[0] == sign && blocks[8] == sign) return true;
        if (blocks[2] == sign && blocks[6] == sign) return true;
        return false;
    }

    // PUBLIC FUNCTIONS

    const checkWin = () => {
        if (mostRecentAddIndex <0 || mostRecentAddIndex >= boardSize) return false;
        let {row, col} = indexToRowCol(mostRecentAddIndex);
        if (checkRowForWin(row) || checkColForWin(col) || checkForDiagWin()) return true;
        return false;
    }

    const checkFull = () => {
        return (count == boardSize);
    }

    const addSignToBlock = (player, index) => {
        if (count > boardSize || index < 0 || index >= boardSize ) {
            console.log("Index out of range");
            return false;
        }
        if (blocks[index] != emptyString) {
            console.log("Block already taken");
            return false;
        }
        blocks[index] = player.getNum().toString(10);
        mostRecentAddIndex = index;
        count++;
        // TODO: Add to DOM the 'sign'

        // I don't think i need 'data-block="0"' , picking nth element from nodelist should do it

        return true;
    }

    const printBoard = () => {
        const horizontalEdge = "-----------"
        console.log(horizontalEdge);
        for(let i=0; i < lineSize; i++) {
            console.log(`|${blocks[rowColToIndex(i,0)]}|${blocks[rowColToIndex(i,1)]}|${blocks[rowColToIndex(i,2)]}|`);
        }
        console.log(horizontalEdge);
    }


    return {checkWin, checkFull, addSignToBlock, printBoard};
})();


// --------------------------------------------
//                   GAME
// --------------------------------------------

const Game = (function () {
    
    const player1 = createPlayer(1, "player1", "X");
    const player2 = createPlayer(2, "player2", "O");
    let currPlayer = player1;
    let gameEnded = false;

    const playTurn = (index) => {
        if (gameEnded) {
            console.log("The game has ended");
            return -1;
        }
        if (!Board.addSignToBlock(currPlayer, index)) return -2;

        Board.printBoard();

        if (Board.checkWin()) {
            console.log(`Player${currPlayer.getNum()} won!`);
            gameEnded = true;
            return currPlayer.getNum();
        }
        if (Board.checkFull()) {
            console.log(`Tie`);
            gameEnded = true;
            return 0;
        }

        currPlayer == player1 ? currPlayer = player2 : currPlayer = player1;
        return -1;
    }

    const start = () => {
        playTurn(4);
        playTurn(3);
        playTurn(9);
        playTurn(4);
        playTurn(5);
        playTurn(6);
        playTurn(8);
        playTurn(0);
        playTurn(1);
        playTurn(2);
    }

    return {start};
  })();

  Game.start();