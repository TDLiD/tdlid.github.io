// js/main.js (modified parts only; replace your existing file with this full content)

const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* existing functions retained (pageIntro, initHeroParallax, initMouseGlow, etc.)
   We'll include them unchanged where necessary — below is the init flow and new handlers. */

// ... (Keep pageIntro, initHeroParallax, initMouseGlow, initSmoothAnchors, initContactForm, showToast here — as in your original file)

/* For brevity, paste your existing earlier functions (pageIntro, initHeroParallax, initMouseGlow, showToast, initProductModalBase etc.)
   and then replace / append the following new utilities and event wiring. */



/* NEW — Product detail + Quote / Compare handling (safe DOM ops) */
function initProductInteractions() {
    const grid = qs('#productGrid');
    if (!grid) return;

    // Product details modal (re-use productModal if exists else create)
    let modal = qs('#productModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'productModal';
        modal.style.position = 'fixed';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.right = '0';
        modal.style.bottom = '0';
        modal.style.display = 'none';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9998';
        modal.innerHTML = `
            <div style="position:absolute; inset:0; background: rgba(2,6,23,0.75); backdrop-filter: blur(6px);"></div>
            <div id="productModalCard" style="position:relative; width:min(980px,92%); max-height:86vh; overflow:auto; border-radius:12px; padding:22px; background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border:1px solid rgba(255,255,255,0.04); box-shadow:0 30px 80px rgba(2,6,23,0.7);">
                <button id="productModalClose" style="position:absolute; right:14px; top:14px; background:transparent; border:none; color:#e6eef8; font-size:18px;">✕</button>
                <div id="productModalContent"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.js-view-details');
        if (!btn) return;
        const card = btn.closest('.group');
        if (!card) return;

        const product = JSON.parse(card.dataset.product || '{}');

        const content = qs('#productModalContent');
        content.innerHTML = `
            <div style="display:flex; gap:20px; flex-wrap:wrap; align-items:flex-start">
                <img src="${product.image || 'images/product-fallback.jpg'}" alt="${product.name}" style="width:320px; height:220px; object-fit:cover; border-radius:8px; box-shadow:0 20px 50px rgba(0,0,0,0.6)">
                <div style="flex:1; min-width:220px">
                    <h3 style="font-size:20px; margin-bottom:8px">${product.name}</h3>
                    <p style="color:rgba(255,255,255,0.85); margin-bottom:12px">${product.description || ''}</p>
                    <ul style="color:rgba(255,255,255,0.85); font-size:14px; line-height:1.6;">
                        <li>Voltage: ${product.voltage || '-'}</li>
                        <li>Capacity: ${product.capacity || '-'}</li>
                        <li>Range: ${product.range || '-'}</li>
                        <li>Weight: ${product.weight || '-'}</li>
                        <li>BMS: ${product.bms || '-'}</li>
                    </ul>
                    <div style="margin-top:14px; display:flex; gap:8px;">
                        ${product.datasheet ? `<a href="${product.datasheet}" target="_blank" class="px-3 py-2 rounded-md border">Download Datasheet</a>` : ''}
                        <button id="modalRequestQuote" data-product="${encodeURIComponent(product.name || '')}" style="padding:10px 14px; border-radius:10px; border:1px solid rgba(34,211,238,0.25); background:linear-gradient(90deg, rgba(34,211,238,0.06), transparent);">Request Quote</button>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
    });

    // close modal
    document.addEventListener('click', (e) => {
        if (e.target.id === 'productModal' || e.target.id === 'productModalClose') {
            qs('#productModal').style.display = 'none';
        }
    });

    // delegate request quote from modal to real quote modal
    document.body.addEventListener('click', (e) => {
        const rq = e.target.closest('#modalRequestQuote, #heroRequestQuote');
        if (!rq) return;
        const productName = decodeURIComponent(rq.dataset.product || '');
        openQuoteModal(productName);
    });
}

