'use strict';
/* eslint-disable no-debugger */
const svgCaptcha = require('svg-captcha');
const Controller = require('egg').Controller;
const md5 = require('md5');
const jwt = require('jwt-simple');
const {
  getAothCode,
  getLocalTime,
} = require('../utils');

class HomeController extends Controller {
  async index() {
    const {
      app,
      ctx,
    } = this;
    const {
      mobile,
      code,
      address,
    } = ctx.query;
    // debugger;
    if (!mobile || !code || !address) {
      ctx.body = {
        status: 202,
        message: '参数不全',
        data: null,
      };
      return;
    }
    // const result = await app.mysql.query('SELECT code, create_time FROM `sms_log` WHERE mobile="' + mobile + '"');
    const result = await app.mysql.select('sms_log', {
      where: { mobile },
      columns: [ 'code', 'create_time' ],
    });
    // debugger;
    if (result.length) {
      if (result[0].code === code) {
        const isBeing = await app.mysql.query(`SELECT * FROM user WHERE mobile = ${mobile} OR address='${address}'`);
        // const isBeing = await app.mysql.select('user', {
        //   where: { mobile }
        // });
        // debugger;
        const token = jwt.encode({
          address,
          mobile,
        }, app.config.secret);

        if (isBeing.length) {
          if (isBeing[0].address === address && isBeing[0].mobile === mobile) {
            ctx.body = {
              body: {
                status: 0,
                message: '验证成功',
                data: {
                  token,
                },
              },
            };
            return;
          }
          ctx.body = {
            body: {
              status: 203,
              message: '该手机号已绑定钱包地址',
              data: null,
            },
          };
          return;


        }
        // isBeingSql = `INSERT INTO user (mobile, address) VALUES(${mobile}, '${address}')`;
        // await app.mysql.query(isBeingSql);
        const { affectedRows } = await app.mysql.insert('user', {
          mobile,
          address,
        });
        if (affectedRows) {
          // const insertSuccess = result.affectedRows === 1;
          console.log('插入数据库成功');
          ctx.body = {
            body: {
              status: 0,
              message: '验证成功',
              data: {
                token,
              },
            },
          };
        } else {
          ctx.body = {
            body: {
              status: 202,
              message: '插入失败',
              data: null,
            },
          };
        }

      } else {
        ctx.body = {
          body: {
            status: 202,
            message: '手机验证码错误',
            data: null,
          },
        };
      }
    } else {
      ctx.body = {
        body: {
          status: 202,
          message: '请先获取验证码',
          data: null,
        },
      };
    }
  }
  async captcha() {
    const {
      ctx,
    } = this;
    const {
      data,
      text,
    } = svgCaptcha.create();
    console.log(text);

    ctx.cookies.set('captcha', text);
    ctx.body = {
      status: 0,
      message: '图形验证成功--dev',
      data,
    };
  }
  async sendSms(time, code, mobile) {
    const { ctx, app } = this;
    const { username, password, sendAddress } = app.config.sms;
    const result = await ctx.curl(sendAddress, {
      methods: 'GET',
      data: {
        username,
        tkey: time,
        password: md5(md5(password) + time),
        mobile,
        content: `【TRUE】您好，您的验证码是 ${code}`,
      },
    });
    return result.data.toString();

  }
  async sendSmsGlobal(time, code, mobile) {
    const { ctx, app } = this;
    const { account, password, sendAddress } = app.config.globalSms;
    const msg = `【TRUE】Hello, your verification code is ${code}`;
    const post_data = { // 这是需要提交的数据
      account,
      password,
      mobile,
      msg,
    };
    const content = JSON.stringify(post_data);
    const result = await ctx.curl(sendAddress, {
      port: 80,
      method: 'POST',
      content,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      contentType: 'json',
      dataType: 'json',
    });
    return result.data.code;
  }

  async smsCaptcha() {
    const {
      ctx,
      app,
    } = this;
    // debugger;
    const smsCode = getAothCode();
    const smsTime = getLocalTime();
    const {
      mobile,
      captcha,
      smsType = '1',
      countryCode,
    } = ctx.query;
    // debugger;
    if (!captcha || !mobile) {
      ctx.body = {
        body: {
          status: 0,
          message: '参数不全',
          data: null,
        },
      };
      return;
    }
    const reg = new RegExp(`^${captcha}$`, 'i');
    if (!reg.test(ctx.cookies.get('captcha'))) {
      ctx.body = {
        body: {
          status: 202,
          message: '图形验证码错误',
          data: null,
        },
      };
      return;
    }

    // debugger;
    const result = await app.mysql.query(`SELECT * FROM sms_log WHERE mobile="${mobile}"`);
    // const result = await app.mysql.select('sms_log', {
    //   where: { mobile },
    // });
    const nowDate = +new Date();
    const expired = 60; // 一分钟内有效 , 并且不能重复发送请求


    if (result.length) {
      if ((nowDate - result[0].create_time) / 1000 < expired) {
        ctx.body = {
          body: {
            status: 202,
            message: '不能频繁请求',
            data: null,
          },
        };
        return;
      }
      console.log('走入了更新逻辑');
      let status;
      if (smsType === '1') {
        status = await this.sendSms(smsTime, smsCode, mobile);
      } else if (smsType === '2') {
        status = await this.sendSmsGlobal(smsTime, smsCode, countryCode + mobile);
      } else {
        ctx.body = {
          body: {
            status: 402,
            message: '参数错误',
            data: null,
          },
        };
        return;
      }
      // const status = await this.sendSms(smsTime, smsCode, mobile);
      // const _updateSql = `update sms_log set create_time=${+new Date()}, code='${smsCode}' WHERE mobile=${mobile}`
      // await app.mysql.query(_updateSql);

      await app.mysql.update('sms_log', {
        create_time: +new Date(),
        code: smsCode,
        status,
      }, {
        where: { mobile },
      });

    } else {
      console.log('走入了插入逻辑');
      let status;
      if (smsType === '1') {
        status = await this.sendSms(smsTime, smsCode, mobile);
      } else if (smsType === '2') {
        status = await this.sendSmsGlobal(smsTime, smsCode, countryCode === '86' ? `${countryCode + mobile}` : mobile);
      } else {
        ctx.body = {
          body: {
            status: 402,
            message: '参数错误',
            data: null,
          },
        };
        return;
      }
      // const status = await this.sendSms(smsTime, smsCode, mobile);
      // await app.mysql.query(`INSERT INTO sms_log (create_time, code, mobile) VALUES(${+new Date()} , '${smsCode}' ,${mobile})`);
      await app.mysql.insert('sms_log', {
        mobile,
        code: smsCode,
        create_time: +new Date(),
        status,
      });
      ctx.body = {
        body: {
          status: 0,
          message: '数据库不存在该手机号, 发送短信',
          data: null,
        },
      };
      return;
    }
    ctx.body = {
      body: {
        status: 0,
        message: '发送短信',
        data: null,
      },
    };
  }
}

module.exports = HomeController;
