import { random } from "../../utils/random";
import { Figure } from "../figures/figure";

export const LFigure = Figure.make(1, "00#", "00#", "0##");
export const JFigure = Figure.make(2, "#00", "#00", "##0");
export const IFigure = Figure.make(3, "#000", "#000", "#000", "#000");
export const ZFigure = Figure.make(4, "##0", "0##");
export const SFigure = Figure.make(5, "0##", "##0");
export const OFigure = Figure.make(6, "##", "##");
export const TFigure = Figure.make(7, "###", "0#0");

export const figures = [LFigure, JFigure, IFigure, ZFigure, SFigure, OFigure, TFigure];

export function getRandomFigure(_seed: number): Figure {
	return figures[random(0, figures.length - 1)].clone();
}
