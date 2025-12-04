// js/ui.js
// UI 인터랙션: 모바일 메뉴, 스크롤 애니메이션, 카운터 효과

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
// ✅ 초기화
// ================================
document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initScrollReveal();
    initCounters();
});