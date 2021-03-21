import { TypedArray, TomType, SelectionAtom, VisualStyleType, ColorMode } from '../shared/types';
import * as io from './io';
import { atom, RecoilState } from 'recoil';
import { nullValForType } from '../shared/utils';
import randomColor from 'randomcolor';
import { bufferedSelections } from '../state/DataState';
import { BufferedSelection } from './BufferedSelection';
import { Color } from 'three';

// This is a place to store data about a small section of a tom file that we want to examine.

export async function makeBufferedBinSelectionFromFile(file: File) {
	// TODO: eventually add on offset to this to load part of the file.
	const [data, length, numElements, type, useNull] = await Promise.all([
		io.readBin(file),
		io.getBinLength(file),
		io.getBinNumElements(file),
		io.getBinDataType(file),
		io.getBinUseNull(file),
	]);
	return new BufferedBinSelection(file, data, length, numElements, useNull, type);
}

export class BufferedBinSelection extends BufferedSelection {
	// Vector data.
	protected positions: Float32Array;
	private edges?: Uint16Array;
	private edgeCount = 0;
	protected vertexColors: Float32Array;
	
	constructor(file: File, data: TypedArray, length: number, numElements: number, useNull: boolean, type: TomType) {
		super(file.name, data, length, numElements, useNull, type);

		const filename = file.name.toLowerCase();
		if (filename.includes('normal')) {
			this.__visualStyle = 'vector';
			this.__vectorDataFilename = file.name;
		} else if (filename.includes('point')) {
			this.__visualStyle = 'point';
			this.__pointDataFilename = file.name;
		} else if (filename.includes('neighbors')) {
			this.__visualStyle = 'mesh';
		} else {
			this.__visualStyle = 'point';
		}

		this.__colorMode = 'hex';
		this.__colorHex = randomColor();
		this.__colorZeroCentered = false;

		this.positions = new Float32Array(this.positionsDataLengthForVisualStyle(this.__visualStyle));
		this.vertexColors = new Float32Array(this.positions.length);
		if (numElements > 4) {
			this.edges = new Uint16Array(length * numElements);
		}

		this.atom = atom<SelectionAtom>({
			key: `${file.name}_atom`,
			default: {
				filename: file.name,
				visualStyle: this.__visualStyle,
				pointDataFilename: this.__pointDataFilename,
				vectorDataFilename: this.__vectorDataFilename,
				vectorOffsetFilename: this.__vectorOffsetFilename,
				vectorScaleFilename: this.__vectorScaleFilename,
				colorMode: this.__colorMode,
				colorHex: this.__colorHex,
				colorZeroCentered: this.__colorZeroCentered,
				colorDataFilename: this.__colorDataFilename,
			},
		});
	}

	private positionsDataLengthForVisualStyle(visualStyle: VisualStyleType) {
		return visualStyle === 'vector' ? 3 * this.length * 2 : 3 * this.length;
	}

	protected setVisualStyle(visualStyle: VisualStyleType) {
		if (this.__visualStyle === visualStyle) {
			return;
		}
		this.__visualStyle = visualStyle;
		this.positions = new Float32Array(this.positionsDataLengthForVisualStyle(this.__visualStyle));
		this.geometryNeedsUpdate = true;
	}

