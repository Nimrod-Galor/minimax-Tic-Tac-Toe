const gridSize = 600;
const gridGutter = 5;
const tileSize = (gridSize - (gridGutter * 4)) / 3;

let currentPlayre = "x";
const board = [];

function setup() {
    createCanvas(gridSize, gridSize, document.getElementById("defaultCanvas0"));
    resetBoard();
    computerMove();
}
  
function draw() {
    background(0);
    // draw grid
    drawGrid();
    drawBoard();
}

function mouseClicked() {
    console.log(`mouse clicked currentPlayre: ${currentPlayre}`);
    if(currentPlayre === "o"){
        currentPlayre = "oo";
        playerMove(mouseX, mouseY);
    }
}

function drawGrid(){
    strokeWeight(0);
    for(let r = 0; r < 3; r++){
        for(let c = 0; c < 3; c++){
            let x = gridGutter + c * gridGutter + c * tileSize;
            let y = gridGutter + r * gridGutter + r * tileSize;
            rect(x, y, tileSize, tileSize);
        }
    }
}

function drawBoard(){
    strokeWeight(gridGutter * 2);
    for(let i=0; i<9; i++){
        if(board[i] != ''){
            let posX = (1 + (i % 3))
            let posY = Math.floor(i / 3);
            if(board[i] === 'x'){
                // posX = posX * tileSize - (tileSize * 0.80) + (gridGutter * posX );
                // posY= posY  * tileSize + gridGutter + (tileSize * 0.2) + (gridGutter * posY );
                //rect(posX, posY, tileSize * 0.6, tileSize * 0.6);
                let x1 = posX * tileSize - (tileSize * 0.80) + (gridGutter * posX );
                let y1 = posY  * tileSize + gridGutter + (tileSize * 0.2) + (gridGutter * posY );
                let x2 = x1 + tileSize * 0.60;
                let y2 = y1 + tileSize * 0.60;
                line(x1, y1, x2, y2);

                //let x3 = posX * tileSize - (tileSize * 0.80) + (gridGutter * posX );
                let y3 = posY  * tileSize + gridGutter + (tileSize * 0.2) + (gridGutter * posY );
                let x4 = x1 + tileSize * 0.60;
                let y4 = y1 + tileSize * 0.60;
                line(x2, y1, x1, y2);
            }else{
                posX = posX  * tileSize - (tileSize / 2) + (gridGutter * posX );
                posY = posY * tileSize +  (tileSize / 2) + (gridGutter * (1 + posY));
                circle(posX, posY, tileSize * 0.60);
            }
        }
    }
}

function resetBoard(){
    for(let i=0; i<9; i++){
        //board[i] = Math.round(Math.random()) == 1 ? 'x' : 'o';
        board[i] = '';
    }
}

function playerMove(x, y){
    // stop user from mouse clicks
    
    console.log(`x: ${x} y: ${y}`);
    // check selected tile
    let posX = Math.floor((x - gridGutter) / (tileSize + gridGutter));
    let posY = Math.floor((y - gridGutter) / (tileSize + gridGutter));
    let index = posX + posY * 3;
    console.log(`posX: ${posX} posY: ${posY} index: ${index}`);
    // update board
    board[index] = 'o';
    let isWin = checkWin();
    if(isWin === null){
        updateStatus("Computer turn");
        computerMove();
    }else if(isWin.status === 'tie'){
        // game End with tie
        updateStatus("Game Tie");
    }else{
        // we have a win
        updateStatus(`${isWin.status} wins game.`);
    }
    
}

function computerMove(){
    let bestScore = -Infinity;
    let move;
    for(let i = 0 ; i < 9; i++){
        if(board[i] === ''){
            board[i] = 'x';
            let score = minimax('o');
            //bestScore = max(bestScore, score);
            board[i] = '';
            if(score > bestScore){
                bestScore = score;
                move = i;
            }
        }
    }

    board[move] = "x";
    let isWin = checkWin();
    if(isWin == null){
        updateStatus("User turn");
        currentPlayre = "o";
    }else if(isWin.status === 'tie'){
        // game End with tie
        updateStatus("Game Tie");
    }else{
        // we have a win
        updateStatus(`${isWin.status} wins game.`);
    }
    
}

function checkWin(){
    // check columns
    for(let c = 0 ; c < 3 ; c++){
        if(board[c] != '' && board[c] === board[c + 3] && board[c] === board[c + 6] ){
            // win
            return {status: board[c], path: [c, c + 3, c + 6]};
        }
    }

    // check rows
    for(let c = 0 ; c < 8 ; c += 3){
        if(board[c] != '' && board[c] === board[c + 1] && board[c] === board[c + 2] ){
            // win
            return {status: board[c], path: [c, c + 1, c + 2]};
        }
    }

    // check diagonal
    if(board[0] != '' && board[0] === board[4] && board[0] === board[8] ){
        // win
        return {status: board[0], path: [0, 4, 8]};
    }

    if(board[2] != '' && board[2] === board[4] && board[2] === board[6] ){
        // win
        return {status: board[2], path: [2, 4, 6]};
    }

    // check for opening
    for(let i = 0; i < 9; i++){
        if(board[i] === ''){
            return null;
        }
    }

    return {status: 'tie'};

}

const scores = {
    x: 1,
    o: -1,
    tie: 0
}

function minimax(player){
    let isWinner = checkWin();
    if(isWinner !== null){
        let score = scores[isWinner.status];
        return score;
    }
    if(player == 'x'){
        let bestScore = -Infinity;
        //let nextPlayer = player === 'x' ? 'o' : 'x';
        for(let i = 0 ; i < 9; i++){
            if(board[i] === ''){
                board[i] = 'x';
                let score = minimax('o');
                board[i] = '';
                bestScore = max(score, bestScore)
            }
        }
        return bestScore;
    }else{
        let bestScore = Infinity;
        //let nextPlayer = player === 'x' ? 'o' : 'x';
        for(let i = 0 ; i < 9; i++){
            if(board[i] === ''){
                board[i] = 'o';
                let score = minimax('x');
                board[i] = '';
                bestScore = min(score, bestScore)
            }
        }
        return bestScore;
    }
}

function updateStatus(status){
    document.getElementById("gameStatus").innerHTML = status;
}