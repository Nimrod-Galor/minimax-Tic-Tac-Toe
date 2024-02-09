let gridSize = 600;
const gridGutter = 5;
let tileSize = (gridSize - (gridGutter * 4)) / 3;
const board = [];
let firstPlayer = "x";
let currentPlayre = "x";
let shake = -1;

const winWave = {
    winPath : [],
    xspacing : 12.5, // Distance between each horizontal location
    w : gridSize / 2, // Width of entire wave
    theta : 0.0, // Start angle at 0
    amplitude : 25.0, // Height of wave
    period : 50.0, // How many pixels before the wave repeats
    dx: 0, // Value for incrementing x
    yvalues : new Array(3), // Using an array to store height values for the wave
    calcWave : function () {
        // Increment theta (try different values for
        // 'angular velocity' here)
        //this.theta += 0.25;
        this.theta += 0.7;
        this.amplitude *= 0.95;

        // For every x value, calculate a y value with sine function
        let x = this.theta;
        for (let i = 0; i < this.yvalues.length; i++) {
          this.yvalues[i] = sin(x) * this.amplitude;
          x += this.dx;
        }
    }
}

function windowResized() {
    gridSize = Math.min(600, windowWidth * 0.6);
    if(windowWidth <= 600){
      gridSize = windowWidth * 0.9;
    }
    tileSize = (gridSize - (gridGutter * 4)) / 3;
    console.log(`win resize grid size: ${gridSize}`);
    resizeCanvas(gridSize, gridSize);
  }

function setup() {
    createCanvas(gridSize, gridSize, document.getElementById("defaultCanvas0"));
    resetBoard();
    winWave.dx = (TWO_PI / winWave.period) * winWave.xspacing; // Value for incrementing x
}
  
function draw() {
    background(0);
    drawGrid();
    drawBoard();
    if(winWave.winPath.length > 0){
        winWave.calcWave();
    }
}

function mouseClicked() {
    if(currentPlayre === "o"){
        if(mouseX > gridGutter && mouseX < (gridSize - gridGutter) & mouseY > gridGutter && mouseY < (gridSize - gridGutter)){
            // stop user from mouse clicks
            currentPlayre = "oo";
            playerMove(mouseX, mouseY);
        }
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
            // shake
            if(shake === i){
                translate(random(-5,5),random(-5,5));
            }
            // win
            if(winWave.winPath.indexOf(i) != -1){
                let index = winWave.winPath.indexOf(i);
                translate(0, winWave.yvalues[index]);
            }

            let posX = (1 + (i % 3))
            let posY = Math.floor(i / 3);
            if(board[i] === 'x'){
                let x1 = posX * tileSize - (tileSize * 0.80) + (gridGutter * posX );
                let y1 = posY  * tileSize + gridGutter + (tileSize * 0.2) + (gridGutter * posY );
                let x2 = x1 + tileSize * 0.60;
                let y2 = y1 + tileSize * 0.60;
                line(x1, y1, x2, y2);
                line(x2, y1, x1, y2);
            }else{
                posX = posX  * tileSize - (tileSize / 2) + (gridGutter * posX );
                posY = posY * tileSize +  (tileSize / 2) + (gridGutter * (1 + posY));
                circle(posX, posY, tileSize * 0.60);
            }
            resetMatrix();
        }
    }
}

function resetBoard(){
    shake = -1;
    winWave.winPath = [];
    winWave.theta = 0.0;
    winWave.amplitude = 25.0;
    currentPlayre = firstPlayer === "x" ? "x" : "o";
    for(let i=0; i<9; i++){
        //board[i] = Math.round(Math.random()) == 1 ? 'x' : 'o';
        board[i] = '';
    }
    
    if(firstPlayer === "x"){
        updateStatus("Computer turn");
        setTimeout(computerMove, 1000);
    }else{
        updateStatus("User turn");
    }
}

function playerMove(x, y){
    // check selected tile
    let posX = Math.floor((x - gridGutter) / (tileSize + gridGutter));
    let posY = Math.floor((y - gridGutter) / (tileSize + gridGutter));
    let index = posX + posY * 3;
    // check tile is free
    if(board[index] != ''){
        shake = index;
        setTimeout(function(){shake = -1}, 600);
        currentPlayre = "o";
        return;
    }
    // update board
    board[index] = 'o';
    let isWin = checkWin();
    if(isWin === null){
        updateStatus("Computer turn");
        setTimeout(computerMove, 1000);
    }else if(isWin.status === 'tie'){
        // game End with tie
        updateStatus("Game Tie");
    }else{
        // we have a win+
        winWave.winPath = isWin.path;
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
        winWave.winPath = isWin.path;
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
    if(status === "User turn"){
        document.getElementById("defaultCanvas0").classList.add("click");
    }else{
        document.getElementById("defaultCanvas0").classList.remove("click");
    }
    
    document.getElementById("gameStatus").innerHTML = status;
}

function firstTurnChange(evt){
    console.log(evt.target.id);
    firstPlayer = evt.target.id === "fturnComp" ? "x" : "o";
}