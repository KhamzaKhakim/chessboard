import { drawPiecesFromFen, preloadPieces } from "./image.js";
import { pieces } from "./types.js";
import { startPositon } from "./utils.js";

export class Chessboard {
  ref: string;
  size: number;
  fen: string;
  svgPieces: Record<string, HTMLImageElement> | null = null;

  constructor(ref: string, size: number, fen: string = startPositon) {
    this.ref = ref;
    this.size = size;
    this.fen = fen;
  }

  async drawBoard() {
    const canvas = document.getElementById(this.ref) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    const TILE = canvas.width / this.size;

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? "#f0d9b5" : "#b58863";
        ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
      }
    }

    //preloadPieces;
    if (!this.svgPieces || !this.svgPieces.size) {
      this.svgPieces = await preloadPieces(pieces);
    }

    drawPiecesFromFen(this.fen, ctx, TILE, this.svgPieces);
  }
}
