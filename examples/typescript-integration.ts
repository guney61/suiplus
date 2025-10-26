/**
 * TypeScript Integration Examples for NFT Rental & Marketplace
 * 
 * This file demonstrates how to integrate the Move smart contract
 * with the Sui TypeScript SDK for frontend applications.
 */

import { TransactionBuilder, SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { lock, unlock, purchaseAndResolvePolicies } from '@mysten/kiosk';
import { SUI_TYPE_ARG } from '@mysten/sui.js/utils';

// ===== CONFIGURATION =====

const NETWORK = 'testnet'; // or 'mainnet'
const RPC_URL = getFullnodeUrl(NETWORK);
const client = new SuiClient({ url: RPC_URL });

// Contract addresses (replace with your deployed contract addresses)
const MARKETPLACE_PACKAGE_ID = '0x...'; // Your deployed package ID
const MARKETPLACE_OBJECT_ID = '0x...'; // Your marketplace object ID

// ===== TYPES =====

export interface NFTListing {
  id: string;
  owner: string;
  renter?: string;
  price: number;
  rental_price: number;
  duration: number;
  start_time: number;
  status: 'Available' | 'Rented' | 'Sold' | 'Cancelled';
  listing_type: 'Rental' | 'Sale' | 'Both';
  nft_id: string;
  kiosk_id: string;
  created_at: number;
}

export interface RentalAgreement {
  id: string;
  nft_id: string;
  owner: string;
  renter: string;
  start_time: number;
  duration: number;
  daily_price: number;
  total_payment: number;
  is_active: boolean;
}

// ===== MARKETPLACE OPERATIONS =====

/**
 * Create a new NFT listing for rent and/or sale
 */
export async function createListing(
  signer: Ed25519Keypair,
  kioskId: string,
  kioskOwnerCapId: string,
  nftId: string,
  salePrice: number,
  rentalPrice: number,
  duration: number,
  listingType: 'Rental' | 'Sale' | 'Both'
) {
  const tx = new TransactionBuilder();
  
  // Get the clock object
  const clock = await client.getClock();
  
  // Create the listing
  tx.moveCall({
    target: `${MARKETPLACE_PACKAGE_ID}::nft_rental_marketplace::create_listing`,
    arguments: [
      tx.object(MARKETPLACE_OBJECT_ID), // marketplace
      tx.object(kioskId),              // kiosk
      tx.object(kioskOwnerCapId),     // kiosk_cap
      tx.pure.string(nftId),          // nft_id
      tx.pure.u64(salePrice),         // price
      tx.pure.u64(rentalPrice),       // rental_price
      tx.pure.u64(duration),          // duration
      tx.pure.u8(listingType === 'Rental' ? 0 : listingType === 'Sale' ? 1 : 2), // listing_type
      tx.object(clock.digest),        // clock
    ],
  });

  const result = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
    options: {
      showEffects: true,
      showEvents: true,
    },
  });

  return result;
}

/**
 * Rent an NFT for a specified duration
 */
export async function rentNFT(
  signer: Ed25519Keypair,
  listingId: string,
  paymentAmount: number
) {
  const tx = new TransactionBuilder();
  
  // Get the clock object
  const clock = await client.getClock();
  
  // Split coins for payment
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(paymentAmount)]);
  
  // Rent the NFT
  tx.moveCall({
    target: `${MARKETPLACE_PACKAGE_ID}::nft_rental_marketplace::rent_nft`,
    arguments: [
      tx.object(MARKETPLACE_OBJECT_ID), // marketplace
      tx.pure.string(listingId),        // listing_id
      coin,                             // payment
      tx.object(clock.digest),          // clock
    ],
  });

  const result = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
    options: {
      showEffects: true,
      showEvents: true,
    },
  });

  return result;
}

/**
 * Buy an NFT (permanent ownership transfer)
 */
