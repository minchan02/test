import React, { createContext, useContext, useState } from 'react';

const AttackContext = createContext();

export const useAttack = () => useContext(AttackContext);

export const AttackProvider = ({ children }) => {
	const [cveResults, setCveResults] = useState({});
	const [cveStatus, setCveStatus] = useState({});
	const [selectedCVE, setSelectedCVE] = useState([]);

	return (
		<AttackContext.Provider
			value={{
				cveResults,
				setCveResults,
				cveStatus,
				setCveStatus,
				selectedCVE,
				setSelectedCVE
			}}
		>
			{children}
		</AttackContext.Provider>
	);
};