/* Quote modal helpers */
function openQuoteModal(productName = '') {
    const modal = qs('#quoteModal');
    const form = qs('#quoteForm'); // 폼 리셋을 위해 form 객체 추가
    
    if (!modal || !form) return;

    // ✅ 수정: CSS에 정의된 대로 'show' 클래스를 추가하여 모달을 표시
    modal.classList.add('show'); 
    
    const input = qs('#quoteForm input[name="product"]') || qs('#quoteProduct');
    if (input) input.value = productName || '';
    
    // 폼 초기화
    form.reset(); 
}

function closeQuoteModal() {
    const modal = qs('#quoteModal');
    if (!modal) return;
    
    // ✅ 수정: 'show' 클래스를 제거하여 모달을 숨김
    modal.classList.remove('show');
}


/* Compare table show/hide */
function initCompareUI() {
    const openBtn = qs('#openCompare');
    const compareModal = qs('#compareModal');
    const closeBtn = qs('#closeCompare');
    if (!openBtn || !compareModal) return;

    openBtn.addEventListener('click', () => {
        // build compare table from global products array
        const products = window.__NG_products || [];
        const container = qs('#compareTableContainer');
        if (!container) return;

        if (!products.length) {
            container.innerHTML = '<div class="py-6 text-center text-neutral-400">No products to compare.</div>';
        } else {
            const headers = ['Model', 'Voltage','Capacity','Range','Weight','BMS','Datasheet'];
            let html = '<table><thead><tr>' + headers.map(h=>`<th>${h}</th>`).join('') + '</tr></thead><tbody>';
            products.forEach(p=>{
                html += `<tr>
                    <td>${p.name}</td>
                    <td>${p.voltage || '-'}</td>
                    <td>${p.capacity || '-'}</td>
                    <td>${p.range || '-'}</td>
                    <td>${p.weight || '-'}</td>
                    <td>${p.bms || '-'}</td>
                    <td>${p.datasheet ? `<a href="${p.datasheet}" target="_blank" class="fileLink">PDF</a>` : '-'}</td>
                </tr>`;
            });
            html += '</tbody></table>';
            container.innerHTML = html;
        }

        compareModal.classList.add('show');
    });

    closeBtn?.addEventListener('click', () => {
        compareModal.classList.remove('show');
    });

    // close on overlay click
    compareModal?.addEventListener('click', (e) => {
        if (e.target === compareModal) compareModal.classList.remove('show');
    });
}

/* sticky CTA show on scroll */
function initStickyCTA() {
    const bar = qs('#stickyCTABar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y > 300) {
            bar.classList.remove('hidden');
            bar.style.display = 'flex';
        } else {
            bar.classList.add('hidden');
            bar.style.display = 'none';
        }
    }, { passive: true });
}

// js/main.js 파일 (initQuoteForm 함수)

/* NEW — Quote Form Handler */
function initQuoteForm() {
    const quoteModal = qs('#quoteModal');
    const heroBtn = qs('#heroRequestQuote');
    const quoteCancelBtn = qs('#quoteCancel');

    if (!quoteModal) return;

    // 1. Hero 섹션 버튼 클릭 핸들러 (전역 openQuoteModal 호출)
    if (heroBtn) {
        heroBtn.addEventListener('click', () => openQuoteModal('General Inquiry'));
    }

    // 2. 닫기 버튼 핸들러 (전역 closeQuoteModal 호출)
    if (quoteCancelBtn) {
        quoteCancelBtn.addEventListener('click', closeQuoteModal);
    }

    // 3. 모달 외부 클릭 시 닫기 (전역 closeQuoteModal 호출)
    quoteModal.addEventListener('click', (e) => {
        if (e.target === quoteModal) {
            closeQuoteModal();
        }
    });
    
    // 폼 제출 처리는 Formspree가 담당하므로, JS에서는 이벤트 리스너를 제거합니다.
}


