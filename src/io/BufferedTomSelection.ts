import { Axis, TypedArray, TomType, VisualStyleType, SelectionAtom } from '../shared/types';
import * as io from './io';
import { Vector3, Color } from 'three';
import { atom } from 'recoil';
import randomColor from 'randomcolor';
import { bufferedSelections, getVector3TomFilenames } from '../state/DataState';
import { BufferedSelection } from './BufferedSelection';

// This is a place to store data about a small section of a tom file that we want to examine.

export async function makeBufferedTomSelectionFromFile(file: File) {
	// TODO: eventually add on offset to this to load part of the file.
	const [data, dimensions, numElements, type, useNull] = await Promise.all([
		io.readTom(file),
		io.getTomDimensions(file),
		io.getTomNumElements(file),
		io.getTomDataType(file),
		io.getTomUseNull(file),
	]);
	if (numElements === 1 && useNull === false) {
		return new BufferedTomScalarSelection(file, data, dimensions, useNull, type);
	}
	return new BufferedTomVectorSelection(file, data, dimensions, useNull, type, numElements);
}

class BufferedTomSelection extends BufferedSelection {
	// Layer data.
	protected layer: TypedArray;
	// Internal variables for book keeping.
	protected layerNeedsUpdate = true;
	private layerNum = -1;
	private axis = Axis.Z; // Data is z-indexed by default.
	// Variables for calculations.
	protected readonly dimensions: Vector3;
	
	constructor(filename: string, data: TypedArray, dimensions: Vector3, numElements: number, useNull: boolean, type: TomType) {
		super(filename, data, dimensions.x * dimensions.y * dimensions.z, numElements, useNull, type);
		this.dimensions = dimensions;

		// Init layer storage.
		const LAYER_LENGTH = this.calcLayerLength();
		this.layer = data.slice(0, LAYER_LENGTH);
	}

	protected calcLayerLength() {
		return  this.numElements * this.dimensions.x * this.dimensions.y * this.dimensions.z / this.dimensions.toArray()[this.axis];
	}

	protected setAxis(axis: Axis) {
		if (this.axis === axis) {
			return;
		}
		this.layerNeedsUpdate = true;
		this.colorsNeedsUpdate = true;

		// Reindex data.
		// TODO: do this.

		// Update internal variables.
		this.axis = axis;
	}

	protected setLayerNum(layerNum: number) {
		if (this.layerNum === layerNum) {
			return;
		}
		// Update internal variables.
		this.layerNeedsUpdate = true;
		this.colorsNeedsUpdate = true;
		this.layerNum = layerNum;
	}

	getLayerData(axis: Axis, layerNum: number) {
		// Update data if needed.
		this.setAxis(axis);
		this.setLayerNum(layerNum);

		// Check if we need to update the data.
		if (!this.layerNeedsUpdate) {
			return this.layer;
		}

		// Copy data into array.
		const LAYER_LENGTH = this.layer.length;
		for (let i = 0; i < LAYER_LENGTH; i++) {
			this.layer[i] = this.data[i + layerNum * LAYER_LENGTH];
		}
		
		// Return layer.
		return this.layer;
	}
}

export class BufferedTomScalarSelection extends BufferedTomSelection {
	// Texture array.
	private rgbTexture: Uint8Array;
	
	constructor(file: File, data: TypedArray, dimensions: Vector3, useNull: boolean, type: TomType) {
		super(file.name, data, dimensions, 1, useNull, type);

		// Init textures.
		const LAYER_LENGTH = this.calcLayerLength();
		this.rgbTexture = new Uint8Array(3 * LAYER_LENGTH);
	}

	updateAtomDefaultsAfterDataLoaded() {
		const filename = this.filename;
		// Set default colormode.
		this.__visualStyle = 'scalarField';
		this.__colorMode = this.layer.constructor === Uint8Array ? 'greyscale' : 'spectral';
		this.__colorZeroCentered = false;

		this.atom = atom<SelectionAtom>({
			key: `${filename}_atom`,
			default: {
				filename,
				visualStyle: this.__visualStyle,
				colorMode: this.__colorMode,
				colorZeroCentered: this.__colorZeroCentered,
			},
		});
	}

