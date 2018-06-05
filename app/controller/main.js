'use strict';
/* eslint-disable no-debugger */
const Controller = require('egg').Controller;
// const Mock = require('mockjs');
class MainController extends Controller {
  async nodeRank() {
    // debugger;
    const { ctx, app } = this;
    // ctx.logger.info('有人访问了');
    const {
      node_type,
      pageIndex = 0,
      pageNumber = 700,
      isScore = false,
    } = ctx.query;

    // debugger;
    if (!node_type) {
      ctx.body = {
        status: 202,
        message: '参数不全',
        data: null,
      };
      return;
    }
    let sql;

    if (node_type === '1' && JSON.parse(isScore)) {
      sql = `
            SELECT nickname, address, type, ((lock_num * .8 + tickets * .2) * 100) as score, create_time FROM team
            WHERE
            node_type=1
            AND
						is_eligibility=1 
            ORDER BY
            (lock_num * .8 + tickets * .2)
            DESC
            LIMIT
            ${pageIndex}, ${pageNumber}
          `;
    } else {
      sql = `
            SELECT * from team 
            WHERE  node_type=${node_type}
            AND is_eligibility=1 
            ORDER BY tickets 
            DESC LIMIT ${pageIndex}, ${pageNumber}
            `;
    }
    // const sql = `SELECT * from team WHERE  node_type=${node_type} AND is_eligibility=1 ORDER BY tickets DESC`;
    const nodeData = await app.mysql.query(sql);
    // console.log(sql);
    ctx.body = {
      status: 0,
      message: '节点排行',
      data: nodeData,
    };
  }
  async teamRank() {
    const { ctx, app } = this;
    const { node_type } = ctx.query;

    if (!node_type) {
      ctx.body = {
        status: 202,
        message: '参数不全',
        data: null,
      };
      return;
    }
    const data = await app.mysql.query(`SELECT * from team WHERE type=2 AND node_type=${node_type} ORDER BY tickets DESC LIMIT 20`);
    ctx.body = {
      status: 0,
      message: '组队排行',
      data,
    };
  }
  async searchTeam() {
    const { ctx, app } = this;
    const { search_value } = ctx.query;
    if (!search_value) {
      ctx.body = {
        status: 202,
        message: '参数不全',
        data: null,
      };
      return;
    }
    const data = await app.mysql.query('SELECT * FROM team WHERE type=2 AND nickname LIKE \'%龙%\'');
    ctx.body = {
      status: 0,
      message: '搜索组队',
      data,
    };
  }

