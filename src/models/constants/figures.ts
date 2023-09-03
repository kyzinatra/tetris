import { random } from "../../utils/random";
import { Figure } from "../figures/figure";

export const LFigure = Figure.make("00#", "00#", "0##");
export const JFigure = Figure.make("#00", "#00", "##0");
export const IFigure = Figure.make("#000", "#000", "#000", "#000");
export const ZFigure = Figure.make("##0", "0##");
export const SFigure = Figure.make("0##", "##0");
export const OFigure = Figure.make("##", "##");
export const TFigure = Figure.make("###", "0#0");

export const figures = [LFigure, JFigure, IFigure, ZFigure, SFigure, OFigure, TFigure];

export function getRandomFigure(_seed: number): Figure {
	return figures[random(0, figures.length - 1)].clone();
}
