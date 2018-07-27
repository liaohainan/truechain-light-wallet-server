'use strict';
const getAothCode = (n = 6) => {
  let randomStr = [];
  for (let i = 0; i < n; i++) {
    randomStr += Math.floor(Math.random() * 10);
  }
  return randomStr;
};

const getRandomStrArr = (n = 1000) => {
  return new Array(n).fill(0).map(x => Math.random().toString(36).substr(2));
};

const getLocalTime = () => {
  // 参数i为时区值数字，比如北京为东八区则输进8,西5输入-5
  const d = new Date();
  // 得到1970年一月一日到现在的秒数
  const len = d.getTime();
  // 本地时间与GMT时间的时间偏移差
  const offset = d.getTimezoneOffset() * 60000;
  // 得到现在的格林尼治时间
  const utcTime = len + offset;
  const date = new Date(+new Date(utcTime + 3600000 * 8));
  const Y = date.getFullYear();
  const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
  const D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
  const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours());
  const m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
  const s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
  return `${Y + M + D + h + m + s}`;
};

const iterface = [{
  constant: true,
  inputs: [],
  name: 'name',
  outputs: [{
    name: '',
    type: 'string',
  }],
  payable: false,
  stateMutability: 'view',
  type: 'function',
},
{
  constant: false,
  inputs: [{
    name: '_spender',
    type: 'address',
  },
  {
    name: '_value',
    type: 'uint256',
  },
  ],
  name: 'approve',
  outputs: [{
    name: 'success',
    type: 'bool',
  }],
  payable: false,
  stateMutability: 'nonpayable',
  type: 'function',
},
{
  constant: true,
  inputs: [],
  name: 'totalSupply',
  outputs: [{
    name: 'supply',
    type: 'uint256',
  }],
  payable: false,
  stateMutability: 'view',
  type: 'function',
},
{
  constant: true,
  inputs: [{
    name: '',
    type: 'address',
  },
  {
    name: '',
    type: 'address',
  },
  ],
  name: 'votingInfo',
  outputs: [{
    name: '',
    type: 'uint256',
  }],
  payable: false,
  stateMutability: 'view',
  type: 'function',
},
{
  constant: false,
  inputs: [{
    name: '_from',
    type: 'address',
  },
  {
    name: '_to',
    type: 'address',
  },
  {
    name: '_value',
    type: 'uint256',
  },
  ],
  name: 'transferFrom',
  outputs: [{
    name: 'success',
    type: 'bool',
  }],
  payable: false,
  stateMutability: 'nonpayable',
  type: 'function',
},
{
  constant: true,
  inputs: [{
    name: '',
    type: 'address',
  }],
  name: 'balances',
  outputs: [{
    name: '',
    type: 'uint256',
  }],
  payable: false,
  stateMutability: 'view',
  type: 'function',
},
{
  constant: true,
  inputs: [],
  name: 'decimals',
  outputs: [{
    name: '',
    type: 'uint256',
  }],
  payable: false,
  stateMutability: 'view',
  type: 'function',
},
{
  constant: true,
  inputs: [{
    name: '_owner',
    type: 'address',
  }],
  name: 'ticketsOf',
  outputs: [{
    name: 'tickets',
    type: 'uint256',
  }],
  payable: false,
  stateMutability: 'view',
  type: 'function',
},
{
  constant: false,
  inputs: [],
  name: 'kill',
  outputs: [],
  payable: false,
  stateMutability: 'nonpayable',
  type: 'function',
},
{
  constant: true,
  inputs: [],
  name: 'founder',
  outputs: [{
    name: '',
    type: 'address',
  }],
  payable: false,
  stateMutability: 'view',
  type: 'function',
},
{
  constant: false,
  inputs: [{
    name: '_to',
    type: 'address',
  },
  {
    name: '_value',
    type: 'uint256',
  },
  ],
  name: 'vote',
  outputs: [{
    name: 'success',
    type: 'bool',
  }],
  payable: false,
  stateMutability: 'nonpayable',
  type: 'function',
},
{
  constant: false,
  inputs: [{
    name: '_owner',
    type: 'address',
  }],
  name: 'balanceOf',
  outputs: [{
    name: 'balance',
    type: 'uint256',
  }],
  payable: false,
  stateMutability: 'nonpayable',
  type: 'function',
},
{
  constant: false,
  inputs: [{
    name: 'newFounder',
    type: 'address',
  }],
  name: 'changeFounder',
  outputs: [],
  payable: false,
  stateMutability: 'nonpayable',
  type: 'function',
},
{
  constant: true,
  inputs: [],
  name: 'symbol',
  outputs: [{
    name: '',
    type: 'string',
  }],
  payable: false,
  stateMutability: 'view',
  type: 'function',
},
{
  constant: true,
  inputs: [],
  name: 'voteEndTime',
  outputs: [{
    name: '',
    type: 'uint256',
  }],
  payable: false,
  stateMutability: 'view',
  type: 'function',
},
{
  constant: true,
  inputs: [{
    name: '',
    type: 'address',
  }],
  name: 'totalVotes',
  outputs: [{
    name: '',
    type: 'uint256',
  }],
  payable: false,
  stateMutability: 'view',
  type: 'function',
},
{
  constant: false,
  inputs: [{
    name: '_to',
    type: 'address',
  },
  {
    name: '_value',
    type: 'uint256',
  },
  ],
  name: 'transfer',
  outputs: [{
    name: 'success',
    type: 'bool',
  }],
  payable: false,
  stateMutability: 'nonpayable',
  type: 'function',
},
{
  constant: false,
  inputs: [{
    name: '_tos',
    type: 'address[]',
  },
  {
    name: '_values',
    type: 'uint256[]',
  },
  ],
  name: 'distributeMultiple',
  outputs: [{
    name: 'success',
    type: 'bool',
  }],
  payable: false,
  stateMutability: 'nonpayable',
  type: 'function',
},
{
  constant: false,
  inputs: [{
    name: '_to',
    type: 'address',
  }],
  name: 'voteAll',
  outputs: [{
    name: 'success',
    type: 'bool',
  }],
  payable: false,
  stateMutability: 'nonpayable',
  type: 'function',
},
{
  constant: false,
  inputs: [{
    name: '_endTime',
    type: 'uint256',
  }],
  name: 'setEndTime',
  outputs: [],
  payable: false,
  stateMutability: 'nonpayable',
  type: 'function',
},
{
  constant: true,
  inputs: [{
    name: '',
    type: 'address',
  }],
  name: 'frozen',
  outputs: [{
    name: '',
    type: 'uint256',
  }],
  payable: false,
  stateMutability: 'view',
  type: 'function',
},
{
  constant: true,
  inputs: [{
    name: '_owner',
    type: 'address',
  },
  {
    name: '_spender',
    type: 'address',
  },
  ],
  name: 'allowance',
  outputs: [{
    name: 'remaining',
    type: 'uint256',
  }],
  payable: false,
  stateMutability: 'view',
  type: 'function',
},
{
  constant: true,
  inputs: [],
  name: 'distributed',
  outputs: [{
    name: '',
    type: 'uint256',
  }],
  payable: false,
  stateMutability: 'view',
  type: 'function',
},
{
  constant: false,
  inputs: [{
    name: '_to',
    type: 'address',
  },
  {
    name: '_amount',
    type: 'uint256',
  },
  ],
  name: 'distribute',
  outputs: [{
    name: 'success',
    type: 'bool',
  }],
  payable: false,
  stateMutability: 'nonpayable',
  type: 'function',
},
{
  inputs: [],
  payable: false,
  stateMutability: 'nonpayable',
  type: 'constructor',
},
{
  anonymous: false,
  inputs: [{
    indexed: true,
    name: '_from',
    type: 'address',
  },
  {
    indexed: true,
    name: '_to',
    type: 'address',
  },
  {
    indexed: false,
    name: '_value',
    type: 'uint256',
  },
  ],
  name: 'Transfer',
  type: 'event',
},
{
  anonymous: false,
  inputs: [{
    indexed: true,
    name: '_from',
    type: 'address',
  },
  {
    indexed: true,
    name: '_to',
    type: 'address',
  },
  {
    indexed: false,
    name: '_value',
    type: 'uint256',
  },
  ],
  name: 'Vote',
  type: 'event',
},
{
  anonymous: false,
  inputs: [{
    indexed: true,
    name: '_owner',
    type: 'address',
  },
  {
    indexed: true,
    name: '_spender',
    type: 'address',
  },
  {
    indexed: false,
    name: '_value',
    type: 'uint256',
  },
  ],
  name: 'Approval',
  type: 'event',
},
];
module.exports = {
  iterface,
  getAothCode,
  getLocalTime,
  getRandomStrArr,
};
