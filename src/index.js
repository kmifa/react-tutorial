import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className={`square ${props.highlight}`} onClick={props.onClick}>
      {props.value}
    </button>
  )
}

function Sort(props) {
  return (
    <button className='squre' onClick={props.onClick}>
      Sort
    </button>
  )
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        highlight={this.props.winCells.includes(i) ? 'highlight' : ''}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        key={i}
      />
    )
  }

  render() {
    const cols = [0, 1, 2];
    const rows = [0, 1, 2];
    // htmlを返す時はreturnしないと駄目
    return (
      <div>
        {
          rows.map(row => {
            return (
              <div className="board-row" key={row}>
                {cols.map(col => this.renderSquare(row * 3 + col))}
              </div>
            )
          })
        }
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        location: {
          col: 0,
          row: 0,
        },
      }],
      stepNumber: 0,
      isAscendingOrder: true,
      xIsNext: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    // sliceで配列のコピーを作成
    // 望む変更を加えた新しいデータのコピーで古いデータを置き換えるほうがよい。利点が3つある
    // 1. 複雑な機能が簡単に実装できる
    // 2. 変更の検出が簡単
    // 3. React の再レンダータイミングの決定
    const squares = current.squares.slice();
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    // concat() は元の配列をミューテートしない
    this.setState({
      history: history.concat([{
        squares: squares,
        location: {
          col: i % 3,
          row: Math.trunc(i / 3),
        },
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    })
  }

  reverse() {
    this.setState({
      isAscendingOrder: !this.state.isAscendingOrder,
    });
  }

  render() {
    // const history = this.state.history;
    const history = this.state.isAscendingOrder ? this.state.history : this.state.history.slice().reverse();
    const currentStepNumber = this.state.isAscendingOrder ? this.state.stepNumber : history.length - 1 - this.state.stepNumber
    const current = history[currentStepNumber];
    const winner = calculateWinner(current.squares);
    const moves = history.map((step, move) => {
      const moveIndex = this.state.isAscendingOrder ? move : history.length - 1 - move;
      const desc = moveIndex ?
        `Go to move #${moveIndex}(col, ${step.location.col}, row, ${step.location.row})`:
        'Go to game start';
      return (
        <li key={moveIndex}>
          <button
            className={move === currentStepNumber ? 'text-bold' : ''}
            onClick={() => this.jumpTo(moveIndex)}>
            {desc}
          </button>
        </li>
      );
    });
    console.log(currentStepNumber)

    let status;
    if (winner.winner) {
      status = 'Winner: ' + winner.winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    if (currentStepNumber === 9 && winner.winner === null) {
      status = 'Draw';
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winCells={winner.causedWinCells}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
          <Sort
            onClick={() => this.reverse()}
          />
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        causedWinCells: lines[i],
      }
    }
  }
  return {
    winner: null,
    causedWinCells: [],
  };
}