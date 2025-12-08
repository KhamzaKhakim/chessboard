import { FenPiece, FEN_PIECES, Color, BoardPiece } from "./types.js";

export const startPositon = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

export const pieceToName: Record<(typeof FEN_PIECES)[number], string> = {
  k: "black king",
  q: "black queen",
  r: "black rook",
  n: "black knight",
  b: "black bishop",
  p: "black pawn",
  K: "white king",
  Q: "white queen",
  R: "white rook",
  N: "white knight",
  B: "white bishop",
  P: "white pawn",
};

export const pieceToSvgName: Record<(typeof FEN_PIECES)[number], string> = {
  k: "bk",
  q: "bq",
  r: "br",
  n: "bn",
  b: "bb",
  p: "bp",
  K: "wk",
  Q: "wq",
  R: "wr",
  N: "wn",
  B: "wb",
  P: "wp",
};

export function iteratePieces(
  fen: string,
  callback: ({
    fenPiece,
    row,
    col,
  }: {
    fenPiece: FenPiece;
    row: number;
    col: number;
  }) => void,
) {
  const rows = fen.split("/");

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let col = 0,
      idx = 0;
    while (row[idx]) {
      if (/\d/.test(row[idx])) {
        col += Number(row[idx]);
        idx++;
        continue;
      }

      callback({ fenPiece: row[idx] as FenPiece, row: i, col });
      idx++;
      col++;
    }
  }
}

export function getCellFromMouse({
  e,
  tileSize,
}: {
  e: MouseEvent;
  tileSize: number;
}) {
  const row = Math.floor(e.offsetY / tileSize);
  const col = Math.floor(e.offsetX / tileSize);

  return { row, col };
}

export function getColorFromFenPie(piece: FenPiece): Color {
  return piece == piece.toUpperCase() ? "white" : "black";
}

export function posKey(piece: BoardPiece): string;
export function posKey(row: number, col: number): string;
export function posKey(pieceOrRow: BoardPiece | number, col?: number): string {
  if (typeof pieceOrRow == "number") return `${pieceOrRow}-${col}`;
  else return `${pieceOrRow.row}-${pieceOrRow.col}`;
}
