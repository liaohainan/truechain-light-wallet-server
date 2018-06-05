'use strict';
// const Web3 = require('web3');
const async = require('async');
// const web3 = new Web3();
const Controller = require('egg').Controller;
class HomeController extends Controller {
  async test() {
    const { ctx, app } = this;
    const result = await app.mysql.query(`
        SELECT user.address FROM user
        WHERE
        user.address not in (
          (SELECT uns.address
          FROM untreated_address  uns
          INNER JOIN
          user
          ON user.address=uns.address
          AND user.lock_num > 0)
        )
        AND user.lock_num > 0
    `);
    let aaa = 0;
    ctx.logger.info(`${result.length} 长度`);
    console.log();
    async.mapLimit(result, 2, (item, callback) => {
      ctx.curl(`http://api.etherscan.io/api?module=account&action=txlist&address=${item.address}&startblock=0&endblock=99999999&sort=desc&apikey=YourApiKeyToken`)
        .then(res => {
          const { result } = JSON.parse(res.data.toString());
          const findItem = result.filter(x => x.to === item.address).map(x => x.from);
          console.log(aaa++);
          callback(null, findItem);
        });
    }, async (err, result) => {
      ctx.logger.info('数据已接收');
      for (let i = 0; i < result.length; i++) {
        const items = [ ...new Set(result[i]) ];
        for (let j = 0; j < items.length; j++) {
          const { affectedRows } = await app.mysql.query(`
            UPDATE untreated_address uns set is_exist=2
            WHERE
            uns.address ='${items[j]}'
          `);
          if (affectedRows) {
            break;
          }
        }
      }
    });
  }
  async getTTRaddress() {
    const reslut = await this.app.mysql.query(`
      select * from untreated_address
      WHERE
      is_send=1
    `);
    this.ctx.body = {
      status: 0,
      message: '获取TTR地址',
      data: reslut,
    };
  }
}

module.exports = HomeController;
