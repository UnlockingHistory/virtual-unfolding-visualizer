import { atom } from 'recoil';

export type TabState = '3D' | '2D';

export const currentTabState = atom<TabState>({
	key: 'currentTab',
	default: '3D',
});

// Only one scalar data section can be visible at a time.
export const visibleScalarTomFilenameState = atom<string | null>({
	key: 'visibleScalarTomFilename',
	default: null,
});

// Many vector sections can be visible at the same time.
export const visibleVectorTomFilenamesState = atom<string[]>({
	key: 'visibleVectorTomFilenames',
	default: [],
});

// Many bin files can be visible at the same time.
export const visibleBinFilenamesState = atom<string[]>({
	key: 'visibleBinFilenames',
	default: [],
});


// // export const visibleScalarDataFilename = selector<string | undefined>({
// // 	key: 'visibleScalarDataFileName',
// // 	get: ({ get }) => {
// // 		const r_loadedScalarDataFilenames = get(loadedScalarDataFilenames);
// // 		const r__visibleScalarDataFilename = get(_visibleScalarDataFilename);
// // 		return r__visibleScalarDataFilename && r_loadedScalarDataFilenames.indexOf(r__visibleScalarDataFilename) >= 0 ?
// // 			 r__visibleScalarDataFilename : r_loadedScalarDataFilenames[0];
// // 	},
// // 	set: ({ set }, newValue) => {
// // 		console.log("here", newValue);
// // 		set(_visibleScalarDataFilename, newValue);
// // 	},
// // });
// const defaultScalarDataAtom = atom<TomScalarSelectionAtom>({
// 	key: 'default_file_atom',
// 	default: {
// 		filename: '',
// 		colorMode: 'greyscale' as ScalarDataColorMode,
// 		zeroCentered: false,
// 	},
// });
// export const visibleScalarDataAtom = selector({
// 	key: 'visibleScalarDataAtom',
// 	get: ({ get }) => {
// 		const r_visibleScalarDataFilename = get(visibleScalarDataFilename);
// 		if (r_visibleScalarDataFilename) {
// 			return (tomFiles[r_visibleScalarDataFilename] as BufferedTomScalarSelection).getAtom();
// 		}
// 		return defaultScalarDataAtom;
// 	},
// });
