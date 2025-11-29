//fen notation, lowercase letters for black pieces, uppercase letters for white pieces
export const pieces = [
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

export type Piece = (typeof pieces)[number];
