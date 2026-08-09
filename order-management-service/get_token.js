const crypto = require('crypto');
const secret = Buffer.from('Y2M4NjZjOTBiOTk4ODNmZTYxMjAwYWM4ZDJjODExMjQxYmM0YjE3MTAzYjQwMGE2ZjIyMmFiMTRjYTI4MWE1YQ==', 'base64');
const header = Buffer.from(JSON.stringify({alg: 'HS256', typ: 'JWT'})).toString('base64').replace(/=/g, '');
const payload = Buffer.from(JSON.stringify({
  sub: '9876543210',
  role: 'CUSTOMER',
  userId: '12345678-1234-1234-1234-123456789012',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600
})).toString('base64').replace(/=/g, '');
const signature = crypto.createHmac('sha256', secret).update(header + '.' + payload).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
console.log(header + '.' + payload + '.' + signature);
