'use strict';

const Controller = require('egg').Controller;
/*
  SELECT count(*) FROM team_user
 */
class PcController extends Controller {
  async nodeSum() {
    const { ctx } = this;
    const result = await this.app.mysql.query('SELECT count(*) as sumNum FROM team_user');
    ctx.body = {
      status: 0,
      message: '优先节点报名总人数',
      data: result,
    };
  }
  async nodeRankPc() {
    const { ctx } = this;
    const { node_type, type } = ctx.query;
    if (!node_type || !type) {
      ctx.body = {
        status: 0,
        message: '参数不全',
        data: null,
      };
      return;
    }
    const result = await this.app.mysql.query(`
      SELECT count(*) as sumNum FROM team
      WHERE
      team.type=${type}
      AND
      team.node_type=${node_type}
      AND
      is_eligibility=1
    `);
    ctx.body = {
      status: 0,
      message: '节点报名人数',
      data: result,
    };
  }
  async nodeTypeSumNum() {
    // 标准节点总人数 2111
    // 全节点总人数 2212
    const { ctx } = this;
    const { type1, type2, type3, type4 } = ctx.query;


    if (!type1 || !type2 || !type3 || !type4) {
      ctx.body = {
        status: 0,
        message: '参数不全',
        data: null,
      };
      return;
    }
    const result = await this.app.mysql.query(`
      SELECT count(*) + (
        SELECT count(*)  from (
        SELECT address FROM team
        WHERE
        team.type=${type1}
        AND
        team.node_type=${type2}
        AND
        is_eligibility=1
        ) aaa
        LEFT JOIN team_user as tu
        ON tu.team_address = aaa.address
      ) as sumNum FROM team
      WHERE
      type=${type3}
      AND
      node_type=${type4}
    `);
    ctx.body = {
      status: 0,
      message: '节点报名人数',
      data: result,
    };
  }
}

module.exports = PcController;