	getLayerTexture(axis: Axis, layerNum: number, atom: SelectionAtom) {
		// Update layer data if needed.
		const layer = this.getLayerData(axis, layerNum);

		// Update internal variables.
		const { colorMode, colorZeroCentered } = atom;
		this.setColorMode(colorMode);
		this.setColorZeroCentered(colorZeroCentered);

		// If nothing has changed, return last computed value.
		if (!this.colorsNeedsUpdate) {
			return this.rgbTexture;
		}
		
		// Copy data into array.
		const LAYER_LENGTH = layer.length;
		let { min, max } = this;
		if (colorZeroCentered) {
			const amplitude = Math.max(Math.abs(max), Math.abs(min));
			min = -amplitude;
			max = amplitude;
		}
		const range = max - min;
		const color = new Color();
		for (let i = 0; i < LAYER_LENGTH; i++) {
			// Calc color from layer data.
			const val = layer[i];
			if (this.nullVal !== null && val === this.nullVal) {
				this.rgbTexture[3 * i] = 0;
				this.rgbTexture[3 * i + 1] = 0;
				this.rgbTexture[3 * i + 2] = 0;
			} else if (colorMode === 'spectral') {
				const scaledVal = (1 - val / range) * 0.7;
				color.setHSL(scaledVal, 1, 0.5);
				this.rgbTexture[3 * i] = Math.round(color.r * 255);
				this.rgbTexture[3 * i + 1] = Math.round(color.g * 255);
				this.rgbTexture[3 * i + 2] = Math.round(color.b * 255);
			} else {
				const scaledVal = Math.round((val - min) / range * 255);
				this.rgbTexture[3 * i] = scaledVal;
				this.rgbTexture[3 * i + 1] = scaledVal;
				this.rgbTexture[3 * i + 2] = scaledVal;
			}
		}

		// Update internal variables.
		this.colorsNeedsUpdate = false;

		return this.rgbTexture;
	}
}

export class BufferedTomVectorSelection extends BufferedTomSelection {
	// Vector data.
	protected positions!: Float32Array;
	protected vertexColors!: Float32Array;
	
	constructor(file: File, data: TypedArray, dimensions: Vector3, useNull: boolean, type: TomType, numElements: number) {
		super(file.name, data, dimensions, numElements, useNull, type);
	}

