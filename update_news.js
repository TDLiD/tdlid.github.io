const admin = require('firebase-admin');
const axios = require('axios');

// 1. Firebase 관리자 설정 (비공개 키는 GitHub Secrets에서 가져옴)
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tdlid-107669-default-rtdb.firebaseio.com" 
});

const db = admin.database();

async function fetchNews() {
  try {
    const API_KEY = process.env.NEWS_API_KEY; // NewsAPI.org 키
    const query = encodeURIComponent('"electric motorcycle" Indonesia');
    const url = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&language=en&apiKey=${API_KEY}`;

    const response = await axios.get(url);
    const articles = response.data.articles.slice(0, 2); // 최신 뉴스 2개만 선택

    for (const article of articles) {
      const timestamp = Date.now();
      const newsId = `news_${timestamp}_${Math.floor(Math.random() * 1000)}`;

      // 기존 JSON 형식과 일치하도록 데이터 구성
      const newsData = {
        category: "news",
        content: article.url,
        date: new Date().toISOString().split('T')[0],
        timestamp: timestamp,
        title: article.title
      };

      // Firebase 'notices' 경로에 데이터 추가
      await db.ref(`notices/${newsId}`).set(newsData);
      console.log(`Updated: ${article.title}`);
    }
    console.log("All news updated successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Update failed:", error);
    process.exit(1);
  }
}

fetchNews();