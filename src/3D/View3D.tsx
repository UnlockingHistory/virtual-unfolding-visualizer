import '../css/View3D.css';
import React, { useContext } from 'react';
import { Canvas } from 'react-three-fiber';
import { ScalarFieldSection } from './ScalarFieldSection';
import { Controls } from './Controls';
// @ts-ignore
import { AppContext } from 'recoil';
import { VectorFieldSections } from './VectorFieldSection';
import { BinSections } from './BinSelection';

export const View3D = () => {
	// We have to forward the context from Recoil to React-Three-Fiber.
	const value = useContext(AppContext);
	return (
		<div className='View3D'>
			<Canvas
				colorManagement
				orthographic
				camera={{ zoom: 5, up: [0, 0, 1], near: 0.0001, far: 10000, position: [100, 100, 100] }}
				pixelRatio={window.devicePixelRatio}
				invalidateFrameloop>
				<AppContext.Provider value={value}>
					<ambientLight />
					<pointLight position={[10, 10, 10]} />
					<ScalarFieldSection />
					<VectorFieldSections />
					<BinSections /> 
					<Controls />
				</AppContext.Provider>
			</Canvas>
		</div>
	);
}