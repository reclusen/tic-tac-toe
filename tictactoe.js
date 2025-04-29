const GameBoard = function() {
    const rows = 3;
    const cols = 3;
    const board = [];

    for (let i = 0; i < rows; i++) {
        //append a row to the board
        board[i] = [];
        for (let j = 0; j < cols; j++) {
            //appends Tile objects on the number of columns
            board[i].push(Tile());
        }
    }

    const getBoard = () => board;
    
    const setMark = (player, row, col) => {
        //look for empty tiles on the board, then finds the exact matching tile and returns it
        const availableTile = board.filter((_, rowNum) => row == rowNum+1).map(row => row[col-1])[0];

        console.log("availableTile:", availableTile);

        //assumes that the tile is occupied
        if (availableTile.getMark() != "") return;

        availableTile.draw(player);
    };

    const printBoard = () => {
        const tiles = board.map( row => row.map( tile => tile.getMark() ) );
        console.log("board:", tiles);
    };

    return { getBoard, setMark, printBoard };
}


function Tile() {
    let mark = "";

    const draw = (player) => {
        mark = player;        
    }
    
    const getMark = () => mark;

    return { draw, getMark };
}


const BoardController = (p1 = "Player 1", p2 = "Player 2") => {
    const gb = GameBoard();
    const board = gb.getBoard();

    const players = [
        {
            name: p1, 
            mark: "x", 
        }, 
        {
            name: p2, 
            mark: "o", 
        } 
    ];

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer == players[0] ? players[1] : players[0];
    }

    const getActivePlayer = () => activePlayer;

    const printTurn = () => {
        gb.printBoard();
        console.log(`It is ${getActivePlayer().name}'s turn.`);
    }

    const checkWinner = (row, col, mark) => {
        //create new object per function call to re-iterate through the board and count the marks
        const patterns = { row: 0, col: 0, ldiag: 0, rdiag: 0 };

        for (let i = 0; i < board.length; i++) {
            if (board[row-1][i].getMark() == mark) patterns.row++;
            if (board[i][col-1].getMark() == mark) patterns.col++;
            if (board[i][i].getMark() == mark) patterns.ldiag++;
            console.log((board.length-1)-i, col-1);
            if (board[(board.length-1)-i][i].getMark() == mark) patterns.rdiag++;
        }
        
        for (const pattern in patterns) {
            console.log(`${pattern}[${patterns[pattern]}]: == ${board.length}`);
            if (patterns[pattern] === board.length) return true;
        }
    }

    const playTurn = (row, col) => {
        console.log(`Mark set on row ${row} column ${col}.`);
        
        gb.setMark(getActivePlayer().mark, row, col);

        if (checkWinner(row, col, getActivePlayer().mark)) return `${getActivePlayer().name} wins!`;

        switchPlayerTurn();
        printTurn();

        return "Next turn";
    };

    //initial message on game start
    printTurn();

    return { playTurn, getActivePlayer };
}