import React from 'react';
import { Slider } from '@blueprintjs/core';
import { useRecoilState, useRecoilValue } from 'recoil'; 
import { sectionAxisState, sectionPositionState } from '../state/SectionState';
import '../css/ControlPanel.css';
import { selectionBoundsState, selectionSizeState } from '../state/SelectionState';

export function ControlPanel() {

	const [sectionPosition, setCrossSectionPosition] = useRecoilState(sectionPositionState);
	const sectionAxis = useRecoilValue(sectionAxisState);
	const selectionBounds = useRecoilValue(selectionBoundsState);
	const selectionSize = useRecoilValue(selectionSizeState);

	return (
		<div className='ControlPanel'>
			{ selectionSize[sectionAxis] > 0 &&  <Slider
				min={selectionBounds.min[sectionAxis]}
				max={selectionBounds.max[sectionAxis] - 1}
				stepSize={1}
				labelStepSize={10}
				onChange={setCrossSectionPosition}
				value={sectionPosition}
				vertical
				showTrackFill={false}
			/> }
		</div>
	);
}