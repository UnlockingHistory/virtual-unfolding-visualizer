import React from 'react';
import { UnsignedByteType, DataTexture, BufferAttribute, RGBFormat } from 'three';
import { useRecoilValue } from 'recoil'; 
import { sectionAxisState, sectionCenterState, sectionPositionState, sectionSizeState } from '../state/SectionState';
import { bufferedSelections } from '../state/DataState';
import { useUpdate } from 'react-three-fiber';
import { TypedArray } from '../shared/types';
import { BufferedTomScalarSelection } from '../io/BufferedTomSelection';
import { visibleScalarTomFilenameState } from '../state/AppState';
import { selectionCenterState } from '../state/SelectionState';

const position = new BufferAttribute(new Float32Array([
	-0.5, -0.5, 0.5,
	0.5, -0.5, 0.5,
	-0.5, 0.5, 0.5,
	0.5, 0.5, 0.5,
	-0.5, -0.5, -0.5,
	0.5, -0.5, -0.5,
	-0.5, 0.5, -0.5,
	0.5, 0.5, -0.5,
]), 3);

const uv = new BufferAttribute(new Float32Array([
	0, 0,
	1, 0,
	0, 1,
	1, 1,
	0, 0,
	1, 0,
	0, 1,
	1, 1,
]), 2);

const index = new BufferAttribute(new Uint32Array([
	0, 1, 2,
	2, 1, 3,
	4, 6, 5,
	5, 6, 7,
	0, 4, 1,
	1, 4, 5,
	1, 5, 3,
	3, 5, 7,
	3, 7, 2,
	2, 7, 6,
	2, 6, 0,
	0, 6, 4
]), 1);

function ScalarFieldSectionMesh() {
	const selectionCenter = useRecoilValue(selectionCenterState);
	console.log(selectionCenter);
	const sectionSize = useRecoilValue(sectionSizeState);
	const sectionCenter = useRecoilValue(sectionCenterState);
	const sectionPosition = useRecoilValue(sectionPositionState);
	const sectionAxis = useRecoilValue(sectionAxisState);
	const visibleScalarDataFilename = useRecoilValue(visibleScalarTomFilenameState);
	const bufferedTomSelection = bufferedSelections[visibleScalarDataFilename!] as BufferedTomScalarSelection;
	const atom = useRecoilValue(bufferedTomSelection.getAtom());

	let layerData: TypedArray | null = null;
	if (bufferedTomSelection) {
		layerData = bufferedTomSelection.getLayerTexture(sectionAxis, sectionPosition, atom);
	};

	const dataTexture = useUpdate<DataTexture>(
		(dataTexture) => {
			if (layerData) {
				// @ts-ignore;
				dataTexture.image.data = layerData;
				dataTexture.needsUpdate = true;
			}
		},
		[...Object.values(atom), sectionPosition, sectionAxis, layerData] // Execute only if these properties change,
	);

	// TODO: add rotation to section if not z aligned.

	return (
		<mesh
			renderOrder={-1}
			position={[sectionCenter[0], sectionCenter[1], selectionCenter[2] + 0.5]}
			scale={sectionSize}>
			<bufferGeometry attach="geometry" attributes-position={position} attributes-uv={uv} index={index} />
			<meshBasicMaterial depthWrite={false} attach="material" >
				<dataTexture ref={dataTexture} attach='map' image-width={sectionSize[0]} image-height={sectionSize[1]} format={RGBFormat} type={UnsignedByteType}/>
			</meshBasicMaterial>
		</mesh>
	);
}

export function ScalarFieldSection() {
	const visibleScalarDataFilename = useRecoilValue(visibleScalarTomFilenameState);
	if (visibleScalarDataFilename === null) {
		return (null)
	}

	return (
		<ScalarFieldSectionMesh/>
	);
}