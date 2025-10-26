/**
 * Demo Contract Functionality
 * 
 * This script demonstrates the deployed NFT Rental & Marketplace contract
 */

import { SuiClient } from '@mysten/sui/client';

// Contract addresses
const PACKAGE_ID = '0xd6893da229355f649d3fd0c3dc589ba6c01fd4fb15a18e0a6f15809e98abc8c9';
const MARKETPLACE_ID = '0x3c888f67f43fd87b90dbe95166d0234c9e08bce8910db4ce935a8ef67e93749e';

// Initialize Sui client
const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io:443' });

async function demoContract() {
  console.log('🚀 NFT Rental & Marketplace Contract Demo\n');
  
  try {
    // Demo 1: Get marketplace stats
    console.log('📊 Getting marketplace statistics...');
    const marketplace = await client.getObject({
      id: MARKETPLACE_ID,
      options: {
        showContent: true,
        showType: true,
      },
    });
    
    if (marketplace.data && marketplace.data.content) {
      const fields = marketplace.data.content.fields;
      console.log('✅ Marketplace Stats:');
      console.log(`   📈 Total Listings: ${fields.total_listings}`);
      console.log(`   🏠 Total Rentals: ${fields.total_rentals}`);
      console.log(`   💰 Platform Fee: ${fields.platform_fee_percentage}%`);
      console.log(`   📦 Listings Table: ${fields.listings.type}`);
      console.log(`   ⏰ Rentals Table: ${fields.rentals.type}`);
    }
    
    // Demo 2: Show available functions
    console.log('\n🔧 Available Contract Functions:');
    const functions = [
      'create_listing - Create NFT listings for rent or sale',
      'rent_nft - Rent an NFT for a specified duration', 
      'buy_nft - Purchase an NFT permanently',
      'cancel_listing - Cancel an existing listing',
      'check_rental_expiry - Check if a rental has expired',
      'is_nft_rented - Check if an NFT is currently rented',
      'get_marketplace_stats - Get marketplace statistics',
      'update_platform_fee - Update platform fee (admin only)'
    ];
    
    functions.forEach((func, index) => {
      console.log(`   ${index + 1}. ${func}`);
    });
    
    // Demo 3: Show contract capabilities
    console.log('\n🎯 Contract Capabilities:');
    console.log('   ✅ NFT Rental System');
    console.log('     - Time-based rentals with automatic expiry');
    console.log('     - Secure NFT locking using Sui Kiosk');
    console.log('     - Rental cost calculation based on duration');
    console.log('     - Automatic return to owner after expiry');
    
    console.log('\n   ✅ NFT Marketplace');
    console.log('     - Direct sales with ownership transfer');
    console.log('     - Platform fee system (configurable)');
    console.log('     - Listing management (create, cancel, update)');
    console.log('     - Payment handling with SUI tokens');
    
    console.log('\n   ✅ Security Features');
    console.log('     - Kiosk integration for secure NFT management');
    console.log('     - Ownership verification for all operations');
    console.log('     - Time-based access control for rentals');
    console.log('     - Platform fee collection for sustainability');
    
    // Demo 4: Show usage examples
    console.log('\n💻 Usage Examples:');
    console.log('   1. Create a Kiosk for your NFTs');
    console.log('   2. List NFTs for rent or sale');
    console.log('   3. Users can rent NFTs for temporary access');
    console.log('   4. Users can buy NFTs for permanent ownership');
    console.log('   5. Monitor rental expirations and returns');
    
    // Demo 5: Show integration options
    console.log('\n🔗 Integration Options:');
    console.log('   📱 React Frontend - Use react-hooks.ts');
    console.log('   💻 TypeScript SDK - Use typescript-integration.ts');
    console.log('   🧪 Testing - Use test_deployed_contract.ts');
    console.log('   📚 Documentation - See DEPLOYMENT_GUIDE.md');
    
    console.log('\n🎉 Contract is live and ready for use!');
    console.log(`\n📦 Contract Address: ${PACKAGE_ID}`);
    console.log(`🏪 Marketplace: ${MARKETPLACE_ID}`);
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo
demoContract().catch(console.error);