export async function buyNFT(
  signer: Ed25519Keypair,
  listingId: string,
  kioskId: string,
  kioskOwnerCapId: string,
  paymentAmount: number
) {
  const tx = new TransactionBuilder();
  
  // Split coins for payment
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(paymentAmount)]);
  
  // Buy the NFT
  tx.moveCall({
    target: `${MARKETPLACE_PACKAGE_ID}::nft_rental_marketplace::buy_nft`,
    arguments: [
      tx.object(MARKETPLACE_OBJECT_ID), // marketplace
      tx.pure.string(listingId),        // listing_id
      coin,                             // payment
      tx.object(kioskId),              // kiosk
      tx.object(kioskOwnerCapId),      // kiosk_cap
    ],
  });

  const result = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
    options: {
      showEffects: true,
      showEvents: true,
    },
  });

  return result;
}

/**
 * Lock an NFT in a kiosk for listing
 */
export async function lockNFTInKiosk(
  signer: Ed25519Keypair,
  kioskId: string,
  kioskOwnerCapId: string,
  nftId: string,
  nftType: string,
  transferPolicyId?: string
) {
  const tx = new TransactionBuilder();
  
  // If no transfer policy, create a basic one or use existing
  const policyId = transferPolicyId || '0x...'; // Replace with actual policy ID
  
  // Lock the NFT in the kiosk
  lock(tx, nftType, tx.object(kioskId), tx.object(kioskOwnerCapId), tx.object(policyId), tx.object(nftId));

  const result = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
    options: {
      showEffects: true,
      showEvents: true,
    },
  });

  return result;
}

/**
 * Unlock an NFT from a kiosk (after rental expiry or cancellation)
 */
export async function unlockNFTFromKiosk(
  signer: Ed25519Keypair,
  kioskId: string,
  kioskOwnerCapId: string,
  nftId: string,
  nftType: string
) {
  const tx = new TransactionBuilder();
  
  // Unlock the NFT from the kiosk
  unlock(tx, nftType, tx.object(kioskId), tx.object(kioskOwnerCapId), tx.object(nftId));

  const result = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
    options: {
      showEffects: true,
      showEvents: true,
    },
  });

  return result;
}

// ===== QUERY OPERATIONS =====

/**
 * Get marketplace statistics
 */
export async function getMarketplaceStats() {
  const marketplace = await client.getObject({
    id: MARKETPLACE_OBJECT_ID,
    options: { showContent: true },
  });

  if (marketplace.data?.content && 'fields' in marketplace.data.content) {
    const fields = marketplace.data.content.fields;
    return {
      totalListings: Number(fields.total_listings),
      totalRentals: Number(fields.total_rentals),
      platformFeePercentage: Number(fields.platform_fee_percentage),
    };
  }

  return null;
}

/**
 * Get a specific listing
 */
export async function getListing(listingId: string): Promise<NFTListing | null> {
  try {
    const result = await client.devInspectTransaction({
      transaction: new TransactionBuilder().moveCall({
        target: `${MARKETPLACE_PACKAGE_ID}::nft_rental_marketplace::get_listing`,
        arguments: [
          tx.object(MARKETPLACE_OBJECT_ID),
          tx.pure.string(listingId),
        ],
      }),
    });

    // Parse the result and return as NFTListing
    // This would need to be implemented based on the actual return structure
    return null; // Placeholder
  } catch (error) {
    console.error('Error fetching listing:', error);
    return null;
  }
}

/**
 * Get a specific rental agreement
 */
export async function getRental(rentalId: string): Promise<RentalAgreement | null> {
  try {
    const result = await client.devInspectTransaction({
      transaction: new TransactionBuilder().moveCall({
        target: `${MARKETPLACE_PACKAGE_ID}::nft_rental_marketplace::get_rental`,
        arguments: [
          tx.object(MARKETPLACE_OBJECT_ID),
          tx.pure.string(rentalId),
        ],
      }),
    });

    // Parse the result and return as RentalAgreement
    return null; // Placeholder
  } catch (error) {
    console.error('Error fetching rental:', error);
    return null;
  }
}

// ===== EVENT LISTENING =====

/**
 * Listen for marketplace events
 */
