import { drawPiecesFromFen, preloadPieces } from "./image.js";
import { BoardPiece, FEN_PIECES } from "./types.js";
import { iteratePieces, startPositon } from "./utils.js";

export class Chessboard {
  ref: string;
  size: number;
  fen: string;
  svgPieces: Record<string, HTMLImageElement> | null = null;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  pieces: BoardPiece[] = [];
  tileSize: number;

  constructor(ref: string, size: number = 8, fen: string = startPositon) {
    this.ref = ref;
    this.size = size;
    this.fen = fen;

    const canvas = document.getElementById(this.ref);

    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error(`Element #${ref} is not a canvas`);
    }

    this.canvas = canvas;

    this.ctx = canvas.getContext("2d")!;

    this.tileSize = this.canvas.width / this.size;
  }

  async init() {
    await this.setup();
    this.draw();
  }

  async setup() {
    //preload pieces;
    if (!this.svgPieces) {
      this.svgPieces = await preloadPieces(FEN_PIECES);
    }

    const tempPieces: BoardPiece[] = [];
    iteratePieces(this.fen, ({ fenPiece, row, col }) => {
      tempPieces.push({
        start: row + "-" + col,
        fenPiece,
        row,
        col,
      } as BoardPiece);
    });

    this.pieces = tempPieces;

    //add event listeneres for canvas
    this.canvas.onmousedown = (e) => this.mouseDownHandler(e);
  }

  draw() {
    if (!this.svgPieces) {
      throw new Error("Preloaded images not found");
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        this.ctx.fillStyle = (r + c) % 2 === 0 ? "#f0d9b5" : "#b58863";
        this.ctx.fillRect(
          c * this.tileSize,
          r * this.tileSize,
          this.tileSize,
          this.tileSize,
        );
      }
    }

    drawPiecesFromFen(this.fen, this.ctx, this.tileSize, this.svgPieces);
  }

  private mouseDownHandler(e: MouseEvent) {
    //i need pieces
    e.preventDefault();
    const x = e.offsetX;
    const y = e.offsetY;

    for (let i = 0; i < this.pieces.length; i++) {
      const piece = this.pieces[i];
      const leftB = piece.col * this.tileSize;
      const rightB = (piece.col + 1) * this.tileSize;
      const topB = piece.row * this.tileSize;
      const bottomB = (piece.row + 1) * this.tileSize;

      if (x > leftB && x < rightB && y > topB && y < bottomB) {
        console.log(`Clicked: ${piece.fenPiece}`);
        return;
      }
    }
  }
}
