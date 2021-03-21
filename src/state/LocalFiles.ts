
const file = 'DB-1538_58x58x58';
const filenames: string[] = [
	`${file}_raw.tom`,
	`${file}_clipped.tom`,
	`${file}_GX.tom`,
	`${file}_GX_3X.tom`,
	`${file}_GY.tom`,
	`${file}_GY_3X.tom`,
	`${file}_GZ.tom`,
	`${file}_GZ_3X.tom`,
	`${file}_GXX.tom`,
	`${file}_GXX_3X.tom`,
	`${file}_GYY.tom`,
	`${file}_GYY_3X.tom`,
	`${file}_GZZ.tom`,
	`${file}_GZZ_3X.tom`,
	`${file}_GXY.tom`,
	`${file}_GXY_3X.tom`,
	`${file}_GYZ.tom`,
	`${file}_GYZ_3X.tom`,
	`${file}_GXZ.tom`,
	`${file}_GXZ_3X.tom`,
	`${file}_normals.tom`,
	`${file}_responses.tom`,
	`${file}_normalsRelaxed.tom`,
	`${file}_responsesRelaxed.tom`,
	`${file}_blurred.tom`,
	`${file}_allPoints.tom`,
	`${file}_allWidthsMax.tom`,
	`${file}_allWidthsMin.tom`,
	`${file}_allIndices.tom`,
	`${file}_allPointsList.bin`,
	`${file}_allNormalsList.bin`,
	`${file}_indices.tom`,
	`${file}_points3DList.bin`,
	`${file}_normalsList.bin`,
	`${file}_widthsMinList.bin`,
	`${file}_widthsMaxList.bin`,
	`${file}_indices_FLAGGED.tom`,
	`${file}_points3DList_FLAGGED.bin`,
	`${file}_normalsList_FLAGGED.bin`,
	`${file}_widthsMinList_FLAGGED.bin`,
	`${file}_widthsMaxList_FLAGGED.bin`,
	`${file}_meshNeighborsList.bin`,
	`${file}_meshNumbersList.bin`,
];
const URLS = filenames.map(filename => {
	return require(`../assets/${filename}`);
});

export async function localFiles() {
	const files = await Promise.all(URLS.map(url => fetch(url).then(r => r.blob())));
	// Manually convert Blob to File.
	(files as File[]).forEach((blob, i) => {
		// @ts-ignore
		blob.name = filenames[i];
	});
	return files as File[];
}