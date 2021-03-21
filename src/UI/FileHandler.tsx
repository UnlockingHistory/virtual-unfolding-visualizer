import React, { useEffect } from 'react';
import { Button } from '@blueprintjs/core';
import { useSetRecoilState, useRecoilValue } from 'recoil'; 
import { sectionPositionState, sectionAxisState } from '../state/SectionState';
import { filenamesState, bufferedSelections } from '../state/DataState';
import * as io from '../io/io';
import { selectionBoundsState, selectionCenterState } from '../state/SelectionState';
import { makeBufferedTomSelectionFromFile } from '../io/BufferedTomSelection';
import { localFiles } from '../state/LocalFiles';
import { getExtension } from '../shared/utils';
import { makeBufferedBinSelectionFromFile } from '../io/BufferedBinSelection';
// import { makeBufferedBinSelectionFromFile } from '../io/BufferedBinSelection';

localFiles();
let localFilesLoaded = false;

export function FileHandler() {

	const setSelectionBounds = useSetRecoilState(selectionBoundsState);
	const setSectionPosition = useSetRecoilState(sectionPositionState);
	const sectionAxis = useRecoilValue(sectionAxisState);
	const setFilenames = useSetRecoilState(filenamesState);

	useEffect(() => {
		async function loadLocalFiles() {
			const files = await localFiles();
			if (files.length) await parseFiles(files);
		}
		if (!localFilesLoaded) {
			loadLocalFiles();
			localFilesLoaded = true;
		}
	});

	async function parseFiles(files: File[]) {
		// // Sort files by alphabetical order.
		// files.sort((a, b) => {
		// 	if (a < b) {
		// 		return -1;
		// 	}
		// 	if (b < a) {
		// 		return 1;
		// 	}
		// 	return 0;
		// });

		// Delete any previously loaded files
		Object.keys(bufferedSelections).forEach(key => {
			bufferedSelections[key].dispose();
			delete bufferedSelections[key];
		});
	
		// Load up all tom files.
		const tomFileObjects = files.filter((file) => getExtension(file.name) === 'tom');
		const bufferedTomSelections = await Promise.all(tomFileObjects.map((file) => makeBufferedTomSelectionFromFile(file)));
		tomFileObjects.forEach((file, i) => {
			bufferedSelections[file.name] = bufferedTomSelections[i];
		});
		Object.values(bufferedTomSelections).forEach(selection => selection.updateAtomDefaultsAfterDataLoaded());

		// // Load up all bin files.
		// const binFileObjects = files.filter((file) => getExtension(file.name) === 'bin');
		// const bufferedBinSelections = await Promise.all(binFileObjects.map((file) => makeBufferedBinSelectionFromFile(file)));
		// binFileObjects.forEach((file, i) => {
		// 	bufferedSelections[file.name] = bufferedBinSelections[i];
		// });

		// Set dimensions and filename.
		const dimensions = (await io.getTomDimensions(tomFileObjects[0])).toArray();
		setSelectionBounds({ min: [0, 0, 0], max: dimensions });
		setSectionPosition(Math.floor(dimensions[sectionAxis] / 2));

		// Add new files to list of loaded files.
		setFilenames(Object.keys(bufferedSelections));
	}

	async function handleFileUpload(e: Event) {
		const fileList = (e.target as HTMLInputElement).files;
		if (fileList === null) {
			return;
		}
		// Convert FileList object to array.
		const files = Array.from(fileList);

		await parseFiles(files);
	}

	function openFileSelector() {
		const input = document.getElementById("file-input");
		if (!input) {
			throw new Error('Missing file input element.');
		}
		input.click();
	}

	function openDirectorySelector() {
		const input = document.getElementById("directory-input");
		if (!input) {
			throw new Error('Missing directory input element.');
		}
		input.click();
	}

	// Bind change listener to file input - this is already in index.html.
	if (document) {
		(document.getElementById('file-input') as HTMLInputElement).onchange = handleFileUpload;
		(document.getElementById('directory-input') as HTMLInputElement).onchange = handleFileUpload;
	}

	return (
		<>
			<Button className="bp3-minimal" icon="upload" text="Upload Files" onClick={openFileSelector} />
			<Button className="bp3-minimal" icon="upload" text="Upload Directory" onClick={openDirectorySelector} />
		</>
	);
}



// import Worker from './io.worker';

// if (!window.Worker) {
// 	throw new Error('Web Workers not supported in this browser.');
// }

// const workers = [];
// for (let i = 0; i<50; i++) {
// 	const worker = new Worker();
// 	worker.postMessage({ i });
// 	workers.push(worker);
// 	// @ts-ignore
// 	worker.onmessage = event => console.log(event.data);
// }