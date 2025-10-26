/**
 * Deployed Contract Usage Examples
 * 
 * This file demonstrates how to interact with the deployed NFT Rental & Marketplace contract
 * Package ID: 0xd6893da229355f649d3fd0c3dc589ba6c01fd4fb15a18e0a6f15809e98abc8c9
 * Marketplace: 0x3c888f67f43fd87b90dbe95166d0234c9e08bce8910db4ce935a8ef67e93749e
 */

import { TransactionBlock } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

// Contract addresses
const PACKAGE_ID = '0xd6893da229355f649d3fd0c3dc589ba6c01fd4fb15a18e0a6f15809e98abc8c9';
const MARKETPLACE_ID = '0x3c888f67f43fd87b90dbe95166d0234c9e08bce8910db4ce935a8ef67e93749e';
const MARKETPLACE_CAP_ID = '0xe7817b8496ce762ae580b3614dc0d362f66623eba5bb24a01abffb1a72addfb2';

// Initialize Sui client
const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io:443' });

/**
 * Example 1: Create a listing for NFT rental
 */
export async function createRentalListing(
  signer: Ed25519Keypair,
  kioskId: string,
  kioskOwnerCapId: string,
  nftId: string,
  price: number,
  duration: number
) {
  const txb = new TransactionBlock();
  
  // Create a rental listing
  txb.moveCall({
    target: `${PACKAGE_ID}::simple_nft_marketplace::create_listing`,
    arguments: [
      txb.object(MARKETPLACE_ID),
      txb.object(kioskId),
      txb.object(kioskOwnerCapId),
      txb.pure.id(nftId),
      txb.pure.u64(price),
      txb.pure.u64(duration),
      txb.pure.u8(1), // ListingType::Rental
    ],
  });

  const result = await client.signAndExecuteTransactionBlock({
    transactionBlock: txb,
    signer,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  console.log('Rental listing created:', result);
  return result;
}

/**
 * Example 2: Create a listing for NFT sale
 */
export async function createSaleListing(
  signer: Ed25519Keypair,
  kioskId: string,
  kioskOwnerCapId: string,
  nftId: string,
  price: number
) {
  const txb = new TransactionBlock();
  
  // Create a sale listing
  txb.moveCall({
    target: `${PACKAGE_ID}::simple_nft_marketplace::create_listing`,
    arguments: [
      txb.object(MARKETPLACE_ID),
      txb.object(kioskId),
      txb.object(kioskOwnerCapId),
      txb.pure.id(nftId),
      txb.pure.u64(price),
      txb.pure.u64(0), // No duration for sale
      txb.pure.u8(0), // ListingType::Sale
    ],
  });

  const result = await client.signAndExecuteTransactionBlock({
    transactionBlock: txb,
    signer,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  console.log('Sale listing created:', result);
  return result;
}

/**
 * Example 3: Rent an NFT
 */
export async function rentNFT(
  signer: Ed25519Keypair,
  listingId: string,
  paymentCoinId: string
) {
  const txb = new TransactionBlock();
  
  // Get clock object
  const clock = txb.object('0x6');
  
  // Rent the NFT
  txb.moveCall({
    target: `${PACKAGE_ID}::simple_nft_marketplace::rent_nft`,
    arguments: [
      txb.object(MARKETPLACE_ID),
      txb.pure.id(listingId),
      txb.object(paymentCoinId),
      clock,
    ],
  });

  const result = await client.signAndExecuteTransactionBlock({
    transactionBlock: txb,
    signer,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  console.log('NFT rented:', result);
  return result;
}

/**
 * Example 4: Buy an NFT
 */
export async function buyNFT(
  signer: Ed25519Keypair,
  listingId: string,
  paymentCoinId: string
) {
  const txb = new TransactionBlock();
  
  // Buy the NFT
  txb.moveCall({
    target: `${PACKAGE_ID}::simple_nft_marketplace::buy_nft`,
    arguments: [
      txb.object(MARKETPLACE_ID),
      txb.pure.id(listingId),
      txb.object(paymentCoinId),
    ],
  });

  const result = await client.signAndExecuteTransactionBlock({
    transactionBlock: txb,
    signer,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  console.log('NFT purchased:', result);
  return result;
}

/**
 * Example 5: Check if an NFT is currently rented
 */
export async function checkNFTStatus(nftId: string) {
  try {
    const result = await client.getObject({
      id: nftId,
      options: {
        showContent: true,
        showType: true,
      },
    });
    
    console.log('NFT Status:', result);
    return result;
  } catch (error) {
    console.error('Error checking NFT status:', error);
    return null;
  }
}

/**
 * Example 6: Get marketplace statistics
 */
export async function getMarketplaceStats() {
  try {
    const marketplace = await client.getObject({
      id: MARKETPLACE_ID,
      options: {
        showContent: true,
        showType: true,
      },
    });
    
    console.log('Marketplace Stats:', marketplace);
    return marketplace;
  } catch (error) {
    console.error('Error getting marketplace stats:', error);
    return null;
  }
}

/**
 * Example 7: Cancel a listing
 */
export async function cancelListing(
  signer: Ed25519Keypair,
  listingId: string
) {
  const txb = new TransactionBlock();
  
  // Cancel the listing
  txb.moveCall({
    target: `${PACKAGE_ID}::simple_nft_marketplace::cancel_listing`,
    arguments: [
      txb.object(MARKETPLACE_ID),
      txb.pure.id(listingId),
    ],
  });

  const result = await client.signAndExecuteTransactionBlock({
    transactionBlock: txb,
    signer,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  console.log('Listing cancelled:', result);
  return result;
}

/**
 * Example 8: Check rental expiry
 */
export async function checkRentalExpiry(
  signer: Ed25519Keypair,
  rentalId: string
) {
  const txb = new TransactionBlock();
  
  // Get clock object
  const clock = txb.object('0x6');
  
  // Check rental expiry
  txb.moveCall({
    target: `${PACKAGE_ID}::simple_nft_marketplace::check_rental_expiry`,
    arguments: [
      txb.object(MARKETPLACE_ID),
      txb.pure.id(rentalId),
      clock,
    ],
  });

  const result = await client.signAndExecuteTransactionBlock({
    transactionBlock: txb,
    signer,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  console.log('Rental expiry checked:', result);
  return result;
}

// Example usage
export async function runExamples() {
  console.log('🚀 NFT Rental & Marketplace Contract Examples');
  console.log('Package ID:', PACKAGE_ID);
  console.log('Marketplace ID:', MARKETPLACE_ID);
  console.log('Marketplace Cap ID:', MARKETPLACE_CAP_ID);
  
  // Get marketplace stats
  await getMarketplaceStats();
  
  console.log('\n✅ Examples ready to use!');
  console.log('Use the exported functions to interact with your deployed contract.');
}

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}
