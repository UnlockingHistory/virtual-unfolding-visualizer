import '../css/FileMenu.css';
import React, { useState } from 'react';
import { Collapse, Classes, Icon, H6, RadioGroup, Radio, Checkbox } from "@blueprintjs/core";
import { useRecoilValue, useRecoilState } from 'recoil';
// @ts-ignore
import MiddleEllipsis from 'react-middle-ellipsis';
import { BufferedSelection, ColorMode, VisualStyleType } from '../shared/types';
import { binFilenamesState, bufferedSelections, scalarTomFilenamesState, vector1TomFilenamesState, vector3TomFilenamesState, vectorTomFilenamesState } from '../state/DataState';
import { visibleBinFilenamesState, visibleScalarTomFilenameState, visibleVectorTomFilenamesState } from '../state/AppState';
import { getExtension } from '../shared/utils';
import classNames from 'classnames';

type DataFileProps = {
	filename: string,
	bufferedSelection: BufferedSelection,
	isExpanded: boolean,
	expandFile: (filename: string | null) => void,
	isVisible: boolean,
	toggleVisiblity: () => void,
}

function DataFile(props: DataFileProps) {
	const { type } = props.bufferedSelection;
	const [ atom, setAtom ] = useRecoilState(props.bufferedSelection.getAtom());
	const {
		visualStyle, 
		pointDataFilename,
		vectorDataFilename,
		vectorOffsetFilename,
		vectorScaleFilename,
		colorMode,
		colorHex,
		colorZeroCentered,
		colorDataFilename,
	} = atom;
	const vector3Filenames = useRecoilValue(vector3TomFilenamesState);
	const vector1Filenames = useRecoilValue(vector1TomFilenamesState);
	const scalarFilenames = useRecoilValue(scalarTomFilenamesState);

	function updateVisualStyle(e: React.FormEvent<HTMLInputElement>) {
		const _visualStyle = (e.target as HTMLInputElement).value;
		setAtom({
			...atom,
			visualStyle: _visualStyle as VisualStyleType,
		});
	}

	function updatePointDataFilename(e: React.FormEvent<HTMLSelectElement>) {
		let _pointDataFilename = (e.target as HTMLSelectElement).value as string | undefined;
		if (_pointDataFilename === 'undefined') {
			_pointDataFilename = undefined;
		}
		setAtom({
			...atom,
			pointDataFilename: _pointDataFilename,
		});
	}

	function updateVectorDataFilename(e: React.FormEvent<HTMLSelectElement>) {
		let _vectorDataFilename = (e.target as HTMLSelectElement).value as string | undefined;
		if (_vectorDataFilename === 'undefined') {
			_vectorDataFilename = undefined;
		}
		setAtom({
			...atom,
			vectorDataFilename: _vectorDataFilename,
		});
	}

	function updateVectorOffsetFilename(e: React.FormEvent<HTMLSelectElement>) {
		let _vectorOffsetFilename = (e.target as HTMLSelectElement).value as string | undefined;
		if (_vectorOffsetFilename === 'undefined') {
			_vectorOffsetFilename = undefined;
		}
		setAtom({
			...atom,
			vectorOffsetFilename: _vectorOffsetFilename,
		});
	}

	function updateVectorScaleFilename(e: React.FormEvent<HTMLSelectElement>) {
		let _vectorScaleFilename = (e.target as HTMLSelectElement).value as string | undefined;
		if (_vectorScaleFilename === 'undefined') {
			_vectorScaleFilename = undefined;
		}
		setAtom({
			...atom,
			vectorScaleFilename: _vectorScaleFilename,
		});
	}

	function updateColorMode(e: React.FormEvent<HTMLInputElement>) {
		const _colorMode = (e.target as HTMLInputElement).value;
		setAtom({
			...atom,
			colorMode: _colorMode as ColorMode,
		});
	}

	function updateColorHex(e: React.FormEvent<HTMLInputElement>) {
		const _colorHex = (e.target as HTMLInputElement).value;
		setAtom({
			...atom,
			colorHex: _colorHex,
		});
	}

	function updateColorZeroCentered(e: React.FormEvent<HTMLInputElement>) {
		const _colorZeroCentered = (e.target as HTMLInputElement).checked;
		setAtom({
			...atom,
			colorZeroCentered: _colorZeroCentered,
		});
	}

	function updateColorDataFilename(e: React.FormEvent<HTMLSelectElement>) {
		const _colorDataFilename = (e.target as HTMLSelectElement).value;
		setAtom({
			...atom,
			colorDataFilename: _colorDataFilename,
		});
	}

	function showData() {
		setAtom({
			...atom,
		});
		props.toggleVisiblity();
	}

	function expandFile(e: any) {
		e.stopPropagation();
		props.expandFile(!props.isExpanded ? props.filename : null);
		if (!props.isExpanded && !props.isVisible) showData();
	}

	const filenameLiClasses = classNames('FileMenu__FileName', Classes.MENU_ITEM, { expanded: props.isExpanded });

	return (
		<>
			<li className={filenameLiClasses} onClick={showData}>
				<a href="# " onClick={expandFile}>
					{ !props.isExpanded && <Icon icon="caret-right"/> }
					{ props.isExpanded && <Icon icon="caret-down"/> }
				</a>
				<MiddleEllipsis>
					<span>
						{props.filename}
					</span>
				</MiddleEllipsis>
				{ props.isVisible && <Icon className={Classes.ALIGN_RIGHT} icon="eye-open"/> }
			</li>
			<Collapse isOpen={props.isExpanded} keepChildrenMounted={true}>
				<div className='FileMenu__FileOptions'>
					<H6>Properties</H6>
					<div>Data Type: <b>{type}</b></div>
					{ props.bufferedSelection.numElements === 1 && <div>Min: <b>{props.bufferedSelection.min.toString()}</b></div> }
					{ props.bufferedSelection.numElements === 1 && <div>Max: <b>{props.bufferedSelection.max.toString()}</b></div> }
					<br/>
					
					{ visualStyle !== 'scalarField' &&
						<>
							<H6>Visual Style</H6>
							<RadioGroup
								onChange={updateVisualStyle}
								selectedValue={visualStyle}
							>
								<Radio label="Point" value="point" />
								<Radio label="Vector" value="vector" />
								{ props.bufferedSelection.numElements > 3 && <Radio label="Mesh" value="mesh" /> }
							</RadioGroup>
							{ visualStyle === 'point' &&
								<div>
									<label className="bp3-label .modifier">
										Point Position Data
										<div className="bp3-select .modifier">
											<select value={pointDataFilename} onChange={updatePointDataFilename}>
												<option value={'undefined'}>None</option>
												{
													vector3Filenames.map(filename => {
														return <option key={filename} value={filename}>{filename}</option>
													})
												}
											</select>
										</div>
									</label>
								</div>
							}
							{ visualStyle === 'vector' &&
								<div>
									<label className="bp3-label .modifier">
										Vector Direction
										<div className="bp3-select .modifier">
											<select value={vectorDataFilename} onChange={updateVectorDataFilename}>
												<option value={'undefined'}>None</option>
												{
													vector3Filenames.map(filename => {
														return <option key={filename} value={filename}>{filename}</option>
													})
												}
											</select>
										</div>
									</label>
									<label className="bp3-label .modifier">
										Vector Origin
										<div className="bp3-select .modifier">
											<select value={vectorOffsetFilename} onChange={updateVectorOffsetFilename}>
												<option value={'undefined'}>Use Voxel Center</option>
												{
													vector3Filenames.map(filename => {
														return <option key={filename} value={filename}>{filename}</option>
													})
												}
											</select>
										</div>
									</label>
									<label className="bp3-label .modifier">
										Vector Magnitude
										<div className="bp3-select .modifier">
											<select value={vectorScaleFilename} onChange={updateVectorScaleFilename}>
											<option value={'undefined'}>Unit Scale</option>
												{
													vector1Filenames.map(filename => {
														return <option key={filename} value={filename}>{filename}</option>
													})
												}
											</select>
										</div>
									</label>
								</div>
							}
							{ visualStyle === 'mesh' &&
								<div>
									<label className="bp3-label .modifier">
										Vertex Data
										<div className="bp3-select .modifier">
											<select value={pointDataFilename} onChange={updatePointDataFilename}>
												<option value={'undefined'}>None</option>
												{
													vector3Filenames.map(filename => {
														return <option key={filename} value={filename}>{filename}</option>
													})
												}
											</select>
										</div>
									</label>
								</div>
							}
							<br/>
						</>
					}
					
					<H6>Color</H6>
					<RadioGroup
							onChange={updateColorMode}
							selectedValue={colorMode}
						>
						{ visualStyle !== 'scalarField' &&
							<Radio label="Hex" value='hex' />
						}
						
						<Radio label="Spectrum" value="spectral" />
						<Radio label="Greyscale" value="greyscale" />
						{ visualStyle !== 'scalarField' && colorMode === 'hex' &&
							<div>
								<label className="bp3-label .modifier">
									Hex Color
									<div>
										<input onKeyUp={updateColorHex} defaultValue={colorHex}/>
									</div>
								</label>
							</div>
						}
						{ colorMode !== 'hex' &&
							<div>
								{ visualStyle !== 'scalarField' &&
									<label className="bp3-label .modifier">
										Data
										<div className="bp3-select .modifier">
											<select value={colorDataFilename} onChange={updateColorDataFilename}>
												<option value={'undefined'}>None</option>
												{
													vector1Filenames.map(filename => {
														return <option key={filename} value={filename}>{filename}</option>
													})
												}
											</select>
										</div>
									</label>
								}
								<Checkbox checked={colorZeroCentered} label="Center colormap around 0" onChange={updateColorZeroCentered} />
							</div>
						}
					</RadioGroup>
				</div>
			</Collapse>
		</>
	);
};

