'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.login.captcha);
  router.get('/login', controller.login.index);
  // router.get('/captcha', controller.login.captcha);
  router.get('/smsCaptcha', controller.login.smsCaptcha);
  router.get('/nodeRank', controller.main.nodeRank);
  router.get('/teamRank', controller.main.teamRank);
  router.get('/searchTeam', controller.main.searchTeam);
  router.get('/teamInfo', controller.main.teamInfo);
  router.get('/getMemberStatus', controller.main.getMemberStatus);
  router.get('/getMemberList', controller.main.getMemberList);
  router.get('/joinTeamRequest', controller.main.joinTeamRequest);
  router.get('/isJoinTeam', controller.main.isJoinTeam);
  router.get('/createTeam', controller.main.createTeam);
  router.get('/initStatus', controller.main.initStatus);
  router.get('/getTeamMember', controller.main.getTeamMember);
  router.get('/getTeamAddress', controller.main.getTeamAddress);
  router.get('/writeUserInfo', controller.main.writeUserInfo);
  router.get('/getTrueCoin', controller.main.getTrueCoin);
  router.get('/takeData', controller.main.takeData);
  router.get('/vote', controller.main.vote);
  router.get('/checkVersion', controller.main.checkVersion);
  router.get('/test', controller.home.test);
  router.get('/test1', controller.home.test1);
  router.get('/getTotalAddress', controller.home.getTotalAddress);
  router.get('/getTTRaddress', controller.home.getTTRaddress);
  router.get('/getTotalLockAddress', controller.home.getTotalLockAddress);

  router.get('/api/nodeSum', controller.pc.nodeSum);
  router.get('/api/nodeRankPc', controller.pc.nodeRankPc);
  router.get('/api/nodeTypeSumNum', controller.pc.nodeTypeSumNum);
};
