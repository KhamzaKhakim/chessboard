import { BoardPiece, FenPiece } from "./types.js";
import { pieceToSvgName } from "./utils.js";

export function drawPieces(
  pieces: BoardPiece[],
  ctx: CanvasRenderingContext2D,
  tileWidth: number,
  images: Record<FenPiece, HTMLImageElement>,
) {
  //TODO: add error checks

  function drawPiece({
    fenPiece,
    x,
    y,
  }: {
    fenPiece: FenPiece;
    x: number;
    y: number;
  }) {
    ctx.drawImage(images[fenPiece], x, y, tileWidth, tileWidth);
  }

  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];
    drawPiece({ fenPiece: piece.fenPiece, x: piece.x, y: piece.y });
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
