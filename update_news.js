const admin = require('firebase-admin');
const axios = require('axios');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tdlid-107669-default-rtdb.firebaseio.com" 
});

const db = admin.database();

async function fetchNews() {
  try {
    const API_KEY = process.env.NEWS_API_KEY;

    // 검색 확률을 높이기 위한 5가지 주요 키워드 조합 (OR 연산자 사용)
    // 1. "electric motorcycle Indonesia" (기본)
    // 2. "EV battery Indonesia" (배터리 공장 관련)
    // 3. "Gesits" OR "Alva One" (인도네시아 현지 브랜드)
    // 4. "motor listrik" (인도네시아어 키워드)
    // 5. "swap battery Indonesia" (인프라 관련)
    const keywords = [
      '"electric motorcycle" Indonesia',
      '"EV battery" Indonesia',
      '"motor listrik" Indonesia',
      'Gesits OR "Alva One"',
      '"battery factory" Indonesia'
    ];
    
    // 키워드를 하나로 묶음
    const searchQuery = keywords.join(' OR ');
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&sortBy=publishedAt&language=en&apiKey=${API_KEY}`;

    const response = await axios.get(url);
    
    // 검색 결과가 없는 경우 처리
    if (!response.data.articles || response.data.articles.length === 0) {
      console.log("최근 30일 이내에 검색된 뉴스가 없습니다.");
      process.exit(0);
    }

    const articles = response.data.articles.slice(0, 3); // 검색 결과 중 최신 3개 선택

    for (const article of articles) {
      // 삭제된 기사 필터링
      if (article.title === "[Removed]") continue;

      const timestamp = Date.now();
      const newsId = `news_${timestamp}_${Math.floor(Math.random() * 1000)}`;

      const newsData = {
        category: "news",
        content: article.url,
        date: new Date().toISOString().split('T')[0],
        timestamp: timestamp,
        title: article.title
      };

      await db.ref(`notices/${newsId}`).set(newsData);
      console.log(`성공적으로 업데이트됨: ${article.title}`);
    }
    
    console.log("뉴스 업데이트 프로세스 완료.");
    process.exit(0);
  } catch (error) {
    console.error("업데이트 실패:", error);
    process.exit(1);
  }
}

fetchNews();


