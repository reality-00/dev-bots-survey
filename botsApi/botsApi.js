const _ = require('lodash');

const get = (req) => {
  let data;
  switch (req) {
    case 'language':
      data = 'en';
      break;
    case 'env':
      data = 'LOC';
      break;
    case 'geo':
      data = [
        {
          lat: 35.161358,
          lng: 129.120468,
          x: 65,
          y: 78,
          address: ['경기도', '부천시'],
        },
      ];
      break;
  }

  // 34.850435
  // 128.426984

  return data;
};

const write = (mudule, data) => {
  return console.log(mudule, data);
};

const tell = (data, option) => {
  const piboTell = data
    .replace("<speak><prosody rate='70%'>", '')
    .replace('</prosody></speak>', '');

  console.log('pibo tell : ', JSON.stringify(piboTell));
  console.log('pibo tell option : ', JSON.stringify(option));

  return piboTell;
};

const event = (cb) => {
  const key = 'key';
  const data = { state: '0' };

  return cb(key, data);
};

const sample = (arr) => {
  const data = _.sample(arr);
  return data;
};

const comm = (name, data) => {};

exports.api = {
  config: { get: get },
  bus: {
    nickName: 'darae',
    robotId: '5ec5df5e389f1700118119e0',
  },
  logger: {
    info: write,
    error: write,
    debug: write,
    warn: write,
  },
  pibo: {
    tell: tell,
  },
  speak: {
    event: event,
  },
  util: {
    sample: sample,
  },
  motion: write,
  comm: comm,
};
