'use strict';
const Subscription = require('egg').Subscription;
class initFetch extends Subscription {
  static get schedule() {
    return {
      type: 'all',
      interval: '24h',
    };
  }
  async subscribe() {
    if (this.app.vote) {
      this.app.vote = false;
    }
    if (this.app.truecoin) {
      this.app.truecoin = false;
    }
  }
}

module.exports = initFetch;