export function listenToMarketplaceEvents() {
  const unsubscribe = client.subscribeEvent({
    filter: { Package: MARKETPLACE_PACKAGE_ID },
    onMessage: (event) => {
      console.log('Marketplace Event:', event);
      
      switch (event.type) {
        case 'NFTListed':
          console.log('New NFT listed:', event.parsedJson);
          break;
        case 'NFTRented':
          console.log('NFT rented:', event.parsedJson);
          break;
        case 'NFTSold':
          console.log('NFT sold:', event.parsedJson);
          break;
        case 'RentalExpired':
          console.log('Rental expired:', event.parsedJson);
          break;
        case 'ListingCancelled':
          console.log('Listing cancelled:', event.parsedJson);
          break;
      }
    },
  });

  return unsubscribe;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Calculate rental cost for a given duration
 */
export function calculateRentalCost(rentalPrice: number, durationMs: number): number {
  const days = Math.ceil(durationMs / (24 * 60 * 60 * 1000));
  return rentalPrice * days;
}

/**
 * Check if a rental has expired
 */
export async function isRentalExpired(rentalId: string): Promise<boolean> {
  try {
    const result = await client.devInspectTransaction({
      transaction: new TransactionBuilder().moveCall({
        target: `${MARKETPLACE_PACKAGE_ID}::nft_rental_marketplace::is_rental_expired`,
        arguments: [
          tx.object(MARKETPLACE_OBJECT_ID),
          tx.pure.string(rentalId),
          tx.object(await client.getClock().then(c => c.digest)),
        ],
      }),
    });

    return result.effects?.status?.status === 'success';
  } catch (error) {
    console.error('Error checking rental expiry:', error);
    return false;
  }
}

/**
 * Process rental expiry (return NFT to owner)
 */
export async function processRentalExpiry(
  signer: Ed25519Keypair,
  rentalId: string
) {
  const tx = new TransactionBuilder();
  
  const clock = await client.getClock();
  
  tx.moveCall({
    target: `${MARKETPLACE_PACKAGE_ID}::nft_rental_marketplace::check_rental_expiry`,
    arguments: [
      tx.object(MARKETPLACE_OBJECT_ID), // marketplace
      tx.pure.string(rentalId),        // rental_id
      tx.object(clock.digest),          // clock
    ],
  });

  const result = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
    options: {
      showEffects: true,
      showEvents: true,
    },
  });

  return result;
}

// ===== EXAMPLE USAGE =====

/**
 * Complete example: List an NFT for rent and sale
 */
export async function exampleListNFT() {
  const signer = Ed25519Keypair.deriveKeypair('your-seed-phrase');
  
  // 1. Lock NFT in kiosk
  await lockNFTInKiosk(
    signer,
    '0x...', // kiosk ID
    '0x...', // kiosk owner cap ID
    '0x...', // NFT ID
    '0x...::game_nft::GameItem', // NFT type
    '0x...'  // transfer policy ID
  );
  
  // 2. Create listing
  await createListing(
    signer,
    '0x...', // kiosk ID
    '0x...', // kiosk owner cap ID
    '0x...', // NFT ID
    1000,    // sale price (1000 SUI)
    10,      // rental price (10 SUI per day)
    86400000, // duration (1 day in milliseconds)
    'Both'   // listing type
  );
}

/**
 * Complete example: Rent an NFT
 */
export async function exampleRentNFT() {
  const signer = Ed25519Keypair.deriveKeypair('your-seed-phrase');
  
  // Rent NFT for 1 day (10 SUI)
  await rentNFT(
    signer,
    '0x...', // listing ID
    10       // payment amount
  );
}

/**
 * Complete example: Buy an NFT
 */
export async function exampleBuyNFT() {
  const signer = Ed25519Keypair.deriveKeypair('your-seed-phrase');
  
  // Buy NFT for 1000 SUI
  await buyNFT(
    signer,
    '0x...', // listing ID
    '0x...', // kiosk ID
    '0x...', // kiosk owner cap ID
    1000     // payment amount
  );
}
