import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './css/navbar.css';

function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 50) {
				setIsScrolled(true);
			} else {
				setIsScrolled(false);
			}
		};

		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	return (
		<header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
			<div className="navbar-logo">
				<Link to="/">CVE Manager</Link>
			</div>
			<nav className="navbar-links">
				<ul>
					<li>
						<Link to="/cve">CVE List</Link>
					</li>
					<li>
						<Link to="/attack">Attack</Link>
					</li>
					<li>
						<Link to="/history">History</Link>
					</li>
					<li>
						<Link to="/manage">Manage</Link>
					</li>
				</ul>
			</nav>
		</header>
	);
}

export default Navbar;
