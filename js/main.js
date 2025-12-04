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
    if (!modal) return;
    modal.classList.add('show');
    const input = qs('#quoteForm input[name="product"]') || qs('#quoteProduct');
    if (input) input.value = productName || '';
}
function closeQuoteModal() {
    const modal = qs('#quoteModal');
    if (!modal) return;
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

/* quote form submit */
function initQuoteForm() {
    const form = qs('#quoteForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = new FormData(form);
        // For demo: show toast and close modal
        showToast('Quote request submitted — our sales team will contact you.');
        closeQuoteModal();
        form.reset();
    });

    qs('#quoteCancel')?.addEventListener('click', closeQuoteModal);
}

/* contact form */
function initContactForm() {
    const form = qs('#contactForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('문의가 접수되었습니다. 담당자가 곧 연락드립니다.');
        form.reset();
    });
}

/* init all */
document.addEventListener('DOMContentLoaded', () => {
    // keep existing initializations if present
    try { pageIntro(); } catch(e){}
    try { initHeroParallax(); } catch(e){}
    try { initMouseGlow(); } catch(e){}
    try { initSmoothAnchors(); } catch(e){}
    // new interactions
    initProductInteractions();
    initCompareUI();
    initStickyCTA();
    initQuoteForm();
    initContactForm();

    // show sticky CTA immediately on tall screens
    setTimeout(()=>{ const bar = qs('#stickyCTABar'); if(bar) bar.classList.add('hidden'); }, 200);
});

/* ✅ 마우스 스포트라이트 + 텍스트 반전 효과 */
let cursorLight = null;

document.addEventListener("DOMContentLoaded", () => {
    cursorLight = document.getElementById("cursorLight");
});

const invertTargets = document.querySelectorAll(
    "h1, h2, h3, p, a, span, .hero-logo-gradient, .hero-slogan-gradient"
);

document.addEventListener("mousemove", (e) => {
    if (!cursorLight) return;

    const x = e.clientX;
    const y = e.clientY;

    cursorLight.style.left = `${x}px`;
    cursorLight.style.top = `${y}px`;

    invertTargets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(centerX - x, centerY - y);

        if (distance < 140) {
            el.classList.add("invert-active");
        } else {
            el.classList.remove("invert-active");
        }
    });
});


/* expose */
window.__NG = window.__NG || {};
window.__NG.showToast = showToast;
