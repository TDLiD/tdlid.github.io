// js/ui.js
// UI 인터랙션: 모바일 메뉴, 스크롤 애니메이션, 카운터 효과, 커서 라이트

// ================================
// ✅ 모바일 메뉴 토글
// ================================
function initMobileMenu() {
    const btn = document.getElementById("mobileMenuBtn");
    const nav = document.querySelector("header nav");

    if (!btn || !nav) return;

    btn.addEventListener("click", () => {
        nav.classList.toggle("hidden");
        nav.classList.toggle("flex");
        nav.classList.toggle("flex-col");
        nav.classList.toggle("absolute");
        nav.classList.toggle("top-16");
        nav.classList.toggle("right-6");
        nav.classList.toggle("bg-neutral-900");
        nav.classList.toggle("p-6");
        nav.classList.toggle("rounded-2xl");
        nav.classList.toggle("shadow-xl");
        nav.classList.toggle("border");
        nav.classList.toggle("border-neutral-800");
        nav.classList.toggle("z-50");
    });
}


// ================================
// ✅ 스크롤 페이드-인 애니메이션
// ================================
function initScrollReveal() {
    const targets = document.querySelectorAll("section, .reveal");

    targets.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(40px)";
        el.style.transition = "all 0.8s ease";
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, { threshold: 0.15 });

    targets.forEach(el => observer.observe(el));
}


// ================================
// ✅ 숫자 카운터 애니메이션
// (사용 시 data-target="100" 속성 필요)
// ================================
function initCounters() {
    const counters = document.querySelectorAll("[data-target]");

    const animateCounter = (el) => {
        const target = +el.dataset.target;
        let current = 0;
        const increment = target / 60;

        const update = () => {
            if (current < target) {
                current += increment;
                el.innerText = Math.ceil(current);
                requestAnimationFrame(update);
            } else {
                el.innerText = target;
            }
        };

        update();
    };

    const counterObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.6 });

    counters.forEach(counter => counterObserver.observe(counter));
}


// ================================
// ✅ 커서 라이트 및 색상 반전 효과
// ================================
function initCursorLight() {
    const cursorLight = document.getElementById('cursorLight');
    // 색상 반전 효과를 적용할 요소들을 선택합니다.
    const invertElements = document.querySelectorAll('.invert-on-hover, .animated-logo-text, .hero-description, .cta-primary, .cta-secondary, h1, h3, h4, a'); 
    
    if (!cursorLight) return;

    // ----------------------------------------------------
    // 1. 커서 라이트 위치 업데이트 (마우스 추적)
    // ----------------------------------------------------
    document.addEventListener('mousemove', (e) => {
        // 커서 라이트 크기(250px)의 절반을 빼서 커서 중앙에 위치시킵니다.
        const x = e.clientX - 125; 
        const y = e.clientY - 125;
        cursorLight.style.transform = `translate(${x}px, ${y}px)`;
    });

    // ----------------------------------------------------
    // 2. 텍스트 색상 반전 로직 (충돌 감지)
    // ----------------------------------------------------
    const getLightRect = () => {
        // 커서 라이트의 위치와 크기 정보를 가져옵니다.
        const rect = cursorLight.getBoundingClientRect();
        return {
            centerX: rect.left + rect.width / 2,
            centerY: rect.top + rect.height / 2,
            radius: rect.width / 2
        };
    };

    const isElementInLight = (elementRect, lightRect) => {
        // 요소의 중심 좌표를 계산합니다.
        const elemCenterX = elementRect.left + elementRect.width / 2;
        const elemCenterY = elementRect.top + elementRect.height / 2;

        // 요소 중심과 커서 라이트 중심 사이의 거리를 계산합니다.
        const distance = Math.sqrt(
            Math.pow(elemCenterX - lightRect.centerX, 2) + 
            Math.pow(elemCenterY - lightRect.centerY, 2)
        );

        // 거리가 원의 반지름 * 0.6 (감지 민감도)보다 작으면 충돌로 간주합니다.
        return distance < lightRect.radius * 0.6; 
    };

    const updateInvertEffect = () => {
        const lightRect = getLightRect();

        invertElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            
            if (isElementInLight(rect, lightRect)) {
                // 커서 라이트 영역에 들어왔을 때 색상 반전 클래스 추가
                element.classList.add('invert-active');
            } else {
                // 영역을 벗어났을 때 클래스 제거
                element.classList.remove('invert-active');
            }
        });
        
        // 다음 프레임에서 효과를 부드럽게 업데이트
        requestAnimationFrame(updateInvertEffect);
    };

    // 애니메이션 루프 시작
    requestAnimationFrame(updateInvertEffect);
}


// ================================
// ✅ 초기화
// ================================
document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initScrollReveal();
    initCounters();
    initCursorLight(); // 새 기능 초기화
});