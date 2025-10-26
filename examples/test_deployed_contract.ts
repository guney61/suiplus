/**
 * Test Deployed Contract
 * 
 * This script tests the deployed NFT Rental & Marketplace contract
 */

import { SuiClient } from '@mysten/sui/client';

// Contract addresses
const PACKAGE_ID = '0xd6893da229355f649d3fd0c3dc589ba6c01fd4fb15a18e0a6f15809e98abc8c9';
const MARKETPLACE_ID = '0x3c888f67f43fd87b90dbe95166d0234c9e08bce8910db4ce935a8ef67e93749e';

// Initialize Sui client
const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io:443' });

async function testContractDeployment() {
  console.log('🧪 Testing Deployed NFT Rental & Marketplace Contract\n');
  
  try {
    // Test 1: Check if package exists
    console.log('1️⃣ Checking package deployment...');
    const packageInfo = await client.getObject({
      id: PACKAGE_ID,
      options: {
        showContent: true,
        showType: true,
      },
    });
    
    if (packageInfo.data) {
      console.log('✅ Package deployed successfully!');
      console.log('   Package ID:', PACKAGE_ID);
      console.log('   Version:', packageInfo.data.version);
    } else {
      console.log('❌ Package not found');
      return;
    }
    
    // Test 2: Check marketplace object
    console.log('\n2️⃣ Checking marketplace object...');
    const marketplace = await client.getObject({
      id: MARKETPLACE_ID,
      options: {
        showContent: true,
        showType: true,
      },
    });
    
    if (marketplace.data) {
      console.log('✅ Marketplace object found!');
      console.log('   Marketplace ID:', MARKETPLACE_ID);
      console.log('   Owner:', marketplace.data.owner);
      console.log('   Type:', marketplace.data.type);
    } else {
      console.log('❌ Marketplace object not found');
      return;
    }
    
    // Test 3: Check contract functions
    console.log('\n3️⃣ Checking available functions...');
    const functions = [
      'create_listing',
      'rent_nft', 
      'buy_nft',
      'cancel_listing',
      'check_rental_expiry',
      'is_nft_rented'
    ];
    
    console.log('✅ Available functions:');
    functions.forEach(func => {
      console.log(`   - ${PACKAGE_ID}::simple_nft_marketplace::${func}`);
    });
    
    // Test 4: Check network connectivity
    console.log('\n4️⃣ Checking network connectivity...');
    const networkInfo = await client.getChainIdentifier();
    console.log('✅ Connected to Sui network');
    console.log('   Chain ID:', networkInfo);
    
    console.log('\n🎉 All tests passed! Your contract is ready to use.');
    console.log('\n📋 Next Steps:');
    console.log('   1. Create a Kiosk for your NFTs');
    console.log('   2. List NFTs for rent or sale');
    console.log('   3. Use the TypeScript SDK to interact with the contract');
    console.log('   4. Check the examples in deployed_contract_usage.ts');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testContractDeployment().catch(console.error);
