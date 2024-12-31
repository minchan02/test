import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SelectedCVE from '../components/SelectedCVE';
import './css/Attack.css';

const Attack = () => {
	const [url, setUrl] = useState('');
	const [selectedCVE, setSelectedCVE] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		const storedSelectedCVE =
			JSON.parse(localStorage.getItem('selectedCVE')) || [];
		if (Array.isArray(storedSelectedCVE)) {
			setSelectedCVE(storedSelectedCVE);
		} else {
			setSelectedCVE([]);
		}
	}, []);

	const handleUrlChange = e => {
		setUrl(e.target.value);
	};

	const handleRemoveCVE = cveKey => {
		const updatedSelectedCVE = selectedCVE.filter(key => key !== cveKey);
		setSelectedCVE(updatedSelectedCVE);
		localStorage.setItem('selectedCVE', JSON.stringify(updatedSelectedCVE));
	};

	const handleAttack = () => {
		if (selectedCVE.length === 0) {
			alert('Select CVE!');
			return;
		}
		navigate('/attack-progress', { state: { url, selectedCVE } });
	};

	return (
		<main className="main-content">
			<SelectedCVE
				selectedCVE={selectedCVE}
				handleRemoveCVE={handleRemoveCVE}
			/>
			<form className="attack-form" onSubmit={e => e.preventDefault()}>
				<div className="input-group">
					<label htmlFor="url">URL</label>
					<input
						type="text"
						id="url"
						value={url}
						onChange={handleUrlChange}
						placeholder="Default: http://host.docker.internal"
					/>
				</div>
				<div className="button-group">
					<button
						type="button"
						className="attack-button"
						onClick={handleAttack}
					>
						Attack
					</button>
				</div>
			</form>
		</main>
	);
};

export default Attack;
