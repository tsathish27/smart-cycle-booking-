// Test script to verify admin endpoints
async function testAdminEndpoints() {
  try {
    console.log('Testing admin endpoints...');
    
    // Test admin login
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
    
    if (!loginData.success) {
      console.error('❌ Login failed');
      return;
    }
    
    const token = loginData.token;
    console.log('✅ Login successful, token received');
    
    // Test admin dashboard
    const dashboardResponse = await fetch('http://localhost:5000/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const dashboardData = await dashboardResponse.json();
    console.log('Dashboard response:', dashboardData);
    
    // Test stations endpoint
    const stationsResponse = await fetch('http://localhost:5000/api/admin/stations', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const stationsData = await stationsResponse.json();
    console.log('Stations response:', stationsData);
    
    // Test cycles endpoint
    const cyclesResponse = await fetch('http://localhost:5000/api/admin/cycles', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const cyclesData = await cyclesResponse.json();
    console.log('Cycles response:', cyclesData);
    
    // Test users endpoint
    const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const usersData = await usersResponse.json();
    console.log('Users response:', usersData);
    
    // Test analytics endpoint
    const analyticsResponse = await fetch('http://localhost:5000/api/admin/analytics/rides?period=7d', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const analyticsData = await analyticsResponse.json();
    console.log('Analytics response:', analyticsData);
    
    console.log('✅ All admin endpoints tested successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminEndpoints(); 