export class Chessboard {
  ref: string;
  size: number;

  constructor(ref: string, size: number) {
    this.ref = ref;
    this.size = size;
  }

  drawBoard() {
    const canvas = document.getElementById(this.ref) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    const TILE = canvas.width / this.size;

    console.log(this.size);

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? "#f0d9b5" : "#b58863";
        ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
      }
    }
  }
}
