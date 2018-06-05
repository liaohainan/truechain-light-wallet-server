'use strict';
const jwt = require('jwt-simple');
module.exports = (options, app) => {
  return async function(ctx, next) {
    // eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2JpbGUiOiIxNTEwMTY2MTM4MCJ9._3CmtTeZoqmoO3o7InXpPoO3t0f9ccXGPURQJLvUPU8
    // eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhZGRyZXNzIjoiMHgzNDQ5ZWQzMDFlOGUyNzJmMmQzNzc0YzRiNjZhYTIzMDBmYmE5NmM4IiwibW9iaWxlIjoiMTc2MTEyMjM2NjUifQ.wfLydygUL2HcOctfRCTOfIwuJHZc5QEC0HHSm9WR-NE
    // debugger;
    const exemptPath = [ '/login', '/', '/smsCaptcha', '/test', '/getTTRaddress', '/takeData', '/checkVersion' ];
    if (!exemptPath.includes(ctx.URL.pathname)) {
      if (!ctx.request.header.token) {
        ctx.body = {
          status: 202,
          message: '请传入token',
          data: null,
        };
        return;
      }
      if ((ctx.request.header.token).split('.').length !== 3) {
        ctx.body = {
          status: 202,
          message: 'token格式错误',
          data: null,
        };
        return;
      }

      const encode = jwt.decode(ctx.request.header.token, app.config.secret);
      ctx.encode = encode;
    }
    await next();
  };
}
;