type DataFileGroupProps = {
	filenames: string[],
	visibleFilenames: string[],
	title: string,
	toggleVisiblity: (filename: string, isVisible: boolean) => void,
}

function DataFileGroup(props: DataFileGroupProps){
	const [isExpanded, setIsExpanded] = useState(false);
	const [currentExpandedFile, setCurrentExpandedFile] = useState<string | null>(null);
	
	function expandGroup() {
		// Don't expand if there are no files loaded.
		if (props.filenames.length === 0) {
			return;
		}
		setIsExpanded(!isExpanded);
	}

	function expandFile(filename: string | null) {
		setCurrentExpandedFile(filename);
	}
 
	return (
		<>
			<a href="# " onClick={expandGroup}>
				<li className={`${Classes.MENU_ITEM} FileMenu__Title ${props.filenames.length === 0 ? Classes.DISABLED: ''}`}>
					{ props.title } ({props.filenames.length})
					{ !isExpanded && <Icon icon="caret-right"/> }
					{ isExpanded && <Icon icon="caret-down"/> }
				</li>
			</a>
			<Collapse isOpen={isExpanded} keepChildrenMounted={true}>
				{ props.filenames.map(filename => {
					const isVisible = props.visibleFilenames.indexOf(filename) > -1;
					return (
						<DataFile
							key={filename} 
							filename={filename}
							bufferedSelection={bufferedSelections[filename]}
							isExpanded={filename === currentExpandedFile} 
							expandFile={expandFile}
							isVisible={isVisible}
							toggleVisiblity={() => props.toggleVisiblity(filename, isVisible)}
						/>
					);
				}) }
			</Collapse>
		</>
	);
}
 
