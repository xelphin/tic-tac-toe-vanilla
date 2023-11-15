// --------------------------------------------
//                  GLOBALS
// --------------------------------------------

const lineSize = 3;
const emptyString = " ";

// --------------------------------------------
// --------------------------------------------
//                   MAIN
// --------------------------------------------
// --------------------------------------------


const Game = (function () {
    
    const player1 = createPlayer(1, "player1", "X");
    const player2 = createPlayer(2, "player2", "O");
    let currPlayer = player1;
    let gameEnded = false;
    let gameState = -1;

    const reset = () => {
        currPlayer = player1;
        gameEnded = false;
        Board.reset();
        gameState = -1;
        Game_DOM.resetStatus();
        console.log("Reset Game");
    }

    const playTurn_aux = (index) => {
        if (gameEnded) {
            console.log("Game has already ended.");
            return currPlayer.getNum();
        }
        if (!Board.addSignToBlock(currPlayer, index)) {
            return -2;
        }

        if (Board.checkWin()) {
            currPlayer.incScore();
            return currPlayer.getNum();
        }
        if (Board.checkFull()) {
            return 0;
        }

        currPlayer == player1 ? currPlayer = player2 : currPlayer = player1;
        return -1;
    }

    const playTurn = (index) => {
        gameState = playTurn_aux(index);
        if (gameState >=0 ) {
            gameEnded = true;
            Game_DOM.showStartBtn();
            Game_DOM.showStatus();
        }
    }

    const getGameState = () => gameState;

    const start = () => {
        Game_DOM.setStartFunctionality();
    }

    return {reset, playTurn, getGameState, start};
})();

const Game_DOM = (function () {
    
    const statusInfo = document.querySelector("#status-info");
    const startBtn = document.querySelector("#start-btn");

    const hideStartBtn = () => {
        startBtn.style.display = 'none';
        startBtn.textContent = "Play Again";
    }

    const showStartBtn = () => {
        startBtn.style.display = 'block';
    }

    const showStatus = () => {
        let gameState = Game.getGameState();
        if (gameState == -1 || gameState == -2) {
            return;
        }
        if (gameState == 0) {
            statusInfo.textContent = "Tie"; 
        } else {
            statusInfo.textContent = "Player"+gameState+" Won!"; 
        }
    }

    const resetStatus = () => {
        statusInfo.textContent = "";
    }

    const setStartFunctionality = () => {
        startBtn.addEventListener("click", () => {
            Game.reset();
            hideStartBtn();
            Board.allowPlaying();
        });
    }

    return { hideStartBtn, showStartBtn, showStatus, resetStatus, setStartFunctionality };
})();

// ------------ START ------------

Game.start();


// --------------------------------------------
// --------------------------------------------
//                RESOURCES
// --------------------------------------------
// --------------------------------------------

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

const Players_DOM = (function () {
    
    const playerScores = document.querySelectorAll(".player-score");

    const incScore = (playerNum, score) => {
        let index = playerNum -1;
        if (index < 0 || index > playerScores.length) return;
        playerScores[index].textContent = "Score: "+score.toString(10);
    }

    return {incScore };
})();

const Board = (function () {

    const boardSize = lineSize*lineSize;
    let blocks = Array(boardSize).fill(emptyString);
    let mostRecentAddIndex = -1;
    let count = 0;

    const checkWin = () => {
        if (mostRecentAddIndex <0 || mostRecentAddIndex >= boardSize) return false;
        return Board_Helper.checkWin(blocks, blocks[mostRecentAddIndex], mostRecentAddIndex);
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

    const allowPlaying = () => {
        Board_DOM.addBlockListener();
    }

    return {checkWin, checkFull, addSignToBlock, reset, allowPlaying};
})();

const Board_DOM = (function () {

    const blocksNodeList = document.querySelectorAll(".board-block-div");

    const getBlock = (index) => {
        if (index < 0 || index >= blocksNodeList.length) return null;
        return blocksNodeList[index];
    }

    const blockEventListener = (event) => {
        let index = HelperDOM.findNodeIndex(event.target, blocksNodeList);
        Game.playTurn(index);
    }

    // PUBLIC

    const addSignToBlock = (sign, index) => {
        let block = getBlock(index);
        if (block != null) {
            block.textContent = sign;
            block.classList.remove('block-allow-hover'); 
        }
    }

    const addBlockListener = () => {
        for (let i=0; i < blocksNodeList.length; i++) {
            blocksNodeList[i].addEventListener("click", blockEventListener);
        }
    }

    const resetBlocks = () => {
        for (let i=0; i< blocksNodeList.length; i++) {
            addSignToBlock(emptyString, i);
            getBlock(i).classList.add('block-allow-hover'); 
            blocksNodeList[i].removeEventListener("click", blockEventListener);
        }
    }

    return {addSignToBlock, addBlockListener, resetBlocks};
    
})();

// --------------------------------------------
// --------------------------------------------
//                 HELPER
// --------------------------------------------
// --------------------------------------------

const HelperDOM = (function () {
    const findNodeIndex = (node, nodeList) => {
        for (let i = 0; i < nodeList.length; i++) {
            if (nodeList[i] === node) {
                return i;
            }
        }
        return -1;
    }

    return { findNodeIndex };
})();

const Board_Helper = (function () {

    const indexToRowCol = (index) => {
        const row = Math.floor(index / lineSize);
        const col = index % lineSize;
      
        return { row, col };
    };
    const rowColToIndex = (row, col) => {
        return (row*lineSize + col);
    };

    const checkRowForWin = (row, blocks, sign) => {
        for (let i=0; i < lineSize; i++) {
            if (blocks[row*lineSize + i] != sign) return false;
        }
        return true;
    }

    const checkColForWin = (col, blocks, sign) => {
        for (let i=0; i < lineSize; i++) {
            if (blocks[i*lineSize + col] != sign) return false;
        }
        return true;
    }

    const checkForDiagWin = (blocks, sign) => {
        if (blocks[0] == sign && blocks[4] == sign && blocks[8] == sign) return true;
        if (blocks[2] == sign && blocks[4] == sign &&  blocks[6] == sign) return true;
        return false;
    }

    const checkWin = (blocks, sign, mostRecentAddIndex) => {
        let {row, col} = Board_Helper.indexToRowCol(mostRecentAddIndex);
        if (   checkRowForWin(row, blocks, sign) 
            || checkColForWin(col, blocks, sign) 
            || checkForDiagWin(blocks, sign)) 
        {
            return true;
        }
        return false;
    }

    return {indexToRowCol, rowColToIndex, checkWin};
})();