  async teamInfo() {
    // debugger;
    const { ctx, app } = this;
    const { address } = ctx.query;
    if (!address) {
      ctx.body = {
        status: 202,
        message: '参数不全',
        data: null,
      };
      return;
    }

    const data = await app.mysql.query(`SELECT * from team WHERE address='${address}'`);
    ctx.body = {
      status: 0,
      message: '组队信息',
      data,
    };
  }
  async getTrueCoin() {
    // debugger;
    const { ctx, app } = this;
    const { mobile, address } = ctx.encode;
    const trueNum = await app.mysql.query(`SELECT sum(my_true) FROM etherscan  WHERE my_from='${address}'`);
    const num = trueNum[0]['sum(my_true)'] || 0;

    ctx.body = {
      status: 0,
      message: 'true币数量',
      data: {
        true_num: num,
        mobile,
      },
    };
  }
  async getMemberStatus() {
    const { ctx, app } = this;
    const { address } = ctx.encode;
    const data = await app.mysql.query(`SELECT status, role FROM team_user WHERE user_address='${address}'`);
    const type = await app.mysql.query(`SELECT type FROM team WHERE address='${address}'`);

    ctx.body = {
      status: 0,
      message: '获取申请状态',
      data: Object.assign({}, data[0], type[0]),
    };
  }
  async writeUserInfo() {
    // debugger;
    const { ctx, app } = this;
    const { address } = ctx.encode;
    const { nickname, reason } = ctx.query;
    // console.log(ctx.query);
    // console.log(address);
    if (!nickname) {
      ctx.body = {
        status: 202,
        message: '参数不全',
        data: null,
      };
      return;
    }
    const data = await app.mysql.query(`UPDATE user set nickname='${nickname}', reason='${reason || ''}' WHERE address='${address}'`);
    ctx.body = {
      status: 0,
      message: '写入信息成功',
      data,
    };
  }
  async createTeam() {
    const { ctx, app } = this;
    const {
      nickname,
      declaration,
      node_type,
      type,
    } = ctx.query;
    const { address } = ctx.encode;

    if (!nickname || !declaration || !node_type || !type) {
      ctx.body = {
        status: 202,
        message: '参数不全',
        data: null,
      };
      return;
    }

    const check = await app.mysql.query(`SELECT * FROM team WHERE address='${address}'`);
    if (check.length) {
      ctx.body = {
        status: 202,
        message: '不能多次创建组队',
        data: null,
      };
      return;
    }

    /* 插入队伍信息 */
    await app.mysql.query(`INSERT INTO team (nickname, declaration,  node_type, type, address, create_time) VALUES('${nickname}', '${declaration}',${node_type},${type}, '${address}', '${+new Date()}')`);

    /* 关联队伍信息 */
    const insertSql = `INSERT INTO team_user (team_address, user_address, role,status) VALUES('${address}', '${address}' , 2, 2)`;
    await app.mysql.query(insertSql);
    ctx.body = {
      status: 0,
      message: '创建成功',
      data: null,
    };
  }
  async getMemberList() {
    const { ctx, app } = this;
    const { address } = ctx.encode;
    const data = await app.mysql.query(`
      SELECT user.reason, user.nickname, user.address, user.lock_num, user.mobile
      FROM team_user, user
      WHERE team_user.team_address='${address}'
      AND team_user.role=1
      AND team_user.user_address = user.address
      AND team_user.status = 1
    `);
    ctx.body = {
      status: 0,
      message: '管理请求',
      data,
    };
  }
  async joinTeamRequest() {
    // debugger;
    const { ctx, app } = this;
    const { team_address } = ctx.query;
    const { address } = ctx.encode;

    const check = await app.mysql.query(`SELECT * FROM team_user WHERE user_address='${address}'`);
    if (check.length) {
      ctx.body = {
        status: 202,
        message: '不能多次加入组队',
        data: null,
      };
      return;
    }

    const data = await app.mysql.query(`INSERT into team_user(user_address,team_address,role,status) values('${address}','${team_address}',1,1)`);
    ctx.body = {
      status: 0,
      message: '加入组队请求',
      data,
    };
  }
  async initStatus() {
    const { ctx, app } = this;
    const { address } = ctx.encode;
    const data = await app.mysql.query(`DELETE FROM team_user WHERE user_address='${address}'`);
    this.ctx.body = {
      status: 0,
      message: '初始化状态成功',
      data,
    };
  }
  async isJoinTeam() {
    const { ctx, app } = this;
    const {
      status,
      user_address,
    } = ctx.query;
    // debugger;
    if (!status || !user_address) {
      ctx.body = {
        status: 202,
        message: '参数不全',
        data: null,
      };
      return;
    }
    const { address } = ctx.encode;
    const arrAddress = user_address.split(',');
    const _adressReturn = [];
    for (let i = 0; i < arrAddress.length; i++) {
      const _data = await app.mysql.query(`UPDATE team_user set status=${status} WHERE team_address='${address}' AND user_address='${arrAddress[i]}'`);
      _adressReturn.push(_data);
    }
    // const data = await app.mysql.query(`UPDATE team_user set status=${status} WHERE team_address='${address}' AND user_address='${user_address}'`)
    this.ctx.body = {
      status: 0,
      message: '是否同意加入组队',
      data: _adressReturn,
    };
  }
  async getTeamMember() {
    const { ctx, app } = this;
    const { team_address } = ctx.query;
    if (!team_address) {
      ctx.body = {
        status: 202,
        message: '参数不全',
        data: null,
      };
      return;
    }

    const data = await app.mysql.query(`
      SELECT nickname , role , lock_num FROM team_user , user
      WHERE team_address='${team_address}'
      AND team_user.user_address = user.address
      AND team_user.status = 2
    `);
    this.ctx.body = {
      status: 0,
      message: '组队成员信息',
      data,
    };
  }
  async getTeamAddress() {
    const { ctx, app } = this;
    const { address } = ctx.encode;
    const data = await app.mysql.query(`select team_address FROM team_user WHERE user_address='${address}'`);
    this.ctx.body = {
      status: 0,
      message: '组队成员信息',
      data,
    };
  }
  async vote() {
    const { ctx, app } = this;
    const {
      vote_num,
      team_address,
    } = ctx.query;

    if (!vote_num || !team_address) {
      ctx.body = {
        status: 202,
        message: '参数不全',
        data: null,
      };
      return;
    }
    const data = await app.mysql.query(`UPDATE team set tickets=${vote_num} WHERE address='${team_address}'`);
    ctx.body = {
      status: 0,
      message: '投票',
      data,
    };
  }
  async takeData() {
    const { ctx, app } = this;
    const lock_num = await app.mysql.query(`
      SELECT SUM(lock_num) as sum  FROM user
    `);
    const sum_person = await app.mysql.query(`
        SELECT count(*) as sum_person FROM team_user
    `);
    ctx.body = `<h1>锁仓总数: ${lock_num[0].sum} ======= 锁仓总人数:${sum_person[0].sum_person}</h1>`;
    // ctx.body = {
    //   message: `锁仓总数: ${lock_num[0].sum} ======= 锁仓总人数:${sum_person[0].sum_person}`,
    // };
  }
  async checkVersion() {
    const { ctx, app } = this;
    const result = await app.mysql.query(`
      SELECT version FROM version
    `);

    ctx.body = {
      status: 0,
      message: '版本号',
      data: result[0],
    };
  }
}
module.exports = MainController;
