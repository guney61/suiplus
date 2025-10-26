# 🚀 NFT Rental & Marketplace - Deployment Guide

## ✅ Contract Successfully Deployed!

Your NFT Rental & Marketplace contract is now live on the Sui network and ready for use!

### 📦 Contract Information

- **Package ID:** `0xd6893da229355f649d3fd0c3dc589ba6c01fd4fb15a18e0a6f15809e98abc8c9`
- **Marketplace ID:** `0x3c888f67f43fd87b90dbe95166d0234c9e08bce8910db4ce935a8ef67e93749e`
- **Marketplace Cap ID:** `0xe7817b8496ce762ae580b3614dc0d362f66623eba5bb24a01abffb1a72addfb2`
- **Transaction Digest:** `CHSxveVryFSJMTMPmpDJswEft5yrxdvTwBrWQpsUE6W2`

### 🎯 Available Functions

The deployed contract includes the following functions:

#### Core Marketplace Functions
- `create_listing` - Create NFT listings for rent or sale
- `rent_nft` - Rent an NFT for a specified duration
- `buy_nft` - Purchase an NFT permanently
- `cancel_listing` - Cancel an existing listing

#### Management Functions
- `check_rental_expiry` - Check if a rental has expired
- `is_nft_rented` - Check if an NFT is currently rented
- `get_marketplace_stats` - Get marketplace statistics
- `update_platform_fee` - Update platform fee (admin only)

### 💻 Usage Examples

#### 1. Create a Rental Listing

```typescript
import { TransactionBlock } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';

const PACKAGE_ID = '0xd6893da229355f649d3fd0c3dc589ba6c01fd4fb15a18e0a6f15809e98abc8c9';
const MARKETPLACE_ID = '0x3c888f67f43fd87b90dbe95166d0234c9e08bce8910db4ce935a8ef67e93749e';

// Create rental listing
const txb = new TransactionBlock();
txb.moveCall({
  target: `${PACKAGE_ID}::simple_nft_marketplace::create_listing`,
  arguments: [
    txb.object(MARKETPLACE_ID),
    txb.object(kioskId),
    txb.object(kioskOwnerCapId),
    txb.pure.id(nftId),
    txb.pure.u64(price), // Price in MIST
    txb.pure.u64(duration), // Duration in milliseconds
    txb.pure.u8(1), // ListingType::Rental
  ],
});
```

#### 2. Rent an NFT

```typescript
// Rent NFT
const txb = new TransactionBlock();
const clock = txb.object('0x6'); // Clock object

txb.moveCall({
  target: `${PACKAGE_ID}::simple_nft_marketplace::rent_nft`,
  arguments: [
    txb.object(MARKETPLACE_ID),
    txb.pure.id(listingId),
    txb.object(paymentCoinId),
    clock,
  ],
});
```

#### 3. Buy an NFT

```typescript
// Buy NFT
const txb = new TransactionBlock();
txb.moveCall({
  target: `${PACKAGE_ID}::simple_nft_marketplace::buy_nft`,
  arguments: [
    txb.object(MARKETPLACE_ID),
    txb.pure.id(listingId),
    txb.object(paymentCoinId),
  ],
});
```

### 🔧 Setup Requirements

#### 1. Install Dependencies

```bash
npm install @mysten/sui
```

#### 2. Initialize Client

```typescript
import { SuiClient } from '@mysten/sui/client';
import { TransactionBlock } from '@mysten/sui/transactions';

const client = new SuiClient({ 
  url: 'https://fullnode.mainnet.sui.io:443' 
});
```

#### 3. Create a Kiosk

Before listing NFTs, you need to create a Kiosk:

```typescript
import { createKiosk } from '@mysten/kiosk';

// Create kiosk for NFT management
const { kioskId, kioskOwnerCapId } = await createKiosk(signer);
```

### 📊 Contract Features

#### NFT Rental System
- **Time-based rentals** with automatic expiry
- **Secure NFT locking** using Sui Kiosk framework
- **Rental cost calculation** based on duration
- **Automatic return** to owner after expiry

#### NFT Marketplace
- **Direct sales** with ownership transfer
- **Platform fee system** (configurable)
- **Listing management** (create, cancel, update)
- **Payment handling** with SUI tokens

#### Security Features
- **Kiosk integration** for secure NFT management
- **Ownership verification** for all operations
- **Time-based access control** for rentals
- **Platform fee collection** for sustainability

### 🎮 Example Workflows

#### Workflow 1: List NFT for Rental
1. Create a Kiosk
2. Lock your NFT in the Kiosk
3. Create a rental listing with price and duration
4. Users can rent the NFT for the specified time
5. NFT automatically returns to owner after expiry

#### Workflow 2: List NFT for Sale
1. Create a Kiosk
2. Lock your NFT in the Kiosk
3. Create a sale listing with price
4. Users can buy the NFT permanently
5. Ownership transfers to buyer

#### Workflow 3: Rent an NFT
1. Browse available rental listings
2. Pay the rental fee
3. Get temporary access to the NFT
4. Use the NFT until rental expires
5. NFT automatically returns to owner

### 📈 Monitoring & Analytics

#### Get Marketplace Stats
```typescript
const stats = await client.getObject({
  id: MARKETPLACE_ID,
  options: { showContent: true }
});
```

#### Check NFT Status
```typescript
const isRented = await client.getObject({
  id: nftId,
  options: { showContent: true }
});
```

### 🔗 Integration Examples

Check the `/examples/` directory for:
- `deployed_contract_usage.ts` - Complete usage examples
- `typescript-integration.ts` - SDK integration
- `react-hooks.ts` - React frontend hooks
- `package.json` - Dependencies

### 🚀 Next Steps

1. **Create your first Kiosk** for NFT management
2. **List NFTs** for rent or sale
3. **Build a frontend** using the provided examples
4. **Integrate with your application** using the TypeScript SDK

### 📞 Support

- **Contract Address:** `0xd6893da229355f649d3fd0c3dc589ba6c01fd4fb15a18e0a6f15809e98abc8c9`
- **Marketplace:** `0x3c888f67f43fd87b90dbe95166d0234c9e08bce8910db4ce935a8ef67e93749e`
- **Documentation:** See `/README.md` for detailed contract documentation

---

🎉 **Your NFT Rental & Marketplace is now live and ready for users!**
