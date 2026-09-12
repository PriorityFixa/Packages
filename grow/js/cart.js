/* =========================================================
   PRIORITYFIXA COMMERCE — CART
========================================================= */

const CART_STORAGE_KEY = "priorityfixa_cart";


/* =========================
   READ / WRITE CART
========================= */

function getCart() {

    try {

        const raw = localStorage.getItem(CART_STORAGE_KEY);

        return raw ? JSON.parse(raw) : [];

    } catch (error) {

        console.warn("Could not read cart:", error);

        return [];
    }
}

function saveCart(cart) {

    try {

        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));

    } catch (error) {

        console.warn("Could not save cart:", error);
    }
}


/* =========================
   MUTATE CART
========================= */

function addToCart(product, quantity = 1) {

    const cart = getCart();

    const existing = cart.find(item => item.id === product.id);

    if (existing) {

        existing.quantity += quantity;

    } else {

        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image || null,
            quantity
        });
    }

    saveCart(cart);
    updateCartCount();
}

function removeFromCart(id) {

    const cart = getCart().filter(item => item.id !== id);

    saveCart(cart);
    updateCartCount();
}

function updateItemQuantity(id, quantity) {

    const cart = getCart();

    const item = cart.find(i => i.id === id);

    if (!item) {
        return;
    }

    if (quantity <= 0) {

        removeFromCart(id);
        return;
    }

    item.quantity = quantity;

    saveCart(cart);
    updateCartCount();
}


/* =========================
   CART COUNT BADGE
========================= */

function updateCartCount() {

    const countEl = document.getElementById("cart-count");

    if (!countEl) {
        return;
    }

    const cart = getCart();

    const total = cart.reduce(
        (sum, item) => sum + Number(item.quantity),
        0
    );

    countEl.textContent = total;
}


/* =========================
   FORMAT PRICE
========================= */

function formatPrice(amount) {

    const currency =
        (typeof BUSINESS_CONFIG !== "undefined" && BUSINESS_CONFIG.location)
            ? BUSINESS_CONFIG.location.currencySymbol
            : "KES";

    return `${currency} ${Number(amount).toLocaleString()}`;
}


/* =========================
   RENDER CART PAGE
========================= */

function renderCartPage(targetId = "cart-page") {

    const container = document.getElementById(targetId);

    if (!container) {
        return;
    }

    const cart = getCart();

    if (cart.length === 0) {

        container.innerHTML = `

            <div class="empty-cart">
                <h2>Your cart is empty</h2>
                <p>Browse coaching sessions, courses, and resources.</p>
                <a href="store.html" class="btn btn-primary">Visit the store</a>
            </div>

        `;

        return;
    }

    const rows = cart.map(item => `

        <div class="cart-row" data-id="${item.id}">

            <div class="cart-row-info">
                <strong>${item.name}</strong>
                <span>${formatPrice(item.price)} each</span>
            </div>

            <div class="cart-row-quantity">
                <button class="qty-btn" data-action="decrease" aria-label="Decrease quantity">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" data-action="increase" aria-label="Increase quantity">+</button>
            </div>

            <div class="cart-row-subtotal">
                ${formatPrice(item.price * item.quantity)}
            </div>

            <button class="cart-row-remove" data-action="remove">
                Remove
            </button>

        </div>

    `).join("");

    const total = cart.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
    );

    container.innerHTML = `

        <div class="cart-rows">
            ${rows}
        </div>

        <div class="cart-total">
            <span>Total</span>
            <strong>${formatPrice(total)}</strong>
        </div>

        <a href="checkout.html" class="btn btn-primary cart-checkout-btn">
            Proceed to checkout
        </a>

    `;

    container.querySelectorAll(".cart-row").forEach(row => {

        const id = row.dataset.id;

        row.querySelector('[data-action="increase"]').addEventListener("click", () => {

            const item = getCart().find(i => i.id === id);

            updateItemQuantity(id, item.quantity + 1);
            renderCartPage(targetId);
        });

        row.querySelector('[data-action="decrease"]').addEventListener("click", () => {

            const item = getCart().find(i => i.id === id);

            updateItemQuantity(id, item.quantity - 1);
            renderCartPage(targetId);
        });

        row.querySelector('[data-action="remove"]').addEventListener("click", () => {

            removeFromCart(id);
            renderCartPage(targetId);
        });
    });
}


/* =========================
   INITIALIZE
========================= */

document.addEventListener("DOMContentLoaded", () => {

    updateCartCount();

    if (document.getElementById("cart-page")) {
        renderCartPage("cart-page");
    }
});
