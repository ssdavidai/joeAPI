const fetch = require('node-fetch');

async function testCreate() {
  const url = 'https://joeapi.fly.dev/api/v1/actionitems';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Title: 'Debug Test',
      Description: 'Testing',
      ActionTypeId: 5,
      DueDate: '2025-12-01T00:00:00.000Z',
      Status: 1,
      Source: 1
    })
  });
  
  const data = await response.json();
  console.log('Direct API Response:');
  console.log(JSON.stringify(data, null, 2));
}

testCreate().catch(console.error);
