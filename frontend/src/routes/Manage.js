import React, { useState } from 'react';
import './css/Manage.css';

const Manage = () => {
	const [cve, setCve] = useState('');
	const [risk, setRisk] = useState('');
	const [target, setTarget] = useState('');
	const [version, setVersion] = useState('');
	const [summary, setSummary] = useState('');
	const [description, setDescription] = useState('');
	const [patch, setPatch] = useState('');

	const handleSubmit = async e => {
		e.preventDefault();

		const data = { cve, risk, target, version, summary, description, patch };

		try {
			const response = await fetch('http://localhost:5000/api/manage/cve/add', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});
			const result = await response.json();
			alert(result.msg);

			setCve('');
			setRisk('');
			setTarget('');
			setVersion('');
			setSummary('');
			setDescription('');
			setPatch('');
		} catch (error) {
			alert('Failed to add CVE');
		}
	};

	return (
		<main id="manage-container">
			<h1>Manage Information</h1>
			<form onSubmit={handleSubmit}>
				<label>
					CVE Name:
					<input
						type="text"
						value={cve}
						onChange={e => setCve(e.target.value)}
					/>
				</label>
				<label>
					Risk:
					<input
						type="text"
						value={risk}
						onChange={e => setRisk(e.target.value)}
					/>
				</label>
				<label>
					Target:
					<input
						type="text"
						value={target}
						onChange={e => setTarget(e.target.value)}
					/>
				</label>
				<label>
					Version:
					<input
						type="text"
						value={version}
						onChange={e => setVersion(e.target.value)}
					/>
				</label>
				<label>
					Summary:
					<input
						type="text"
						value={summary}
						onChange={e => setSummary(e.target.value)}
					/>
				</label>
				<label>
					Description:
					<textarea
						value={description}
						onChange={e => setDescription(e.target.value)}
					/>
				</label>
				<label>
					Patch Guide:
					<textarea value={patch} onChange={e => setPatch(e.target.value)} />
				</label>
				<button type="submit">Submit</button>
			</form>
		</main>
	);
};

export default Manage;
