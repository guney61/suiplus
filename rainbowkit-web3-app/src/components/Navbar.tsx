import React from 'react';
import { Link } from 'react-router-dom';
import ConnectButton from './ConnectButton';

const Navbar: React.FC = () => {
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                {/* Add more links as needed */}
            </ul>
            <ConnectButton />
        </nav>
    );
};

export default Navbar;