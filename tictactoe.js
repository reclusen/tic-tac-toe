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
    const clearBoard = () => {
        for (const row of board) {
            for (const col of row) {
                col.set("");
            }
        }
    };
    
    const setMark = (player, row, col) => {
        //look for empty tiles on the board, then finds the exact matching tile and returns it
        const availableTile = board.filter((_, rowNum) => row-1 == rowNum).map(row => row[col-1])[0];

        console.log("availableTile:", availableTile);

        //assumes that the tile is occupied
        if (availableTile.getMark() != "") return;


        availableTile.set(player.mark);
    };

    const printBoard = () => {
        const tiles = board.map( row => row.map( tile => tile.getMark() ) );
        console.log("board:", tiles);
    };

    return { getBoard, setMark, clearBoard, printBoard };
}


function Tile() {
    let mark = "";

    const set = (player) => {
        mark = player;        
    }
    
    const getMark = () => mark;

    return { set, getMark };
}


const BoardController = ({p1 = "Player 1", p2 = "Player 2", toggledCPU = false} = {}) => {
    const gb = GameBoard();
    const board = gb.getBoard();

    const players = [
        { name: p1, mark: "x" }, 
        { name: p2, mark: "o" } 
    ];

    let activePlayer = players[0];

    const toggleCPU = () => {
        toggledCPU = true;
    }

    if (toggledCPU) {
        function setRandom() {
            const random = (min, max) => {
                return Math.round(Math.random() * (max-min) + min);
            }

            const emptyTiles = board.flatMap(
                                    (row, rowIndex) => row.map(
                                        (tile, colIndex) => Object.create({rowIndex, colIndex, mark: tile.getMark()}))
                                            ).filter(tile => tile.mark == "");

            const tileIndex = random(0, emptyTiles.length-1);
            const {rowIndex, colIndex} = emptyTiles[tileIndex];

            board[rowIndex][colIndex].set(this.mark);
        };
        

        Object.assign(players[1], { isCPU: true, setRandom });
    }

    const switchPlayerTurn = () => {
        activePlayer = activePlayer == players[0] ? players[1] : players[0];
    }

    const resetPlayerTurn = () => {
        activePlayer = players[0];
        console.log("confirmed reset:", activePlayer);
    }

    const getActivePlayer = () => activePlayer;

    const printTurn = () => {
        gb.printBoard();
        console.log(`It is ${getActivePlayer().name}'s turn.`);
    }

    const checkIfWinner = mark => {
        //create new object per function call to re-iterate through the board and count the marks
        const diagonal = { left: 0, right: 0 };
        const straight = {
            row: [{rowNum: 1, count: 0}, {rowNum: 2, count: 0}, {rowNum: 3, count: 0}],
            col: [{colNum: 1, count: 0}, {colNum: 2, count: 0}, {colNum: 3, count: 0}],
        }

        const boardLen = board.length;

        for (let row = 0; row < boardLen; row++) {
            for (let col = 0; col < board[row].length; col++) {
                if (board[row][col].getMark() == mark) {
                    const rowNum = straight["row"].find(tile => row+1 == tile.rowNum);
                    rowNum.count++;
                }

                if (board[col][row].getMark() == mark) {
                    const colNum = straight["col"].find(tile => row+1 == tile.colNum);
                    colNum.count++;
                }
            }

            if (board[row][row].getMark() == mark) diagonal.left++;
            if (board[(boardLen-1)-row][row].getMark() == mark) diagonal.right++;
        }

        console.log("straight", straight);
        console.log("diagonal", diagonal.left, diagonal.right);

        if (diagonal.left == boardLen || diagonal.right == boardLen) return {hasWinner: true};


        for (const line in straight) {
            const res = straight[line].find(line => line.count == boardLen);
            if (res) {
                if (res.count === boardLen) return {hasWinner: true};
            }
        }

        let occupied = 0;
        for (const row of board) {
            for (const col of row) {
                if (col.getMark() != "") occupied++;
            }
        }

        if (occupied == boardLen*3) return {hasWinner: false, occupied};
        
        return {hasWinner: null, occupied};
    }

    const playTurn = (row, col) => {
        console.log(`Mark set on row ${row} column ${col}.`);
        
        gb.setMark(getActivePlayer(), row, col);

        //immediately end the game if a winner is found
        let activePlayer = getActivePlayer();
        let {hasWinner, occupied} = checkIfWinner(activePlayer.mark);

        if (!hasWinner && toggledCPU && occupied < board.length*3) {
            switchPlayerTurn();
            printTurn();

            console.log("[[[[[cpu detected]]]]]");
            const cpu = getActivePlayer();

            cpu.setRandom();

            activePlayer = cpu;

            ({hasWinner, occupied} = checkIfWinner(cpu.mark));
            console.log(activePlayer.name, hasWinner);
        }

        switchPlayerTurn();
        printTurn();

        return hasWinner ? `${activePlayer.name} wins!` : hasWinner == false ? "Tie game." : "No pattern detected";
    };

    //initial message on game start
    printTurn();

    return { playTurn, toggleCPU, boardFunc: {getBoard: gb.getBoard, clearBoard: gb.clearBoard}, playerFunc: {getActivePlayer, resetPlayerTurn} };
}

