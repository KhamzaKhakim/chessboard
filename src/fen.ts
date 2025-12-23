import { BoardPiece } from "./types.js";

//8 sized board for now
//need to call before update on currentPiece
export function getNewFen({ pieces }: { pieces: BoardPiece[] }) {
  let tempFenArr =
    "11111111/11111111/11111111/11111111/11111111/11111111/11111111/11111111";

  for (const piece of pieces) {
    tempFenArr = replaceAt(
      tempFenArr,
      piece.row * 9 + piece.col,
      piece.fenPiece,
    );
  }

  tempFenArr = tempFenArr.replace(/1+/g, (match) => match.length.toString());

  return tempFenArr;
}

export function replaceAt(str: string, index: number, replacement: string) {
  return (
    str.substring(0, index) +
    replacement +
    str.substring(index + replacement.length)
  );
}
