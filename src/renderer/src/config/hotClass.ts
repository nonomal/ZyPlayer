export default {
  kuyun: {
    name: '酷云eye',
    url: 'https://eye.kuyun.com/',
    data: {
      episode: {
        key: 2,
        name: '剧集',
        source: [
          { key: 1, name: '腾讯视频' },
          { key: 2, name: '爱奇艺' },
          { key: 3, name: '优酷' },
          { key: 4, name: '芒果' },
        ],
      },
      variety: {
        key: 3,
        name: '综艺',
        source: [
          { key: 1, name: '腾讯视频' },
          { key: 2, name: '爱奇艺' },
          { key: 3, name: '优酷' },
          { key: 4, name: '芒果' },
        ],
      },
      movie: {
        key: 1,
        name: '电影',
        source: [
          { key: 1, name: '腾讯视频' },
          { key: 2, name: '爱奇艺' },
          { key: 3, name: '优酷' },
        ],
      },
    },
  },
  kylive: {
    name: 'ky.live',
    url: 'https://www.ky.live/#/',
    data: [
      {
        key: 0,
        name: '全端热度',
      },
      {
        key: 1,
        name: '爱奇艺',
      },
      {
        key: 2,
        name: '腾讯视频',
      },
      {
        key: 3,
        name: '优酷',
      },
      {
        key: 4,
        name: '芒果',
      },
    ],
  },
  enlightent: {
    name: '云合数据',
    url: 'https://www.enlightent.cn/sixiang/rank-list/',
    data: [
      {
        key: 'tv',
        name: '连续剧',
      },
      {
        key: 'art',
        name: '综艺',
      },
      {
        key: 'movie',
        name: '电影',
      },
    ],
  },
  douban: {
    name: '豆瓣数据',
    url: 'https://www.douban.com',
    data: [
      {
        key: 'tv_hot',
        name: '热播新剧',
      },
      {
        key: 'tv_variety_show',
        name: '热播综艺',
      },
      {
        key: 'movie_hot_gaia',
        name: '豆瓣热播',
      },
      {
        key: 'movie_showing',
        name: '影院热映',
      },
    ],
  },
  komect: {
    name: '未来电视数据',
    url: 'https://msi.nsoap.komect.com/minitvH5/index.html#/hotlist?licensedParty=%E6%9C%AA%E6%9D%A5%E7%94%B5%E8%A7%86&isOuter=undefined&provCode=42&deviceType=502090&isNewTheme',
    data: [
      {
        key: '电影',
        name: '电影',
      },
      {
        key: '电视剧',
        name: '电视剧',
      },
      {
        key: '综艺',
        name: '综艺',
      },
      {
        key: '少儿',
        name: '少儿',
      },
    ],
  },
};