/* contact form */
function initContactForm() {
    const form = qs('#contactForm');
    if (!form) return;

}

/* ✅ 자동 그라데이션 애니메이션 제어 함수 */
function toggleLogoGradientAnimation(shouldPause = null) {
    const logoText = document.querySelector('.animated-logo-text');
    if (!logoText) return;

    if (shouldPause === true) {
        // 애니메이션 정지 (off)
        logoText.classList.add('paused');
        console.log('Logo Gradient Paused.');
    } else if (shouldPause === false) {
        // 애니메이션 재개 (on)
        logoText.classList.remove('paused');
        console.log('Logo Gradient Running.');
    } else {
        // 현재 상태를 반전
        logoText.classList.toggle('paused');
        console.log('Logo Gradient Toggled.');
    }
}


function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className =
        `fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-xl text-white z-[9999] 
        ${type === "success" ? "bg-green-600" : 
           type === "error"   ? "bg-red-600"   : 
                                "bg-gray-800"}`;

    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("opacity-0", "transition-opacity");
    }, 2300);

    setTimeout(() => {
        toast.remove();
    }, 2800);
}

/* NEW — CSV Download Utility (for Download Sample Quote button) */
function generateAndDownloadCsv(data, filename = 'data.csv', fields) {
    if (!data || data.length === 0) {
        showToast('No product data available for download.', 'error');
        return;
    }

    // Define fields (headers)
    const headers = fields || Object.keys(data[0]);

    // Format CSV content
    const headerCsv = headers.join(',');
    
    const rowsCsv = data.map(row => {
        return headers.map(fieldName => {
            let value = row[fieldName] || '-';
            if (typeof value === 'object' && value !== null) {
                value = JSON.stringify(value);
            }
            // CSV escaping
            value = String(value).replace(/"/g, '""');
            return `"${value}"`;
        }).join(',');
    }).join('\n');

    const csvContent = headerCsv + '\n' + rowsCsv;

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Sample quote data downloaded successfully.', 'success');
}

/* NEW — Download Quote CSV Button Handler */
function initDownloadQuoteCsv() {
    const btn = qs('#downloadQuoteCsv');
    if (!btn) return;

    btn.addEventListener('click', () => {
        // data_loader.js에서 전역에 저장한 제품 목록을 사용
        const products = window.__NG_products || [];
        
        // CSV에 포함할 필드 정의 (필요에 따라 조정 가능)
        const fields = [
            'name', 'voltage', 'capacity', 'range', 'weight', 'bms', 'datasheet'
        ];

        generateAndDownloadCsv(products, 'TDL-Product-Specs-Sample.csv', fields);
    });
}

/* NEW — Product Data Loader */
// products.json 파일을 비동기로 불러와 전역 변수에 저장합니다.
async function loadProductData() {
    // 🚨 파일 경로가 'products.json'이라고 가정합니다. 파일이 다른 곳에 있다면 경로를 수정하세요.
    const productDataUrl = 'data/products.json'; 

    try {
        const response = await fetch(productDataUrl);
        if (!response.ok) {
            // 파일을 찾을 수 없거나 로드에 실패하면 오류 발생
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();
        
        // ✅ 핵심: 전역 변수에 데이터 할당
        window.__NG_products = products; 
        
        console.log(`[Data Loaded] ${products.length} products loaded into window.__NG_products`);
        
        // 데이터 로드 성공 후, 제품 데이터에 의존하는 UI를 초기화합니다.
        // 기존 DOMContentLoaded에서 호출하던 함수들입니다.
        initProductInteractions(); 
        initCompareUI(); 

    } catch (error) {
        console.error('Failed to load product data:', error);
        // showToast 함수가 있다면 에러 메시지를 사용자에게 표시할 수 있습니다.
        // if (typeof showToast === 'function') {
        //     showToast('제품 데이터를 로드하는 데 실패했습니다.', 'error');
        // }
    }
}

// js/main.js에 아래 함수를 추가합니다.

/* NEW — Product Gallery (PDF Viewer Style) */
function initProductGallery() {
    const container = qs('#galleryImageContainer');
    const prevBtn = qs('#galleryPrevBtn');
    const nextBtn = qs('#galleryNextBtn');
    const statusSpan = qs('#galleryStatus');
    
    if (!container || !prevBtn || !nextBtn || !statusSpan) return;

// 🚨 [수정 1] 총 페이지 수를 32로 변경합니다.
    const totalPages = 32; 
    
    // 🚨 [수정 2] 파일 경로 접두사를 'data/products/image-'로 유지합니다.
    const pathPrefix = 'data/products/image-'; 
    
    let currentPage = 1;
    let autoSlideInterval;
    const slideDuration = 3000; // 8초마다 자동 전환

    // 🚨 [수정 3] 이미지 파일명 형식 로직을 'image-1.png' 형식으로 변경합니다.
    const getImagePath = (page) => {
        // 기존의 .padStart(3, '0') 코드를 제거하여 패딩을 없앱니다.
        // ex: image-1.png, image-10.png
        return `${pathPrefix}${page}.png`; 
    };

    // 이미지 표시 함수
    const updateGallery = () => {
        // 이미지를 동적으로 생성/업데이트
        container.innerHTML = `<img src="${getImagePath(currentPage)}" alt="Product Page ${currentPage}" class="w-full h-full object-contain transition-opacity duration-500">`;
        
        // 상태 텍스트 업데이트
        statusSpan.textContent = `Page ${currentPage} / ${totalPages}`;
        
        // 버튼 활성화/비활성화
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
        prevBtn.classList.toggle('opacity-50', prevBtn.disabled);
        nextBtn.classList.toggle('opacity-50', nextBtn.disabled);
    };

    // 페이지 이동 로직
    const changePage = (step) => {
        let newPage = currentPage + step;
        if (newPage < 1) newPage = totalPages; // 순환 설정 (선택 사항)
        else if (newPage > totalPages) newPage = 1; // 순환 설정 (선택 사항)
        
        // 순환을 원하지 않는다면:
        // if (newPage >= 1 && newPage <= totalPages) { 
        //     currentPage = newPage;
        //     updateGallery();
        // }
        
        currentPage = newPage;
        updateGallery();
    };

    // 자동 슬라이드 시작/재설정
    const startAutoSlide = () => {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(() => {
            changePage(1);
        }, slideDuration);
    };
    
    // 이벤트 리스너 설정
    prevBtn.addEventListener('click', () => {
        changePage(-1);
        startAutoSlide(); // 수동 클릭 후 자동 전환 재시작
    });
    nextBtn.addEventListener('click', () => {
        changePage(1);
        startAutoSlide(); // 수동 클릭 후 자동 전환 재시작
    });
    
    // 초기화
    updateGallery();
    startAutoSlide();
}



/* init all */
document.addEventListener('DOMContentLoaded', () => {
    // keep existing initializations if present
    try { pageIntro(); } catch(e){}
    try { initHeroParallax(); } catch(e){}
    try { initMouseGlow(); } catch(e){}
    try { initSmoothAnchors(); } catch(e){}
    
    // 1. 제품 데이터 로드 시작 (비동기)
    // 이 함수 내부에서 initProductInteractions()와 initCompareUI()가 호출됩니다.
    loadProductData(); 
    
    // 2. 데이터 로드와 관계없이 즉시 실행 가능한 기능들
    // 🚨 기존의 initProductInteractions()와 initCompareUI() 호출은 제거해야 합니다.
    // initProductInteractions(); // 👈 제거 (loadProductData 안으로 이동)
    // initCompareUI();          // 👈 제거 (loadProductData 안으로 이동)
    
// ✅ 신규 갤러리 기능 초기화
    initProductGallery();

    initStickyCTA();
    initQuoteForm();
    initContactForm();
    initDownloadQuoteCsv();

// ✨ NEW: 뉴스 모달 초기화
   // initNewsModal();
    
    // show sticky CTA immediately on tall screens
    setTimeout(()=>{ const bar = qs('#stickyCTABar'); if(bar) bar.classList.add('hidden'); }, 200);
});



// ===== Mobile Menu Logic =====
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const menuBox = document.getElementById('mobileMenu');
    const menuClose = document.getElementById('mobileMenuClose');

    if(menuBtn && menuBox && menuClose){
        menuBtn.addEventListener('click', () => {
            menuBox.classList.remove('hidden');
        });

        menuClose.addEventListener('click', () => {
            menuBox.classList.add('hidden');
        });

        // Close on link click
        document.querySelectorAll('.mobile-nav').forEach(link => {
            link.addEventListener('click', () => {
                menuBox.classList.add('hidden');
            });
        });
    }
});


