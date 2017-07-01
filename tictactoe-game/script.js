"use strict";

document.addEventListener('DOMContentLoaded', function() {
    Game.init();
});

var Game = ((function() {
    let marks = {
        human: 'X',
        computer: 'O',
        none: ''
    };
    
    let map = getClearMap();
    let mapIsNotAvailable = false;
    let choice;
    
    function getClearMap() {
        let arr = [];
        
        for(let i = 0; i < 9; i++) {
            arr[i] = marks.none;
        }
        
        return arr;
    }
    
    function computerMove() {
        minimax('computer', 0, -Infinity, +Infinity);  
        
        map[choice] = marks.computer;
        document.getElementById('table-cell-' + choice).textContent = marks.computer;
        
        let status = getGameStatus();
        
        if(status.code > 0) {
            mapIsNotAvailable = true;
            showGameStatus(status.code);
            highlightWinningCells(status.cells);
        }
    }

    // Codes:
    // 0 = game is not over yet
    // 1 = it's a draw
    // 2 = human won
    // 3 = computer won

    function getGameStatus() {
        let code = [2, 3];
        let mark = [marks.human, marks.computer];
        
        //check for winning combination
        
        for(let j = 0; j < 2; j++) {
            
            //horizontal: 0,1,2 and 3,4,5 and 6,7,8
            
            for(let i = 0; i <= 6; i += 3) {
                if(map[i] === mark[j] && map[i + 1] === mark[j] && map[i + 2] === mark[j]) {
                    return {
                        code: code[j], 
                        cells: [i, i + 1, i + 2]
                    };    
                }
            }  
            
            //vertical: 0,3,6 and 1,4,7 and 2,5,8
        
            for(let i = 0; i <= 2; i++) {
                if(map[i] === mark[j] && map[i + 3] === mark[j] && map[i + 6] === mark[j]) {
                    return {
                        code: code[j], 
                        cells: [i, i + 3, i + 6]
                    };
                }
            }

            //diagonal: 0,4,8 and 2,4,6
            
            for(let i = 0; i <= 2; i += 2) {
                if(map[i] === mark[j] && map[4] === mark[j] && map[8 - i] === mark[j]) {
                    return {
                        code: code[j], 
                        cells: [i, 4, 8 - i]
                    };
                }     
            }
        }
        
        //if some of cells is empty - it is not end
        
        for(let i = 0; i < 9; i++) {
            if(map[i] === marks.none) {
                return {
                    code: 0,
                    cells: []
                };
            }
                
        }   
        
        //if all cells is not empty it is a draw
        
        return {
            code: 1,
            cells: []
        };
    }
    
    function minimax(player, depth, alpha, beta) {
        let status = getGameStatus();
        
        if(status.code > 0) {
            if(status.code === 1)
                return 0;
        
            if (status.code === 2)
                return depth - 10;

            if (status.code === 3)
                return 10 - depth;
        }
            
        depth++;
        
        let availableMoves = getAvailableMoves();
        let move, result;
        
        if(player == 'computer') {
            for(let i = 0; i < availableMoves.length; i++) {
                move = availableMoves[i];
                
                map[move] = marks.computer;
                result = minimax('human', depth, alpha, beta);
                map[move] = marks.none;
                
                if(result > alpha) {
                    alpha = result;
                    
                    if(depth == 1)
                        choice = move;
                } else if (alpha >= beta) {
                    return alpha;
                }
            }
            
            return alpha;
        } else {
            for(let i = 0; i < availableMoves.length; i++) {
                move = availableMoves[i];
                
                map[move] = marks.human;
                result = minimax('computer', depth, alpha, beta);
                map[move] = marks.none;
                
                if(result < beta) {
                    beta = result;
                    
                    if (depth == 1)
                        choice = move;
                } else if (beta <= alpha) {
                    return beta;
                }
            }  
            
            return beta;
        }
    }
    
    function getAvailableMoves() {
        let arr = [];
        
        for (let i = 0; i < 9; i++) {
            if(map[i] == marks.none) {
                arr.push(i);
            }
                
        }
        
        return arr;
    }
    
    function showGameStatus(code) {
        let status = '';
        
        switch(code) {
            case 1: status = "It's a draw!"; break;        
            case 2: status = "You have won!"; break;        
            case 3: status = "The computer has won!"; break;  
            default: console.error(`Unknown code: ${code}`);
        }
        
        let statusElement = document.getElementById('status');
        
        statusElement.classList.remove('visibilityHidden');
        statusElement.textContent = status;    
    }
    
    function highlightWinningCells(cells) {
        cells.forEach(function(id) {
            document.getElementById('table-cell-' + id).classList.add('table__cell-highlight');
        });
    }
    
    function humanMove(mouseEvent) {
        let index = mouseEvent.target.getAttribute('data-index');
                
        if(index == null) {
            return;
        }

        if(map[index] !== marks.none) {
            return;
        }
        
        if(mapIsNotAvailable) {
            return;
        }

        map[index] = marks.human;
        mouseEvent.target.textContent = marks.human;

        let status = getGameStatus();
        
        if(status.code > 0) {
            mapIsNotAvailable = true;
            showGameStatus(status.code);
            highlightWinningCells(status.cells);
        } else {
            computerMove();
        }
    }
    
    function cleanTable() {
        document.querySelectorAll('.table__cell').forEach(function(element) {
            element.textContent = '';
            element.classList.remove('table__cell-highlight');
        });
    }
    
    function buttonsHandler(event) {
        let action = event.target.getAttribute('data-action');

        switch(action) {
            case 'new-game': {
                map = getClearMap();
                mapIsNotAvailable = false;
                cleanTable();
                
                document.getElementById('table').classList.add('displayNone');
                document.getElementById('welcome').classList.remove('displayNone');
                
                document.getElementById('status').classList.add('visibilityHidden');
                document.getElementById('new-game-btn').classList.add('visibilityHidden');
            } break;
            case 'set-player-x': {
                marks.human = 'X';
                marks.computer = 'O';
                
                document.getElementById('welcome').classList.add('displayNone');
                document.getElementById('table').classList.remove('displayNone');
                document.getElementById('new-game-btn').classList.remove('visibilityHidden');
            } break;
            case 'set-player-o': {
                marks.human = 'O';
                marks.computer = 'X';
                
                document.getElementById('welcome').classList.add('displayNone');
                document.getElementById('table').classList.remove('displayNone');
                document.getElementById('new-game-btn').classList.remove('visibilityHidden');
                
                computerMove();
            } break;
            default: {
                console.error(`Unknown action: ${action}`);
            }
        }  
    }

    return {
        init: function() {
            document.getElementById('table').addEventListener('click', humanMove);
            
            [].forEach.call(document.querySelectorAll('[data-type=button]'), function(element) {
                element.addEventListener('click', buttonsHandler);
            });
        }
    }
})());