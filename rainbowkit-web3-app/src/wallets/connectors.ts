import { InjectedConnector } from '@rainbow-me/rainbowkit';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';

export const connectors = ({ chainId }) => {
  return [
    new InjectedConnector({ chains: [chainId] }),
    new WalletConnectConnector({
      chains: [chainId],
      options: {
        qrcode: true,
      },
    }),
    new CoinbaseWalletConnector({
      chains: [chainId],
      options: {
        appName: 'RainbowKit Web3 App',
      },
    }),
  ];
};