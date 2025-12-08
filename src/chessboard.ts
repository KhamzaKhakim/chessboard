import {
  drawCurrentPiece,
  drawMoves,
  drawPieces,
  preloadPieces,
} from "./image.js";
import { calculateAvailableMoves } from "./moves.js";
import { BoardPiece, FEN_PIECES, Move, BoardPieces } from "./types.js";
import {
  getCellFromMouse,
  getColorFromFenPie,
  iteratePieces,
  posKey,
  startPositon,
} from "./utils.js";
export class Chessboard {
  private ref: string;
  private size: number;
  private fen: string;
  private svgPieces: Record<string, HTMLImageElement> | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pieces: BoardPieces = new Map<string, BoardPiece>();
  private tileSize: number;
  private isDragging = false;
  private isClicked = false;
  private currentPiece: BoardPiece | null = null;
  private availableMoves: Move[] = [];

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

  private async setup() {
    //preload pieces;
    if (!this.svgPieces) {
      this.svgPieces = await preloadPieces(FEN_PIECES);
    }

    const tempPieces = new Map<string, BoardPiece>();

    iteratePieces(this.fen, ({ fenPiece, row, col }) => {
      tempPieces.set(posKey(row, col), {
        start: posKey(row, col),
        fenPiece,
        row,
        col,
        y: row * this.tileSize,
        x: col * this.tileSize,
        color: getColorFromFenPie(fenPiece),
      } as BoardPiece);
    });

    this.pieces = tempPieces;

    //add event listeneres for canvas
    this.canvas.onmousedown = (e) => this.mouseDownHandler(e);
    this.canvas.onmouseup = (e) => this.mouseUpHandler(e);
    this.canvas.onmouseout = (e) => this.mouseOutHandler(e);
    this.canvas.onmousemove = (e) => this.mouseMoveHandler(e);
  }

  private draw() {
    if (!this.pieces) return;
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

    drawPieces(this.pieces, this.ctx, this.tileSize, this.svgPieces);

    drawMoves(this.availableMoves, this.ctx, this.tileSize);

    if (this.currentPiece)
      drawCurrentPiece(
        this.currentPiece,
        this.ctx,
        this.tileSize,
        this.svgPieces,
      );
  }

  private mouseDownHandler(e: MouseEvent) {
    e.preventDefault();

    const { row, col } = getCellFromMouse({
      e,
      tileSize: this.tileSize,
    });

    if (this.isClicked) {
      return;
    }

    const tempPiece = this.pieces.get(posKey(row, col));

    if (tempPiece) {
      this.isDragging = true;

      this.currentPiece = tempPiece;
      this.pieces.delete(posKey(row, col));

      this.currentPiece.x = e.offsetX - this.tileSize / 2;
      this.currentPiece.y = e.offsetY - this.tileSize / 2;

      this.availableMoves = calculateAvailableMoves(
        this.currentPiece,
        this.pieces,
        this.size,
      );

      this.draw();
    }
  }

  private mouseUpHandler(e: MouseEvent) {
    if (!(this.isDragging || this.isClicked) || !this.currentPiece) return;

    e.preventDefault();

    const { row, col } = getCellFromMouse({
      e,
      tileSize: this.tileSize,
    });

    if (row == this.currentPiece.row && col == this.currentPiece.col) {
      this.isClicked = true;
      this.isDragging = false;

      this.currentPiece.x = this.currentPiece.col * this.tileSize;
      this.currentPiece.y = this.currentPiece.row * this.tileSize;

      this.draw();
      return;
    }

    if (this.isClicked) {
      const isClickAvailable = !!this.availableMoves.find(
        (m) => m.row == row && col == m.col,
      );

      if (!isClickAvailable) {
        this.pieces.set(
          posKey(this.currentPiece.row, this.currentPiece?.col),
          this.currentPiece!,
        );
        this.currentPiece = null;
        this.isClicked = false;
        this.availableMoves = [];
        this.draw();
        return;
      } else {
        this.pieces.delete(posKey(row, col));
      }

      //need to have different animation
      this.currentPiece.row = row;
      this.currentPiece.col = col;

      this.currentPiece.x = col * this.tileSize;
      this.currentPiece.y = row * this.tileSize;

      this.isDragging = false;
      this.isClicked = false;

      this.pieces.set(
        posKey(this.currentPiece.row, this.currentPiece.col),
        this.currentPiece,
      );
      this.currentPiece = null;
      this.availableMoves = [];
      this.draw();

      return;
    }

    //move by drag
    this.currentPiece.row = row;
    this.currentPiece.col = col;

    this.currentPiece.x = col * this.tileSize;
    this.currentPiece.y = row * this.tileSize;

    this.isDragging = false;
    this.isClicked = false;

    this.pieces.set(
      posKey(this.currentPiece.row, this.currentPiece.col),
      this.currentPiece,
    );
    this.currentPiece = null;
    this.availableMoves = [];
    this.draw();
  }

  private mouseOutHandler(e: MouseEvent) {
    if (!this.isDragging || !this.currentPiece) return;
    e.preventDefault();

    //go back to previous position
    //TODO: remove maybe
    this.currentPiece.x = this.currentPiece.col * this.tileSize;
    this.currentPiece.y = this.currentPiece.row * this.tileSize;

    this.isDragging = false;
    this.isClicked = true;
    this.availableMoves = [];
    this.currentPiece = null;
    this.draw();
  }

  private mouseMoveHandler(e: MouseEvent) {
    if (!this.isDragging || !this.currentPiece) return;

    e.preventDefault();

    const x = e.offsetX,
      y = e.offsetY;

    this.currentPiece.x = x - this.tileSize / 2;
    this.currentPiece.y = y - this.tileSize / 2;

    this.draw();
  }
}
