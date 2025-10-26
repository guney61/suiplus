import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

const useWallet = () => {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    if (isConnected) {
      setWallet(address);
    } else {
      setWallet(null);
    }
  }, [isConnected, address]);

  const connectWallet = async (connector) => {
    await connect(connector);
  };

  const disconnectWallet = async () => {
    await disconnect();
  };

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    connectors,
  };
};

export default useWallet;