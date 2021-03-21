import React, { useEffect } from 'react';
import { useRecoilValue } from 'recoil'; 
import { extend, useThree, ReactThreeFiber, useUpdate } from 'react-three-fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { selectionCenterState } from '../state/SelectionState';
import { threeState } from '../state/ThreeState';

// Add OrbitControls to react-three-fiber.
extend({ OrbitControls });
// Add type to JSX namespace.
declare global {
	namespace JSX {
		interface IntrinsicElements {
		'orbitControls': ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>;
		}
	}
}

export interface ControlsProps {
}

export function Controls(props: ControlsProps) {

	const selectionCenter = useRecoilValue(selectionCenterState);

	// Get a reference to the Three.js Camera, and the canvas html element.
	const {
		camera,
		gl: { domElement },
		invalidate,
	} = useThree();

	// Ref to the controls, so that we can update them on every frame using useFrame
	const controls = useUpdate<OrbitControls>(
		(controls: OrbitControls) => {
			controls.update();
		},
		[selectionCenter] // Execute only if these properties change,
	)

	useEffect(() => {
		if (controls && controls.current !== null) {
			threeState.controls = controls.current;
			controls.current!.addEventListener("change", invalidate);
			const cancel = () =>
			controls.current!.removeEventListener("change", invalidate);
			return cancel;
		}
		return () => null;
	}, [controls, invalidate]);

	return (
		<orbitControls
			ref={controls}
			args={[camera, domElement]} 
			target-x={selectionCenter[0]}
			target-y={selectionCenter[1]}
			target-z={selectionCenter[2]}
			zoomSpeed={1}
			rotateSpeed={1}
			// enablePan={false}
		/>
	);
  };