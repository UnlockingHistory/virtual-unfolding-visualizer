import React from 'react';
import { BufferAttribute } from 'three';
import { useRecoilValue } from 'recoil'; 
import { sectionAxisState, sectionCenterState, sectionPositionState } from '../state/SectionState';
import { useUpdate } from 'react-three-fiber';
import { BufferedTomVectorSelection } from '../io/BufferedTomSelection';
import { bufferedSelections } from '../state/DataState';
import { visibleVectorTomFilenamesState } from '../state/AppState';
import { selectionCenterState } from '../state/SelectionState';

export interface VectorFieldSectionProps {
	bufferedTomSelection: BufferedTomVectorSelection;
}

export function VectorFieldSection(props: VectorFieldSectionProps) {
	const sectionPosition = useRecoilValue(sectionPositionState);
	const sectionAxis = useRecoilValue(sectionAxisState);
	const atom = useRecoilValue(props.bufferedTomSelection.getAtom());
	const sectionCenter = useRecoilValue(sectionCenterState);
	const selectionCenter = useRecoilValue(selectionCenterState);

	const { positions, count, vertexColors } = props.bufferedTomSelection.getLayerPositions(sectionAxis, sectionPosition, atom);
	const { visualStyle } = atom;

	const positionAttribute = useUpdate<BufferAttribute>(
		(positionAttribute) => {
			// @ts-ignore;
			positionAttribute.needsUpdate = true;
		},
		[...Object.values(atom), sectionPosition, sectionAxis, positions] // Execute only if these properties change,
	);

	const colorAttribute = useUpdate<BufferAttribute>(
		(colorAttribute) => {
			// @ts-ignore;
			colorAttribute.needsUpdate = true;
		},
		[...Object.values(atom), sectionPosition, sectionAxis, vertexColors] // Execute only if these properties change,
	);

	// TODO: add rotation to section if not z aligned.

	return (
		<>
		{ visualStyle === 'vector' &&
			<lineSegments position={[0, 0, -sectionCenter[2] + selectionCenter[2]]}>
				<bufferGeometry attach="geometry">
					<bufferAttribute ref={positionAttribute} attachObject={["attributes", "position"]} array={positions} count={count} itemSize={3}/>
					<bufferAttribute ref={colorAttribute} attachObject={["attributes", "color"]} array={vertexColors} count={count} itemSize={3}/>
				</bufferGeometry>
				<lineBasicMaterial attach="material" vertexColors={true} depthTest={false}/>
			</lineSegments>
		}
		{ visualStyle === 'point' &&
			<points position={[0, 0, -sectionCenter[2] + selectionCenter[2]]}>
				<bufferGeometry  attach="geometry">
					<bufferAttribute ref={positionAttribute} attachObject={["attributes", "position"]} array={positions} count={count} itemSize={3}/>
					<bufferAttribute ref={colorAttribute} attachObject={["attributes", "color"]} array={vertexColors} count={count} itemSize={3}/>
				</bufferGeometry>
				<pointsMaterial size={4} attach="material" vertexColors={true} depthTest={false}/>
			</points>
		}
		</>
	);
}

export function VectorFieldSections() {
	const r_visibleVector3DDataFilenames = useRecoilValue(visibleVectorTomFilenamesState);
	return (
		<>
			{
				r_visibleVector3DDataFilenames.map(filename => {
					return (
						<VectorFieldSection key={filename} bufferedTomSelection={bufferedSelections[filename] as BufferedTomVectorSelection}/>
					);
				})
			}
		</>
	);
}