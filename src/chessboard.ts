import { drawPieces, preloadPieces } from "./image.js";
import { BoardPiece, FEN_PIECES } from "./types.js";
import { getCellFromMouse, iteratePieces, startPositon } from "./utils.js";

//TODO: rows 0 is the 8th rank hard to read.
// x and y in drawPiece is counterintuitive

export class Chessboard {
  ref: string;
  size: number;
  fen: string;
  svgPieces: Record<string, HTMLImageElement> | null = null;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  pieces: BoardPiece[] = [];
  tileSize: number;
  isDragging = false;
  isClicked = false;
  currentPiece: BoardPiece | null = null;

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
        y: row * this.tileSize,
        x: col * this.tileSize,
      } as BoardPiece);
    });

    this.pieces = tempPieces;

    //add event listeneres for canvas
    this.canvas.onmousedown = (e) => this.mouseDownHandler(e);
    this.canvas.onmouseup = (e) => this.mouseUpHandler(e);
    this.canvas.onmouseout = (e) => this.mouseOutHandler(e);
    this.canvas.onmousemove = (e) => this.mouseMoveHandler(e);
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

    drawPieces(this.pieces, this.ctx, this.tileSize, this.svgPieces);
  }

  private mouseDownHandler(e: MouseEvent) {
    //i need pieces
    e.preventDefault();
    const { row: clickedRow, col: clickedCol } = getCellFromMouse({
      e,
      tileSize: this.tileSize,
    });

    if (
      this.isClicked &&
      this.currentPiece &&
      (clickedRow != this.currentPiece.row ||
        clickedCol != this.currentPiece.col)
    ) {
      this.currentPiece.row = clickedRow;
      this.currentPiece.col = clickedCol;
      this.currentPiece.y = clickedRow * this.tileSize;
      this.currentPiece.x = clickedCol * this.tileSize;

      this.draw();
      this.isClicked = false;

      return;
    }

    const index = this.pieces.findIndex(
      (piece) => piece.row === clickedRow && piece.col === clickedCol,
    );

    if (index !== -1) {
      this.isDragging = true;

      this.currentPiece = this.pieces.splice(index, 1)[0];
      this.pieces.push(this.currentPiece);

      this.currentPiece.x = e.offsetX - this.tileSize / 2;
      this.currentPiece.y = e.offsetY - this.tileSize / 2;

      this.draw();
    }
  }

  private mouseUpHandler(e: MouseEvent) {
    if (!this.isDragging || !this.currentPiece) return;

    e.preventDefault();

    const { row, col } = getCellFromMouse({
      e,
      tileSize: this.tileSize,
    });

    //need to calculate which cell it was moved to and center piece to the cell
    //somehow update the fen accordingly i guess best option is with pieces array

    if (row == this.currentPiece.row && col == this.currentPiece.col) {
      this.isClicked = true;
      this.isDragging = false;

      this.currentPiece.x = this.currentPiece.col * this.tileSize;
      this.currentPiece.y = this.currentPiece.row * this.tileSize;

      this.draw();
      return;
    }

    this.currentPiece.row = row;
    this.currentPiece.col = col;

    this.currentPiece.x = col * this.tileSize;
    this.currentPiece.y = row * this.tileSize;

    this.isDragging = false;
    this.currentPiece = null;
    this.draw();
  }

  private mouseOutHandler(e: MouseEvent) {
    if (!this.isDragging || !this.currentPiece) return;
    e.preventDefault();

    //go back to previous position
    //TODO: remove maybe
    this.currentPiece.x = this.currentPiece.col * this.tileSize;
    this.currentPiece.y = this.currentPiece.row * this.tileSize;

    this.draw();

    this.isDragging = false;
    this.currentPiece = null;
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
