import { drawPiecesFromFen, preloadPieces } from "./image.js";
import { pieces } from "./types.js";
import { startPositon } from "./utils.js";

export class Chessboard {
  ref: string;
  size: number;
  fen: string;
  svgPieces: Record<string, HTMLImageElement> | null = null;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

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
  }

  async init() {
    await this.setup();
    this.draw();
  }

  async setup() {
    //preload pieces;
    if (!this.svgPieces) {
      this.svgPieces = await preloadPieces(pieces);
    }

    //add event listeneres for canvas
    this.canvas.onmousedown = this.mouseDownHandler;
  }

  draw() {
    if (!this.svgPieces) {
      throw new Error("Preloaded images not found");
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const TILE = this.canvas.width / this.size;

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        this.ctx.fillStyle = (r + c) % 2 === 0 ? "#f0d9b5" : "#b58863";
        this.ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
      }
    }

    drawPiecesFromFen(this.fen, this.ctx, TILE, this.svgPieces);
  }

  private mouseDownHandler(e: MouseEvent) {
    //i need pieces
    e.preventDefault();
    const x = e.offsetX;
    const y = e.offsetY;
    console.log(`Clicked at canvas position: ${x}, ${y}`);
  }
}
