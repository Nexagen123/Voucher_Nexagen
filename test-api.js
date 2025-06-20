// Simple test script to check API endpoints
const API_BASE_URL = 'http://localhost:5000/api';

// For Node.js environment, we need to use node-fetch or a similar library
// But for simplicity, let's use the built-in fetch (Node 18+)
const fetch = globalThis.fetch || require('node-fetch');

async function testAPI() {
  console.log('Testing API endpoints...\n');

  // Test 1: Check if server is running
  try {
    console.log('1. Testing server connection...');
    const response = await fetch(`${API_BASE_URL}/categories/test`);
    const data = await response.json();
    console.log('✅ Server is running:', data.message);
  } catch (error) {
    console.log('❌ Server connection failed:', error.message);
    return;
  }

  // Test 2: Get categories
  try {
    console.log('\n2. Testing GET /categories...');
    const response = await fetch(`${API_BASE_URL}/categories`);
    const data = await response.json();
    console.log('✅ Categories endpoint working:', data.success ? 'Success' : 'Failed');
    console.log('Categories count:', data.data?.length || 0);
  } catch (error) {
    console.log('❌ Categories GET failed:', error.message);
  }

  // Test 3: Get inventory
  try {
    console.log('\n3. Testing GET /inventory...');
    const response = await fetch(`${API_BASE_URL}/inventory`);
    const data = await response.json();
    console.log('✅ Inventory endpoint working:', data.success ? 'Success' : 'Failed');
    console.log('Inventory count:', data.data?.items?.length || data.data?.length || 0);
  } catch (error) {
    console.log('❌ Inventory GET failed:', error.message);
  }

  // Test 4: Create a test category
  try {
    console.log('\n4. Testing POST /categories...');
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Category ' + Date.now(),
        description: 'Test category created by API test'
      })
    });
    const data = await response.json();
    console.log('✅ Category creation:', data.success ? 'Success' : 'Failed');
    if (data.success) {
      console.log('Created category ID:', data.data._id);
    } else {
      console.log('Error:', data.message);
    }
  } catch (error) {
    console.log('❌ Category POST failed:', error.message);
  }

  console.log('\n🎉 API testing completed!');
}

// Run the test
testAPI();
