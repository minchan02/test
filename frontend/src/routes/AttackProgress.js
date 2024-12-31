import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/AttackProgress.css';

const AttackProgress = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { url, selectedCVE } = location.state || {};
	const [cveResults, setCveResults] = useState({});
	const [cveStatus, setCveStatus] = useState({});
	const [cveMsg, setCveMsg] = useState({});
	const [cveLog, setCveLog] = useState({});
	const [isComplete, setIsComplete] = useState(false);

	useEffect(() => {
		const initialStatus = selectedCVE.reduce((acc, cve) => {
			acc[cve] = 'Running';
			return acc;
		}, {});
		setCveStatus(initialStatus);

		const runAttack = async () => {
			for (const cve of selectedCVE) {
				try {
					const response = await fetch('http://localhost:5000/api/attack', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							cve: cve,
							url: url
						})
					});
					const data = await response.json();

					if (data.result === 'True') {
						setCveResults(prevResults => ({
							...prevResults,
							[cve]: 'Crack Found'
						}));
						setCveStatus(prevStatus => ({
							...prevStatus,
							[cve]: 'Finished'
						}));
					} else {
						setCveResults(prevResults => ({
							...prevResults,
							[cve]: 'No Crack'
						}));
						setCveStatus(prevStatus => ({
							...prevStatus,
							[cve]: 'Error'
						}));
					}

					setCveMsg(prevMsg => ({
						...prevMsg,
						[cve]: data.msg
					}));
					setCveLog(prevLog => ({
						...prevLog,
						[cve]: data.log
					}));
				} catch (error) {
					setCveResults(prevResults => ({
						...prevResults,
						[cve]: `Error: Internal Error`
					}));
					setCveStatus(prevStatus => ({
						...prevStatus,
						[cve]: 'Error'
					}));
				}
			}
			setIsComplete(true);
		};

		runAttack();
	}, [selectedCVE, url]);

	const handleSave = async () => {
		const timestamp = new Date().toISOString();
		const saveData = selectedCVE.map(cve => ({
			cve,
			msg: cveMsg[cve],
			result: cveResults[cve],
			log: cveLog[cve],
			timestamp
		}));

		try {
			const response = await fetch('http://localhost:5000/api/history/save', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ attacks: saveData })
			});
			const data = await response.json();
			if (data.success) {
				alert('Attack data saved successfully!');
			} else {
				alert('Failed to save attack data.');
			}
		} catch (error) {
			console.error('Error saving attack data:', error);
		}
	};

	const handleCveClick = cve => {
		navigate('/attack-info', {
			state: { cve, msg: cveMsg[cve], log: cveLog[cve] }
		});
	};

	return (
		<div className="cveStatusContainer">
			<h3>Attack Progress</h3>
			{selectedCVE.map(cve => (
				<div key={cve} className="cveCard" onClick={() => handleCveClick(cve)}>
					<h4>{cve}</h4>
					<div className="progressBarContainer">
						<div className={`progressBar ${cveStatus[cve]}`}></div>
					</div>
					<p
						className={`statusText ${
							cveResults[cve] === 'Crack Found' ? 'crackFound' : 'noCrack'
						}`}
					>
						{cveResults[cve] || 'Pending'}
					</p>
				</div>
			))}
			{isComplete && (
				<button onClick={handleSave} className="saveButton">
					SAVE
				</button>
			)}
		</div>
	);
};

export default AttackProgress;