	getLayerPositions(atom: SelectionAtom) {
		const {
			visualStyle,
			pointDataFilename,
			vectorDataFilename,
			vectorOffsetFilename,
			vectorScaleFilename,
			colorMode,
			colorHex,
			colorZeroCentered,
			colorDataFilename,
		} = atom;
		this.setVisualStyle(visualStyle);
		this.setPointDataFilename(pointDataFilename);
		this.setVectorDataFilename(vectorDataFilename);
		this.setVectorOffsetFilename(vectorOffsetFilename);
		this.setColorMode(colorMode);
		this.setColorHex(colorHex);
		this.setColorZeroCentered(colorZeroCentered);
		this.setColorDataFilename(colorDataFilename);

		// If nothing has changed, return last computed value.
		if (!this.geometryNeedsUpdate && !this.colorsNeedsUpdate) {
			return {
				edges: this.edges,
				positions: this.positions,
				count: this.count,
				vertexColors: this.vertexColors,
			};
		}

		// Get dependencies.
		const dependencies: {
			pointData?: TypedArray,
			vectorData? : TypedArray,
			vectorOffset?: TypedArray,
			vectorScale?: TypedArray,
			colorData?: TypedArray,
			colorDataSelection?: BufferedBinSelection,
		} = {};
		if (pointDataFilename) {
			dependencies.pointData = (bufferedSelections[pointDataFilename] as BufferedBinSelection).getData();
		}
		if (vectorDataFilename) {
			dependencies.vectorData = (bufferedSelections[vectorDataFilename] as BufferedBinSelection).getData();
		}
		if (vectorOffsetFilename) {
			dependencies.vectorOffset = (bufferedSelections[vectorOffsetFilename] as BufferedBinSelection).getData();
		}
		if (vectorScaleFilename) {
			dependencies.vectorScale = (bufferedSelections[vectorScaleFilename] as BufferedBinSelection).getData();
		}
		if (colorDataFilename) {
			dependencies.colorDataSelection = bufferedSelections[colorDataFilename] as BufferedBinSelection;
			dependencies.colorData = dependencies.colorDataSelection.getData();
		}

		// Copy data into array.
		let count = 0;
		let edgeCount = 0;
		for (let i = 0; i < this.length; i++) {
			// Get color.
			const color = new Color();
			if (colorMode === 'hex' && colorHex) {
				const colorInt = parseInt(colorHex.substr(1), 16);
				if (!isNaN(colorInt)) {
					color.setHex(colorInt);
				}
			} else if (dependencies.colorData && dependencies.colorDataSelection) {
				let { min, max } = dependencies.colorDataSelection;
				if (colorZeroCentered) {
					const amplitude = Math.max(Math.abs(max), Math.abs(min));
					min = -amplitude;
					max = amplitude;
				}
				const val = (dependencies.colorData[i] - min) / (max - min);
				if (colorMode === 'greyscale') {
					color.setRGB(val, val, val);
				} else if (colorMode === 'spectral') {
					color.setHSL(val * 0.7, 1, 0.5);
				}
			}
			if (visualStyle === 'point' || visualStyle === 'mesh') {
				// Create points data.
				if (!dependencies.pointData) {
					continue;
				}
				// We don't want to reindex points data if we are in mesh mode.
				if (visualStyle !== 'mesh' && dependencies.pointData[3* i] === this.nullVal) {
					continue;
				}
				this.positions[3 * count] = dependencies.pointData[3 * i];
				this.positions[3 * count + 1] = dependencies.pointData[3 * i + 1];
				this.positions[3 * count + 2] = dependencies.pointData[3 * i + 2];
				this.vertexColors[3 * count] = color.r;
				this.vertexColors[3 * count + 1] = color.g;
				this.vertexColors[3 * count + 2] = color.b;
				count++;
			} else if (visualStyle === 'vector') {
				if (!dependencies.vectorData || !dependencies.vectorOffset) {
					continue;
				}
				// Make starting point.
				if (dependencies.vectorOffset[3* i] === this.nullVal) {
					continue;
				}
				this.positions[3 * count] = dependencies.vectorOffset[3 * i];
				this.positions[3 * count + 1] = dependencies.vectorOffset[3 * i + 1];
				this.positions[3 * count + 2] = dependencies.vectorOffset[3 * i + 2];
				this.vertexColors[3 * count] = color.r;
				this.vertexColors[3 * count + 1] = color.g;
				this.vertexColors[3 * count + 2] = color.b;
				count++;
				
				// Add second point to complete segment.
				if (dependencies.vectorData[3* i] === this.nullVal) {
					continue;
				}
				let scale = dependencies.vectorScale ? dependencies.vectorScale[i] : 1;
				this.positions[3 * count] = this.positions[3 * (count - 1)] + scale * dependencies.vectorData[3 * i];
				this.positions[3 * count + 1] = this.positions[3 * (count - 1) + 1] + scale * dependencies.vectorData[3 * i + 1];
				this.positions[3 * count + 2] = this.positions[3 * (count - 1) + 2] + scale * dependencies.vectorData[3 * i + 2];
				// Add same color for second point.
				this.vertexColors[3 * count] = this.vertexColors[3 * (count - 1)];
				this.vertexColors[3 * count + 1] = this.vertexColors[3 * (count - 1) + 1];
				this.vertexColors[3 * count + 2] = this.vertexColors[3 * (count - 1) + 2];
				count++;
			}
			if (visualStyle === 'mesh') {
				// Create edges data.
				if (!dependencies.pointData) {
					continue;
				}
				for (let j = 0; j < this.numElements; j++) {
					const neighborIndex = this.data[this.numElements * i + j];
					if (neighborIndex === this.nullVal) {
						break;
					}
					if (neighborIndex < i) {
						this.edges![edgeCount] = i;
						this.edges![edgeCount + 1] = neighborIndex;
						edgeCount += 2;
					}
				}
			}
		}
		this.count = count;
		this.edgeCount = edgeCount;

		// Update internal variables.
		this.geometryNeedsUpdate = false;
		this.colorsNeedsUpdate = false;

		return {
			edges: this.edges,
			edgeCount: this.edgeCount,
			positions: this.positions,
			count,
			vertexColors: this.vertexColors,
		};
	}
}
