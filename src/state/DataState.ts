import { atom, selector } from 'recoil';
import { BufferedSelection } from '../shared/types';
import { getExtension } from '../shared/utils';

// Each bufferedSelection has its own atom.
export const bufferedSelections: { [key: string]: BufferedSelection } = {};
const tomFilenameFilter = (filename: string) => {
	return getExtension(filename) === 'tom';
}
const binFilenameFilter = (filename: string) => {
	return getExtension(filename) === 'bin';
}
const scalarTypesFilter = (filename: string) => {
	return bufferedSelections[filename].isScalarType();
}
const vectorTypesFilter = (filename: string) => {
	return bufferedSelections[filename].isVectorType();
}
const vector1TypesFilter = (filename: string) => {
	return bufferedSelections[filename].isVector1Type();
}
const vector3TypesFilter = (filename: string) => {
	return bufferedSelections[filename].isVector3Type();
}

export function getVector3TomFilenames() {
	return Object.keys(bufferedSelections).filter(tomFilenameFilter).filter(vector3TypesFilter);
}

export const filenamesState = atom<string[]>({
	key: 'filenames',
	default: [],
});

const tomFilenamesState = selector<string[]>({
	key: 'tomFilenames',
	get: ({ get }) => {
		const filenames = get(filenamesState);
		return filenames.filter(tomFilenameFilter);
	}
});

export const binFilenamesState = selector<string[]>({
	key: 'binFilenames',
	get: ({ get }) => {
		const filenames = get(filenamesState);
		return filenames.filter(binFilenameFilter);
	}
});

export const vector3BinFilenamesState = selector<string[]>({
	key: 'vector3BinFilenames',
	get: ({ get }) => {
		const binFilenames = get(binFilenamesState);
		return binFilenames.filter(vector3TypesFilter);
	}
});

export const scalarTomFilenamesState = selector<string[]>({
	key: 'scalarTomFilenames',
	get: ({ get }) => {
		const tomFilenames = get(tomFilenamesState);
		return tomFilenames.filter(scalarTypesFilter);
	}
});

export const vectorTomFilenamesState = selector<string[]>({
	key: 'vectorTomFilenames',
	get: ({ get }) => {
		const tomFilenames = get(tomFilenamesState);
		return tomFilenames.filter(vectorTypesFilter);
	}
});

export const vector3TomFilenamesState = selector<string[]>({
	key: 'vector3TomFilenames',
	get: ({ get }) => {
		const tomFilenames = get(tomFilenamesState);
		return tomFilenames.filter(vector3TypesFilter);
	}
});

export const vector1TomFilenamesState = selector<string[]>({
	key: 'vector1TomFilenames',
	get: ({ get }) => {
		const tomFilenames = get(tomFilenamesState);
		return tomFilenames.filter(vector1TypesFilter);
	}
});

// Overall dimensions of the current file.
export const dimensionsState = atom({
	key: 'dimensions',
	default: [0, 0, 0],
});