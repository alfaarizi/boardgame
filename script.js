/* ==================================VARIABLES================================== */
const imageUrls = {
    actionPointImg: "assets/Action Points.png",
    boardImg: "assets/Board.png",
    droughtImg: "assets/Drought.png",
    hintImg: "assets/Hint.png",
    holeImg: "assets/Hole.png",
    oasisMarkerImg: "assets/Oasis marker.png",
    oasisImg: "assets/Oasis.png",
    playerImg: "assets/Player.png",
    player1Img: "assets/Player1.png",
    player2Img: "assets/Player2.png",
    player3Img: "assets/Player3.png",
    player4Img: "assets/Player4.png",
    stargateImg: "assets/Stargate.png",
    waterImg: "assets/Water.png",
    item1: {
        itemImg: "assets/Item 1.png",
        clueImg: "assets/Item 1 - clue.png",
        clueDownImg: "assets/Item 1 - clue_DOWN.png",
        clueLeftImg: "assets/Item 1 - clue_LEFT.png",
        clueRightImg: "assets/Item 1 - clue_RIGHT.png",
        clueUpImg: "assets/Item 1 - clue_UP.png",
    },
    item2: {
        itemImg: "assets/Item 2.png",
        clueImg: "assets/Item 2 - clue.png",
        clueDownImg: "assets/Item 2 - clue_DOWN.png",
        clueLeftImg: "assets/Item 2 - clue_LEFT.png",
        clueRightImg: "assets/Item 2 - clue_RIGHT.png",
        clueUpImg: "assets/Item 2 - clue_UP.png",
    },
    item3: {
        itemImg: "assets/Item 3.png",
        clueImg: "assets/Item 3 - clue.png",
        clueDownImg: "assets/Item 3 - clue_DOWN.png",
        clueLeftImg: "assets/Item 3 - clue_LEFT.png",
        clueRightImg: "assets/Item 3 - clue_RIGHT.png",
        clueUpImg: "assets/Item 3 - clue_UP.png",
    },
};

// display variables
const boardDiv = document.querySelector("#board");
const timeSpan = document.querySelector("#time");
const playerStatus = document.querySelector('#player-status')
const gameStatus = document.querySelector('#game-status')

const maxWaterCount = 6;
const maxApCount = 3;
let player1 = {
    name : "",
    img : imageUrls.player1Img,
    rowPos: 2,
    colPos: 2,
    waterCount: maxWaterCount,
    apCount: maxApCount,
    waterSpan: document.querySelector("#player1-water"),
    apSpan: document.querySelector("#player1-ap"),
    color: "#dc143c"
};

let player2 = {
    name : "",
    img : imageUrls.player2Img,
    rowPos: 2,
    colPos: 2,
    waterCount: maxWaterCount,
    apCount: maxApCount,
    waterSpan: document.querySelector("#player2-water"),
    apSpan: document.querySelector("#player2-ap"),
    color: "#097969"
};

let player3 = {
    name : "",
    img : imageUrls.player3Img,
    rowPos: 2,
    colPos: 2,
    waterCount: maxWaterCount,
    apCount: maxApCount,
    waterSpan: document.querySelector("#player3-water"),
    apSpan: document.querySelector("#player3-ap"),
    color: "#005b96"
};

let player4 = {
    name : "",
    img : imageUrls.player4Img,
    rowPos: 2,
    colPos: 2,
    waterCount: maxWaterCount,
    apCount: maxApCount,
    waterSpan: document.querySelector("#player4-water"),
    apSpan: document.querySelector("#player4-ap"),
    color: "#cc5500"
};

let item1 = {
    itemSpan: document.querySelector("#item1"),
};

let item2 = {
    itemSpan: document.querySelector("#item2"),
};

let item3 = {
    itemSpan: document.querySelector("#item3"),
};

// tile type variables
const TileType = {
    EMPTY: "Empty",
    COMPONENT: "Component",
    CLUE: "Clue",
    OASIS: "Oasis",
    MIRAGE: "Mirage",
};

// in-game variables
const Maxrows = 5;
const Maxcols = 5;

const MiddleRow = 2;
const MiddleCol = 2;

const MaxEmptyTile = 12;
const MaxComponentTile = 3;
const MaxClueTile = MaxComponentTile * 2;
const MaxOasisTile = 3;
const MaxMirageTile = 1;

const allPlayers = [player1, player2, player3, player4];

let boardMatrix = []; // board matrix to store tile types
let players = [];
let items = [item1, item2, item3];

let round = 0;
let currentPlayer = player1;
let timeLeft = 180;
let componentsFound = 0;
/* ============================================================================= */


