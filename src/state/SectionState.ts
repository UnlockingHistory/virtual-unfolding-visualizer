import { atom, selector } from 'recoil';
import { Axis } from '../shared/types';
import { selectionSizeState, selectionCenterState } from './SelectionState';

export const sectionPositionState = atom<number>({
	key: "sectionPosition",
	default: 0,
});

export const sectionAxisState = atom<Axis>({
	key: "sectionAxis",
	default: Axis.Z,
});

export const currentVisibleScalarSectionState = atom<string>({
	key: "currentVisibleSection",
	default: 'raw',
});

// Compute the size of the cross section.
export const sectionSizeState = selector<[number, number, number]>({
	key: 'sectionSize',
	get: ({ get }) => {
		const selectionSize = get(selectionSizeState);
		const sectionAxis = get(sectionAxisState);
		const size = selectionSize.slice();
		size[sectionAxis] = 1;
		return size as [number, number, number];
	},
});

// Compute the center of the cross section.
export const sectionCenterState = selector<[number, number, number]>({
	key: 'sectionCenter',
	get: ({ get }) => {
		const selectionCenter = get(selectionCenterState);
		const sectionAxis = get(sectionAxisState);
		const sectionPosition = get(sectionPositionState);
		const center = selectionCenter.slice();
		center[sectionAxis] = sectionPosition;
		return center as [number, number, number];
	},
});