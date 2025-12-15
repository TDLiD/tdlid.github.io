// js/news.js (게시판 페이지 목록 렌더링 용)

// 페이지의 모든 DOM 내용이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    // news.html 페이지의 컨테이너 요소를 찾습니다.
    const newsListContainer = document.querySelector('#newsListContainer');
    
    // 해당 요소가 없으면 (즉, index.html 페이지라면) 아무것도 하지 않고 종료
    if (!newsListContainer) return;

    // 데이터 로드 및 렌더링 함수 실행
    loadNewsData(newsListContainer);
});


/**
 * news.json에서 데이터를 불러와 목록을 렌더링합니다.
 * @param {HTMLElement} newsListElement - 뉴스가 렌더링될 DOM 요소 (#newsListContainer)
 */
async function loadNewsData(newsListElement) {
    // 로딩 메시지 표시
    newsListElement.innerHTML = `<p class="text-center text-neutral-500 py-10 text-xl">Loading news...</p>`;

    try {
        // news.html이 index.html과 같은 폴더에 있고, data 폴더가 그 아래에 있다고 가정합니다.
        const res = await fetch("data/news.json"); 
        
        if (!res.ok) throw new Error("뉴스 데이터를 불러올 수 없습니다. Status: " + res.status);
        
        const newsData = await res.json();

        if (newsData.length === 0) {
            newsListElement.innerHTML = `<p class="text-center text-neutral-500 py-10 text-xl">No news articles available at the moment.</p>`;
            return;
        }
        
// 데이터 렌더링
        // 🚨 최종 수정 템플릿 (반응형 줄바꿈):
        // 1. <a> 태그에 flex-col과 md:flex-row를 적용하여 창 너비에 따라 세로/가로 정렬 전환
        // 2. 제목에서 whitespace-nowrap을 제거하여 줄바꿈 허용 (세로 길이 확장)
        // 3. Source/Date는 좁은 화면에서 제목 아래로 이동하고, 넓은 화면에서 오른쪽으로 자동 이동
        newsListElement.innerHTML = newsData.map((item, index) => `
            <a href="${item.url}" target="_blank" rel="noopener noreferrer" 
               class="py-3 px-4 md:py-4 md:px-6 bg-neutral-900 border border-neutral-800 rounded-xl 
                      flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 
                      transition-colors hover:bg-cyan-500/10 hover:border-cyan-500 w-full">
                
                <div class="flex items-start flex-grow min-w-0 w-full md:w-auto">
                    <div class="text-base md:text-xl font-bold text-cyan-500 flex-shrink-0 w-6 md:w-8 pt-0.5">${index + 1}.</div>
                    
                    <div class="text-base md:text-xl font-semibold text-white ml-2">
                        ${item.title}
                    </div>
                </div>

                <div class="flex-shrink-0 text-left md:text-right w-full md:w-auto md:ml-auto ml-8 md:ml-0">
                    <span class="text-xs md:text-sm text-neutral-400 whitespace-nowrap">Source: ${item.source}</span>
                    <span class="text-xs md:text-sm text-neutral-500 font-medium pl-3 whitespace-nowrap">| ${item.publishedDate}</span>
                </div>
            </a>
        `).join('');

    } catch (error) {
        console.error("❌ 뉴스 로딩 실패:", error);
        // 에러 메시지 표시
        newsListElement.innerHTML = `
            <div class="p-6 bg-neutral-900 border border-neutral-800 rounded-xl text-center">
                <h4 class="text-red-400 font-semibold mb-2">Failed to load news data</h4>
                <p class="text-sm text-neutral-400">파일 경로(data/news.json)를 확인하거나 로컬 서버에서 실행해 주세요. (${error.message})</p>
            </div>
        `;
    }
}