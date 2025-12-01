import { BoardPiece, BoardPieces, FenPiece, Move } from "./types.js";
import { pieceToSvgName } from "./utils.js";

export function drawPieces(
  pieces: BoardPieces,
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

  for (const piece of pieces.values()) {
    drawPiece({ fenPiece: piece.fenPiece, x: piece.x, y: piece.y });
  }
}

export function drawMoves(
  moves: Move[],
  ctx: CanvasRenderingContext2D,
  tileWidth: number,
) {
  if (!moves.length) return;
  //TODO: add error checks

  function drawDot({ row, col }: { row: number; col: number }) {
    const centerX = col * tileWidth + tileWidth / 2;
    const centerY = row * tileWidth + tileWidth / 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, tileWidth * 0.15, 0, 2 * Math.PI, false);
    ctx.fillStyle = "rgba(104, 104, 104, 0.4)";

    ctx.fill();
  }

  function drawCircle({ row, col }: { row: number; col: number }) {
    const centerX = col * tileWidth + tileWidth / 2;
    const centerY = row * tileWidth + tileWidth / 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, tileWidth * 0.4, 0, 2 * Math.PI, false);
    ctx.strokeStyle = "rgba(104, 104, 104, 0.4)";
    ctx.lineWidth = tileWidth * 0.1;
    ctx.stroke();
  }

  for (let i = 0; i < moves.length; i++) {
    const { row, col, capture } = moves[i];
    if (capture) {
      drawCircle({ row, col });
    } else {
      drawDot({ row, col });
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

export function drawCurrentPiece(
  piece: BoardPiece,
  ctx: CanvasRenderingContext2D,
  tileWidth: number,
  images: Record<FenPiece, HTMLImageElement>,
) {
  ctx.drawImage(images[piece.fenPiece], piece.x, piece.y, tileWidth, tileWidth);
}
