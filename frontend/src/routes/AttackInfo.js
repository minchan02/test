import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/AttackInfo.css';

const AttackInfo = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { cve, msg, log } = location.state || {};
	const [requestData, setRequestData] = useState(null);
	const [responseData, setResponseData] = useState(null);

	useEffect(() => {
		if (log) {
			const logEntries = log.trim().split('\n');
			const parsedEntries = logEntries.map(entry => JSON.parse(entry));

			const requestLog = parsedEntries.find(entry => entry.type === 'request');
			const responseLog = parsedEntries.find(
				entry => entry.type === 'response'
			);

			setRequestData(requestLog);
			setResponseData(responseLog);
		}
	}, [log]);

	const parseJsonSafely = data => {
		try {
			return JSON.stringify(JSON.parse(data), null, 2);
		} catch (error) {
			return data; // JSON 파싱 실패 시 원본 문자열을 반환
		}
	};

	const handleCveCheck = () => {
		if (cve) {
			navigate(`/cve/${cve}`);
		}
	};

	return (
		<div className="attackInfoContainer">
			<h3>Attack Details for {cve}</h3>

			{msg && (
				<div className="attackMessage">
					<p>{msg}</p>
				</div>
			)}

			<button onClick={handleCveCheck} className="cveCheckButton">
				CVE Info
			</button>

			<div className="infoSectionWrapper">
				{requestData && (
					<div className="requestSection">
						<h4>Request Information</h4>
						<p>
							<strong>URL:</strong> {requestData.url}
						</p>
						<p>
							<strong>Method:</strong> {requestData.method}
						</p>
						<h5>Headers:</h5>
						<pre className="codeBlock">
							{JSON.stringify(requestData.request_headers, null, 2)}
						</pre>
						<h5>Body:</h5>
						<pre className="codeBlock">
							{parseJsonSafely(requestData.request_body)}
						</pre>
					</div>
				)}

				{responseData && (
					<div className="responseSection">
						<h4>Response Information</h4>
						<p>
							<strong>Status Code:</strong> {responseData.status_code}
						</p>
						<h5>Headers:</h5>
						<pre className="codeBlock">
							{JSON.stringify(responseData.response_headers, null, 2)}
						</pre>
						<h5>Body:</h5>
						<pre className="codeBlock">
							{parseJsonSafely(responseData.response_body)}
						</pre>
					</div>
				)}
			</div>
		</div>
	);
};

export default AttackInfo;
