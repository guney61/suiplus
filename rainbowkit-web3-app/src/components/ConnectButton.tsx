import React from 'react';
import { useWallet } from '../hooks/useWallet';

const ConnectButton: React.FC = () => {
    const { connect, disconnect, connected } = useWallet();

    return (
        <button onClick={connected ? disconnect : connect}>
            {connected ? 'Disconnect Wallet' : 'Connect Wallet'}
        </button>
    );
};

export default ConnectButton;