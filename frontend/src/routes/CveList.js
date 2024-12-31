import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SelectedCVE from '../components/SelectedCVE';
import Search from '../components/Searchbar';
import targetColors from '../utils/targetColors';
import './css/CveList.css';

const CVEList = () => {
	const [cveData, setCveData] = useState([]);
	const [selectedCVE, setSelectedCVE] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;
	const navigate = useNavigate();

	useEffect(() => {
		const fetchCVEData = async () => {
			try {
				// http://localhost:5000
				const response = await axios.get('http://localhost:5000/api/cve');
				const formattedData = Object.entries(response.data).map(
					([key, value]) => ({
						key: key.replace('cve:', ''),
						...value
					})
				);
				setCveData(formattedData);
			} catch (error) {
				console.error('Error fetching the CVE data', error);
			}
		};
		fetchCVEData();

		const storedSelectedCVE =
			JSON.parse(localStorage.getItem('selectedCVE')) || [];
		setSelectedCVE(storedSelectedCVE);
	}, []);

	// 현재 페이지
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = cveData.slice(indexOfFirstItem, indexOfLastItem);

	// 페이지 번호
	const totalPages = Math.ceil(cveData.length / itemsPerPage);
	const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

	const handlePageChange = pageNumber => {
		setCurrentPage(pageNumber);
	};

	const handleSelectCVE = cveKey => {
		let updatedSelectedCVE;

		if (selectedCVE.includes(cveKey)) {
			updatedSelectedCVE = selectedCVE.filter(key => key !== cveKey);
		} else {
			updatedSelectedCVE = [...selectedCVE, cveKey];
		}

		setSelectedCVE(updatedSelectedCVE);
		localStorage.setItem('selectedCVE', JSON.stringify(updatedSelectedCVE));
	};

	const handleRemoveCVE = cveKey => {
		const updatedSelectedCVE = selectedCVE.filter(key => key !== cveKey);
		setSelectedCVE(updatedSelectedCVE);
		localStorage.setItem('selectedCVE', JSON.stringify(updatedSelectedCVE));
	};

	const handleCveClick = cveName => {
		navigate(`/cve/${cveName}`);
	};

	return (
		<div className="cve-list-and-selected">
			<div className="selected-cve-container">
				<SelectedCVE
					selectedCVE={selectedCVE}
					handleRemoveCVE={handleRemoveCVE}
				/>
			</div>
			<div className="cve-list-container">
				<Search onResults={setCveData} />

				{currentItems.map(cve => (
					<div key={cve.key} className="cve-card">
						<div className="cve-badges">
							<span
								className="badge"
								style={{ backgroundColor: targetColors[cve.target] || 'gray' }}
							>
								{cve.target}
							</span>
							<span className="badge badge-risk">{cve.risk}</span>
						</div>
						<a className="cve-title" onClick={() => handleCveClick(cve.key)}>
							{cve.key}
						</a>
						<p className="cve-summary">{cve.summary}</p>
						<button
							className={`select-button ${
								selectedCVE.includes(cve.key) ? 'selected' : ''
							}`}
							onClick={() => handleSelectCVE(cve.key)}
						>
							{selectedCVE.includes(cve.key) ? 'Selected' : 'Select'}
						</button>
					</div>
				))}
				<div className="pagination">
					{pageNumbers.map(number => (
						<button
							key={number}
							onClick={() => handlePageChange(number)}
							className={currentPage === number ? 'active' : ''}
						>
							{number}
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

export default CVEList;
