// Simple server test to verify on-device detection integration
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

console.log('Testing server connection...');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Server Response:');
    console.log(`Status: ${res.statusCode}`);
    console.log(`Data: ${data}`);

    if (res.statusCode === 200) {
      console.log('✅ Server is running properly!');
      testDetectionEndpoint();
    } else {
      console.log('❌ Server returned non-200 status');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Server connection failed:', error.message);
  console.log('\nTroubleshooting steps:');
  console.log('1. Check if server is running on port 3000');
  console.log('2. Check server logs for errors');
  console.log('3. Verify all dependencies are installed');
});

req.on('timeout', () => {
  console.error('❌ Server connection timeout');
  req.destroy();
});

req.end();

function testDetectionEndpoint() {
  console.log('\n🧪 Testing detection endpoint...');

  const detectionOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/detect/models',
    method: 'GET',
    timeout: 5000
  };

  const detReq = http.request(detectionOptions, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`Detection endpoint status: ${res.statusCode}`);
      if (res.statusCode === 200 || res.statusCode === 401) {
        console.log('✅ Detection endpoint is accessible!');
        console.log('Response preview:', data.substring(0, 200) + '...');
      } else {
        console.log('❌ Detection endpoint issue:', data);
      }
    });
  });

  detReq.on('error', (error) => {
    console.error('❌ Detection endpoint test failed:', error.message);
  });

  detReq.end();
}
