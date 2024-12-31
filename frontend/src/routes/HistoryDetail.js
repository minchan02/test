import React from 'react';
import { useLocation } from 'react-router-dom';

const HistoryDetail = () => {
	const location = useLocation();
	const { entry } = location.state || {};

	return (
		<div className="historyDetailContainer">
			<h3>Attack Details for {new Date(entry.timestamp).toLocaleString()}</h3>
			<p>
				<strong>URL:</strong> {entry.url}
			</p>
			<p>
				<strong>Port:</strong> {entry.port}
			</p>
			<h4>Results:</h4>
			<ul>
				{Object.entries(entry.cveResults).map(([cve, result]) => (
					<li key={cve}>
						<strong>{cve}:</strong> {result}
					</li>
				))}
			</ul>
		</div>
	);
};

export default HistoryDetail;
