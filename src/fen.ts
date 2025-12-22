import { BoardPiece, Move, Position } from "./types.js";

//8 sized board for now
//need to call before update on currentPiece
export function updateFen({
  currentPiece,
  move,
  oldFen,
}: {
  currentPiece: BoardPiece;
  move: Position;
  oldFen: string;
}) {
  const tempFenArr = oldFen.split("/");
  const cols = tempFenArr[currentPiece.row];

  // for(let i = 0; i < tempFenArr)

  return true;
}