/* =============================MAIN FUNCTIONS================================== */
function setUpDashboard() {
    displayDashboard();
}

function setUpBoardMatrix() {
    createDivTable(Maxrows, Maxcols);
    emptyTiles();
    setTiles();
    displayBoardMatrix();
}
/* ============================================================================= */


/* ==============================MOVEMENTS======================================= */
function movePlayer(rowOffset, colOffset) {
    const newRow = currentPlayer.rowPos + rowOffset;
    const newCol = currentPlayer.colPos + colOffset;
    
    if (isValidMove(newRow, newCol)) {
        const previousBox = document.querySelector("#box-" + (currentPlayer.rowPos + 1) + "-" + (currentPlayer.colPos + 1));
        const playerImages = previousBox.querySelectorAll(".board-icon");

        // remove player image
        playerImages.forEach(pl => {
            if(pl.getAttribute('src') === currentPlayer.img){
                previousBox.removeChild(pl);
            }
        });

        currentPlayer.rowPos = newRow;
        currentPlayer.colPos = newCol;
        currentPlayer.apCount--; // decrease action points
        
        // place player image
        placeTile(newRow, newCol, currentPlayer.img, "board-icon");
        handleDisplayBoardIcon();
        displayDashboard();
        handleEndTurn();
    }
}



let posDigged = [] // positions {[row, col]} of digged tiles
function dig(){
    let row = currentPlayer.rowPos;
    let col = currentPlayer.colPos;
    const currentBox = document.querySelector(`#box-${row + 1}-${col + 1}`);
    const currentTile = boardMatrix[row][col];

    let isDiggable = true;
    posDigged.some(ps => {
        if (ps[0] === row && ps[1] === col){
            isDiggable = false;
        }
        gameStatus.textContent = "Not Diggable!"
    });

    if( (row !== MiddleRow || col !== MiddleCol) && isDiggable){
        
        let tileStr = (currentTile === TileType.EMPTY) ? "Hole" : currentTile
        gameStatus.textContent = `Digged ${tileStr}!`
        
        if (currentTile !== TileType.OASIS){
            posDigged.push([row, col]);
        }
        
        const computedStyle = window.getComputedStyle(currentBox);
        const currentColor = computedStyle.backgroundColor;
        if (currentColor === "rgb(205, 170, 127)") {
            currentBox.style.backgroundColor = "#f6d7b0";
        }

        let tiles = currentBox.querySelectorAll(".board-icon-fixed");
        tiles.forEach(tile => { tile.remove(); }); 

        revealTile(currentBox, currentTile);
        
        currentPlayer.apCount--;
        displayDashboard();
        handleEndTurn();
    }

}

function revealTile(box, tile){

    let imageUrl, id;

    const parts =  box.id.split("-");
    let row = parts[1] - 1;
    let col = parts[2] - 1;

    if (tile === TileType.EMPTY) {
        placeTile(row, col, imageUrls.holeImg, "board-icon-fixed");
    } else if (tile === TileType.OASIS){
        placeTile(row, col, imageUrls.oasisImg, "board-icon-fixed");
        currentPlayer.waterCount = maxWaterCount;
    } else if (tile === TileType.MIRAGE){
        placeTile(row, col, imageUrls.droughtImg, "board-icon-fixed");
    } else if (tile.includes(TileType.COMPONENT) ){
        id = parseInt(tile.split(TileType.COMPONENT)[1]);
        
        items.forEach(it => {
            let currComponent = parseInt((it.itemSpan.id).split("item")[1]);
            if(currComponent === id){
                it.itemSpan.style.display = "none"
                componentsFound++;
            }
        });

        switch (id){
            case 1:
                imageUrl = imageUrls.item1.itemImg
                break;
            case 2:
                imageUrl = imageUrls.item2.itemImg
                break;
            case 3:
                imageUrl = imageUrls.item3.itemImg
                break;
        }

        placeTile(row, col, imageUrl, "board-icon-fixed");
    } else if (tile.includes(TileType.CLUE) ){
        id = parseInt(tile.split(TileType.CLUE)[1]);

        switch (id){
            case 1:
                imageUrl = imageUrls.item1.clueImg
                break;
            case 2:
                imageUrl = imageUrls.item2.clueImg
                break;
            case 3:
                imageUrl = imageUrls.item3.clueImg
                break;
        }
        imageUrl = imageUrl.split(".png")[0];

        let componentRow, componentCol;

        let isRowClue = false;
        for(let r = 0; r < Maxrows && !isRowClue; r++){
            if(boardMatrix[r][col] === TileType.COMPONENT + id ){
                componentRow = r;
                isRowClue = true;
            }
        }

        let isColClue = false;
        for(let c = 0; c < Maxcols && !isColClue; c++){
            if(boardMatrix[row][c] === TileType.COMPONENT + id ){
                componentCol = c;
                isColClue = true;
            }
        }

        if(isRowClue){
            imageUrl += row < componentRow ? "_DOWN" : "_UP";
        }else if(isColClue){
            imageUrl += col < componentCol ? "_RIGHT" : "_LEFT";
        }

        imageUrl += ".png";
        placeTile(row, col, imageUrl, "board-icon-fixed");

    }

}
  