function ScalarTomFileGroup(){
	const scalarTomFilenames = useRecoilValue(scalarTomFilenamesState);
	const [visibleScalarTomFilename, setVisibleScalarTomFilename] = useRecoilState(visibleScalarTomFilenameState);

	function toggleVisiblity(filename: string, isVisible: boolean) {
		if (isVisible) {
			setVisibleScalarTomFilename(null);
		} else {	
			setVisibleScalarTomFilename(filename);
		}
	}

	return (
		<DataFileGroup
			filenames={scalarTomFilenames}
			visibleFilenames={visibleScalarTomFilename ? [visibleScalarTomFilename] : []}
			title="Scalar Fields"
			toggleVisiblity={toggleVisiblity}
		/>
	);
}

function VectorTomFileGroup(){
	const vectorTomFilenames = useRecoilValue(vectorTomFilenamesState);
	const [visibleVectorTomFilenames, setVisibleVectorTomFilenames] = useRecoilState(visibleVectorTomFilenamesState);

	function toggleVisiblity(filename: string, isVisible: boolean) {
		const nextState = visibleVectorTomFilenames.slice();
		if (isVisible) {
			nextState.splice(nextState.indexOf(filename), 1);
		} else {	
			nextState.push(filename);
		}
		setVisibleVectorTomFilenames(nextState);
	}
 
	return (
		<DataFileGroup
			filenames={vectorTomFilenames}
			visibleFilenames={visibleVectorTomFilenames}
			title="Vector Fields"
			toggleVisiblity={toggleVisiblity}
		/>
	);
}

function BinFileGroup(){
	const binFilenames = useRecoilValue(binFilenamesState);
	const [visibleBinFilenames, setVisibleBinFilenames] = useRecoilState(visibleBinFilenamesState);

	function toggleVisiblity(filename: string, isVisible: boolean) {
		const nextState = visibleBinFilenames.slice();
		if (isVisible) {
			nextState.splice(nextState.indexOf(filename), 1);
		} else {	
			nextState.push(filename);
		}
		setVisibleBinFilenames(nextState);
	}
 
	return (
		<DataFileGroup
			filenames={binFilenames}
			visibleFilenames={visibleBinFilenames}
			title="Other Data"
			toggleVisiblity={toggleVisiblity}
		/>
	);
}

export function FileMenu() {
	return (
		<ul className={`FileMenu pt-list-unstyled ${Classes.ELEVATION_0}`}>
			<ScalarTomFileGroup/>
			<VectorTomFileGroup/>
			<BinFileGroup/>
		</ul>
	);
}