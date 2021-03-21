import * as types from './types';
import { Vector3 } from 'three';

/**
 * Tests if a number is an integer.
 * @param {number} num number to be tested
 * @returns {boolean} true if num is an integer, else false
 */
function isInteger(num: number) {
	return Number.isInteger(num);
}

/**
 * Tests if a number is a positive integer (strictly > 0).
 * @param {number} num number to be tested
 * @returns {boolean} true if num is a positive integer, else false
 */
export function isPositiveInteger(num: number) {
	return isInteger(num) && num > 0;
}

/**
 * Tests if a number is a non-negative integer (>= 0).
 * @param {number} num number to be tested
 * @returns {boolean} true if num is a non-negative integer, else false
 */
export function isNonNegativeInteger(num: number) {
	return isInteger(num) && num >= 0;
}

/**
 * Returns the number of bytes per element of a given data type.
 * @param {string} type string describing data type
 * @returns {number} number of bytes per element of type
 */
export function dataSizeForType(type: types.TomType) {
	switch (type) {
		case 'uint8':
			return 1;
		case 'int32':
			return 4;
		case 'uint32':
			return 4;
		case 'float32':
			return 4;
		default:
			throw new Error(`Unknown type ${type}.`);
	}
};

export function stringifyVector3(vector3: Vector3) {
	return `[ ${vector3.x}, ${vector3.y}, ${vector3.z} ]`;
};

export function typeOfTypedArray(typedArray: Float32Array | Uint8Array | Uint32Array | Int32Array): types.TomType;
export function typeOfTypedArray(typedArray: Float32Array | Uint8Array | Uint32Array | Int32Array | Uint16Array): types.TomType | 'uint16';
export function typeOfTypedArray(typedArray: any) {
	// Get data type from TypedArray.
	switch (typedArray.constructor) {
		case Uint8Array:
			return 'uint8';
		case Float32Array:
			return 'float32';
		case Int32Array:
			return 'int32';
		case Uint32Array:
			return 'uint32';
		case Uint16Array:
			return 'uint16';
		default:
			throw new Error(`Unknown type for tom file:  ${typedArray.constructor}`)
	}
}

/**
 * Returns the number we are reserving as 'null' for a given data type.
 * @param {string} type string describing data type
 * @returns {number} null value for that data type
 */
export function nullValForType(type: types.TomType) {
	switch (type) {
		case 'uint8':
		    return 255;
		case 'int32':
			return -10000;
		// case 'uint32':
		//     return ;
		case 'float32':
			return -10000;
		default:
			throw new Error(`No null supported for type ${type}.`);
	}
};

/**
 * Returns the file type extension of a filename.
 * @param {string} filenameWithExtension
 * @returns {string} extension, no period
 */
export function getExtension(filenameWithExtension: string) {
	const parts = filenameWithExtension.split('.');
	if (parts.length < 2) {
		throw new Error(`Invalid filename: ${filenameWithExtension}, or no extension present.`);
	}
	return parts[parts.length - 1];
};