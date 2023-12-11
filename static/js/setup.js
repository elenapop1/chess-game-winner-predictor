var board = null
var game = new Chess()
var isGamePaused = false;
var isGameInProgress = false; 


/*------------------startGame-----------------------------*/
function startGame() {
    console.log(isGameInProgress);
    console.log(isGamePaused);
    if (isGameInProgress || isGamePaused) {
        // If the game is in progress, stop the game and restart the board
        stopGame();
        board.clear;
    } else {
        // If the game is not in progress, simply start the board
        board.start;
    }
}

/*------------------startGame-----------------------------*/
function stopGame() {
    // Add your code to stop the game here
    // For example, pause timers, disable moves, etc.
    // Ensure that the board is in a state where it can be restarted.
    isGameInProgress = false;
    isGamePaused = false
    board.stop;

}

/*------------------onDragStart-----------------------------*/
function onDragStart (source, piece, position, orientation) {

    // do not pick up pieces if the game is over
    if (game.game_over()) return false

    // only pick up pieces for White
    if (piece.search(/^b/) !== -1) return false
}

/*------------------makeRandomMove-----------------------------*/
function makeRandomMove () {

    isGameInProgress = true;
    var possibleMoves = game.moves()

    // game over
    if (game.game_over()) return
    if(!isGamePaused || !isGameInProgress){
        var randomIdx = Math.floor(Math.random() * possibleMoves.length)
        game.move(possibleMoves[randomIdx])
        board.position(game.fen())
  
        window.setTimeout(makeRandomMove, 500)
    }
}

/*------------------onDrop-------------------------------------*/
function onDrop (source, target) {
    // see if the move is legal
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
    })

    // illegal move
    if (move === null) return 'snapback'

    // make random legal move for black
    window.setTimeout(makeRandomMove, 250)
}

/*------------------onSnapEnd-----------------------------------*/
function onSnapEnd () {
    // update the board position after the piece snap
    // for castling, en passant, pawn promotion
    board.position(game.fen())
}

/*------------------pauseGame-----------------------------------*/
function pauseGame() {
    var winnerSpan = document.getElementById('winnerSpan');
    winnerSpan.innerHTML = '';

    isGamePaused = true;
    var moves = game.history();
    console.log('Moves:', moves);
    sendMovesToBackend(moves)
}

/*------------------sendMovesToBackend-----------------------------------*/
function sendMovesToBackend(moves) {

    $.ajax({
        type: "POST",
        url: "/predict/",
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify({ moves: moves }),
        success: function(response) {
            // Update the UI with the prediction
            var winnerSpan = document.getElementById('winnerSpan');
            winnerSpan.innerText = response.prediction === 1 ? 'white' : 'black';
        },
        error: function(error) {
            console.error('Error:', error);
        }
    });

}
/*------------------resumeGame-----------------------------------*/
// Function to resume the game
function resumeGame() {
    isGamePaused = false;
}
/*------------------makeBestMove-----------------------------------*/
function makeBestMove() {
    // Add your logic to generate the best move
    //var bestMove = getBestMove(game);
    var scnMove = "e2e4";
    var moveObject = {
        from: scnMove.substring(0, 2),
        to: scnMove.substring(2, 4),
        promotion: 'q', // You can set promotion if applicable (default is 'q' for queen)
    };
    result = game.move(moveObject);
    if (result) {
        // Move is legal, update the board
        board.position(game.fen());
    } else {
        // Move is illegal, handle accordingly
        console.error("Illegal move:", scnMove);
    }
/*     board.position(game.fen());
    renderMoveHistory(game.history()); */
    if (game.game_over()) {
        alert('Game over');
    }
}

function renderMoveHistory(moves) {
    // Render the move history
}

function getBestMove(game) {
    // Add your logic to get the best move
    
}

var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
}

board = Chessboard('board1', config)

$('#startBtn').on('click', startGame);
$('#clearBtn').on('click', board.clear);
$('#undoBtn').on('click', board.undo);
//$('#moveBtn').on('click', makeBestMove);
$('#randomToRandomBtn').on('click', makeRandomMove);
$('#playerToRandomBtn').on('click', makeRandomMove);
$('#pauseGameBtn').on('click', pauseGame);
$('#resumeGameBtn').on('click', resumeGame);