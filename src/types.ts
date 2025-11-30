//fen notation, lowercase letters for black pieces, uppercase letters for white pieces
export const FEN_PIECES = [
  "k", //black king
  "q", // black queen
  "r", //black rook
  "n", //black knight
  "b", //black bishop
  "p", //black pawn
  "K", //white king
  "Q", //white queen
  "R", //white rook
  "N", //white knight
  "B", //white bishop
  "P", //white pawn
] as const;

export type FenPiece = (typeof FEN_PIECES)[number];

export type BoardPiece = {
  start: string;
  fenPiece: FenPiece;
  col: number;
  row: number;
  x: number;
  y: number;
};
