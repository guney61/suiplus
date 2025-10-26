# TypeScript/React Integration for NFT Rental & Marketplace

This directory contains TypeScript and React integration examples for the NFT Rental & Marketplace smart contract.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd examples
npm install
```

### 2. Configure Your Contract

Update the contract addresses in `typescript-integration.ts`:

```typescript
const MARKETPLACE_PACKAGE_ID = '0x...'; // Your deployed package ID
const MARKETPLACE_OBJECT_ID = '0x...'; // Your marketplace object ID
```

### 3. Use in Your React App

```typescript
import { useMarketplace, useListings, useRentals } from './react-hooks';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';

function App() {
  const signer = Ed25519Keypair.deriveKeypair('your-seed-phrase');
  const { state, actions } = useMarketplace(signer);
  
  return (
    <div>
      <h1>NFT Marketplace</h1>
      {state.loading && <p>Loading...</p>}
      {state.error && <p>Error: {state.error}</p>}
      {/* Your marketplace UI */}
    </div>
  );
}
```

## 📚 Available Hooks

### `useMarketplace(signer)`
Main hook for marketplace operations.

```typescript
const { state, actions } = useMarketplace(signer);

// State
state.listings        // All listings
state.rentals         // All rentals
state.stats          // Marketplace statistics
state.loading        // Loading state
state.error          // Error messages

// Actions
actions.createListing(params)     // Create new listing
actions.rentNFT(id, amount)        // Rent an NFT
actions.buyNFT(id, kiosk, cap, amount) // Buy an NFT
actions.lockNFT(params)        // Lock NFT in kiosk
actions.unlockNFT(params)      // Unlock NFT from kiosk
actions.processExpiredRentals(ids) // Process expired rentals
actions.refreshData()          // Refresh all data
```

### `useListings(signer)`
Hook for managing NFT listings.

```typescript
const { 
  myListings,        // Your listings
  availableListings, // Available to rent/buy
  createListing,     // Create new listing
  cancelListing,     // Cancel listing
  loading, 
  error 
} = useListings(signer);
```

### `useRentals(signer)`
Hook for managing rentals.

```typescript
const { 
  myRentals,           // Rentals you own
  rentedToMe,          // NFTs you're renting
  expiredRentals,      // Expired rentals
  rentNFT,             // Rent an NFT
  processExpiredRentals, // Process expired rentals
  loading, 
  error 
} = useRentals(signer);
```

### `useMarketplaceStats()`
Hook for marketplace statistics.

```typescript
const { 
  stats,    // Marketplace statistics
  loading,  // Loading state
  error,    // Error messages
  refresh   // Refresh function
} = useMarketplaceStats();
```

### `useRentalCost()`
Hook for rental cost calculations.

```typescript
const { 
  calculateCost,        // Calculate cost for duration
  calculateDailyCost,   // Calculate daily cost
  calculateHourlyCost   // Calculate hourly cost
} = useRentalCost();
```

### `useRentalExpiry()`
Hook for checking rental expiry.

```typescript
const { 
  expiredRentals,  // List of expired rental IDs
  checking,        // Checking state
  checkExpiry,     // Check expiry for rental IDs
  clearExpired     // Clear expired list
} = useRentalExpiry();
```

## 🔧 Kiosk Integration

### Lock NFT in Kiosk

```typescript
import { lock } from '@mysten/kiosk';

const tx = new TransactionBuilder();

// Lock NFT in kiosk for listing
await lockNFTInKiosk(signer, {
  kioskId: '0x...',
  kioskOwnerCapId: '0x...',
  nftId: '0x...',
  nftType: '0x...::game_nft::GameItem',
  transferPolicyId: '0x...' // Optional
});
```

### Unlock NFT from Kiosk

```typescript
// Unlock NFT after rental expiry or cancellation
await unlockNFTFromKiosk(signer, {
  kioskId: '0x...',
  kioskOwnerCapId: '0x...',
  nftId: '0x...',
  nftType: '0x...::game_nft::GameItem'
});
```

## 📝 Example Usage

### Complete Listing Flow

```typescript
import { useMarketplace } from './react-hooks';

function CreateListingComponent() {
  const signer = Ed25519Keypair.deriveKeypair('your-seed-phrase');
  const { actions } = useMarketplace(signer);
  
  const handleCreateListing = async () => {
    // 1. Lock NFT in kiosk first
    await actions.lockNFT({
      kioskId: '0x...',
      kioskOwnerCapId: '0x...',
      nftId: '0x...',
      nftType: '0x...::game_nft::GameItem'
    });
    
    // 2. Create listing
    await actions.createListing({
      kioskId: '0x...',
      kioskOwnerCapId: '0x...',
      nftId: '0x...',
      salePrice: 1000,      // 1000 SUI
      rentalPrice: 10,      // 10 SUI per day
      duration: 86400000,   // 1 day in milliseconds
      listingType: 'Both'   // Available for both rent and sale
    });
  };
  
  return (
    <button onClick={handleCreateListing}>
      Create Listing
    </button>
  );
}
```

### Rental Flow

```typescript
function RentNFTComponent({ listingId }: { listingId: string }) {
  const signer = Ed25519Keypair.deriveKeypair('your-seed-phrase');
  const { actions } = useMarketplace(signer);
  
  const handleRent = async () => {
    const rentalCost = calculateRentalCost(10, 86400000); // 10 SUI/day for 1 day
    await actions.rentNFT(listingId, rentalCost);
  };
  
  return (
    <button onClick={handleRent}>
      Rent NFT (10 SUI/day)
    </button>
  );
}
```

### Purchase Flow

```typescript
function BuyNFTComponent({ listingId }: { listingId: string }) {
  const signer = Ed25519Keypair.deriveKeypair('your-seed-phrase');
  const { actions } = useMarketplace(signer);
  
  const handleBuy = async () => {
    await actions.buyNFT(
      listingId,
      '0x...', // kiosk ID
      '0x...', // kiosk owner cap ID
      1000     // 1000 SUI payment
    );
  };
  
  return (
    <button onClick={handleBuy}>
      Buy NFT (1000 SUI)
    </button>
  );
}
```

## 🎯 Event Listening

The integration automatically listens for marketplace events:

```typescript
// Events are automatically handled by the hooks
// You can also listen manually:

import { listenToMarketplaceEvents } from './typescript-integration';

const unsubscribe = listenToMarketplaceEvents();

// Clean up
unsubscribe();
```

## 🔒 Security Notes

1. **Never expose private keys** in frontend code
2. **Use environment variables** for sensitive configuration
3. **Validate all inputs** before sending transactions
4. **Handle errors gracefully** in your UI
5. **Test thoroughly** on testnet before mainnet deployment

## 🚀 Deployment

1. Deploy your Move smart contract
2. Update contract addresses in the integration files
3. Install dependencies: `npm install`
4. Build: `npm run build`
5. Deploy your React app

## 📞 Support

For questions about the integration:
1. Check the Move smart contract documentation
2. Review the Sui TypeScript SDK docs
3. Test with the provided examples
4. Open an issue for specific problems

---

**Happy building! 🚀**
