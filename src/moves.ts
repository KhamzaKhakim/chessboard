import { BoardPiece, BoardPieces, Move, Position } from "./types.js";
import { posKey } from "./utils.js";

export function calculateAvailableMoves(
  currentPiece: BoardPiece,
  pieces: BoardPieces,
  size: number,
): Move[] {
  function cleanMoves(pos: Position) {
    if (pos.col < 0 || pos.col >= size || pos.row < 0 || pos.row >= size)
      return false;

    const pieceAtPosition = pieces.get(posKey(pos.row, pos.col));
    if (pieceAtPosition && pieceAtPosition.color == currentPiece.color) {
      return false;
    }

    return true;
  }

  function checkCapture(pos: Position): Move {
    const capture = pieces.has(posKey(pos.row, pos.col));
    return { ...pos, capture };
  }

  function getRookMoves(pos: Position) {
    let [up, down, left, right] = [true, true, true, true];
    const moves: Position[] = [];

    const { col, row } = pos;
    let i = 1;
    while (up || down || left || right) {
      if (i > size) return moves;

      //check if left is still ok
      if (left) {
        //out of board
        if (col - i < 0) {
          left = false;
        } else if (pieces.has(posKey(row, col - i))) {
          //if not same color can capture
          if (pieces.get(posKey(row, col - i))?.color != currentPiece.color) {
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
        } else if (pieces.has(posKey(row, col + i))) {
          if (pieces.get(posKey(row, col + i))?.color != currentPiece.color) {
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
        } else if (pieces.has(posKey(row - i, col))) {
          if (pieces.get(posKey(row - i, col))?.color != currentPiece.color) {
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
        } else if (pieces.has(posKey(row + i, col))) {
          if (pieces.get(posKey(row + i, col))?.color != currentPiece.color) {
            moves.push({ row: row + i, col });
          }
          down = false;
        } else {
          moves.push({ row: row + i, col });
        }
      }
      i++;
    }

    return moves;
  }

  function getBishopMoves(pos: Position) {
    //tl is top left, br is bottom right
    let [tl, tr, bl, br] = [true, true, true, true];
    const moves: Position[] = [];

    const { col, row } = pos;
    let i = 1;
    while (tl || tr || bl || br) {
      if (i > size) return moves;

      if (tl) {
        //out of board
        if (col - i < 0 || row - i < 0) {
          tl = false;
        } else if (pieces.has(posKey(row - i, col - i))) {
          //if not same color can capture
          if (
            pieces.get(posKey(row - i, col - i))?.color != currentPiece.color
          ) {
            moves.push({ row: row - i, col: col - i });
          }
          tl = false;
        } else {
          moves.push({ row: row - i, col: col - i });
        }
      }
      if (tr) {
        if (col + i > size || row - i < 0) {
          tr = false;
        } else if (pieces.has(posKey(row - i, col + i))) {
          if (
            pieces.get(posKey(row - i, col + i))?.color != currentPiece.color
          ) {
            moves.push({ row: row - i, col: col + i });
          }
          tr = false;
        } else {
          moves.push({ row: row - i, col: col + i });
        }
      }
      if (bl) {
        if (row + i > size || col - i < 0) {
          bl = false;
        } else if (pieces.has(posKey(row + i, col - i))) {
          if (
            pieces.get(posKey(row + i, col - i))?.color != currentPiece.color
          ) {
            moves.push({ row: row + i, col: col - i });
          }
          bl = false;
        } else {
          moves.push({ row: row + i, col: col - i });
        }
      }
      if (br) {
        if (row + i > size || col + i > size) {
          br = false;
        } else if (pieces.has(posKey(row + i, col + i))) {
          if (
            pieces.get(posKey(row + i, col + i))?.color != currentPiece.color
          ) {
            moves.push({ row: row + i, col: col + i });
          }
          br = false;
        } else {
          moves.push({ row: row + i, col: col + i });
        }
      }
      i++;
    }

    return moves;
  }

  function getQueenMoves(pos: Position) {
    return [...getRookMoves(pos), ...getBishopMoves(pos)];
  }

  function getPawnMoves(pos: Position) {
    const moves: Position[] = [];

    const { row, col } = pos;
    if (currentPiece.color == "w") {
      if (!pieces.has(posKey(row - 1, col))) {
        moves.push({ row: row - 1, col: col });
      }
      if (
        row == size - 2 &&
        !pieces.has(posKey(row - 1, col)) &&
        !pieces.has(posKey(row - 2, col))
      ) {
        moves.push({ row: row - 2, col: col });
      }
      const tl = pieces.get(posKey(row - 1, col - 1));
      const tr = pieces.get(posKey(row - 1, col + 1));
      if (tl && tl.color != currentPiece.color) {
        moves.push({ row: row - 1, col: col - 1 });
      }
      if (tr && tr.color != currentPiece.color) {
        moves.push({ row: row - 1, col: col + 1 });
      }
    } else {
      if (!pieces.has(posKey(row + 1, col))) {
        moves.push({ row: row + 1, col: col });
      }
      if (
        row == 1 &&
        !pieces.has(posKey(row + 1, col)) &&
        !pieces.has(posKey(row + 2, col))
      ) {
        moves.push({ row: row + 2, col: col });
      }
      const tl = pieces.get(posKey(row + 1, col - 1));
      const tr = pieces.get(posKey(row + 1, col + 1));
      if (tl && tl.color != currentPiece.color) {
        moves.push({ row: row + 1, col: col - 1 });
      }
      if (tr && tr.color != currentPiece.color) {
        moves.push({ row: row + 1, col: col + 1 });
      }
    }

    return moves;
  }

  const { row, col } = currentPiece;

  switch (currentPiece.fenPiece.toLowerCase()) {
    // case "p":
    //   return currentPiece.;
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
    case "b":
      return getBishopMoves(currentPiece).map(checkCapture);
    case "q":
      return getQueenMoves(currentPiece).map(checkCapture);
    case "p":
      return getPawnMoves(currentPiece).map(checkCapture);
    default:
      throw new Error(
        `Piece with fen code: ${currentPiece.fenPiece} not found`,
      );
  }
}
