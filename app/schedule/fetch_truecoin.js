'use strict';
const Subscription = require('egg').Subscription;
const Web3 = require('web3');
class UpdateCache extends Subscription {
  static get schedule() {
    return {
      type: 'all',
      interval: '1m',
    };
  }
  async subscribe() {
    // const { mysql } = this.app;
    console.log('获取币数开始');
    // debugger;
    this.ctx.runInBackground(async () => {
      await this.getTxsData();
      await this.updateUserLockNumber();
      Promise.all([
        this.updateIndividualTeamLockNumber(),
        this.updateTeamLockNumber(),
      ]).then(x => {
        this.setTeamIsEligibility();
      });
    });


  }
  async getTxsData() {
    const { ctx, app } = this;
    const { data: { result } } = await ctx.curl(app.config.lockedUrl, {
      dataType: 'json',
      timeout: 6000,
    });

    const txsData = result.map(x => {
      return {
        my_hash: x.hash,
        my_from: x.from,
        my_true: new Web3().utils.fromWei(x.value, 'ether'),
      };
    });
    /* 插入之前清空 etherscan 表 */
    await app.mysql.query('DELETE from etherscan');
    //  debugger;
    for (let i = 0; i < txsData.length; i++) {
      const item = txsData[i];
      await app.mysql.query(`INSERT INTO etherscan(id, my_hash, my_from, my_true) VALUES(0, '${item.my_hash}', '${item.my_from}', '${item.my_true}')`);

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
          left join etherscan e ON u.address = e.my_from
          group by u.address) tmp 
      set 
          user.lock_num = tmp.sumNum
      where
          user.address = tmp.address;
    `);
    // const trueNum = await app.mysql.query(`SELECT address from user`);
    // console.log(trueNum);
    // for (let i = 0; i < trueNum.length; i++) {

    //   let sumNum         = await app.mysql.query(`SELECT sum(etherscan.my_true) FROM etherscan WHERE etherscan.my_from = '${trueNum[i].address}'`);

    //   let lockNum        = sumNum[0]['sum(etherscan.my_true)'] || 0;
    //   let updateSql      = `UPDATE user set lock_num='${lockNum}' WHERE address='${trueNum[i].address}'`;
    //   await app.mysql.query(updateSql);
    // }
    // console.log('更新个人锁仓数量 => 2');
  }
  async updateIndividualTeamLockNumber() {
    await this.app.mysql.query(`
      UPDATE team, user set team.lock_num=user.lock_num 
      WHERE team.address=user.address 
      AND team.type=1
    `);
    // console.log('更新个人组队锁仓数量 => 3');
  }
  async updateTeamLockNumber() {
    const { app } = this;
    // debugger;
    const teamsItem = await app.mysql.query('SELECT * from team WHERE type=2');
    for (let i = 0; i < teamsItem.length; i++) {
      const { address } = teamsItem[i];
      const sql = `
                    SELECT sum(user.lock_num) 
                    FROM team_user, user
                    WHERE team_user.user_address = user.address 
                    AND team_user.team_address='${address}'
                    AND team_user.status=2
                  `;
      const sumLock = (await app.mysql.query(sql));

      const lockNum = sumLock[0]['sum(user.lock_num)'] || 0;
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
      await app.mysql.query(`UPDATE team set is_eligibility=${is_eli} WHERE address='${address}'`);
    }
    // console.log('已设置是否达标 => 5');
  }
}

module.exports = UpdateCache;
