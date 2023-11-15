// --------------------------------------------
//                  GLOBALS
// --------------------------------------------

const lineSize = 3;
const emptyString = " ";

// --------------------------------------------
//                  HELPERS
// --------------------------------------------

const HelperDOM = (function () {
    const findIndexInParent = (node) => {
        let parent = node.parentNode;
        if (parent) {
            let children = parent.childNodes;
            let countDivs = 0;
            for (let i = 0; i < children.length; i++) {
                if (children[i] === node) {
                    return countDivs;
                }
                if (children[i].nodeName == 'DIV') {
                    countDivs++;
                }
            }
        }
        return -1; // Not found
    }
    const findNodeIndex = (node, nodeList) => {
        for (let i = 0; i < nodeList.length; i++) {
            if (nodeList[i] === node) {
                return i;
            }
        }
        return -1;
    }

    return { findIndexInParent, findNodeIndex };
})();

// --------------------------------------------
//                   PLAYER
// --------------------------------------------

const Players_DOM = (function () {
    
    const playerScores = document.querySelectorAll(".player-score");

    const incScore = (playerNum, score) => {
        let index = playerNum -1;
        if (index < 0 || index > playerScores.length) return;
        playerScores[index].textContent = "Score: "+score.toString(10);
    }


    return {incScore };
})();



function createPlayer (num, name, symbol) {
    
    let score = 0;

    const getNum = () => num;
    const getName = () => name;
    const getSymbol = () => symbol;
    const getScore = () => score;
    const incScore = () => {
        score++;
        Players_DOM.incScore(num, score);
    }

    return {getNum, getName, getSymbol, getScore, incScore};
}

// --------------------------------------------
//                   BOARD
// --------------------------------------------

const Board_DOM = (function () {

    const blocksNodeList = document.querySelectorAll(".board-block-div");

    const getBlock = (index) => {
        if (index < 0 || index >= blocksNodeList.length) return null;
        return blocksNodeList[index];
    }

    // PUBLIC

    const addSignToBlock = (sign, index) => {
        let block = getBlock(index);
        if (block != null) {
            block.textContent = sign;
            block.classList.remove('block-allow-hover'); 
        }
    }

    const resetBlocks = () => {
        for (let i=0; i< blocksNodeList.length; i++) {
            addSignToBlock("", i);
            getBlock(i).classList.add('block-allow-hover'); 
        }
    }

    const printNodeList = () => {
        console.log(blocksNodeList);
    }


    return {addSignToBlock, resetBlocks, printNodeList};
    
  })();

  const Board_Helper = (function () {


    const indexToRowCol = (index) => {
        const row = Math.floor(index / lineSize);
        const col = index % lineSize;
      
        return { row, col };
    };
    const rowColToIndex = (row, col) => {
        return (row*lineSize + col)
    };


    const checkRowForWin = (row, blocks) => {
        let sign = blocks[row*lineSize];
        if (sign == emptyString) return false;
        for (let i=1; i < lineSize; i++) {
            if (blocks[row*lineSize + i] != sign) return false;
        }
        return true
    }

    const checkColForWin = (col, blocks) => {
        let sign = blocks[col];
        if (sign == emptyString) return false;
        for (let i=1; i < lineSize; i++) {
            if (blocks[i*lineSize + col] != sign) return false;
        }
        return true
    }

    const checkForDiagWin = (blocks) => {
        // Note: Only works well for 3x3 board
        let sign = blocks[4];
        if (sign == emptyString) return false;
        if (blocks[0] == sign && blocks[8] == sign) return true;
        if (blocks[2] == sign && blocks[6] == sign) return true;
        return false;
    }

    return {indexToRowCol, rowColToIndex, checkRowForWin, checkColForWin, checkForDiagWin};
})();

