const axios = require('axios');
const util = require('util');
const wget = require('node-wget');

const $ = {};

const getErrNum = (text) => {
  const e = text.split(' ');
  const errorCode = Number(e.pop());
  const code = errorCode >= 400 && errorCode < 500 ? 400 : 500;
  return code;
};

/**
 *
 * @param {tells : array} ['str', 'str']
 */

$.choiceTell = ({ api }, tells) => {
  const tell = api.util.sample(Object.values(tells));
  return tell;
};

/**
 *
 * @param {isExact : bool}
 * @param {music : string} musicPath
 */
$.piboTell = ({ api, lang, motion, volume, isExact, music }, tell) => {
  api.pibo.tell(`<speak><prosody rate='70%'>${tell}</prosody></speak>`, {
    lang: lang,
    motion: motion,
    volume: volume,
    play: music,
    cb: true,
    isExact: isExact,
  });
};

/**
 *
 * @param {isExact : bool}
 */
$.piboTellWithoutBg = ({ api, lang, motion, volume, isExact }, tell) => {
  api.pibo.tell(`<speak><prosody rate='70%'>${tell}</prosody></speak>`, {
    lang: lang,
    motion: motion,
    volume: volume,
    cb: true,
    isExact: isExact,
  });
};

/**
 *
 * @param {motions : array} [ 'str', 'str' ]
 */
$.piboMotion = ({ api, logger, moduleNm, motions }) => {
  api.speak.event((key, data) => {
    if (data.state > 0) {
      const motion = api.util.sample(motions);
      logger.info(moduleNm, `! piboMotion : ${motion}`);
      api.motion(motion);
    }
  });
};

$.errorTell = ({ errMent, ...tellInfo }, err) => {
  const errorCode = getErrNum(err.toString());
  const tell = errMent[errorCode];

  $.piboTellWithoutBg({ ...tellInfo, tell: tell });
};

$.getPostData = ({ logger, moduleNm, basicHeaders }, url, postData) => {
  const getData = (callback) => {
    axios({
      method: 'post',
      url: url,
      headers: basicHeaders,
      data: postData,
    })
      .then(function (res) {
        logger.info(moduleNm, `# getPostData.res.status: ${res.status}`);
        callback(null, res.data.data);
      })
      .catch(function (err) {
        logger.error(moduleNm, `# getPostData.err : ${err}`);
        callback(err);
      });
  };
  const D = util.promisify(getData);
  return D();
};

$.getGetData = ({ logger, moduleNm, basicHeaders }, url, params) => {
  const getData = (callback) => {
    axios({
      method: 'get',
      url: url,
      headers: basicHeaders,
      params: params,
    })
      .then(function (res) {
        logger.info(moduleNm, `# getGetData.res.status: ${res.status}`);
        callback(null, res.data.data);
      })
      .catch(function (err) {
        logger.error(moduleNm, `# getGetData.err : ${err}`);
        callback(err);
      });
  };
  const D = util.promisify(getData);
  return D();
};

$.getMp3 = (I, url, getData, cb) => {
  const { logger, moduleNm, streamHeaders } = I;

  wget(
    {
      url: `${url}?m_vid=${getData.vid}`,
      headers: streamHeaders,
      dest: getData.path,
    },
    (err, data) => {
      if (err) {
        logger.error(moduleNm, `# getMp3.err : ${err}`);
        return $.errorTell(I, err);
      }
      cb();
    },
  );
};

const delBracket = (text) => {
  const re = /\[.+\]|\(.+\)|<<.+>>|\<.+\>/gi;
  const reResult = text.match(re);

  let newText = text;
  if (reResult) {
    newText = text.replace(reResult[0], '');
  }

  return newText;
};

const delDoubleBracket = (text) => {
  const re = /\([^()]*\)/gi;
  const reResult = text.match(re);
  let delText = text;

  if (reResult !== null && reResult.length > 0) {
    reResult.forEach((el) => {
      delText = delText.replace(el, '');
    });
  }

  return delText;
};

const delEscapeSequence = (text) => {
  const clearText = text.replace(/\n/gi, '').replace(/\*/gi, '');
  return clearText;
};

const delTag = (text) => {
  const clearText = text.replace(/&nbsp;/gi, ' ').replace(/<br>/gi, '');
  return clearText;
};

$.clearText = (text) => {
  const clearText = delBracket(
    delDoubleBracket(delEscapeSequence(delTag(text))),
  );

  return clearText;
};

$.baluem_ko = (text) => {
  const newText = text
    .replace(/6.25/gi, "<sub alias='육이오'>6.25</sub>")
    .replace(/1번째/gi, "<sub alias='첫번째'>1번째</sub>")
    .replace(/5번째/gi, "<sub alias='다섯번째'>5번째</sub>")
    .replace(/6번째/gi, "<sub alias='여섯번째'>6번째</sub>")
    .replace(/13번째/gi, "<sub alias='열세번째'>13번째</sub>")
    .replace(/km²/gi, "<sub alias='제곱킬로미터'>km²</sub>")
    .replace(/워싱턴 D. C./gi, "<sub alias='워싱턴디씨'>워싱턴 D. C.</sub>")
    .replace(/km2/gi, "<sub alias='제곱킬로미터'>km²</sub>");

  return newText;
};

module.exports = $;
