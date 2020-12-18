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

// 타이틀 번호
let tNum = 0;

// 타이틀 안의 문제 번호
let qNum = 0;

// 질문 시간인지 답을 받는 부분인지 체크
let isQuestionTime = true;

// 카드를 잘못 보여줬는지 체크
let cardErr = false;

// 마지막 질문했던 시간
let lastQuestionTime = undefined;

// 문제가 끝나지 않고 시간이 흐름
let aLotOfTimeNoEnd = false;

// 문제가 끝나지 않고 다시 질문 함
let anotherQuestionWhenNoEnd = false;

// 멘트
let sayIntro = undefined;
let sayFinished = undefined;
let sayErr = undefined;
let questions = undefined;

// 대답 저장 장소
const answer = A.dementia.A;

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

  // 정보
  if (qNum === 0) {
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

  // 초기 설정
  if (!lastQuestionTime) {
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

    const QD = M.t('DEMENTIA', { nickName: userNickName });
    sayIntro = QD.I;
    sayFinished = QD.F;
    sayErr = QD.E;
    questions = QD.Q;
  }

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

    // getData
    getApiData: F.getGetData,
    clearText: F.clearText,
  };

  // 명령어가 들어오면 타이틀 분기 시키기
  if (piboInpuText.includes('우울')) {
    tNum = 0;
    checkContinue();
  } else if (piboInpuText.includes('삶') || piboInpuText.includes('살')) {
    tNum = 1;
    checkContinue();
  } else if (piboInpuText.includes('사회')) {
    tNum = 2;
    checkContinue();
  } else if (piboInpuText.includes('재화')) {
    tNum = 3;
    checkContinue();
  }

  // 현재 정보
  logger.info(
    moduleNm,
    `$ current : ${isQuestionTime ? 'Question' : 'Answer'}`,
  );
  logger.info(moduleNm, `$ title num : ${tNum},  question num : ${qNum}`);
  logger.info(moduleNm, `$ answer : ${stateValue}`);

  const arrOfAnswerAboutQuestion = Object.keys(QD.QA[tNum]);
  const qLength = Object.keys(questions[tNum]).length;

  // 인트로 - ~시작 + 카드 설명

  // 인트로 - 카드 설명

  // 인트로 - 이어서 시작

  // 질문 - 질문

  // 끝 - 딥

  // 끝 - 답 + 설문이 종료

  // 끝 - 이어서 시작 관련 답 + 처음 부터 시작 or 이어서 시작

  // 질문을 하고 설문을 마치지 않았을 때,
  const currentTime = moment();
  let diff = currentTime.diff(lastQuestionTime, 'minute');

  console.log('!!!!!!!!!!!!!!! lastQuestionTime', lastQuestionTime);
  console.log('!!!!!!!!!!!!!!! diff', diff);
  console.log('!!!!!!!!!!!!!!! tNum', tNum);
  console.log('!!!!!!!!!!!!!!! qNum', qNum);
  console.log('!!!!!!!!!!!!!!! aLotOfTimeNoEnd', aLotOfTimeNoEnd);

  const checkContinue = () => {
    if (qNum !== 0) {
      anotherQuestionWhenNoEnd = true;
      callOneself();
    }
  };

  const numInit = () => {
    tNum = 0;
    qNum = 0;
    lastQuestionTime = undefined;
  };

  const addQNum = (i) => {
    return new Promise(function (resolve, reject) {
      ++qNum;

      if (qNum === qLength) {
        qNum = 0;
      }

      // 내려주는 정보 수정
      i.q = qNum;
      resolve(i);
    });
  };

  const saveAnswer = (tNum, qNum, value) => {
    const AKey = `${tNum}-${qNum}-A`;

    console.log('TTNum', tNum, 'QQNum', qNum, 'VVValue', value);

    answer[tNum][AKey] = value;
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

  if (
    lastQuestionTime &&
    (diff > 4 || anotherQuestionWhenNoEnd) &&
    !aLotOfTimeNoEnd &&
    qNum !== 0
  ) {
    aLotOfTimeNoEnd = true;
    sayTheStopAndContinue()
      .then(sayTheStopAndContinueExplainCard)
      .then(searchQR);
  } else {
    // 이전 질문에 이어서 진행할 것인지, 아닌지에 관한 답변
    if (aLotOfTimeNoEnd) {
      if (stateValue) {
        const info = { t: tNum, q: qNum };
        if (stateValue === 'O') {
          aLotOfTimeNoEnd = false;
          lastQuestionTime = undefined;
          sayTheContinue(info).then(sayTheExplainCard).then(callOneself);
        } else if (stateValue === 'X') {
          aLotOfTimeNoEnd = false;
          lastQuestionTime = undefined;
          qNum = 0;
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
