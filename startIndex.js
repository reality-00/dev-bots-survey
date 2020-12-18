const { api } = require('./botsApi/botsApi');
// const { bot } = require('./index');
const { bot } = require('./index');

const example = {
  ko: ['파이보, 설문하자.'],
  en: [
    'pi·bo,  tell me about travel information​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​.',
  ],
};

const nouns = {
  ko: [['설문']],

  en: [['information', 'traval']],
};

const value = {
  ko: '[12, 2390225]',
  en: '[76, 1349267, "en"]',
};

const lang = api.config.get('language');
const param = {
  state: {
    token: ['부산', '역사', '여행'],
    text: example[lang][0],
    keywords: { noun: nouns[[lang]][0] },
    cmd: '$_BC',
    value: '',
    type: 'Q',
  },
};

bot(param, api);