function ScreenController() {
    const p1 = document.querySelector("#p1").value;
    const p2 = document.querySelector("#p2").value;

    let game = BoardController();
    
    if (p1 && p2) {
        game = BoardController(p1, p2);
        if (document.querySelector("#cpu").checked) game = BoardController({p1: p1, p2: p2, toggledCPU: true});
    } else {
        if (document.querySelector("#cpu").checked) game = BoardController({toggledCPU: true});
    }

    const activePlayerName = document.querySelector(".current-player");
    const boardDiv = document.querySelector(".board");
    const statusP = document.querySelector(".status");
    
    const setActivePlayerName = (activePlayer) => {
        activePlayerName.textContent = `It is ${activePlayer.name}'s turn.`;
        console.log("active player name set:", activePlayer.name);
    };

    const updateScreen = (statusMessage, firstElementChild) => {
        boardDiv.textContent = "";

        const board = game.boardFunc.getBoard();
        let activePlayer = game.playerFunc.getActivePlayer();

        setActivePlayerName(activePlayer);
        
        board.forEach((row, rowIndex) => {
            row.forEach((tile, colIndex) => {
                const tileDiv = document.createElement("button");
                tileDiv.classList.add("tile");

                tileDiv.dataset.row = rowIndex+1;
                tileDiv.dataset.column = colIndex+1;


                if (tile.getMark() == "x") {
                    const x = document.createElement("img");
                    x.classList.add("xmark");
                    x.src = "./svg/icon _cross_.svg";
                    tileDiv.append(x);
                }

                if (tile.getMark() == "o") {
                    const o = document.createElement("img");
                    o.classList.add("opera-logo");
                    o.src = "./svg/icon_opera_.svg";
                    tileDiv.append(o);
                }

                boardDiv.append(tileDiv);
            });
        });
        
        statusP.textContent = statusMessage || "Start";

        if (statusMessage) {
            if (!statusMessage.includes("pattern")) {
                const tiles = document.querySelectorAll(".tile");
                const resetBtn = document.createElement("button");

                const opponentType = document.querySelector(".opponent-type");
    
                tiles.forEach(tile => {
                    tile.toggleAttribute("disabled");
                    tile.style.cursor = "auto";
                });

                resetBtn.textContent = "Reset";
                resetBtn.classList.add("reset");

                opponentType.insertAdjacentElement("beforebegin", resetBtn);

                resetBtn.addEventListener("click", e => {
                    tiles.forEach(tile => {
                        tile.toggleAttribute("disabled");
                        tile.replaceChildren();
                    });

                    game.boardFunc.clearBoard();
                    game.playerFunc.resetPlayerTurn();

                    activePlayer = game.playerFunc.getActivePlayer();
                    setActivePlayerName(activePlayer);
                    statusP.textContent = "Start";

                    resetBtn.replaceWith();
                });
            }
        }
    }

    const clickTileHandler = e => {
        const selectedRow = e.target.dataset.row;
        const selectedColumn = e.target.dataset.column;

        if (!selectedRow || !selectedColumn) return;

        const statusMessage = game.playTurn(selectedRow, selectedColumn);


        updateScreen(statusMessage, e.target.firstElementChild);
    }

    boardDiv.addEventListener("click", clickTileHandler);
    
    updateScreen();
}

const renderScreen = ScreenController;

renderScreen();