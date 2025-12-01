import { BoardPiece, Move, Position } from "./types.js";

export function calculateAvailableMoves(
  currentPiece: BoardPiece,
  pieces: BoardPiece[],
  size: number,
): Move[] {
  function cleanMoves(v: Position) {
    if (v.col < 0 || v.col >= size || v.row < 0 || v.row >= size) return false;

    return true;
  }

  function checkCapture(v: Position): Move {
    const capture = !!pieces.find((p) => p.col == v.col && p.row == v.row);
    return { ...v, capture };
  }

  const { row, col } = currentPiece;

  //check color
  //king and knight is done
  //bishop rook
  //queen

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
      return [].map(checkCapture);
  }
  return [];
}
