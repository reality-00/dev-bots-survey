const _ = require('lodash');
const F = require('./ext_basic_func');
const M = require('i18next');
const yaml = require('js-yaml');
const fs = require('fs');
const config = yaml.load(fs.readFileSync(__dirname + '/config.yml', 'utf8'), {
  json: true,
});
const moment = require('moment');
const ko = require('./lang_ko.json');
const en = require('./lang_en.json');
const A = require('./ext_answer.json');
let tNum = 0;
let qNum = 0;
let cardErr = false;
let lastQuestionTime = undefined;
let continueCheck = false;

exports.bot = async (param, api) => {
  const lang = api.config.get('language');
  const env = api.config.get('env');
  const logger = api.logger;
  const geoInfo = api.config.get('geo')[0];
  const myCity = geoInfo.address;
  const userNickName = api.bus.nickName;
  const cfg = config[env];
  const moduleNm = cfg.MODULE_NAME;
  const piboInpuText = param.state.text ? param.state.text : '설문';
  const cmd = param.state.cmd;
  const stateValue = param.state.value;
  const url = cfg.CAPI_URL;
  const streamHeaders = {
    'Content-Type': 'audio/mpeg',
    Accept: 'application/octet-stream',
    'x-client-type': cfg.CLIENT_TYPE,
    'x-client-id': api.bus.robotId,
  };
  const basicHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-client-type': cfg.CLIENT_TYPE,
    'x-client-id': api.bus.robotId,
  };

  // 자동 실행의 경우
  if (!param.state.keywords) {
    param.state['keywords'] = {};
    param.state.keywords['noun'] = ['설문'];
  }

  const token = param.state.keywords['noun'];

  console.time('i18next');
  M.init({
    resources: {
      en: {
        bot: en.OFFICIAL_SURVEY,
      },
      ko: {
        bot: ko.OFFICIAL_SURVEY,
      },
    },
    lng: lang,
    fallbackLng: lang,
    debug: false,
    ns: ['bot'],
    defaultNS: 'bot',
    interpolation: {
      escapeValue: false,
    },
    returnObjects: true,
    returnedObjectHandler: true,
    joinArrays: true,
    keySeparator: true,
  });
  console.timeEnd('i18next');

  const I = {
    // 기본
    api: api,
    lang: lang,
    logger: logger,
    moduleNm: moduleNm,

    // 모션
    motion: 'speak',
    motions: ['speak', 'greeting', 'hand1'],

    // 말
    volume: 2,
    isExact: true,
    //music: '/home/pi/pibo-resource/music/official_tour.mp3',
    errMent: {
      400: M.t('API_ERR_400'),
      500: M.t('API_ERR_500'),
    },

    // api
    capi: url,
    basicHeaders: basicHeaders,
    streamHeaders: streamHeaders,

    // getData
    getApiData: F.getGetData,
    clearText: F.clearText,
  };

  if (piboInpuText.includes('우울')) {
    tNum = 0;
  } else if (piboInpuText.includes('삶') || piboInpuText.includes('살')) {
    tNum = 1;
  } else if (piboInpuText.includes('사회')) {
    tNum = 2;
  } else if (piboInpuText.includes('재화')) {
    tNum = 3;
  }

  const QD = M.t('DEMENTIA', { nickName: userNickName });
  const intros = QD.I;
  const finished = QD.F;
  const err = QD.E;
  const questions = QD.Q;
  const answer = A.dementia.A;
  const arrOfAnswerAboutQuestion = Object.keys(QD.QA[tNum]);
  const qTitleLength = questions.length;
  const qLength = Object.keys(questions[tNum]).length;

  // 봇 정보
  if (tNum === 0 && qNum === 0) {
    logger.info(
      moduleNm,
      `$ beginTime : ${moment().format('YYYY-MM-DDTHH:mm:ss.SSS')}`,
    );
    logger.info(moduleNm, `! param.token : ${JSON.stringify(token)}`);
    logger.info(moduleNm, `! param.text : ${piboInpuText}`);
    logger.info(moduleNm, `! param.cmd : ${cmd}`);
  } else {
    logger.info(moduleNm, `! survey in progress ...................`);
  }

  logger.info(moduleNm, `$ title num : ${tNum},  question num : ${qNum}`);
  logger.info(moduleNm, `$ answer : ${stateValue}`);

  const numInit = () => {
    tNum = 0;
    qNum = 0;
    lastQuestionTime = undefined;
  };

  const sayTheIntro = (i) => {
    return new Promise(function (resolve, reject) {
      const { t } = i;
      F.piboTell(I, intros[t]);
      resolve(i);
    });
  };

  const sayTheErrCard = (i) => {
    return new Promise(function (resolve, reject) {
      F.piboTell(I, err['CARD_ERR']);
      resolve(i);
    });
  };

  const sayTheExplainCard = (i) => {
    return new Promise(function (resolve, reject) {
      const { t } = i;
      F.piboTell(I, intros[`${t}-1`]);
      resolve(i);
    });
  };

  const sayTheStopAndContinue = (i) => {
    return new Promise(function (resolve, reject) {
      F.piboTell(I, intros['CHOICE_STOP_AND_CONTINUE']);
      resolve(i);
    });
  };

  const sayTheStopAndContinueExplainCard = (i) => {
    return new Promise(function (resolve, reject) {
      F.piboTell(I, intros['CHOICE_STOP_AND_CONTINUE-1']);
      resolve(i);
    });
  };

  const sayTheContinue = (i) => {
    return new Promise(function (resolve, reject) {
      F.piboTell(I, intros['CONTINUE']);
      resolve(i);
    });
  };

  const sayTheStop = (i) => {
    return new Promise(function (resolve, reject) {
      F.piboTell(I, intros['STOP']);
      numInit();
      resolve(i);
    });
  };

  const sayTheQuestion = (i) => {
    return new Promise(function (resolve, reject) {
      const { t, QKey } = i;
      F.piboTell(I, questions[t][QKey]);
      resolve(i);
    });
  };

  const sayTheAnswer = (i) => {
    return new Promise(function (resolve, reject) {
      const { t, v } = i;
      F.piboTell(I, finished['ANSWER'].replace('{answer}', QD.QA[t][v]));
      resolve(i);
    });
  };

  const sayTheFinish = (i) => {
    return new Promise(function (resolve, reject) {
      F.piboTell(I, finished['FINISH']);
      resolve(i);
    });
  };

  const searchQR = (i) => {
    return new Promise(async function (resolve, reject) {
      await api.pibo.qrsearch();
      resolve(i);
    });
  };

  const callOneself = (i) => {
    return new Promise(async function (resolve, reject) {
      api.bot('OFFICIAL_SURVEY');
      resolve(i);
    });
  };

  const report = (i) => {
    return new Promise(function (resolve, reject) {
      console.log('result : ', Object.values(answer[tNum]));
      numInit();
      resolve(i);
    });
  };

  const addTNum = () => {
    ++tNum;
  };

  const addQNum = (i) => {
    return new Promise(function (resolve, reject) {
      ++qNum;

      if (qNum === qLength) {
        addTNum();
        qNum = 0;
      }

      // 내려주는 정보 수정
      i.q = qNum;
      resolve(i);
    });
  };

  const saveAnswer = (tNum, qNum, value) => {
    const AKey = `${tNum}-${qNum}-A`;
    answer[AKey] = value;
  };

  const askQuestion = (tNum, qNum) => {
    const QKey = `${tNum}-${qNum}-Q`;
    const info = { t: tNum, q: qNum, QKey: QKey };

    if (cardErr) {
      cardErr = false;
      sayTheQuestion(info).then(searchQR);
    } else {
      if (qNum === 0) {
        sayTheIntro(info)
          .then(sayTheExplainCard)
          .then(sayTheQuestion)
          .then(searchQR);
      } else {
        sayTheQuestion(info).then(searchQR);
      }
    }
  };

  const endding = (i) => {
    if (i.q === 0) {
      return sayTheFinish().then(report);
    } else {
      return callOneself();
    }
  };

  const toAnswer = (tNum, qNum, value) => {
    const info = { t: tNum, q: qNum, v: value };

    if (arrOfAnswerAboutQuestion.includes(value)) {
      saveAnswer(tNum, qNum, value);
      addQNum(info).then(sayTheAnswer).then(endding);
    } else {
      cardErr = true;
      sayTheErrCard(info).then(sayTheExplainCard).then(callOneself);
    }
  };

  const currentTime = moment();
  const diff = currentTime.diff(lastQuestionTime, 'minute');

  // 질문을 하고 설문을 마치지 않았을 때,

  console.log('!!!!!!!!!!!!!!! lastQuestionTime', lastQuestionTime);
  console.log('!!!!!!!!!!!!!!! diff', diff);
  console.log('!!!!!!!!!!!!!!! tNum', tNum);
  console.log('!!!!!!!!!!!!!!! qNum', qNum);
  console.log('!!!!!!!!!!!!!!! continueCheck', continueCheck);

  if (
    lastQuestionTime &&
    diff > 4 &&
    !continueCheck &&
    (tNum !== 0 || qNum !== 0)
  ) {
    continueCheck = true;
    sayTheStopAndContinue()
      .then(sayTheStopAndContinueExplainCard)
      .then(searchQR);
  } else {
    // 이전 질문에 이어서 진행할 것인지, 아닌지에 관한 답변
    if (continueCheck) {
      if (stateValue) {
        const info = { t: tNum, q: qNum };
        if (stateValue === 'O') {
          continueCheck = false;
          lastQuestionTime = undefined;
          sayTheContinue(info).then(sayTheExplainCard).then(callOneself);
        } else if (stateValue === 'X') {
          continueCheck = false;
          lastQuestionTime = undefined;
          numInit();
          sayTheStop().then(callOneself);
        } else {
          sayTheErrCard().then(sayTheStopAndContinueExplainCard).then(searchQR);
        }
      }
    } else {
      // basic
      if (stateValue) {
        // 대답
        toAnswer(tNum, qNum, stateValue);
      } else {
        // 질문
        askQuestion(tNum, qNum);
        lastQuestionTime = moment();
      }
    }
  }
};
