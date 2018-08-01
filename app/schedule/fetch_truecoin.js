'use strict';
const Subscription = require('egg').Subscription;
const Web3 = require('web3');
class UpdateCache extends Subscription {
  static get schedule() {
    return {
      type: 'all',
      interval: '2m',
    };
  }
  async subscribe() {
    /* eslint-disable no-debugger */
    if (this.app.truecoin) {
      return;
    }
    this.app.truecoin = true;
    try {
      const isChange = await this.getTxsData();
      if (isChange) {
        this.app.truecoin = false;
        return;
      }
      await this.updateUserLockNumber();
      Promise.all([
        this.updateIndividualTeamLockNumber(),
        this.updateTeamLockNumber(),
      ]).then(() => {
        this.ctx.logger.info('TRUECOIN UPDATED SUCCESS!');
        this.setTeamIsEligibility();
        this.app.truecoin = false;
      });
    } catch (err) {
      this.app.truecoin = false;
      this.logger.error('===REQUEST TIMEOUT, RESTART===');
    }
  }
  async getTxsData() {
    const { ctx, app } = this;
    // debugger;
    const { data: { result } } = await ctx.curl(app.config.lockedUrl, {
      dataType: 'json',
      timeout: 100000,
    });
    const resultSum = await app.mysql.query('SELECT count(*) as sumLength FROM etherscan');
    if (resultSum[0].sumLength === result.length) {
      this.ctx.logger.info('NOT CHANGED, NOT UPDATE');
      return true;
    }

    const txsData = result.map(x => {
      return {
        my_hash: x.hash,
        my_from: x.from,
        my_true: new Web3().utils.fromWei(x.value, 'ether'),
      };
    });
    // debugger;
    /* 插入之前清空 etherscan 表 */
    await app.mysql.query('TRUNCATE TABLE etherscan');
    // const options = [];
    for (let i = 0; i < txsData.length; i++) {
      const item = txsData[i];
      // options.push(`('${item.my_hash}', '${item.my_from}', '${item.my_true}')`);
      try {
        // app.mysql.query(`INSERT INTO etherscan(my_hash, my_from, my_true) VALUES ${options.join(',')}`);
        const asql = `INSERT INTO etherscan(my_hash, my_from, my_true) VALUES ('${item.my_hash}', '${item.my_from}', '${item.my_true}')`;
        app.mysql.query(asql);
      } catch (error) {
        this.ctx.logger.info(`可能是${item.my_from} 地址重复了, ${error}`);
      }
    }
    // console.log('获取锁仓信息 => 1');
  }
  async updateUserLockNumber() {
    const { app } = this;

    await app.mysql.query(`
      update user,
          (select
              u.address, ifnull(sum(e.my_true), 0) as sumNum
          from
              user u
          left join etherscan e
          ON u.address = e.my_from
          group by u.address) tmp
      set
          user.lock_num = tmp.sumNum
      where
          user.address = tmp.address
      AND
          user.is_fake=0;
    `);

  }
  async updateIndividualTeamLockNumber() {
    await this.app.mysql.query(`
      UPDATE team, user set team.lock_num=user.lock_num
      WHERE team.address=user.address
      AND team.type='1'
      AND team.is_fake='0'
    `);
    // console.log('更新个人组队锁仓数量 => 3');
  }
  async updateTeamLockNumber() {
    const { app } = this;
    // debugger;
    const teamsItem = await app.mysql.query("SELECT * from team WHERE type='2'");
    for (let i = 0; i < teamsItem.length; i++) {
      const { address } = teamsItem[i];
      const sql = `
                    SELECT ifnull(sum(user.lock_num), 0) as lockNum
                    FROM team_user, user
                    WHERE team_user.user_address = user.address
                    AND team_user.team_address='${address}'
                    AND team_user.status=2
                  `;
      const { lockNum } = (await app.mysql.query(sql))[0];
      const updateSql = `UPDATE team set lock_num='${lockNum}' WHERE address='${address}'`;
      await app.mysql.query(updateSql);
    }
    // console.log('更新组队锁仓数量 => 4');
  }
  async setTeamIsEligibility() {
    const { app } = this;
    // debugger;
    const teamsItem = await app.mysql.query('SELECT * FROM team');
    for (let i = 0; i < teamsItem.length; i++) {
      const { type, node_type, lock_num, address } = teamsItem[i];
      let is_eli = 0;
      if (type === 1 && node_type === 1 && lock_num >= 2000) {
        // console.log('个人标准节点达标');
        is_eli = 1;
      } else if (type === 2 && node_type === 1 && lock_num >= 3000) {
        // console.log('组队标准节点达标');
        is_eli = 1;
      } else if (type === 1 && node_type === 2 && lock_num >= 50000) {
        // console.log('个人全节点达标');
        is_eli = 1;
      } else if (type === 2 && node_type === 2 && lock_num >= 100000) {
        // console.log('组队全节点达标');
        is_eli = 1;
      }
      await app.mysql.query(`UPDATE team set is_eligibility='${is_eli}' WHERE address='${address}'`);
    }
    // console.log('已设置是否达标 => 5');
  }
}

module.exports = UpdateCache;