function isValidMove(row, col) {
    return 0 <= row && row < Maxrows && 0 <= col && col < Maxcols;
}
  
function handleEndTurn() {
    if (currentPlayer.apCount === 0) {
        currentPlayer.waterCount--;
        checkGameOver();
        switchToNextPlayer();
    }
}

function resetCurrentPlayer(player){
    player.apCount = maxApCount;
}
  
function switchToNextPlayer() {
    
    let currentPlayerIndex = players.indexOf(currentPlayer); 
    if(players[currentPlayerIndex] === players[players.length - 1]) { round++; }
    resetCurrentPlayer(currentPlayer)

    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    currentPlayer = players[currentPlayerIndex]

    playerStatus.textContent = `${currentPlayer.name}'s turn`
}
/* ============================================================================= */


/* ==========================HELPER FUNCTIONS=================================== */
function getTilePosition(boardMx, tileType) {
    let pos = [];

    currRow = 0;
    boardMx.forEach((ls) => {
        currCol = 0;
        ls.forEach((e) => {
        if (e.includes(tileType)) {
            pos.push([currRow, currCol]);
        }
        currCol++;
        });
        currRow++;
    });

  return pos;
}

function placeRandomTiles(tileType, maxTiles) {
    for (let i = 0; i < maxTiles; i++) {
        let row, col;
        
        do {
        row = random(0, Maxrows - 1);
        col = random(0, Maxcols - 1);
        } while ( boardMatrix[row][col] !== TileType.EMPTY || isPositionOccupied(placedTilesPos, row, col));
        
        boardMatrix[row][col] = tileType;
    }
}

function isPositionOccupied(posList, row, col) {
    return posList.some((pos) => pos[0] === row && pos[1] === col);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
}
/* ============================================================================= */


/* ==============================INITIALIZATION================================= */
function askNumberOfPlayers() {
    const numberOfPlayers = prompt("The number of players (1-4):");
    if (numberOfPlayers && !isNaN(numberOfPlayers) && numberOfPlayers >= 1 && numberOfPlayers <= 4) {
        let i = 0;
        while (i < parseInt(numberOfPlayers)) {
            let playerName = prompt(`Enter the name of Player ${i + 1}:`);
            if (playerName && playerName.length > 0 && playerName.length <= 12) {
                playerName = playerName.charAt(0).toUpperCase() + playerName.slice(1).toLowerCase();
                allPlayers[i].name = playerName;
                players.push(allPlayers[i]);
                i++;
            } else {
                alert("Please enter a valid name between 1 and 12 characters.");
            }
        }
    } else {
        askNumberOfPlayers();
    }
}

let placedTilesPos = []; // positions of tiles placed {[row,col]}
function createDivTable(rows, cols) {
    // creates div boxes with id in the format of "box-row-col"
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let div = document.createElement("div");
            div.classList.add("box");
            div.id = "box-" + (i + 1) + "-" + (j + 1);
            board.appendChild(div);
        }
    }
}

function emptyTiles() {
    for (let i = 0; i < Maxrows; i++) {
        boardMatrix[i] = [];
        for (let j = 0; j < Maxcols; j++) {
            boardMatrix[i][j] = TileType.EMPTY;
        }
    }
}

