exports.init = {
  start: {
    ko: ['설문', '질문'],
    en: ['survey'],
  },
  end: {
    ko: ['종료'],
    en: ['end'],
  },
  locale: ['ko'],
  example: {
    ko: [
      '파이보, 우울 상태 대해 질문해줘.',
      '파이보, 삶의 질 상태에 대해 질문해줘.',
      '파이보, 사회 기능 상태에 대해 질문해줘.',
      '파이보, 재활 서비스 상태에 대해 질문해줘.',
    ],
    en: [],
  },
  title: {
    ko: '질문',
    en: '',
  },
  description: {
    ko: '파이보가 너에게 질문을 해줄게.',
    en: '',
  },
  standalone: false,
  permission: ['speak'],
  visible: true,
  type: 2,
  cateogry: 1,
};

exports.node = {
  common: [
    {
      id: '$_BC',
      q: {
        ko: ['봇카드'],
      },
      a: {
        ko: [''],
      },
    },
  ],
};
