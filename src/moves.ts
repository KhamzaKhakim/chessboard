import { BoardPiece, BoardPieces, Move, Position } from "./types.js";

export function calculateAvailableMoves(
  currentPiece: BoardPiece,
  pieces: BoardPieces,
  size: number,
): Move[] {
  function cleanMoves(pos: Position) {
    if (pos.col < 0 || pos.col >= size || pos.row < 0 || pos.row >= size)
      return false;

    const pieceAtPosition = pieces.get(`${pos.row}-${pos.col}`);
    if (pieceAtPosition && pieceAtPosition.color == currentPiece.color) {
      return false;
    }

    return true;
  }

  //TODO: change pieces to map
  function checkCapture(pos: Position): Move {
    const capture = pieces.has(`${pos.row}-${pos.col}`);
    return { ...pos, capture };
  }

  //TODO: make more readable
  function getRookMoves(pos: Position) {
    let [up, down, left, right] = [true, true, true, true];
    const moves: Position[] = [];

    const { col, row } = pos;
    let i = 1;
    while (up || down || left || right) {
      if (i > size) return [];

      //check if left is still ok
      if (left) {
        //out of board
        if (col - i < 0) {
          left = false;
        } else if (pieces.has(row + "-" + (col - i))) {
          //if not same color can capture
          if (pieces.get(row + "-" + (col - i))?.color != currentPiece.color) {
            moves.push({ row, col: col - i });
          }
          left = false;
        } else {
          moves.push({ row, col: col - i });
        }
      }
      if (right) {
        if (col + i > size) {
          right = false;
        } else if (pieces.has(row + "-" + (col + i))) {
          if (pieces.get(row + "-" + (col + i))?.color != currentPiece.color) {
            moves.push({ row, col: col + i });
          }
          right = false;
        } else {
          moves.push({ row, col: col + i });
        }
      }
      if (up) {
        if (row - i < 0) {
          up = false;
        } else if (pieces.has(row - i + "-" + col)) {
          if (pieces.get(row - i + "-" + col)?.color != currentPiece.color) {
            moves.push({ row: row - i, col });
          }
          up = false;
        } else {
          moves.push({ row: row - i, col });
        }
      }
      if (down) {
        if (row + i > size) {
          down = false;
        } else if (pieces.has(row + i + "-" + col)) {
          if (pieces.get(row + i + "-" + col)?.color != currentPiece.color) {
            moves.push({ row: row + i, col });
          }
          down = false;
        } else {
          moves.push({ row: row + i, col });
        }
      }
      i++;
    }

    console.log(moves);
    return moves;
  }

  const { row, col } = currentPiece;

  switch (currentPiece.fenPiece.toLowerCase()) {
    case "k":
      return [
        { row: row + 1, col },
        { row: row - 1, col },
        { row, col: col - 1 },
        { row, col: col + 1 },
        { row: row + 1, col: col + 1 },
        { row: row + 1, col: col - 1 },
        { row: row - 1, col: col - 1 },
        { row: row - 1, col: col + 1 },
      ]
        .filter(cleanMoves)
        .map(checkCapture);
    case "n":
      return [
        { row: row + 2, col: col + 1 },
        { row: row + 2, col: col - 1 },
        { row: row - 2, col: col + 1 },
        { row: row - 2, col: col - 1 },
        { row: row + 1, col: col + 2 },
        { row: row + 1, col: col - 2 },
        { row: row - 1, col: col + 2 },
        { row: row - 1, col: col - 2 },
      ]
        .filter(cleanMoves)
        .map(checkCapture);
    case "r":
      return getRookMoves(currentPiece).map(checkCapture);
  }
  return [];
}