function setTiles() {
    let componentTotal = 0;

    // keep the middle box empty 
    placedTilesPos.push([MiddleRow, MiddleCol]);

    while (componentTotal < MaxComponentTile) {
    let componentRow, componentCol;
    do {
      componentRow = random(0, Maxrows - 1);
      componentCol = random(0, Maxcols - 1);
    } while ( boardMatrix[componentRow][componentCol] !== TileType.EMPTY || isPositionOccupied(placedTilesPos, componentRow, componentCol));

    boardMatrix[componentRow][componentCol] = TileType.COMPONENT + (componentTotal + 1);
    placedTilesPos.push([componentRow, componentCol]);

    let clueRow1 = componentRow;
    let clueCol1 = (componentCol + 1) % Maxcols;
    while (isPositionOccupied(placedTilesPos, clueRow1, clueCol1)) {
      clueCol1 = (clueCol1 + 1) % Maxcols;
    }
    boardMatrix[clueRow1][clueCol1] = TileType.CLUE + (componentTotal + 1);
    placedTilesPos.push([clueRow1, clueCol1]);

    let clueRow2 = (componentRow + 1) % Maxrows;
    let clueCol2 = componentCol;
    while (isPositionOccupied(placedTilesPos, clueRow2, clueCol2)) {
      clueRow2 = (clueRow2 + 1) % Maxrows;
    }
    boardMatrix[clueRow2][clueCol2] = TileType.CLUE + (componentTotal + 1);
    placedTilesPos.push([clueRow2, clueCol2]);

    componentTotal++;
  }

  placeRandomTiles(TileType.OASIS, MaxOasisTile);
  placeRandomTiles(TileType.MIRAGE, MaxMirageTile);
}
/* ============================================================================= */


/* ================================DISPLAY====================================== */
let dashboardFilled = false;
function displayDashboard() {
  if (!dashboardFilled){
    timeSpan.textContent = formatTime(timeLeft);
    gameStatus.textContent = "Gather Components!";
    playerStatus.textContent = `${currentPlayer.name}'s turn`;
    playerStatus.style.color = currentPlayer.color;

    allPlayers.forEach(pl => {
        if ( !players.includes(pl) ){
            const currPlayerDashboardBox = document.querySelector('#' + pl.waterSpan.id.split('-')[0])
            const childElements = currPlayerDashboardBox.querySelectorAll('*'); // Select all child elements
            childElements.forEach(ch => {
                ch.remove();
            })
        }
    })

    let currentItem = 1;
    items.forEach((it) => {
      const itemImage = document.createElement("img");
      itemImage.classList.add("icon");
      itemImage.src = imageUrls[`item${currentItem}`].itemImg;
      it.itemSpan.appendChild(itemImage);
      currentItem++;
    });

    dashboardFilled = true;
  }

  let i = 0;
  playerStatus.style.color = currentPlayer.color;
  players.forEach((pl) => {
    const currPlayerTitle = document.querySelector(`#player${i + 1}-title`);
    currPlayerTitle.textContent = players[i].name
    pl.apSpan.textContent = pl.apCount;
    pl.waterSpan.textContent = pl.waterCount;
    i++;
  });
}

let stargateBoxFilled = false, oasisMarkerBoxFilled = false;
function displayBoardMatrix() {
  if (!stargateBoxFilled) {
    placeTile(2, 2, imageUrls.stargateImg, "board-icon-fixed");
    stargateBoxFilled = true;
  }

  if (!oasisMarkerBoxFilled) {
    const oasisPos = getTilePosition(boardMatrix, TileType.OASIS);
    oasisPos.forEach((pos) => {
      placeTile(pos[0], pos[1], imageUrls.oasisMarkerImg, "board-icon-fixed");
    });

    const miragePos = getTilePosition(boardMatrix, TileType.MIRAGE);
    miragePos.forEach((pos) => {
      placeTile(pos[0], pos[1], imageUrls.oasisMarkerImg, "board-icon-fixed");
    });
    oasisMarkerBoxFilled = true;
  }

  players.forEach(pl => {
    placeTile(pl.rowPos, pl.colPos, pl.img, "board-icon");
  })

}

function placeTile(row, col, imageUrl, imageClass) {
  const targetBox = document.querySelector(
    "#box-" + (row + 1) + "-" + (col + 1)
  );


  const tileImage = document.createElement("img");
  tileImage.src = imageUrl;
  tileImage.classList.add(imageClass);
  targetBox.appendChild(tileImage);
}

function handleDisplayBoardIcon() {
  const boxes = document.querySelectorAll(".box");

  boxes.forEach((box) => {
    const iconFixed = box.querySelectorAll(".board-icon-fixed");
    const iconFixedCount = iconFixed.length;
    if (iconFixedCount > 0) {
      box.style.backgroundColor = "#f6d7b0";
    }

    const icon = box.querySelectorAll(".board-icon");
    const iconCount = icon.length;
    const iconWidthPercentage = 100 / iconCount;
    icon.forEach((ic, index) => {
      ic.style.zIndex = iconCount - index;
      ic.style.left = `${index * iconWidthPercentage}%`;
      ic.style.width = `${iconWidthPercentage}%`;
    });
  });
}

