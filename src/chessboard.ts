import { drawMoves, drawPieces, preloadPieces } from "./image.js";
import { BoardPiece, FEN_PIECES, Move, Position } from "./types.js";
import { getCellFromMouse, iteratePieces, startPositon } from "./utils.js";

export class Chessboard {
  private ref: string;
  private size: number;
  private fen: string;
  private svgPieces: Record<string, HTMLImageElement> | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pieces: BoardPiece[] = [];
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

  private draw() {
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
  }

  private mouseDownHandler(e: MouseEvent) {
    //i need pieces
    e.preventDefault();

    const { row: clickedRow, col: clickedCol } = getCellFromMouse({
      e,
      tileSize: this.tileSize,
    });

    const index = this.pieces.findIndex(
      (piece) => piece.row === clickedRow && piece.col === clickedCol,
    );

    if (index !== -1) {
      this.isDragging = true;

      this.currentPiece = this.pieces.splice(index, 1)[0];
      this.pieces.push(this.currentPiece);

      this.currentPiece.x = e.offsetX - this.tileSize / 2;
      this.currentPiece.y = e.offsetY - this.tileSize / 2;

      this.availableMoves = this.calculateAvailableMoves(
        this.currentPiece,
        this.pieces,
        this.tileSize,
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
    //move by click, maybe change to mouse up
    if (this.isClicked && this.currentPiece) {
      this.currentPiece.row = row;
      this.currentPiece.col = col;
      this.currentPiece.y = row * this.tileSize;
      this.currentPiece.x = col * this.tileSize;
      this.availableMoves = [];

      this.isClicked = false;
      this.isDragging = false;
      this.draw();

      return;
    }

    //move by drag
    this.currentPiece.row = row;
    this.currentPiece.col = col;

    this.currentPiece.x = col * this.tileSize;
    this.currentPiece.y = row * this.tileSize;

    this.isDragging = false;
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
    // this.availableMoves = [];
    // this.currentPiece = null;
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

  calculateAvailableMoves(
    currentPiece: BoardPiece,
    pieces: BoardPiece[],
    tileSize: number,
    size: number,
  ): Move[] {
    function cleanMoves(v: Position) {
      if (v.col < 0 || v.col >= size || v.row < 0 || v.row >= size)
        return false;

      return true;
    }

    function checkCapture(v: Position): Move {
      const capture = !!pieces.find((p) => p.col == v.col && p.row == v.row);
      return { ...v, capture };
    }

    const { row, col } = currentPiece;

    switch (currentPiece.fenPiece.toLowerCase()) {
      case "k":
        return [
          { row: row + 1, col },
          { row: row - 1, col },
          { row, col: col - 1 },
          { row, col: col + 1 },
          { row: row + 1, col: col + 1 },
          { row: row + 1, col: col - 1 },
          { row: row - 1, col: col - 1 },
          { row: row - 1, col: col + 1 },
        ]
          .filter(cleanMoves)
          .map(checkCapture);
      case "n":
        return [
          { row: row + 2, col: col + 1 },
          { row: row + 2, col: col - 1 },
          { row: row - 2, col: col + 1 },
          { row: row - 2, col: col - 1 },
          { row: row + 1, col: col + 2 },
          { row: row + 1, col: col - 2 },
          { row: row - 1, col: col + 2 },
          { row: row - 1, col: col - 2 },
        ]
          .filter(cleanMoves)
          .map(checkCapture);
    }
    return [];
  }
}
