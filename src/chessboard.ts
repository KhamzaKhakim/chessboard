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
  private pieceChosen = false;
  private mousePressed = false;
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
    // this.canvas.onmouseout = (e) => this.mouseOutHandler(e);
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
      if (this.currentPiece.dx || this.currentPiece.dy) {
        this.currentPiece.x += this.currentPiece.dx || 0;
        this.currentPiece.y += this.currentPiece.dy || 0;

        //TODO: wip
        if (
          this.currentPiece.dx &&
          this.currentPiece.dx < 0 &&
          this.currentPiece.x <= this.currentPiece.col * this.tileSize
        ) {
          this.currentPiece.x = this.currentPiece.col * this.tileSize;
          this.currentPiece.dx = 0;
        } else if (
          this.currentPiece.dx &&
          this.currentPiece.dx > 0 &&
          this.currentPiece.x >= this.currentPiece.col * this.tileSize
        ) {
          this.currentPiece.x = this.currentPiece.col * this.tileSize;
          this.currentPiece.dx = 0;
        }

        if (
          this.currentPiece.dy &&
          this.currentPiece.dy < 0 &&
          this.currentPiece.y <= this.currentPiece.row * this.tileSize
        ) {
          this.currentPiece.y = this.currentPiece.row * this.tileSize;
          this.currentPiece.dy = 0;
        } else if (
          this.currentPiece.dy &&
          this.currentPiece.dy > 0 &&
          this.currentPiece.y >= this.currentPiece.row * this.tileSize
        ) {
          this.currentPiece.y = this.currentPiece.row * this.tileSize;
          this.currentPiece.dy = 0;
        }

        drawCurrentPiece(
          this.currentPiece,
          this.ctx,
          this.tileSize,
          this.svgPieces,
        );

        if (!this.currentPiece.dx && !this.currentPiece.dy) {
          this.pieces.set(posKey(this.currentPiece), this.currentPiece);
          this.currentPiece = null;
        }

        requestAnimationFrame(() => this.draw());
      } else {
        drawCurrentPiece(
          this.currentPiece,
          this.ctx,
          this.tileSize,
          this.svgPieces,
        );
      }
  }

  private mouseDownHandler(e: MouseEvent) {
    e.preventDefault();

    const { row, col } = getCellFromMouse({
      e,
      tileSize: this.tileSize,
    });

    // pressed same piece again
    if (row == this.currentPiece?.row && col == this.currentPiece.col) {
      this.pieceChosen = true;
      this.mousePressed = true;
      return;
    }

    const tempPiece = this.pieces.get(posKey(row, col));

    if (tempPiece) {
      // no selected piece
      if (!this.currentPiece) {
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
      } else if (this.currentPiece.color != tempPiece.color) {
        this.pieceChosen = false;
        return;
        // piece with the same color
      } else {
        this.pieces.set(posKey(this.currentPiece), this.currentPiece);
        this.currentPiece = tempPiece;
        this.pieces.delete(posKey(row, col));
        this.pieceChosen = false;

        this.currentPiece.x = e.offsetX - this.tileSize / 2;
        this.currentPiece.y = e.offsetY - this.tileSize / 2;

        this.availableMoves = calculateAvailableMoves(
          this.currentPiece,
          this.pieces,
          this.size,
        );

        this.draw();
      }
      this.mousePressed = true;
      return;
    }
  }

  private mouseUpHandler(e: MouseEvent) {
    if (!this.currentPiece) return;

    e.preventDefault();
    // this.mousePressed = false; //move below

    const { row, col } = getCellFromMouse({
      e,
      tileSize: this.tileSize,
    });

    if (row == this.currentPiece.row && col == this.currentPiece.col) {
      this.mousePressed = false;
      this.currentPiece.x = this.currentPiece.col * this.tileSize;
      this.currentPiece.y = this.currentPiece.row * this.tileSize;

      if (this.pieceChosen) {
        this.pieces.set(posKey(this.currentPiece), this.currentPiece);

        this.currentPiece = null;
        this.availableMoves = [];
        this.pieceChosen = false;
        this.draw();
        return;
      }

      this.pieceChosen = true;
    } else {
      //TODO: improve moveAvailabe finding
      const isMoveAvailable = !!this.availableMoves.find(
        (m) => m.row == row && col == m.col,
      );

      if (!isMoveAvailable) {
        this.currentPiece.x = this.currentPiece.col * this.tileSize;
        this.currentPiece.y = this.currentPiece.row * this.tileSize;

        if (!this.mousePressed) {
          this.pieces.set(posKey(this.currentPiece), this.currentPiece);
          this.currentPiece = null;
          this.availableMoves = [];
        }
      } else {
        //TODO: if mouse not pressed animate
        this.currentPiece.row = row;
        this.currentPiece.col = col;

        if (!this.mousePressed) {
          //TODO: safari fps is somehow slower than chrome
          this.currentPiece.dx =
            (col * this.tileSize - this.currentPiece.x) / 10;
          this.currentPiece.dy =
            (row * this.tileSize - this.currentPiece.y) / 10;
          this.availableMoves = [];
          this.pieceChosen = false;
        } else {
          this.currentPiece.x = col * this.tileSize;
          this.currentPiece.y = row * this.tileSize;

          this.pieces.set(posKey(this.currentPiece), this.currentPiece);
          this.currentPiece = null;
          this.availableMoves = [];
          this.pieceChosen = false;
        }
      }
    }
    this.draw();
    this.mousePressed = false;
    return;
  }

  // private mouseOutHandler(e: MouseEvent) {
  //   if (!this.currentPiece) return;
  //   e.preventDefault();

  //   //go back to previous position
  //   //TODO: remove maybe
  //   this.currentPiece.x = this.currentPiece.col * this.tileSize;
  //   this.currentPiece.y = this.currentPiece.row * this.tileSize;
  //   this.mousePressed = false;

  //   // this.availableMoves = [];
  //   // this.currentPiece = null;
  //   this.draw();
  // }

  private mouseMoveHandler(e: MouseEvent) {
    if (!this.mousePressed || !this.currentPiece) return;

    e.preventDefault();

    const x = e.offsetX,
      y = e.offsetY;

    this.currentPiece.x = x - this.tileSize / 2;
    this.currentPiece.y = y - this.tileSize / 2;

    this.draw();
  }
}
