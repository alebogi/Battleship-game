//Sound from Zapsplat.com

var player1name;
var player2name;

//boards that players set at begining of the game
var board1 = new Array();
var board2 = new Array();

//matrix, 0 -> empty, 1-> ship
var player1board = [];
var player2board = [];

//1 -> player1, 2 -> player2
var turn = 1; 

var player1guessing = [];
var player2guessing = [];

//counter of ships
var ship1 = 4;
var ship2 = 3;
var ship3 = 2;
var ship4 = 1;

//----------------------- welcome ---------------------

function startGame(){
    let ret = checkNameFields();
    if (ret){
        alert("Let's start!");
        document.location.href='battleship-setup.html';
    }
}

function checkNameFields(){
    player1name = document.formW.player1name.value;
    player2name = document.formW.player2name.value;
    let namepattern = /^\w{3,15}$/;  

    localStorage.setItem("player1name", player1name);
    localStorage.setItem("player2name", player2name);
	
	let ret = true;

    if (!namepattern.test(player1name)){
        alert("Player1 name format invalid");
        ret = false;
    }
	
	if (!namepattern.test(player2name)){
        alert("Player2 name format invalid");
        ret = false;
    }

    return ret;
}

//------------------------------- setup ---------------------------
function soundAlertGameBegin(){
    var audio = new Audio("battleship-assets/sounds/let_the_games_begin.mp3");
    audio.play();
}

function soundAlertBattle(){
    var audio = new Audio("battleship-assets/sounds/fight.mp3");
    if (turn == 2)
     audio.play();
}

function soundAlertMissed(){
    var audio = new Audio("battleship-assets/sounds/missed.mp3");
    audio.play();
}

function soundAlertHit(){
    var audio = new Audio("battleship-assets/sounds/bomb_water.mp3");
    audio.play();
}

function initialiseBoardsWithZeros(num){ 
    if (num == 1){
        for(var i = 0; i < 10; i++) {
            player1board[i] = [];
            for(var j = 0; j < 10; j++) {
                player1board[i][j] = 0;
            }
        }
    }else{
        for(var i = 0; i < 10; i++) {
            player2board[i] = [];
            for(var j = 0; j < 10; j++) {
                player2board[i][j] = 0;
            }
        }
    }
}

function nameAlert(num){
    let name;
    if (num == 1){
        player1name = localStorage.getItem("player1name");
        name = player1name;
        //initialise board with zeros
        initialiseBoardsWithZeros(1);
    }else if (num == 2){
        player2name = localStorage.getItem("player2name");
        name = player2name;
        initialiseBoardsWithZeros(2);
        //initialise board with zeros
    }
    msg = name.concat(", please, set up your board");
    alert(msg);
}

function playerDoneWithSetup(){
    if ((ship1 != 0) || (ship2 != 0) || (ship3 != 0) || (ship4 != 0)){
        alert("You didn't place all your ships!");
        return;
    }
    let h = document.getElementById("header2setup").innerText;
    if (h==="Player 1"){
        saveBoard(1);
        document.getElementById("header2setup").innerHTML = "Player 2";
        nameAlert(2);
        resetBoard();
        turn = 2;
    }
    else{
        saveBoard(2);
        alert("Battle!");
        resetBoard();
        document.location.href='battleship-game.html';
    }
    
}

function decrementIfPossible(className){
    let result = document.querySelector(className);
    if(result.innerHTML > 0){
         result.innerHTML--;
         return true;
    }
     return false;
}

let started = 0; //mouse pressed on board
let fieldCnt = 0;
let arrayOfFields = new Array();
//tmp array where we store fields that were selected. After that we validate fields and store them in board1/2

function tdMousePressed(input){
    started = 1;
    if (input.innerHTML == "")
            input.innerHTML = "X";
    arrayOfFields.push(input);
    fieldCnt++;
}

function tdMouseEnter(input){
    if (started){
        if (input.innerHTML == "")
            input.innerHTML = "X";
        arrayOfFields.push(input);
        fieldCnt++;    
    }
}

function tdMouseReleased(input){
    if (started){
        size = fieldCnt;
        if (size > 4){
            deleteLastFields();
            arrayOfFields = [];
            fieldCnt = 0;
            started = 0;
            return;
        }
        let validPositions = checkFieldsPositions();
        if(!validPositions){
            deleteLastFields();
            arrayOfFields = [];
            fieldCnt = 0;
            started = 0;
            return;
        }
        drawShips(size);
        arrayOfFields = [];
        fieldCnt = 0;
        started = 0;
    }
}

function deleteLastFields(){
    for(let i = 0; i <arrayOfFields.length; i++){
        field = arrayOfFields[i];
        if (field.innerText == "X"){
            field.innerHTML = "";
        }
    }
}

