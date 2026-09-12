/* =========================================================
   PRIORITYFIXA COMMERCE — STOREFRONT
========================================================= */

function renderProductGrid(targetId = "product-grid", limit = null) {

    const container = document.getElementById(targetId);

    if (!container || typeof PRODUCTS === "undefined") {
        return;
    }

    const products = limit ? PRODUCTS.slice(0, limit) : PRODUCTS;

    container.innerHTML = products.map(product => `

        <article class="product-card">

            <img
                src="${product.image}"
                alt="${product.name}"
                class="product-image"
                loading="lazy"
            >

            <div class="product-body">

                <h3>${product.name}</h3>

                <p class="product-description">
                    ${product.description}
                </p>

                <div class="product-footer">

                    <span class="product-price">
                        ${formatPrice(product.price)}
                    </span>

                    <button class="btn add-to-cart" data-add-to-cart="${product.id}">
                        Add to cart
                    </button>

                </div>

            </div>

        </article>

    `).join("");

    container.querySelectorAll("[data-add-to-cart]").forEach(button => {

        button.addEventListener("click", () => {

            const product = PRODUCTS.find(
                p => p.id === button.dataset.addToCart
            );

            if (!product) {
                return;
            }

            addToCart(product, 1);

            const originalText = button.textContent;

            button.textContent = "Added";

            setTimeout(() => {
                button.textContent = originalText;
            }, 1200);
        });
    });
}


/* =========================
   INITIALIZE
========================= */

document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("product-grid")) {
        renderProductGrid("product-grid");
    }

    if (document.getElementById("featured-product-grid")) {
        renderProductGrid("featured-product-grid", 3);
    }
});
