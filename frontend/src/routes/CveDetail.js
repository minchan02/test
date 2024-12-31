import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import hljs from 'highlight.js';
import styles from './css/CveDetail.module.css';
import SelectedCVE from '../components/SelectedCVE';
import 'highlight.js/styles/atom-one-dark.css';
import targetColors from '../utils/targetColors';

const CveDetail = () => {
	const { cveName } = useParams();
	const [cveDetail, setCveDetail] = useState(null);
	const [selectedCVE, setSelectedCVE] = useState([]);
	const codeRef = useRef(null);
	const patchRef = useRef(null);

	useEffect(() => {
		const fetchCveDetail = async () => {
			try {
				const response = await axios.get(
					`http://localhost:5000/api/cve/${cveName}`
				);
				setCveDetail(response.data);
			} catch (error) {
				console.error('Error fetching CVE details', error);
			}
		};

		fetchCveDetail();

		const storedSelectedCVE =
			JSON.parse(localStorage.getItem('selectedCVE')) || [];
		if (Array.isArray(storedSelectedCVE)) {
			setSelectedCVE(storedSelectedCVE);
		} else {
			setSelectedCVE([]);
		}
	}, [cveName]);

	useEffect(() => {
		if (codeRef.current) {
			hljs.highlightBlock(codeRef.current);
		}
		if (patchRef.current) {
			hljs.highlightElement(patchRef.current);
		}
	}, [cveDetail]);

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

	if (!cveDetail) {
		return <div>Loading...</div>;
	}

	return (
		<div className={styles.cveDetailContainer}>
			<SelectedCVE
				selectedCVE={selectedCVE}
				handleRemoveCVE={handleRemoveCVE}
			/>

			<div className={styles.cveHeader}>
				<button
					className={`${styles.cveDetailSelectButton} ${
						selectedCVE.includes(cveName) ? styles.selected : ''
					}`}
					onClick={() => handleSelectCVE(cveName)}
				>
					{selectedCVE.includes(cveName) ? 'Selected' : 'Select'}
				</button>
				<h1 className={styles.cveTitle}>{cveName}</h1>
			</div>
			<p className={styles.cveSummary}>{cveDetail.summary}</p>

			<div className={styles.cveInfo}>
				<div className={styles.cveBadges}>
					<span
						className={styles.badge}
						style={{
							backgroundColor: targetColors[cveDetail.target] || 'gray'
						}}
					>
						{cveDetail.target}
					</span>
					<span className={`${styles.badge} ${styles.badgeRisk}`}>
						Score {cveDetail.risk}
					</span>
				</div>
				<div className={styles.cveInfoItem}>
					<span className={styles.cveInfoLabel}>Vuln Version -&gt; </span>
					<span>{cveDetail.version}</span>
				</div>
			</div>

			<div className={styles.cveDescription}>
				<strong>Description</strong>
				<p>{cveDetail.description}</p>
			</div>

			<div>
				<strong>PoC</strong>
				{cveDetail.poc && (
					<div className={styles.codeBlock}>
						<pre>
							<code ref={codeRef} className="language-python">
								{cveDetail.poc}
							</code>
						</pre>
					</div>
				)}
			</div>

			<div>
				<strong>Patch Guide</strong>
				{cveDetail.patch ? (
					<div className={styles.codeBlock}>
						<pre>
							<code ref={patchRef}>{cveDetail.patch}</code>
						</pre>
					</div>
				) : (
					<div className={styles.codeBlock}>
						<pre>
							<code>Upgrade to the latest version</code>
						</pre>
					</div>
				)}
			</div>
		</div>
	);
};

export default CveDetail;
