import * as Const from "../const";


export function buildDialogHeaderText(text) {

  const leftDeco = Const.Char.WhiteLeftPointingSmallTriangle + Const.Char.WhiteDiamondContainingBlackSmallDiamond;
  const rightDeco = Const.Char.WhiteDiamondContainingBlackSmallDiamond + Const.Char.WhiteRightPointingSmallTriangle;
  const line = Const.Char.BoxDrawingsLightHorizontal.repeat(20);

  return line + ' ' + leftDeco + ' ' + text + ' ' + rightDeco + ' ' + line;

}
