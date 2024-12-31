import React from 'react';
import './css/SelectedCVE.css';

const SelectedCVE = ({ selectedCVE, handleRemoveCVE }) => {
	return (
		<div className="selected-cve-container">
			<h3>SELECTED</h3>
			{selectedCVE.length === 0 ? (
				<p>No CVEs selected</p>
			) : (
				selectedCVE.map(cveKey => (
					<div key={cveKey} className="selected-cve-item">
						<span>{cveKey}</span>
						<button
							className="remove-button"
							onClick={() => handleRemoveCVE(cveKey)}
						>
							[-]
						</button>
					</div>
				))
			)}
		</div>
	);
};

export default SelectedCVE;
