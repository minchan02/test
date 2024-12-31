import React, { useState, useEffect } from 'react';
import ReactSlider from 'react-slider';
import axios from 'axios';
import targetColors from '../utils/targetColors';
import './css/Searchbar.css';

const Searchbar = ({ onResults }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [isOptionsVisible, setIsOptionsVisible] = useState(false);
	const [selectedFrameworks, setSelectedFrameworks] = useState([]);
	const [riskRange, setRiskRange] = useState([1, 10]);
	const [targets, setTargets] = useState([]);
	const [selectedTargets, setSelectedTargets] = useState([]);
	const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);
	const [versionInput, setVersionInput] = useState('');

	useEffect(() => {
		const fetchTargets = async () => {
			try {
				const response = await axios.get('http://localhost:5000/api/cve');
				const data = response.data;

				const extractedTargets = Object.values(data)
					.map(item => item.version?.split(':')[0]?.trim().toLowerCase())
					.filter(target => target);

				const uniqueTargets = [...new Set(extractedTargets)];
				setTargets(uniqueTargets);
			} catch (error) {
				console.error('Error fetching CVE data:', error);
			}
		};

		fetchTargets();
	}, []);

	const handleSearchChange = e => {
		setSearchTerm(e.target.value);
	};

	const toggleOptions = () => {
		setIsOptionsVisible(!isOptionsVisible);
	};

	const toggleTargetDropdown = () => {
		setIsTargetDropdownOpen(!isTargetDropdownOpen);
	};

	const handleTargetClick = target => {
		setSelectedTargets(prev =>
			prev.includes(target)
				? prev.filter(item => item !== target)
				: [...prev, target]
		);
	};

	const handleFrameworkClick = framework => {
		setSelectedFrameworks(prev =>
			prev.includes(framework)
				? prev.filter(item => item !== framework)
				: [...prev, framework]
		);
	};

	const handleSearchClick = async () => {
		try {
			const queryParams = new URLSearchParams();

			if (searchTerm.trim() !== '') {
				queryParams.append('search', searchTerm);
			}

			if (selectedFrameworks.length > 0) {
				queryParams.append('frame', selectedFrameworks.join(','));
			}

			queryParams.append('risk', `${riskRange[0]}-${riskRange[1]}`);

			if (selectedTargets.length > 0) {
				queryParams.append('target', selectedTargets.join(','));
			}

			if (versionInput.trim() !== '') {
				queryParams.append('version', versionInput.trim());
			}

			const queryString = queryParams.toString();
			const url = queryString
				? `http://localhost:5000/api/cve/get?${queryString}`
				: 'http://localhost:5000/api/cve';

			const response = await axios.get(url);

			const formattedData = Object.entries(response.data).map(
				([key, value]) => ({
					key: key.replace('cve:', ''),
					...value
				})
			);

			onResults(formattedData);
		} catch (error) {
			if (error.response && error.response.status === 404) {
				console.error('No results found');
				onResults([]);
			} else {
				console.error('Error fetching CVE data', error);
			}
		}
	};

	const handleResetClick = () => {
		setSearchTerm('');
		setSelectedFrameworks([]);
		setRiskRange([1, 10]);
		setSelectedTargets([]);
		setVersionInput('');
	};

	return (
		<div id="search-bar-container">
			<div id="search-bar">
				<input
					type="text"
					placeholder="Search CVE"
					value={searchTerm}
					onChange={handleSearchChange}
				/>
				<button id="search-button" onClick={handleSearchClick}></button>
				<button id="options-button" onClick={toggleOptions}>
					Options
				</button>
			</div>

			{isOptionsVisible && (
				<div id="options-container">
					<button id="reset-button" onClick={handleResetClick}></button>
					<div id="framework-options">
						{Object.keys(targetColors).map(framework => (
							<span
								key={framework}
								className={`option ${
									selectedFrameworks.includes(framework) ? 'selected' : ''
								}`}
								style={{
									backgroundColor: selectedFrameworks.includes(framework)
										? targetColors[framework]
										: 'white', // 기본 배경
									color: selectedFrameworks.includes(framework)
										? 'white'
										: '#333'
								}}
								onClick={() => handleFrameworkClick(framework)}
							>
								{framework}{' '}
							</span>
						))}
					</div>
					<div id="risk-slider">
						<label>
							Risk Range: {riskRange[0]} - {riskRange[1]}
						</label>
						<ReactSlider
							className="horizontal-slider"
							thumbClassName="slider-thumb"
							trackClassName="slider-track"
							value={riskRange}
							min={1}
							max={10}
							step={1}
							onChange={value => setRiskRange(value)}
							renderTrack={(props, state) => {
								const { index } = state; // 트랙 인덱스: 0(왼쪽), 1(선택), 2(오른쪽)
								let background = '#ddd'; // 기본 비활성화 색상
								if (index === 1) background = '#007bff'; // 활성화된 범위는 파란색

								return (
									<div
										{...props}
										style={{
											...props.style,
											background,
											height: '10px',
											borderRadius: '5px'
										}}
									/>
								);
							}}
							renderThumb={props => <div {...props} className="slider-thumb" />}
						/>
					</div>

					<div id="target-dropdown">
						<div className="dropdown-header">
							<button
								className="dropdown-toggle"
								onClick={toggleTargetDropdown}
							>
								Targets <span>{isTargetDropdownOpen ? '▲' : '▼'}</span>
							</button>
							<input
								type="text"
								placeholder="Enter version"
								className="version-input"
								value={versionInput}
								onChange={e => setVersionInput(e.target.value)}
							/>
						</div>
						{isTargetDropdownOpen && (
							<div className="dropdown-menu">
								{targets.map(target => (
									<div key={target} className="dropdown-item">
										<label>
											<input
												type="checkbox"
												checked={selectedTargets.includes(target)}
												onChange={() => handleTargetClick(target)}
											/>
											{target}
										</label>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default Searchbar;