const Board = (function () {

    // PRIVATE
    const boardSize = lineSize*lineSize;
    
    let blocks = Array(boardSize).fill(emptyString);
    let mostRecentAddIndex = -1;
    let count = 0;


    // PUBLIC FUNCTIONS

    const checkWin = () => {
        if (mostRecentAddIndex <0 || mostRecentAddIndex >= boardSize) return false;
        let {row, col} = Board_Helper.indexToRowCol(mostRecentAddIndex);
        if (   Board_Helper.checkRowForWin(row, blocks) 
            || Board_Helper.checkColForWin(col, blocks) 
            || Board_Helper.checkForDiagWin(blocks)) 
        {
            return true;
        }
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
            console.log("Block already taken: at block there's already ", blocks[index]);
            return false;
        }
        blocks[index] = player.getNum().toString(10);
        mostRecentAddIndex = index;
        count++;
        Board_DOM.addSignToBlock(player.getSymbol(), index);

        return true;
    }

    const reset = () => {
        blocks = Array(boardSize).fill(emptyString);
        mostRecentAddIndex = -1;
        count = 0;
        Board_DOM.resetBlocks();
    }

    const printBoard = () => {
        const horizontalEdge = "-----------"
        console.log(horizontalEdge);
        for(let i=0; i < lineSize; i++) {
            let lineString = "|";
            for (let j=0; j< lineSize; j++) {
                lineString += blocks[Board_Helper.rowColToIndex(i,j)] + "|"
            }
            console.log(lineString);
        }
        console.log(horizontalEdge);
    }

    const printBoardArr = () => {
        console.log(blocks);
    }


    return {checkWin, checkFull, addSignToBlock, reset, printBoard, printBoardArr};
})();


// --------------------------------------------
//                   GAME
// --------------------------------------------

const Game = (function () {
    
    const player1 = createPlayer(1, "player1", "X");
    const player2 = createPlayer(2, "player2", "O");
    let currPlayer = player1;
    let gameEnded = false;
    let gameState = -1;
    // DOM
    const blocksNodeList = document.querySelectorAll(".board-block-div");
    const statusInfo = document.querySelector("#status-info");
    const startBtn = document.querySelector("#start-btn");

    const blockEventListener = (event) => {
        let index = HelperDOM.findNodeIndex(event.target, blocksNodeList);
        playTurn(index);
        console.log("Finished a turn");
    }

    const reset = () => {
        currPlayer = player1;
        gameEnded = false;
        Board.reset();
        gameState = -1;
        statusInfo.textContent = "";
        for (let i=0; i < blocksNodeList.length; i++) {
            blocksNodeList[i].removeEventListener("click", blockEventListener);
        }
        console.log("Reset Game");
    }

    const playTurn_aux = (index) => {
        if (gameEnded) {
            console.log("The game has already ended");
            return currPlayer.getNum();
        }
        Board.printBoardArr();
        if (!Board.addSignToBlock(currPlayer, index)) {
            return -2;
        }

        Board.printBoard();

        if (Board.checkWin()) {
            console.log(`Player${currPlayer.getNum()} won!`);
            gameEnded = true;
            currPlayer.incScore();
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

    const playTurn = (index) => {
        gameState = playTurn_aux(index);
        if (gameState == -1 || gameState == -2) {
            return;
        }
        if (gameState == 0) {
            statusInfo.textContent = "Tie"; 
        } else {
            statusInfo.textContent = "Player"+gameState+" Won!"; 
        }
        console.log("Game State: ", gameState);
        startBtn.style.display = 'block';
    }

    const initBlocks = () => {
        console.log(blocksNodeList);
        
        let bookInfoDiv = document.createElement('div');
        bookInfoDiv.className = 'book-info-div';

        for (let i=0; i < blocksNodeList.length; i++) {
            blocksNodeList[i].addEventListener("click", blockEventListener);
        }
    }

    const initStartBtn = () => {
        startBtn.addEventListener("click", () => {
            reset();
            initBlocks();
            startBtn.style.display = 'none';
            startBtn.textContent = "Play Again";
        });
    }

    const start = () => {
        initStartBtn();
    }

    return {start};
  })();

  Game.start();