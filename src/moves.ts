import { BoardPiece, Move, Position } from "./types.js";

export function calculateAvailableMoves(
  currentPiece: BoardPiece,
  pieces: BoardPiece[],
  size: number,
): Move[] {
  function cleanMoves(pos: Position) {
    if (pos.col < 0 || pos.col >= size || pos.row < 0 || pos.row >= size)
      return false;

    const ownPiecesAtPosition = pieces.filter(
      (p) =>
        p.col == pos.col && p.row == pos.row && currentPiece.color == p.color,
    );

    if (ownPiecesAtPosition.length) return false;

    return true;
  }

  //TODO: change pieces to map
  function checkCapture(pos: Position): Move {
    const capture = !!pieces.find((p) => p.col == pos.col && p.row == pos.row);
    return { ...pos, capture };
  }

  // function getRookMoves(pos: Position) {
  //   let [up, down, left, right] = [true, true, true, true];

  //   let { col, row } = pos;
  //   let i = 1;
  //   while (up || down || left || right) {
  //     if (up) {
  //       if (col - i < 0) {
  //         up = false;
  //       } else if (col - i == )
  //     }
  //   }
  // }

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
      return [].map(checkCapture);
  }
  return [];
}