/* ================================
   CURSOR SPOTLIGHT SCRIPT
================================ */
document.addEventListener("DOMContentLoaded", () => {
    const spotlight = document.getElementById("cursor-spotlight");
    if (!spotlight) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        spotlight.style.left = mouseX + "px";
        spotlight.style.top  = mouseY + "px";
    });
});


document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".image-card");
    const firstImg = document.querySelector(".image-card img");

    if (!firstImg) return;

    function syncHeights() {
        const h = firstImg.naturalHeight * (firstImg.clientWidth / firstImg.naturalWidth);

        cards.forEach(card => {
            card.style.height = h + "px";
        });
    }

    // 이미지 로드 완료 후 실행
    if (firstImg.complete) {
        syncHeights();
    } else {
        firstImg.onload = syncHeights;
    }

    // 리사이즈 대응
    window.addEventListener("resize", syncHeights);
});

/* ============================================================
   IMAGE POPUP (TECHNOLOGY + SOLUTION 공통)
   ============================================================ */

function initImagePopup() {

    // 팝업 생성 (한번만)
    let popup = document.getElementById('imagePopup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'imagePopup';
        popup.style.cssText = `
            position: fixed;
            inset: 0;
            display: none;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.85);
            z-index: 999999;
            padding: 20px;
        `;
        popup.innerHTML = `
            <div id="popupContent" style="display:flex; gap:20px; max-width:95%; max-height:95%;"></div>
            <button id="popupClose" style="
                position:absolute;
                top:20px; right:25px;
                font-size:30px;
                background:none; border:none;
                color:white;
                cursor:pointer;
            ">✕</button>
        `;
        document.body.appendChild(popup);
    }

    const popupContent = popup.querySelector('#popupContent');
    const popupClose   = popup.querySelector('#popupClose');

    /* 공통 클릭 로직 */
    function openPopup(srcList) {
        popupContent.innerHTML = '';

        srcList.forEach(src => {
            const img = document.createElement('img');
            img.src = src.trim();
            img.style.maxWidth = '48%';
            img.style.maxHeight = '90vh';
            img.style.objectFit = 'contain';
            popupContent.appendChild(img);
        });

        popup.style.display = 'flex';
    }

    function closePopup() {
        popup.style.display = 'none';
    }

    popupClose.addEventListener('click', closePopup);
    popup.addEventListener('click', e => {
        if (e.target === popup) closePopup();
    });

    /* Technology 섹션 */
    document.querySelectorAll('.openBatteryDetail').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const srcs = btn.dataset.detailSrc.split(',');
            openPopup(srcs);
        });
    });

    /* Solutions 섹션 */
    document.querySelectorAll('.openSolutionDetail').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const srcs = btn.dataset.detailSrc.split(',');
            openPopup(srcs);
        });
    });
}

/* DOMContentLoaded 안에 추가 */
document.addEventListener('DOMContentLoaded', () => {
    initImagePopup();
});


/* expose */
window.__NG = window.__NG || {};
window.__NG.showToast = showToast;

