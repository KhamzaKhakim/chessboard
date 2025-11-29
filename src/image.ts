import { Piece } from "./types.js";
import { pieceToSvgName } from "./utils.js";

export function drawPiecesFromFen(
  fen: string,
  ctx: CanvasRenderingContext2D,
  tileWidth: number,
  images: Record<Piece, HTMLImageElement>,
) {
  //TODO: add error checks

  const rows = fen.split("/");

  function drawPiece({
    piece,
    row,
    col,
  }: {
    piece: Piece;
    row: number;
    col: number;
  }) {
    console.log("Drawing: " + JSON.stringify({ piece, row, col }));

    ctx.drawImage(
      images[piece],
      col * tileWidth,
      row * tileWidth,
      tileWidth,
      tileWidth,
    );
  }

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

      drawPiece({ piece: row[idx] as Piece, row: i, col });
      idx++;
      col++;
    }
  }
}

export async function preloadPieces(
  pieces: readonly Piece[],
): Promise<Record<Piece, HTMLImageElement>> {
  const entries = await Promise.all(
    pieces.map(
      (piece) =>
        new Promise<[Piece, HTMLImageElement]>((resolve, reject) => {
          const img = new Image();
          img.src = `./assets/${pieceToSvgName[piece]}.svg`;

          img.onload = () => resolve([piece, img]);
          img.onerror = () =>
            reject(new Error(`Failed to load image: ${piece}`));
        }),
    ),
  );

  return Object.fromEntries(entries) as Record<Piece, HTMLImageElement>;
}
