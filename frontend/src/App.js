import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import MainPage from './routes/Main';
import CveListPage from './routes/CveList';
import CveDetailPage from './routes/CveDetail';
import AttackPage from './routes/Attack';
import AttackProgressPage from './routes/AttackProgress';
import AttackInfoPage from './routes/AttackInfo';
import HistoryPage from './routes/History';
import HistoryDetailPage from './routes/HistoryDetail';
import ManagePage from './routes/Manage';

function App() {
	return (
		<Router>
			<div>
				<Navbar />
				<Routes>
					<Route path="/" element={<MainPage />} />
					<Route path="/cve" element={<CveListPage />} />
					<Route path="/attack" element={<AttackPage />} />
					<Route path="/attack-progress" element={<AttackProgressPage />} />
					<Route path="/attack-info" element={<AttackInfoPage />} />
					<Route path="/history" element={<HistoryPage />} />
					<Route path="/history-detail" element={<HistoryDetailPage />} />
					<Route path="/manage" element={<ManagePage />} />
					<Route path="/cve/:cveName" element={<CveDetailPage />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;
