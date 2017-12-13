import React from 'react';
import ReactDOM from 'react-dom';

import Settings from './components/Settings';
import SETTINGS_FORMAT from './settings_format.js';
import 'normalize.css';
import './app.scss';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      board: [],
      gameIsActive: false,
      settingsAreOpen: false,
      settings: {
        updateTimer: SETTINGS_FORMAT.updateTimer.default,
        percentOfLiveCells: SETTINGS_FORMAT.percentOfLiveCells.default,
        cellSize: SETTINGS_FORMAT.cellSize.default,
        numberOfRows: SETTINGS_FORMAT.numberOfRows.default,
        numberOfColumns: SETTINGS_FORMAT.numberOfColumns.default
      },
      stat: {
        generation: 0
      }
    };

    this.handleOnBoardClick = this.handleOnBoardClick.bind(this);
    this.handleOnSettingsClick = this.handleOnSettingsClick.bind(this);
    this.handleOnSettingsChange = this.handleOnSettingsChange.bind(this);

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.reset = this.reset.bind(this);
    this.clear = this.clear.bind(this);

    this.updateBoard = this.updateBoard.bind(this);
  }

  componentWillMount() {
    this.generateBoard(
      this.state.settings.numberOfRows, 
      this.state.settings.numberOfColumns, 
      this.state.settings.percentOfLiveCells);
  }

  componentDidMount() {
    this.start();
  }

  start() {
    this.setState({ gameIsActive: true });
    this.timer = setTimeout(this.updateBoard, this.state.settings.updateTimer);
  }

  stop() {
    this.setState({ gameIsActive: false });
    clearTimeout(this.timer);
  }

  reset() {
   this.stop();
   this.setState({ stat: { generation: 0 } });

   this.generateBoard(
      this.state.settings.numberOfRows, 
      this.state.settings.numberOfColumns, 
      this.state.settings.percentOfLiveCells);
  }

  clear() {
    this.stop();
    this.setState({ stat: { generation: 0 } });
    
    this.generateBoard(
      this.state.settings.numberOfRows, 
      this.state.settings.numberOfColumns,
      0);
  }

  updateBoard() {
    let newBoard = this.state.board.map((cell, index) => {
      let neighbors = this.getNeighbors(index, this.state.settings.numberOfRows, this.state.settings.numberOfColumns);
      let sum = 0;

      for(let i = 0; i < neighbors.length; i++) {
        if(this.state.board[neighbors[i]]) {
          sum++;
        }
      }

      if(1 < sum && sum < 4) {
        if(sum == 3) {
          return true;
        } else {
          return cell;
        }
      } else {
        return false;
      }
    });

    this.setState({ 
      board: newBoard,
      stat: {
        generation: this.state.stat.generation + 1
      }
    });

    this.timer = setTimeout(this.updateBoard, this.state.settings.updateTimer);
  }

  generateBoard(row, col, percent) {
    let numberOfCells = row * col;
    let numberOfLiveCells = Math.floor(numberOfCells * percent * 0.01);
    let board = new Array(numberOfCells).fill(false, 0, numberOfCells);
    
    for(let i = 0; i < numberOfLiveCells; i++) {
      let random = Math.floor(Math.random() * numberOfCells);

      while(board[random]) {
        random = (random + 1) % numberOfCells;
      }

      board[random] = true;
    }
   
    this.setState({ board });
  }

  getBoardWidth() {
    return `${this.state.settings.numberOfColumns * this.state.settings.cellSize + 1}px`;
  }

  getNeighbors(index, row, col) {
    let arr = [];

    /* Top Line */

    if(0 <= index && index < col) {
      
      /* Top Left Corner */

      if(index == 0) {
        arr[0] = col * row - 1;
        arr[1] = col * (row - 1);
        arr[2] = col * (row - 1) + 1;
        
        arr[3] = col - 1;
        arr[4] = 1;

        arr[5] = (col * 2) - 1;
        arr[6] = col;
        arr[7] = col + 1;

        return arr;
      }

      /* Top Right Corner */

      if(index == col - 1) {
        arr[0] = col * row - 2;
        arr[1] = col * row - 1;
        arr[2] = col * (row - 1);
        
        arr[3] = index - 1;
        arr[4] = 0;

        arr[5] = (col * 2) - 2;
        arr[6] = (col * 2) - 1;
        arr[7] = col;

        return arr;
      }

      /* Top Line, Not Corner Cells */

      arr[0] = index + col * (row - 1) - 1;
      arr[1] = index + col * (row - 1);
      arr[2] = index + col * (row - 1) + 1;
      
      arr[3] = index - 1;
      arr[4] = index + 1;

      arr[5] = index + col - 1;
      arr[6] = index + col;
      arr[7] = index + col + 1;

      return arr;
    } 

    /* Bottom Line */

    if(col * (row - 1) <= index && index < col * row) {
      
      /* Bottom Left Corner */

      if(index == col * (row - 1)) {
        arr[0] = index - 1;
        arr[1] = col * (row - 2);
        arr[2] = col * (row - 2) + 1;
        
        arr[3] = col * row - 1;
        arr[4] = index + 1;

        arr[5] = col - 1;
        arr[6] = 0;
        arr[7] = 1;
      }

      /* Bottom Right Corner */

      if(index == col * row - 1) {
        arr[0] = col * (row - 1) - 2;
        arr[1] = col * (row - 1) - 1;
        arr[2] = col * (row - 2);
        
        arr[3] = index - 1;
        arr[4] = col * (row - 1);

        arr[5] = col - 1;
        arr[6] = col - 2;
        arr[7] = 0;
      }

      /* Bottom Lime, Not Corner Cells */

      arr[0] = index - col - 1;
      arr[1] = index - col;
      arr[2] = index - col + 1;
      
      arr[3] = index - 1;
      arr[4] = index + 1;

      arr[5] = index % col - 1;
      arr[6] = index % col;
      arr[7] = index % col + 1;

      return arr;
    }

    /* Left Side */

    if(index % col == 0) {
      arr[0] = index - 1;
      arr[1] = index - col;
      arr[2] = index - col + 1;
      
      arr[3] = index + col - 1;
      arr[4] = index + 1;

      arr[5] = index + (col * 2) - 1;
      arr[6] = index + col;
      arr[7] = index + col + 1;

      return arr;
    }

    /* Right Side */

    if(index % col == col - 1) {
      arr[0] = index - col - 1;
      arr[1] = index - col;
      arr[2] = index - (col * 2) + 1;
      
      arr[3] = index - 1;
      arr[4] = index - col + 1;

      arr[5] = index + col - 1;
      arr[6] = index + col;
      arr[7] = index + 1;

      return arr;
    }

    /* Common case */

    arr[0] = index - col - 1;
    arr[1] = index - col;
    arr[2] = index - col + 1;
    
    arr[3] = index - 1;
    arr[4] = index + 1;

    arr[5] = index + col - 1;
    arr[6] = index + col;
    arr[7] = index + col + 1;

    return arr;
  }

  handleOnBoardClick(event) {
    if(event.target.nodeName !== 'SPAN') {
      return;
    }
    
    let index = Number(event.target.getAttribute('data-index'));
    let newBoard = this.state.board;
    
    newBoard[index] = !newBoard[index];

    this.setState({ board: newBoard });
  }

  handleOnSettingsClick() {
    this.setState({ settingsAreOpen: !this.state.settingsAreOpen });
  }

  handleOnSettingsChange(settings) {
    this.setState({ settings }, this.reset);
  }

  render() {
    return (
        <div className="wrapper">
          <div className="header">
            <p className="header__logo">Game Of Life</p>  
            <div className="header__controls">
              <span className="header__button" onClick={this.state.gameIsActive ? this.stop : this.start}>{this.state.gameIsActive ? 'Stop' : 'Start'}</span>
              <span className="header__button" onClick={this.reset}>Reset</span>
              <span className="header__button" onClick={this.clear}>Clear</span>
              <span className="header__button" onClick={this.handleOnSettingsClick}>Settings</span>
            </div>
            <Settings 
                state={this.state.settingsAreOpen} 
                settings={this.state.settings} 
                onSettingsClick={this.handleOnSettingsClick} 
                onSettingsChange={this.handleOnSettingsChange}
            />
            <div className="stat header__stat">
              <span className="stat__element">{`Generation: ${this.state.stat.generation}`}</span>
            </div>
          </div>
          <div className="content wrapper__content">
            <div className="board" style={{width: this.getBoardWidth()}} onClick={this.handleOnBoardClick}>
              { 
                this.state.board.map((alive, index) => 
                  <span 
                    key={index}
                    data-index={index} 
                    style={{
                      width: `${this.state.settings.cellSize}px`,
                      height: `${this.state.settings.cellSize}px`
                    }} 
                    className={`board__cell${alive ? ' board__cell_alive' : ''}`}
                  ></span>)
              }
            </div> 
          </div>
        </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));