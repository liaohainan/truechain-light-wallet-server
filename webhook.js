'use strict';
const http = require('http');
const createHandler = require('coding-webhook-handler');
const handler = createHandler({
  path: '/webhook',
  token: 'truechain_xiaojian', // 在 coding 上面可以填写一个 token
});

// const rumCommand = (cmd, args, callback) => {
//   const child = spawn(cmd, args);
//   let response = '';
//   child.stdout.on('data', buffer => response += buffer.toString());
//   child.stdout.on('end', () => callback(response));
// };

http.createServer((req, res) => {
  handler(req, res, function(err) {
    res.statusCode = 404;
    res.end('no such location');
  });
}).listen(7777);

handler.on('error', err => {
  console.error('Error:', err.message);
});

handler.on('push', event => {
  console.log('成功了');
  // rumCommand('sh', [ './auto_build.sh' ], txt => {
  //   console.log(txt);
  // });
});
