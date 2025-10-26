import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { WagmiConfig, createClient } from 'wagmi';

const { chains, provider } = getDefaultWallets({
  appName: 'RainbowKit Web3 App',
});

const client = createClient({
  autoConnect: true,
  provider,
});

ReactDOM.render(
  <WagmiConfig client={client}>
    <RainbowKitProvider chains={chains}>
      <App />
    </RainbowKitProvider>
  </WagmiConfig>,
  document.getElementById('root')
);