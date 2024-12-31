import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/History.css';

const History = () => {
	const [history, setHistory] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchHistory = async () => {
			try {
				const response = await fetch('http://localhost:5000/api/history/get');
				const data = await response.json();
				setHistory(data.history);
			} catch (error) {
				console.error('Failed to fetch history:', error);
			}
		};

		fetchHistory();
	}, []);

	const handleHistoryClick = item => {
		navigate('/attack-info', {
			state: {
				cve: item.cve,
				msg: item.msg,
				result: item.result,
				log: item.log,
				timestamp: item.timestamp
			}
		});
	};

	const handleDelete = async timestamp => {
		try {
			const response = await fetch('http://localhost:5000/api/history/delete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ timestamp })
			});
			const data = await response.json();
			if (data.success) {
				setHistory(prevHistory =>
					prevHistory.filter(entry => entry.timestamp !== timestamp)
				);
				alert('History deleted successfully.');
			} else {
				alert('Failed to delete history.');
			}
		} catch (error) {
			console.error('Failed to delete history:', error);
			alert('An error occurred while deleting the history.');
		}
	};

	return (
		<div className="historyContainer">
			<h3>Attack History by Timestamp</h3>
			{history.map(entry => (
				<div key={entry.timestamp} className="timestampGroup">
					<div className="timestampHeader">
						<h4>Timestamp: {new Date(entry.timestamp).toLocaleString()}</h4>
						<button
							onClick={() => handleDelete(entry.timestamp)}
							className="deleteButton"
						>
							Delete
						</button>
					</div>
					<ul className="cveList">
						{entry.attacks.map(item => (
							<li
								key={item.cve}
								onClick={() =>
									handleHistoryClick({ ...item, timestamp: entry.timestamp })
								}
								className="cveItem"
							>
								<p>
									<strong>CVE:</strong> {item.cve}
								</p>
								<p>
									<strong>Result:</strong> {item.result}
								</p>
							</li>
						))}
					</ul>
				</div>
			))}
		</div>
	);
};

export default History;
