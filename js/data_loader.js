// js/data_loader.js
async function loadProducts() {
    const grid = document.getElementById("productGrid");
    const modelSelect = document.querySelector('select[name="model"]');
    if (!grid) return;

    try {
        const res = await fetch("data/products.json");
        if (!res.ok) throw new Error("제품 데이터를 불러올 수 없습니다.");

        const products = await res.json();
        grid.innerHTML = "";
        // clear select options
        if (modelSelect) {
            modelSelect.innerHTML = '<option value="">Select Model (Optional)</option>';
        }

        // build simple array for compare table later
        window.__NG_products = products;

        products.forEach((product) => {
            const card = document.createElement("div");
            card.className = `group relative bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-cyan-500/20`;

            // Use product.image or fallback; set loading lazy
            const imgSrc = product.image || 'images/product-fallback.jpg';

            card.innerHTML = `
                <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10"></div>

                <div class="relative">
                    <span class="absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-full bg-cyan-500 text-neutral-900 shadow-lg">
                        ${product.tag || ''}
                    </span>

                    <img src="${imgSrc}" alt="${product.name}" class="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy">
                </div>

                <div class="p-6">
                    <h4 class="text-lg font-bold mb-2">${product.name}</h4>
                    <p class="text-sm text-neutral-400 mb-4">${product.description}</p>

                    <div class="grid grid-cols-2 gap-2 text-xs text-neutral-300 mb-4">
                        <div>⚡ Voltage: <span class="text-white">${product.voltage}</span></div>
                        <div>🔋 Capacity: <span class="text-white">${product.capacity}</span></div>
                        <div>🛣 Range: <span class="text-white">${product.range}</span></div>
                        <div>⚖ Weight: <span class="text-white">${product.weight}</span></div>
                        <div>❄ Cooling: <span class="text-white">${product.cooling}</span></div>
                        <div>🧠 BMS: <span class="text-white">${product.bms}</span></div>
                    </div>

                    <div class="text-xs text-cyan-400 font-semibold mb-3">${product.application || ''}</div>

                    <div class="flex gap-2">
                        <a href="${product.datasheet || '#'}" class="product-datasheet fileLink" target="_blank" rel="noreferrer">${product.datasheet ? 'Datasheet' : 'No Datasheet'}</a>
                        <button class="w-full py-2 rounded-xl border border-neutral-700 hover:border-cyan-400 hover:text-cyan-400 transition js-view-details">
                            View Details
                        </button>
                    </div>
                </div>

                <div class="absolute inset-0 rounded-2xl ring-0 group-hover:ring-1 group-hover:ring-cyan-500/70 transition"></div>
            `;

            // attach product meta for modal usage
            card.dataset.product = JSON.stringify(product);

            grid.appendChild(card);

            // add model option to select
            if (modelSelect) {
                const opt = document.createElement('option');
                opt.value = product.name;
                opt.innerText = product.name;
                modelSelect.appendChild(opt);
            }
        });

    } catch (error) {
        console.error("❌ 제품 로딩 실패:", error);
        grid.innerHTML = `
            <div class="col-span-full text-center text-red-400 py-10">
                제품 정보를 불러오는 데 실패했습니다.
            </div>
        `;
    }
}

document.addEventListener("DOMContentLoaded", loadProducts);
