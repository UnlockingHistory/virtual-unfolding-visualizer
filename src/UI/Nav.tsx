import React from 'react';
import {
    Alignment,
    Navbar,
    NavbarDivider,
    NavbarGroup,
	NavbarHeading,
	Tab,
	Tabs,
} from '@blueprintjs/core';
import '../css/Nav.css';
import { TabState, currentTabState } from '../state/AppState';
import { useRecoilState } from 'recoil';
import { FileHandler } from './FileHandler';

export function Nav() {

	const [tabState, setTabState] = useRecoilState(currentTabState);

	return (
		<Navbar className={`Nav`}>
			<NavbarGroup align={Alignment.LEFT}>
				<NavbarHeading>Locked Letters</NavbarHeading>
				<NavbarDivider/>
				<Tabs
					animate={true}
					large={true}
					onChange={(newTabId) => setTabState(newTabId as TabState)}
					selectedTabId={tabState}
				>
					<Tab id="3D" title="3D" />
					<Tab disabled id="2D" title="2D" />
				</Tabs>
			</NavbarGroup>
			<Navbar.Group align={Alignment.RIGHT}>
				<FileHandler/>
			</Navbar.Group>
		</Navbar>
	);
}
