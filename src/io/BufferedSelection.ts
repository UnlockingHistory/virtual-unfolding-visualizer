import { RecoilState } from 'recoil';
import { ColorMode, SelectionAtom, TomType, TypedArray, VisualStyleType } from '../shared/types';
import { nullValForType } from '../shared/utils';

export class BufferedSelection {
	// 3D data.
	protected data: TypedArray;
	// Atom for updates in react.
	protected atom!: RecoilState<SelectionAtom>;
	// Internal variables for book keeping.
	protected nullVal: number | null = null;
	protected geometryNeedsUpdate = true;
	protected colorsNeedsUpdate = true;
	protected __visualStyle!: VisualStyleType;
	protected __pointDataFilename?: string;
	protected __vectorDataFilename?: string;
	protected __vectorOffsetFilename?: string;
	protected __vectorScaleFilename?: string;
	protected __colorMode: ColorMode = 'hex';
	protected __colorZeroCentered = false;
	protected __colorHex?: string;
	protected __colorDataFilename?: string;
	// Vector data.
	protected positions?: Float32Array;
	protected count = 0;
	protected vertexColors?: Float32Array;
	// Variables for calculations.
	readonly numElements: number;
	readonly length: number;
	// Other immutable parameters.
	readonly min: number;
	readonly max: number;
	readonly type: string;
	readonly filename: string;
	
	constructor(filename: string, data: TypedArray, length: number, numElements: number, useNull: boolean, type: TomType) {
		this.filename = filename;
		this.data = data;
		this.length = length;
		this.numElements = numElements;
		this.nullVal = useNull ? nullValForType(type) : null;
		this.type = type;

		// Find min and max of data.
		let max = -Infinity;
		let min = Infinity;
		for (let i = 0, length = data.length; i < length; i++) {
			const val = data[i];
			if (this.nullVal !== null && val === this.nullVal) {
				continue;
			}
			max = Math.max(max, val);
			min = Math.min(min, val);
		}
		if (min === Infinity) {
			min = 0;
			max = 0;
		}
		this.min = min;
		this.max = max;

		if (type === 'uint8') {
			this.min = 0;
			this.max = 255;
		}
	}

	getAtom() {
		return this.atom;
	}

	getData() {
		return this.data;
	}

	protected setPointDataFilename(pointDataFilename?: string) {
		if (this.__pointDataFilename === pointDataFilename) {
			return;
		}
		this.__pointDataFilename = pointDataFilename;
		this.geometryNeedsUpdate = true;
	}

	protected setVectorDataFilename(vectorDataFilename?: string) {
		if (this.__vectorDataFilename === vectorDataFilename) {
			return;
		}
		this.__vectorDataFilename = vectorDataFilename;
		this.geometryNeedsUpdate = true;
	}

	protected setVectorOffsetFilename(vectorOffsetFilename?: string) {
		if (this.__vectorOffsetFilename === vectorOffsetFilename) {
			return;
		}
		this.__vectorOffsetFilename = vectorOffsetFilename;
		this.geometryNeedsUpdate = true;
	}

	protected setVectorScaleFilename(vectorScaleFilename?: string) {
		if (this.__vectorScaleFilename === vectorScaleFilename) {
			return;
		}
		this.__vectorScaleFilename = vectorScaleFilename;
		this.geometryNeedsUpdate = true;
	}

	protected setColorMode(colorMode: ColorMode) {
		if (this.__colorMode === colorMode) {
			return;
		}
		this.__colorMode = colorMode;
		this.colorsNeedsUpdate = true;
	}

	protected setColorZeroCentered(colorZeroCentered: boolean) {
		if (this.__colorZeroCentered === colorZeroCentered) {
			return;
		}
		this.__colorZeroCentered = colorZeroCentered;
		this.colorsNeedsUpdate = true;
	}

	protected setColorHex(colorHex?: string) {
		if (this.__colorHex === colorHex) {
			return;
		}
		this.__colorHex = colorHex;
		this.colorsNeedsUpdate = true;
	}

	protected setColorDataFilename(colorDataFilename?: string) {
		if (this.__colorDataFilename === colorDataFilename) {
			return;
		}
		this.__colorDataFilename = colorDataFilename;
		this.colorsNeedsUpdate = true;
	}

	isScalarType() {
		// We'll consider anything with nulls a vector type.
		return this.numElements === 1 && this.nullVal === null;
	}

	isVectorType() {
		// We'll consider anything with nulls a vector type.
		return this.numElements > 1 || this.nullVal !== null;
	}

	isVector3Type() {
		return this.numElements === 3;
	}

	isVector1Type() {
		return this.numElements === 1;
	}


	dispose() {
		// Delete atom.

	}
}