function deleteImgsFromFields(){
    if (turn == 1){
        for(let i = 0; i <board1.length; i++){
            field = board1[i];
            field.innerHTML = "";
        }
    }else {
        for(let i = 0; i <board2.length; i++){
            field = board2[i];
            field.innerHTML = "";
        }
    }
}

function checkFieldsPositions(){
    var result = true;

    //first we have to check if there is available ship of that size
    var shipSize = arrayOfFields.length;
    switch(shipSize){
        case 1: 
            if (ship1 == 0)
                result = false;
            break;
        case 2: 
            if (ship2 == 0)
                result = false;
            break;
        case 3: 
            if (ship3 == 0)
                result = false;
            break;
        case 4: 
            if (ship4 == 0)
                result = false;
            break; 
    }

    /**
     * than we have to check following things:
     * - if there is already something on that field
     * - if there is ship on field in same row, but col -1/+1
     * - if there is ship on field in same col, but row -1/+1
     */

    var field; var classField; var row; var col;
    for(var i = 0; i < arrayOfFields.length; i++){
        field = arrayOfFields[i];
        classField = field.className;
        row = parseInt(classField.charAt(0));
        col = parseInt(classField.charAt(1));
        if (turn == 1){
            if (player1board[row][col] == 1)
                result = false;    
            if (row > 0){
                if (player1board[row - 1][col] == 1){
                    result = false;
                }
            }
            if (col > 0){
                if (player1board[row][col - 1] == 1){
                    result = false;
                }
            }
            if (row < 9){
                if (player1board[row + 1][col] == 1){
                    result = false;
                }
            }
            if (col < 9){
                if (player1board[row][col + 1] == 1){
                    result = false;
                }
            }
        }else{
            if (player2board[row][col] == 1)
                result = false; 
            if (row > 0){
                if (player2board[row - 1][col] == 1){
                    result = false;
                }
            }
            if (col > 0){
                if (player2board[row][col - 1] == 1){
                    result = false;
                }
            }
            if (row < 9){
                if (player2board[row + 1][col] == 1){
                    result = false;
                }
            }
            if (col < 9){
                if (player2board[row][col + 1] == 1){
                    result = false;
                }
            }
        }
    }

    //at the end we have to check if every "part" of ship is in same row/col
    field = arrayOfFields[0];
    classField = field.className;
    row = parseInt(classField.charAt(0));
    col = parseInt(classField.charAt(1));
    var r; var c;
    for (i = 1; i < arrayOfFields.length; i++){
        field = arrayOfFields[i];
        classField = field.className;
        r = parseInt(classField.charAt(0));
        c = parseInt(classField.charAt(1));
        if ((r != row) && (c != col))
            result = false;   
    }

    return result;
}

function drawShips(size){
    //first we have to decrement number of ships
    switch(size){
        case 1: decrementIfPossible(".shipSize1");
                ship1--;
            break;
        case 2: decrementIfPossible(".shipSize2");
                ship2--;
            break;
        case 3: decrementIfPossible(".shipSize3");
                ship3--;
            break;
        case 4: decrementIfPossible(".shipSize4");
                ship4--;
            break;    
    }
    //then we draw ships instead of "X", and we save that field in matrix of player
    for (let i = 0; i < arrayOfFields.length; i++){
        let el = arrayOfFields[i];

        //saving field in matrix -> marking it with 1
        var classField = el.className;
        row = classField.charAt(0);
        row = parseInt(row);
        col = classField.charAt(1);
        col = parseInt(col);

        if(turn == 1){
            board1.push(el);
            player1board[row][col] = 1;
        }else{
            board2.push(el);
            player2board[row][col] = 1;
        }
       el.innerHTML = "<img src='battleship-assets/img/img_blackShip.png'>";
    }
}

function saveBoard(num){
    if (num == 1){
        localStorage.setItem("player1board", JSON.stringify(player1board));
    }else if (num == 2){
        localStorage.setItem("player2board", JSON.stringify(player2board));
    }
    
}

function getBoards(){
    initialiseBoardsWithZeros(1);
    initialiseBoardsWithZeros(2);

    var p1 = JSON.parse(localStorage.getItem("player1board"));
    for(var i = 0; i < 10; i++){
        for(var j = 0; j < 10; j++){
            player1board[i][j] = parseInt(p1[i][j]);
        }
    }

    var p2 = JSON.parse(localStorage.getItem("player2board"));
    for(var i = 0; i < 10; i++){
        for(var j = 0; j < 10; j++){
            player2board[i][j] = parseInt(p2[i][j]);
        }
    }
}

function resetBoard(){
    deleteImgsFromFields();
    let el = document.querySelector(".shipSize1");
    el.innerHTML = "4";
    el = document.querySelector(".shipSize2");
    el.innerHTML = "3";
    el = document.querySelector(".shipSize3");
    el.innerHTML = "2";
    el = document.querySelector(".shipSize4");
    el.innerHTML = "1";

    ship1 = 4;
    ship2 = 3;
    ship3 = 2;
    ship4 = 1;
}