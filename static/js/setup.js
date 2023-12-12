var board = null
//var game = new Chess()
var isGamePaused = false;
var isGameInProgress = false; 
var randomMoveAllowed = true;
var playerToRandomMode = false;


/*------------------stopGame-----------------------------*/
function stopGame() {
    // If the game is in progress, stop the game and reset the board
    if (isGameInProgress || isGamePaused) {
        // Stop the game and retrieve the moves
        var moves = game.history();
        console.log('Moves:', moves);
        
        // Reset the board
        board.clear();
        // Set another board
        board = Chessboard('board1', config);

        // Reset the Chess game instance
        game.reset();

        isGameInProgress = false;
        isGamePaused = false;
        randomMoveAllowed = false;

        var winnerSpan = document.getElementById('winnerSpan');
        winnerSpan.innerHTML = '';
        
    }
}

/*------------------randomToRandom-----------------------------*/
function randomToRandom() {
    // If the game is in progress, stop the game and reset the board
    if (isGameInProgress) {
        stopGame();
    }

    // Start a new board
    board.start();
    // Set another board
    board = Chessboard('board1', config);

    // Start a new game with only random moves
    game = new Chess();
    isGameInProgress = true;
    isGamePaused = false;
    playerToRandomMode = false;

    // Allow only random moves
    randomMoveAllowed = true;

    // Start making random moves automatically
    rtr = true;
    console.log('elo');
    makeRandomMove();
}

/*------------------playerToRandom-----------------------------*/
function playerToRandom() {
    // If the game is in progress, stop the game and reset the board
    if (isGameInProgress) {
        stopGame();
    }

    // Start a new board
    board = Chessboard('board1', config);
    config.draggable = true;

    // Start a new game where a user has to drag and drop, and then random moves
    game = new Chess();
    isGameInProgress = true;
    isGamePaused = false;
    playerToRandomMode = true;
    randomMoveAllowed = true;
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
    if (randomMoveAllowed) {
            var possibleMoves = game.moves()

            // game over
            if (game.game_over()) return
            if(!isGamePaused){
                var randomIdx = Math.floor(Math.random() * possibleMoves.length)
                game.move(possibleMoves[randomIdx])
                board.position(game.fen())
        
                if (!playerToRandomMode){
                    window.setTimeout(makeRandomMove, 500)
                }
            }
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
    window.setTimeout(makeRandomMove, 500)
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

    config.draggable = false;

    isGamePaused = true;
    var moves = game.history();
    console.log('Moves:', moves);
    sendMovesToBackend(moves)
}
/*------------------resumeGame-----------------------------------*/
// Function to resume the game
function resumeGame() {
    isGamePaused = false;
    config.draggable = true;
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

var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
}

board = Chessboard('board1', config)

$('#stopBtn').on('click', stopGame);
$('#randomToRandomBtn').on('click', randomToRandom);
$('#playerToRandomBtn').on('click', playerToRandom);
$('#pauseGameBtn').on('click', pauseGame);
$('#resumeGameBtn').on('click', resumeGame);