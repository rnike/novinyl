const languageSelector = country => ({
  newHits: country === 'TW' ? '速爆新歌' : 'NEW HITS',
  searchSongs: country === 'TW' ? '搜尋歌曲' : 'FIND SONGS',
  mobileNotSupported: country === 'TW' ? '不支援行動裝置' : 'Mobile not supported',
  safariAutoplayNotice:
    country === 'TW'
      ? 'Safari 瀏覽器請先至設定允許此頁面的自動撥放'
      : 'On safari please enable autoplay on this website.',
  howTo: country === 'TW' ? '如何做?' : 'How to?',
  chromeRecommendation:
    country === 'TW' ? '使用 Chrome 獲得最佳體驗' : 'Change to Chrome for better experience'
});

export default languageSelector;
