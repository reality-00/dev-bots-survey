const F = require('./ext_basic_func');

const sayTheIntro = (i) => {
  return new Promise(function (resolve, reject) {
    const { t } = i;
    F.piboTell(I, sayIntro[t]);
    resolve(i);
  });
};

const sayTheErrCard = (i) => {
  return new Promise(function (resolve, reject) {
    F.piboTell(I, sayErr['CARD_ERR']);
    resolve(i);
  });
};

const sayTheExplainCard = (i) => {
  return new Promise(function (resolve, reject) {
    const { t } = i;
    F.piboTell(I, sayIntro[`${t}-1`]);
    resolve(i);
  });
};

const sayTheStopAndContinue = (i) => {
  return new Promise(function (resolve, reject) {
    F.piboTell(I, sayIntro['CHOICE_STOP_AND_CONTINUE']);
    resolve(i);
  });
};

const sayTheStopAndContinueExplainCard = (i) => {
  return new Promise(function (resolve, reject) {
    F.piboTell(I, sayIntro['CHOICE_STOP_AND_CONTINUE-1']);
    resolve(i);
  });
};

const sayTheContinue = (i) => {
  return new Promise(function (resolve, reject) {
    F.piboTell(I, sayIntro['CONTINUE']);
    resolve(i);
  });
};

const sayTheStop = (i) => {
  return new Promise(function (resolve, reject) {
    F.piboTell(I, sayIntro['STOP']);
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
    F.piboTell(I, sayFinished['ANSWER'].replace('{answer}', QD.QA[t][v]));
    resolve(i);
  });
};

const sayTheFinish = (i) => {
  return new Promise(function (resolve, reject) {
    F.piboTell(I, sayFinished['FINISH']);
    resolve(i);
  });
};

const callOneself = (i) => {
  return new Promise(async function (resolve, reject) {
    api.bot('OFFICIAL_SURVEY');
    resolve(i);
  });
};

const searchQR = (i) => {
  return new Promise(async function (resolve, reject) {
    await api.pibo.qrsearch();
    resolve(i);
  });
};

const report = (i) => {
  return new Promise(function (resolve, reject) {
    console.log('RRRRRRRRRRRRReport', tNum);

    console.log('result : ', Object.values(answer[tNum]));
    //numInit();
    resolve(i);
  });
};
