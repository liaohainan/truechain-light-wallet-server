'use strict';
const Subscription = require('egg').Subscription;
const Web3 = require('web3');
const async = require('async');
const {
  iterface,
} = require('../utils');
class UpdateCache extends Subscription {
  static get schedule() {
    return {
      type: 'all',
      interval: '10m',
      // interval: '10s',
    };
  }
  async subscribe() {
    /* eslint-disable no-debugger */
    // debugger;
    const { mysql } = this.app;
    // let index = 0;
    const data = await mysql.query("SELECT address FROM team WHERE is_eligibility='1'");
    this.ctx.logger.info('投票数据开始获取');
    // this.ctx.logger.info(data.length, '达标team的长度');
    // console.log(data.length, 'data.length');
    async.mapLimit(data, 2, (item, callback) => {
      const { url, address } = this.app.config.vote;
      const web3 = new Web3(new Web3.providers.HttpProvider(url));
      const contract = new web3.eth.Contract(iterface);
      contract.options.address = address;
      contract.methods.totalVotes(item.address).call().then(res => {
        const number = web3.utils.fromWei(`${res}`, 'ether');
        // this.ctx.logger.info(++index);
        callback(null, [ item.address, number ]);
      });
    }, async (err, result) => {
      if (err) throw err;
      // console.log('0x1b1367a8b903216624e8694695134df3ff5f43e5');
      // console.log(JSON.stringify(result, null, 2));
      this.ctx.logger.info('投票数据以获取');
      for (let i = 0; i < result.length; i++) {
        const item = result[i];
        const sql = `UPDATE team set tickets='${item[1]}' WHERE address='${item[0]}'`;
        await mysql.query(sql);
      }
      this.ctx.logger.info('投票更新了');
    });
  }
}

module.exports = UpdateCache;
