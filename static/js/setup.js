var board = null
var isGamePaused = false;
var isGameInProgress = false; 
var randomMoveAllowed = true;
var playerToRandomMode = false;


/*------------------stopGame-----------------------------*/
function stopGame() {
    // If the game is in progress, stop the game and reset the board
    if (isGameInProgress || isGamePaused) {
        
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

        $('#randomToRandomBtn').show();
        $('#playerToRandomBtn').show();
        $('#pauseGameBtn').hide();
        $('#resumeGameBtn').hide();
        
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

    $('#pauseGameBtn').show();
    $('#resumeGameBtn').hide();
    $('#playerToRandomBtn').hide();
    $('#randomToRandomBtn').hide();

    // Start making random moves automatically
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
    

    // Start a new game where a user has to drag and drop, and then random moves
    game = new Chess();

    isGameInProgress = true;
    isGamePaused = false;
    playerToRandomMode = true;
    randomMoveAllowed = true;

    config.draggable = true;

    $('#pauseGameBtn').show();
    $('#resumeGameBtn').hide();
    $('#playerToRandomBtn').hide();
    $('#randomToRandomBtn').hide();
}
/*------------------playerToPlayer-----------------------------*/
function playerToPlayer() {
    // If the game is in progress, stop the game and reset the board
    if (isGameInProgress) {
        stopGame();
    }

    // Start a new board
    board = Chessboard('board1', config);
    

    // Start a new game where a user has to drag and drop, and then random moves
    game = new Chess();

    isGameInProgress = true;
    isGamePaused = false;
    playerToRandomMode = true;
    randomMoveAllowed = true;

    config.draggable = true;

    $('#pauseGameBtn').show();
    $('#resumeGameBtn').hide();
    $('#playerToRandomBtn').hide();
    $('#randomToRandomBtn').hide();
    $('#playerToPlayerBtn').hide();
}

function isPlayerTurn(piece) {
    return (game.turn() === 'w' && piece.search(/^w/) !== -1) || (game.turn() === 'b' && piece.search(/^b/) !== -1);
}

/*------------------onDragStart-----------------------------*/
function onDragStart (source, piece, position, orientation) {

    // do not pick up pieces if the game is over
    //if (game.game_over()) return false
    if (game.game_over() || (playerToRandomMode && !isPlayerTurn(piece))) {
        return false;
    }

    // only pick up pieces for White
    //if (piece.search(/^b/) !== -1) return false

    // only pick up pieces for White or Black (depending on the turn)
    if (!isPlayerTurn(piece)) {
        return false;
    }
}

/*------------------makeRandomMove-----------------------------*/
function makeRandomMove () {
    if (randomMoveAllowed) {
            var possibleMoves = game.moves()

            // game over
            if (game.game_over()) {
                return
            }

            if(!isGamePaused){
                var randomIdx = Math.floor(Math.random() * possibleMoves.length)
                game.move(possibleMoves[randomIdx])
                board.position(game.fen())

                if (game.in_checkmate()) {
                    // Determine the winner
                    var winner = game.turn() === 'w' ? 'White' : 'Black';

                    // Display the checkmate message in the HTML
                    var checkmateWinner = document.getElementById('checkmateWinner');
                    checkmateWinner.innerText = winner;

                    // Show the checkmate message container
                    var checkmateMessage = document.getElementById('checkmateMessage');
                    checkmateMessage.style.display = 'block';
                    return
                }
        
                if (randomMoveAllowed && !isGamePaused && !playerToRandomMode){
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

    // Check for checkmate after the move
    if (game.in_checkmate()) {
        // Determine the winner
        var winner = game.turn() === 'w' ? 'White' : 'Black';

        // Display the checkmate message in the HTML
        var checkmateWinner = document.getElementById('checkmateWinner');
        checkmateWinner.innerText = winner;

        // Show the checkmate message container
        var checkmateMessage = document.getElementById('checkmateMessage');
        checkmateMessage.style.display = 'block';

        return
    } else {
        // make random legal move for black
        window.setTimeout(makeRandomMove, 500);
    }
}

/*------------------onSnapEnd-----------------------------------*/
function onSnapEnd () {
    // update the board position after the piece snap
    // for castling, en passant, pawn promotion
    board.position(game.fen())
}
/*------------------pauseGame-----------------------------------*/
function pauseGame() {
    isGamePaused = true;

    config.draggable = false;

    var moves = game.history();

    var winnerSpan = document.getElementById('winnerSpan');
    winnerSpan.innerHTML = '';

    sendMovesToBackend(moves)

    $('#pauseGameBtn').hide();
    $('#resumeGameBtn').show();
}
/*------------------resumeGame-----------------------------------*/
// Function to resume the game
function resumeGame() {
    isGamePaused = false;
    config.draggable = true;

    if (!playerToRandomMode){
        makeRandomMove()
    }

    $('#pauseGameBtn').show();
    $('#resumeGameBtn').hide();

}
/*------------------sendMovesToBackend-----------------------------------*/
function sendMovesToBackend(moves) {
    console.log(moves);

    $.ajax({
        type: "POST",
        url: "/predict/",
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify({ moves: moves }),
        success: function(response) {
            // Update the UI with the prediction
            //console.log(response);
            var winnerSpan = document.getElementById('winnerSpan');
            winnerSpan.innerText = response.prediction === 1 ? 'white' : 'black';
            
            console.log(response.probability);
            //document.getElementById('probabilityDisplay').innerText = `Probability: ${response.probability}`;
            //document.getElementById('probabilityMessage').style.display = 'block'; 
        },
        error: function(error) {
            console.error('Error:', error);
        }
    });

}

var config = {
    draggable: false,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
}

board = Chessboard('board1', config)

$('#stopBtn').on('click', stopGame);
$('#randomToRandomBtn').on('click', randomToRandom);
$('#playerToRandomBtn').on('click', playerToRandom);
$('#playerToPlayerBtn').on('click', playerToPlayer);
$('#pauseGameBtn').on('click', pauseGame);
$('#resumeGameBtn').on('click', resumeGame);

$('#pauseGameBtn').hide();
$('#resumeGameBtn').hide();