	updateAtomDefaultsAfterDataLoaded() {
		const filename = this.filename.toLowerCase();
		const vector3Filenames = getVector3TomFilenames();

		// Set default colormode.
		this.__colorMode = 'hex';
		this.__colorHex = randomColor();
		this.__colorZeroCentered = false;

		if (filename.includes('normal')) {
			this.__visualStyle = 'vector';
			this.__vectorDataFilename = this.filename;
		} else if (filename.includes('point')) {
			this.__visualStyle = 'point';
			this.__pointDataFilename = this.filename;
		} else if (filename.includes('indices')) {
			this.__visualStyle = 'point';
			this.__pointDataFilename = vector3Filenames.find(filename => filename.toLowerCase().includes('point'));
			this.__colorMode = 'spectral';
			this.__colorDataFilename = this.filename;
		} else if (filename.includes('width')) {
			this.__visualStyle = 'vector';
			this.__vectorScaleFilename = this.filename;
			this.__vectorDataFilename = vector3Filenames.find(filename => filename.toLowerCase().includes('normalsrelaxed')) ||  vector3Filenames.find(filename => filename.toLowerCase().includes('normals'));
			this.__vectorOffsetFilename = vector3Filenames.find(filename => filename.toLowerCase().includes('point'));
		} else {
			this.__visualStyle = 'point';
		}

		// Set atom.
		this.atom = atom<SelectionAtom>({
			key: `${filename}_atom`,
			default: {
				filename,
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

		this.positions = new Float32Array(this.positionsDataLengthForVisualStyle(this.__visualStyle));
		this.vertexColors = new Float32Array(this.positions.length);
	}

	private positionsDataLengthForVisualStyle(visualStyle: VisualStyleType) {
		const LAYER_LENGTH = this.calcLayerLength();
		return visualStyle === 'vector' ? 3 * LAYER_LENGTH * 2 : 3 * LAYER_LENGTH;
	}

	private setVisualStyle(visualStyle: VisualStyleType) {
		if (this.__visualStyle === visualStyle) {
			return;
		}
		this.__visualStyle = visualStyle;
		this.positions = new Float32Array(this.positionsDataLengthForVisualStyle(this.__visualStyle));
		this.geometryNeedsUpdate = true;
		this.colorsNeedsUpdate = true;
	}

	protected setAxis(axis: Axis) {
		super.setAxis(axis);
		this.geometryNeedsUpdate = true;
	}

	protected setLayerNum(layerNum: number) {
		super.setLayerNum(layerNum);
		this.geometryNeedsUpdate = true;
	}

	getLayerPositions(axis: Axis, layerNum: number, atom: SelectionAtom) {
		// Update layer if needed.
		const layer = this.getLayerData(axis, layerNum);

		// Update internal variables.
		this.setAxis(axis);
		this.setLayerNum(layerNum);
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

		// Return last vals in case nothing has changed
		if (!this.colorsNeedsUpdate && !this.geometryNeedsUpdate) {
			return {
				positions: this.positions,
				count: this.count,
				vertexColors: this.vertexColors,
			}
		}

		// Get dependencies.
		const dependencies: {
			pointData?: TypedArray,
			vectorData? : TypedArray,
			vectorOffset?: TypedArray,
			vectorScale?: TypedArray,
			colorData?: TypedArray,
			colorDataSelection?: BufferedTomSelection,
		} = {};
		if (pointDataFilename) {
			dependencies.pointData = (bufferedSelections[pointDataFilename] as BufferedTomVectorSelection).getLayerData(axis, layerNum);
		}
		if (vectorDataFilename) {
			dependencies.vectorData = (bufferedSelections[vectorDataFilename] as BufferedTomVectorSelection).getLayerData(axis, layerNum);
		}
		if (vectorOffsetFilename) {
			dependencies.vectorOffset = (bufferedSelections[vectorOffsetFilename] as BufferedTomVectorSelection).getLayerData(axis, layerNum);
		}
		if (vectorScaleFilename) {
			dependencies.vectorScale = (bufferedSelections[vectorScaleFilename] as BufferedTomVectorSelection).getLayerData(axis, layerNum);
		}
		if (colorDataFilename) {
			dependencies.colorDataSelection = bufferedSelections[colorDataFilename] as BufferedTomSelection;
			if (dependencies.colorDataSelection) {
				dependencies.colorData = dependencies.colorDataSelection.getLayerData(axis, layerNum);
			}
		}

		// First update colors.
		if (this.colorsNeedsUpdate) {
			const X_LENGTH = axis === Axis.X ? 1 : this.dimensions.x;
			const Y_LENGTH = axis === Axis.Y ? 1 : this.dimensions.y;
			const Z_LENGTH = axis === Axis.Z ? 1 : this.dimensions.z;
			let count = 0;
			for (let z = 0; z < Z_LENGTH; z++) {
				for (let y = 0; y < Y_LENGTH; y++) {
					for (let x = 0; x < X_LENGTH; x++) {
						const i = z * X_LENGTH * Y_LENGTH + y * X_LENGTH + x;
						if (layer[this.numElements * i] === this.nullVal) {
							continue;
						}
						// First calculate vertex color.
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
						this.vertexColors[3 * count] = color.r;
						this.vertexColors[3 * count + 1] = color.g;
						this.vertexColors[3 * count + 2] = color.b;

						// const colorDatum = dependencies.colorData[i];
						if (visualStyle === 'point') {
							// Create points data.
							if (dependencies.pointData) {
								if (dependencies.pointData[3* i] === this.nullVal) {
									continue;
								}
								count++;
							} else {
								count++;
							}
						} else if (visualStyle === 'vector') {
							if (!dependencies.vectorData) {
								continue;
							}
							// Make starting point.
							if (dependencies.vectorOffset) {
								if (dependencies.vectorOffset[3* i] === this.nullVal) {
									continue;
								}
								count++
							} else {
								count++
							}
							
							// Add same color for second point.
							this.vertexColors[3 * count] = this.vertexColors[3 * (count - 1)];
							this.vertexColors[3 * count + 1] = this.vertexColors[3 * (count - 1) + 1];
							this.vertexColors[3 * count + 2] = this.vertexColors[3 * (count - 1) + 2];
							count++
						}

					}
				}
			}

			this.colorsNeedsUpdate = false;
		}
		
		// Then update positions.
		if (this.geometryNeedsUpdate) {
			// Copy data into array.
			const X_LENGTH = axis === Axis.X ? 1 : this.dimensions.x;
			const Y_LENGTH = axis === Axis.Y ? 1 : this.dimensions.y;
			const Z_LENGTH = axis === Axis.Z ? 1 : this.dimensions.z;
			// TODO: do this loop in most efficient order for data.
			let count = 0;
			for (let z = 0; z < Z_LENGTH; z++) {
				for (let y = 0; y < Y_LENGTH; y++) {
					for (let x = 0; x < X_LENGTH; x++) {
						const i = z * X_LENGTH * Y_LENGTH + y * X_LENGTH + x;
						if (layer[this.numElements * i] === this.nullVal) {
							continue;
						}
						if (visualStyle === 'point') {
							// Create points data.
							if (dependencies.pointData) {
								if (dependencies.pointData[3* i] === this.nullVal) {
									continue;
								}
								this.positions[3 * count] = dependencies.pointData[3 * i];
								this.positions[3 * count + 1] = dependencies.pointData[3 * i + 1];
								this.positions[3 * count + 2] = dependencies.pointData[3 * i + 2];
								count++;
							} else {
								// Use center point of voxel.
								this.positions[3 * count] = x + 0.5;
								this.positions[3 * count + 1] = y + 0.5;
								this.positions[3 * count + 2] = layerNum + 0.5;
								count++;
							}
						} else if (visualStyle === 'vector') {
							if (!dependencies.vectorData) {
								continue;
							}
							// Make starting point.
							if (dependencies.vectorOffset) {
								if (dependencies.vectorOffset[3* i] === this.nullVal) {
									continue;
								}
								this.positions[3 * count] = dependencies.vectorOffset[3 * i];
								this.positions[3 * count + 1] = dependencies.vectorOffset[3 * i + 1];
								this.positions[3 * count + 2] = dependencies.vectorOffset[3 * i + 2];
								count++;
							} else {
								// Use center point of voxel.
								this.positions[3 * count] = x + 0.5;
								this.positions[3 * count + 1] = y + 0.5;
								this.positions[3 * count + 2] = layerNum + 0.5;
								count++;
							}
							
							// Add second point to complete segment.
							if (dependencies.vectorData[3* i] === this.nullVal) {
								continue;
							}
							let scale = dependencies.vectorScale ? dependencies.vectorScale[i] : 1;
							this.positions[3 * count] = this.positions[3 * (count - 1)] + scale * dependencies.vectorData[3 * i];
							this.positions[3 * count + 1] = this.positions[3 * (count - 1) + 1] + scale * dependencies.vectorData[3 * i + 1];
							this.positions[3 * count + 2] = this.positions[3 * (count - 1) + 2] + scale * dependencies.vectorData[3 * i + 2];
							count++;
						}
					}
				}
			}
			this.count = count;

			// Update internal variables.
			this.geometryNeedsUpdate = false;
		}

		return {
			positions: this.positions,
			count: this.count,
			vertexColors: this.vertexColors,
		};
	}
}