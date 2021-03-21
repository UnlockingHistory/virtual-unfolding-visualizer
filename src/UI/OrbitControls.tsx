import React from 'react';
import { Button } from '@blueprintjs/core';
import { useSetRecoilState } from 'recoil'; 
import '../css/OrbitControls.css';
import { threeState } from '../state/ThreeState';

export function OrbitControls() {

	function resetControls() {
		threeState.controls?.reset();
	}

	return (
		<div className='OrbitControls'>
			<Button className="bp3-minimal" text="Reset 3D View" onClick={resetControls} />
		</div>
	);
}