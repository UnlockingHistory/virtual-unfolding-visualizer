import { BufferedBinSelection } from '../io/BufferedBinSelection';
import { BufferedTomScalarSelection, BufferedTomVectorSelection } from '../io/BufferedTomSelection';

// Valid types for Tom files.
export type TomType = 'uint8' | 'float32' | 'uint32' | 'int32';
export type TomTypedArray = Uint8Array | Float32Array | Uint32Array | Int32Array;
// These are the types currently in use in the app.
export type Type = 'uint8' | 'float32' | 'uint32' | 'int32' | 'int16' | 'uint16';
export type TypedArray = Uint8Array | Float32Array | Uint32Array | Int32Array | Int16Array | Uint16Array;

// export namespace Axis {
// 	export const X = 0;
// 	export type X = typeof X;
// 	export const Y = 1;
// 	export type Y = typeof Y;
// 	export const Z = 2;
// 	export type Z = typeof Z;
//   }
// export type Axis = typeof Axis[keyof typeof Axis];

export enum Axis {
	X = 0,
	Y = 1,
	Z = 2,
}

export type ColorMode = 'hex' | 'greyscale' | 'spectral';
export type VisualStyleType = 'scalarField' | 'vector' | 'point' | 'mesh';

export type SelectionAtom = {
	filename: string,
	visualStyle: VisualStyleType,
	pointDataFilename?: string,
	vectorDataFilename?: string,
	vectorOffsetFilename?: string,
	vectorScaleFilename?: string,
	colorMode: ColorMode,
	colorHex?: string,
	colorZeroCentered: boolean,
	colorDataFilename?: string,
};

export type BufferedSelection = BufferedBinSelection | BufferedTomScalarSelection | BufferedTomVectorSelection;

