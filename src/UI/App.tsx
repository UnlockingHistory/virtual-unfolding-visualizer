import React from 'react';
import '../css/App.css';
import { Nav } from './Nav';
import '../css/Blueprint.css';
import { FocusStyleManager } from "@blueprintjs/core";
import { FileMenu } from './FileMenu';
import { View3D } from '../3D/View3D';
// @ts-ignore
import { RecoilRoot } from 'recoil';
import { ControlPanel } from './ControlPanel';
import { OrbitControls } from './OrbitControls';

// Focus style manager is needed to prevent intrusive focus artifacts.
// https://blueprintjs.com/docs/#core/accessibility.focus-management
FocusStyleManager.onlyShowFocusOnTabs();

function App() {
  return (
	<div className="App">
		<RecoilRoot>
			<Nav/>
			<div className='App__Content'> 
				<FileMenu/>
				<View3D/>
				<ControlPanel/>
				<OrbitControls/>
			</div>
		</RecoilRoot>
    </div>
  );
}

export default App;
