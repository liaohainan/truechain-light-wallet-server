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
  /* 超级节点5%利息发放 */
  async test1() {
    const { ctx, app } = this;
    /* eslint-disable no-debugger */
    // parseInt(176800 /(60 * 60 * 24))
    // 0x6bb737cbe746fcb6d3c4897eb3b324ed102d4fb3 例子
    debugger;
    const result = await app.mysql.query(`
      SELECT * FROM super_node
      WHERE is_contract=1
    `);
    // const result = newresult.slice(0, 5);
    const resultLock = await app.mysql.query(`
      SELECT t_from, timestamp FROM super_node_lock
    `);
    let index = 0;
    const lockAddress = resultLock.map(x => x.t_from);
    ctx.logger.info(`${result.length} 长度`);
    async.mapLimit(result, 2, (item, callback) => {
      ctx.curl(`http://api.etherscan.io/api?module=account&action=txlist&address=${item.t_to}&startblock=0&endblock=99999999&sort=desc&apikey=YourApiKeyToken`, {
        timeout: 40000,
      })
        .then(res => {
          console.log(item.t_to, 'item.t_to');

          let is_success = true;
          const { result } = JSON.parse(res.data.toString());
          // const tos = result.map(x => x.to);
          // const froms = result.map(x => x.from);
          console.log(++index, 'index');
          /* 是否转出 */
          for (let i = 0; i < result.length; i++) {
            const el = result[i];
            /* 如果转出则查看tos中所有的地址是否全部存在于锁仓地址中 */
            if (el.from === item.t_to) {
              if (is_success) {
                is_success = lockAddress.includes(el.to);
              } else {
                break;
              }
            }
          }

          callback(null, {
            address: item.t_to,
            is_success,
          });
        });
    }, async (err, result) => {
      ctx.logger.info('数据已接收');
      // console.log(result, 'result');

      for (let i = 0; i < result.length; i++) {
        const items = result[i];
        const sql = `
          UPDATE super_node
          set is_turn_out='${+items.is_success}'
          WHERE
          t_to='${items.address}'
        `;

        const { affectedRows } = await app.mysql.query(sql);
        if (affectedRows) {
          console.log('执行成功ok', 'address', items.address, 'is_success', +items.is_success);
        }
      }

      ctx.body = {
        code: 0,
        message: 'ok',
        data: null,
      };
    });
  }
  async getTotalAddress(x, page = 1, offset = 1000) {
    const { ctx, app } = this;
    /* eslint-disable no-debugger */
    // debugger;
    // https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2&page=1&offset=100&sort=asc&apikey=YourApiKeyToken
    const options = [];
    const { data } = await ctx.curl(`https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=0xa4d17ab1ee0efdd23edc2869e7ba96b89eecf9ab&page=${page}&offset=${offset}&sort=desc&apikey=YourApiKeyToken`, {
      timeout: 30000,
    });
    debugger;
    const { result } = JSON.parse(data.toString());
    const startTime = 1526572800; // 2018/5/18 0:0:0
    const endTime = 1529337599; // 2018/6/18 23:59:59
    // console.log('============');
    for (let i = 0; i < result.length; i++) {
      const item = result[i];
      if (item.timeStamp > startTime && item.timeStamp < endTime) {
        options.push(`('${item.blockNumber}', '${item.timeStamp}', '${item.from}', '${item.to}', '${item.value}', '${item.hash}')`);
      } else {
        console.log('小于了=========');
      }
    }

    const sql_result = await app.mysql.query(`
      INSERT INTO super_node(block_number, timestamp, t_from, t_to, t_value, tx) VALUES ${options.join(',')}
    `);

    if (sql_result.affectedRows === offset) {
      console.log('此次已完成, 当前page:', page);
      await this.getTotalAddress(null, ++page);
    } else {
      console.log('抓取完毕');
    }
    ctx.body = {
      code: 0,
      message: '成功',
      data: null,
    };
  }
  async getTotalLockAddress(x, page = 1, offset = 1000) {
    const { ctx, app } = this;
    /* eslint-disable no-debugger */
    debugger;
    // https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2&page=1&offset=100&sort=asc&apikey=YourApiKeyToken
    const options = [];
    const { data } = await ctx.curl('http://api.etherscan.io/api?module=account&action=tokentx&address=0x08C62C32226CE2D9148A80F71A03dDB73B673792&sort=asc&apikey=YourApiKeyToken&startblock=0&endblock=999999999', {
      timeout: 30000,
    });
    debugger;
    const { result } = JSON.parse(data.toString());
    const startTime = 1526572800; // 2018/5/18 0:0:0
    const endTime = 1529337599; // 2018/6/18 23:59:59

    for (let i = 0; i < result.length; i++) {
      const item = result[i];
      if (item.timeStamp > startTime && item.timeStamp < endTime) {
        options.push(`('${item.blockNumber}', '${item.timeStamp}', '${item.from}', '${item.to}', '${item.value}', '${item.hash}')`);
      } else {
        console.log('小于了=========');
      }
    }

    const sql_result = await app.mysql.query(`
      INSERT INTO super_node_lock(block_number, timestamp, t_from, t_to, t_value, tx) VALUES ${options.join(',')}
    `);

    console.log('此次已完成共影响', sql_result.affectedRows);
    ctx.body = {
      code: 0,
      message: '成功',
      data: null,
    };
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