function handleDisplayBoardIcon() {
    const boxes = document.querySelectorAll(".box");
  
    boxes.forEach((box) => {
      const iconFixed = box.querySelectorAll(".board-icon-fixed");
      const iconFixedCount = iconFixed.length;
      if (iconFixedCount > 0) {
        box.style.backgroundColor = "#f6d7b0";
      }
  
      const icon = box.querySelectorAll(".board-icon");
      const iconCount = icon.length;
      const iconWidthPercentage = 100 / iconCount;
  
      let playerIconCount = 0; // counter for player icons
  
      icon.forEach((ic, index) => {
        if (ic.classList.contains("player")) { // if it's a player icon
            console.log("yes");
          ic.style.zIndex = iconCount - index + playerIconCount; // set zIndex above other icons
          playerIconCount++; // increment the player icon count
        } else {
          ic.style.zIndex = iconCount - index;
        }
        ic.style.left = `${index * iconWidthPercentage}%`;
        ic.style.width = `${iconWidthPercentage}%`;
      });
    });
  }
  
document.addEventListener("DOMContentLoaded", () => handleDisplayBoardIcon());
/* ============================================================================= */


/* ===============================GAME LOGIC==================================== */
function random(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function isValidGame() {
  return (
    MaxEmptyTile +
      MaxComponentTile +
      MaxClueTile +
      MaxOasisTile +
      MaxMirageTile ==
    Maxrows * Maxcols
  );
}

function checkGameOver(){    
    if(currentPlayer.waterCount === 0){
        alert(`Game over. You ran out of water!`);
        window.location.reload();
    }
    else if(componentsFound === MaxComponentTile && currentPlayer.waterCount !== 0){
        alert("Congratulations! You found all the component parts. You win!");
        window.location.reload();
    }
}

document.addEventListener("keydown", (event) => {
    startTimer();
    const key = event.key.toLowerCase();
    if (event.shiftKey){
        if(key === "d") dig();
    }
    else if (key === "arrowUp" || key === "w") { movePlayer(-1, 0); } 
    else if (key === "arrowdown" || key === "s") { movePlayer(1, 0); } 
    else if (key === "arrowleft" || key === "a") { movePlayer(0, -1); } 
    else if (key === "arrowright" || key === "d") { movePlayer(0, 1); } 
    else if (key === "e" || key === "f") {dig(); }
});
/* ============================================================================= */


/* ==================================TIMER======================================= */

let startTime; // store the start time of the game
let isTimerStarted = false;

function startTimer() {
    if (!isTimerStarted) {
        isTimerStarted = true;
        startTime = Date.now(); // get the current time when the game starts
        gameLoop(); // start the game loop
    }
}

function stopTimer() {
    cancelAnimationFrame(timerID); // stop the game loop when the game is over
}

function gameLoop() {
    const currentTime = Date.now(); // get the current time
    const elapsedTime = (currentTime - startTime) / 1000; // calculate elapsed time in seconds

    if (elapsedTime >= timeLeft) {
        // If elapsed time is more than the total time, stop the timer
        alert("Time's up! Game over.");
        window.location.reload();
        return;
    }

    timeSpan.textContent = formatTime(timeLeft - elapsedTime); // update the displayed time
    timerID = requestAnimationFrame(gameLoop); // request the next frame
}
/* ============================================================================= */


/* ================================DEBUGGING==================================== */
function debug() {
    // debugging purposes:)
    emptyCount = 0;
    componentCount = 0;
    clueCount = 0;
    oasisCount = 0;
    mirageCount = 0;
    boardMatrix.forEach((ls) => {
        ls.forEach((e) => {
            if (e == TileType.OASIS) oasisCount++;
            else if (e == TileType.MIRAGE) mirageCount++;
            else if (e.includes(TileType.COMPONENT)) componentCount++;
            else if (e.includes(TileType.CLUE)) clueCount++;
            else emptyCount++;
        });
    });
    console.log(boardMatrix);
    console.log("Empty tile: " + emptyCount);
    console.log("Component tile: " + componentCount);
    console.log("Clue tile: " + clueCount);
    console.log("Oasis tile: " + oasisCount);
    console.log("Mirage tile: " + mirageCount);

    const Status = oasisCount == MaxOasisTile && mirageCount == MaxMirageTile &&
        componentCount == MaxComponentTile && clueCount == MaxClueTile && emptyCount == MaxEmptyTile
        ? "Tiles are properly filled"
        : "Tiles are not properly filled";
    console.log("Status: " + Status);
}
/* ============================================================================= */

function run() {
    if (!isValidGame()) return;
    askNumberOfPlayers();
    setUpDashboard();
    setUpBoardMatrix();
}

run();
// debug();

