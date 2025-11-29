import { FenPiece } from "./types.js";
import { pieceToSvgName } from "./utils.js";

export function drawPiecesFromFen(
  fen: string,
  ctx: CanvasRenderingContext2D,
  tileWidth: number,
  images: Record<FenPiece, HTMLImageElement>,
) {
  //TODO: add error checks

  const rows = fen.split("/");

  function drawPiece({
    piece,
    row,
    col,
  }: {
    piece: FenPiece;
    row: number;
    col: number;
  }) {
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

      drawPiece({ piece: row[idx] as FenPiece, row: i, col });
      idx++;
      col++;
    }
  }
}

export async function preloadPieces(
  pieces: readonly FenPiece[],
): Promise<Record<FenPiece, HTMLImageElement>> {
  const entries = await Promise.all(
    pieces.map(
      (piece) =>
        new Promise<[FenPiece, HTMLImageElement]>((resolve, reject) => {
          const img = new Image();
          img.src = `./assets/${pieceToSvgName[piece]}.svg`;

          img.onload = () => resolve([piece, img]);
          img.onerror = () =>
            reject(new Error(`Failed to load image: ${piece}`));
        }),
    ),
  );

  return Object.fromEntries(entries) as Record<FenPiece, HTMLImageElement>;
}
