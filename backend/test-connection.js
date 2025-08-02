// Test script to verify backend connectivity
async function testConnection() {
  try {
    console.log('Testing backend connection...');
    
    const response = await fetch('http://localhost:5000/api/test');
    const data = await response.json();
    
    console.log('✅ Backend is reachable!');
    console.log('Response:', data);
    
    // Test auth endpoints
    console.log('\nTesting auth endpoints...');
    
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@smartcycle.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection(); 