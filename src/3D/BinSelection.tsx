import React, { } from 'react';
import { BufferAttribute } from 'three';
import { useRecoilValue } from 'recoil'; 
import { useUpdate } from 'react-three-fiber';
import { bufferedSelections } from '../state/DataState';
import { BufferedBinSelection } from '../io/BufferedBinSelection';
import { visibleBinFilenamesState } from '../state/AppState';

export interface BinSectionProps {
	bufferedBinSelection: BufferedBinSelection;
}

function BinSection(props: BinSectionProps) {
	const atom = useRecoilValue(props.bufferedBinSelection.getAtom());

	const { positions, count, edges, edgeCount, vertexColors } = props.bufferedBinSelection.getLayerPositions(atom);
	const { visualStyle } = atom;

	const positionAttribute = useUpdate<BufferAttribute>(
		(positionAttribute) => {
			// @ts-ignore;
			positionAttribute.needsUpdate = true;
		},
		[...Object.values(atom), positions] // Execute only if these properties change,
	);
	const indexAttribute = useUpdate<BufferAttribute>(
		(indexAttribute) => {
			// @ts-ignore;
			indexAttribute.needsUpdate = true;
		},
		[...Object.values(atom), edges] // Execute only if these properties change,
	);
	const colorAttribute = useUpdate<BufferAttribute>(
		(colorAttribute) => {
			// @ts-ignore;
			colorAttribute.needsUpdate = true;
		},
		[...Object.values(atom), vertexColors] // Execute only if these properties change,
	);

	return (
		<>
			{ (visualStyle === 'vector' || visualStyle === 'mesh') &&
				<lineSegments>
					<bufferGeometry  attach="geometry">
						<bufferAttribute ref={positionAttribute} attachObject={["attributes", "position"]} array={positions} count={count} itemSize={3}/>
						{ visualStyle === 'mesh' &&
							<bufferAttribute ref={indexAttribute} attach={"index"} array={edges} count={edgeCount} itemSize={1}/>
						}
						<bufferAttribute ref={colorAttribute} attachObject={["attributes", "color"]} array={vertexColors} count={count} itemSize={3}/>
					</bufferGeometry>
					<lineBasicMaterial attach="material" vertexColors={true}/>
				</lineSegments>
			}
			{ visualStyle === 'point' &&
				<points>
					<bufferGeometry  attach="geometry">
						<bufferAttribute ref={positionAttribute} attachObject={["attributes", "position"]} array={positions} count={count} itemSize={3}/>
						<bufferAttribute ref={colorAttribute} attachObject={["attributes", "color"]} array={vertexColors} count={count} itemSize={3}/>
					</bufferGeometry>
					<pointsMaterial size={4} attach="material" vertexColors={true}/>
				</points>
			}
		</>
	);
}

export function BinSections() {
	const r_visibleBinFilenames = useRecoilValue(visibleBinFilenamesState);
	return (
		<>
			{
				r_visibleBinFilenames.map(filename => {
					return (
						<BinSection key={filename} bufferedBinSelection={bufferedSelections[filename] as BufferedBinSelection}/>
					);
				})
			}
		</>
	);
}