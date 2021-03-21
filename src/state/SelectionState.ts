import { atom, selector } from 'recoil';

// Bounds of a 3D selection within the data.
export const selectionBoundsState = atom({
	key: 'selectionBounds',
	default: {
		min: [0, 0, 0],
		max: [0, 0, 0],
	},
});

// Compute the size of the selection.
export const selectionSizeState = selector<[number, number, number]>({
	key: 'selectionSize',
	get: ({ get }) => {
		const selectionBounds = get(selectionBoundsState);
		return [
			selectionBounds.max[0] - selectionBounds.min[0],
			selectionBounds.max[1] - selectionBounds.min[1],
			selectionBounds.max[2] - selectionBounds.min[2],
		];
	},
});

// Compute the center of the selection.
export const selectionCenterState = selector<[number, number, number]>({
	key: 'selectionCenter',
	get: ({ get }) => {
		const selectionSize = get(selectionSizeState);
		return [
			selectionSize[0]/2,
			selectionSize[1]/2,
			selectionSize[2]/2,
		];
	},
});