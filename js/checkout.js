/**
 * Checkout Process Logic
 * Handles address selection, order summary preview, and order persistence.
 * @module CheckoutService
 */

/**
 * Shared utility to get the current user's cart key.
 */
function getCartKey() {
    const u = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    return u ? "cart_" + u.id : null;
}

document.addEventListener("DOMContentLoaded", () => {
    // 1. Authorization Guard
    let user = null;
    try {
        if (typeof getCurrentUser === "function") {
            user = getCurrentUser();
        }
    } catch (e) { }

    if (!user) {
        if (typeof window.showToast === "function") {
            const msg = window.t ? window.t("login_required_checkout") : "Vui lòng đăng nhập để tiến hành thanh toán!";
            window.showToast(msg, "error");
        } else {
            alert("Vui lòng đăng nhập để tiến hành thanh toán!");
        }
        window.location.href = "../html/login.html";
        return;
    }

    // 2. Load User Profile for dynamic data (addresses)
    let fullUser = null;
    try {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        fullUser = users.find(u => String(u.id) === String(user.id));
    } catch (e) { }

    // 3. Pre-fill Form & Address Selector
    if (fullUser) {
        const nameInput = document.getElementById("checkout-name");
        const emailInput = document.getElementById("checkout-email");
        if (nameInput) nameInput.value = fullUser.name || "";
        if (emailInput) emailInput.value = fullUser.email || "";

        const addrGroup = document.getElementById("address-selector-group");
        const addrSelect = document.getElementById("checkout-address-select");

        if (fullUser.addresses && fullUser.addresses.length > 0 && addrGroup && addrSelect) {
            addrGroup.style.display = "block";
            let defaultFound = false;

            fullUser.addresses.forEach(addr => {
                const opt = document.createElement("option");
                opt.value = addr.id;
                opt.textContent = `${addr.name} - ${addr.phone} - ${addr.detail}`;
                // Using dataset for easy extraction on change
                opt.dataset.name = addr.name;
                opt.dataset.phone = addr.phone;
                opt.dataset.detail = addr.detail;

                if (addr.isDefault) {
                    opt.selected = true;
                    defaultFound = true;
                    // Initial pre-fill with default address
                    if (nameInput) nameInput.value = addr.name;
                    const phoneInput = document.getElementById("checkout-phone");
                    const addrInput = document.getElementById("checkout-address");
                    if (phoneInput) phoneInput.value = addr.phone;
                    if (addrInput) addrInput.value = addr.detail;
                }
                addrSelect.appendChild(opt);
            });

            addrSelect.addEventListener("change", function () {
                const nameInput = document.getElementById("checkout-name");
                const phoneInput = document.getElementById("checkout-phone");
                const addrInput = document.getElementById("checkout-address");

                if (this.value) {
                    const sel = this.options[this.selectedIndex];
                    if (nameInput) nameInput.value = sel.dataset.name;
                    if (phoneInput) phoneInput.value = sel.dataset.phone;
                    if (addrInput) addrInput.value = sel.dataset.detail;
                } else {
                    // Reset to basic profile if "Select other..." is chosen
                    if (nameInput) nameInput.value = fullUser.name;
                    if (phoneInput) phoneInput.value = "";
                    if (addrInput) addrInput.value = "";
                }
            });

            if (!defaultFound) {
                addrSelect.value = "";
            }
        }
    }

    loadCheckoutItems();

    // 4. Order Submission Handler
    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const CART_STORAGE_KEY = getCartKey();
            if (!CART_STORAGE_KEY) return;
            const cartItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];

            // A. Update purchased_items (Enables comments/ratings)
            let purchased = [];
            try {
                purchased = JSON.parse(localStorage.getItem("purchased_items")) || [];
            } catch (error) { purchased = []; }

            cartItems.forEach(item => {
                const idStr = String(item.id);
                if (!purchased.includes(idStr)) purchased.push(idStr);
            });
            localStorage.setItem("purchased_items", JSON.stringify(purchased));

            // B. Deduct Stock from local_products
            try {
                let products = JSON.parse(localStorage.getItem("local_products")) || [];
                cartItems.forEach(cartItem => {
                    const product = products.find(p => String(p.id) === String(cartItem.id));
                    if (product && product.stock !== undefined) {
                        product.stock = Math.max(0, product.stock - cartItem.quantity);
                    }
                });
                localStorage.setItem("local_products", JSON.stringify(products));
            } catch (err) {
                console.error("Failed to update stock", err);
            }

            // C. Persist Order to User History & Global Orders (for admin)
            try {
                let users = JSON.parse(localStorage.getItem("users")) || [];
                let fullUserIndex = users.findIndex(u => String(u.id) === String(user.id));

                const statusMsg = window.t ? window.t("order_processing") : "Đang xử lý";
                const newOrder = {
                    id: "MS-" + Math.floor(10000 + Math.random() * 90000),
                    userId: user.id,
                    userName: user.name,
                    date: new Date().toLocaleDateString('vi-VN'),
                    items: cartItems,
                    totalPrice: window.finalTotalValue || 0,
                    status: statusMsg,
                    address: document.getElementById("checkout-address")?.value || ""
                };

                // Add to user's history
                if (fullUserIndex > -1) {
                    if (!users[fullUserIndex].orders) users[fullUserIndex].orders = [];
                    users[fullUserIndex].orders.unshift(newOrder);
                    localStorage.setItem("users", JSON.stringify(users));
                }

                // Add to global orders for Admin
                let globalOrders = JSON.parse(localStorage.getItem("global_orders")) || [];
                globalOrders.unshift(newOrder);
                localStorage.setItem("global_orders", JSON.stringify(globalOrders));

            } catch (err) {
                console.error("Critical: Failed to save order record", err);
            }

            // D. UI Success Trigger
            const modal = document.getElementById("success-modal");
            if (modal) modal.style.display = "flex";

            // E. Cleanup
            localStorage.removeItem(CART_STORAGE_KEY);
            if (typeof updateCartCount === "function") updateCartCount();

            // Clear summary view
            const listContainer = document.getElementById("checkout-items");
            if (listContainer) listContainer.innerHTML = "";
            const subtotalEl = document.getElementById("checkout-subtotal");
            if (subtotalEl) subtotalEl.textContent = "0đ";
            const totalEl = document.getElementById("checkout-final-total");
            if (totalEl) totalEl.textContent = "0đ";
        });
    }
});

/**
 * Loads and calculates the current cart summary for the checkout review section.
 */
function loadCheckoutItems() {
    const listContainer = document.getElementById("checkout-items");
    const subtotalEl = document.getElementById("checkout-subtotal");
    const totalEl = document.getElementById("checkout-final-total");

    if (!listContainer || !subtotalEl || !totalEl) return;

    const CART_STORAGE_KEY = getCartKey();
    if (!CART_STORAGE_KEY) return;

    const cartItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];

    // Empty state redirect
    if (cartItems.length === 0) {
        if (typeof showToast === "function") {
            const msg = window.t ? window.t("cart_empty_checkout") : "Giỏ hàng rỗng! Vui lòng thêm sản phẩm.";
            showToast(msg, "error");
        }
        setTimeout(() => window.location.href = "./cart.html", 1500);
        return;
    }

    listContainer.innerHTML = "";
    let subtotal = 0;

    cartItems.forEach(item => {
        const numPrice = parseInt(String(item.price).replace(/\./g, ""), 10) || 0;
        const itemTotal = numPrice * item.quantity;
        subtotal += itemTotal;

        const div = document.createElement("div");
        div.className = "preview-item";
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" onerror="this.src='../img/placeholder.jpg'">
            <div class="preview-info">
                <p class="preview-name">${item.name}</p>
                <div class="preview-price-qty">
                    ${item.price}đ <span style="color: var(--text-color); font-weight: normal; font-size: 0.8rem;">x ${item.quantity}</span>
                </div>
            </div>
        `;
        listContainer.appendChild(div);
    });

    // Hardcoded shipping fee for prototype
    const shippingFee = 30000;
    const finalTotal = subtotal + shippingFee;
    window.finalTotalValue = finalTotal;

    const formatter = new Intl.NumberFormat('vi-VN');
    subtotalEl.textContent = formatter.format(subtotal) + "đ";
    totalEl.textContent = formatter.format(finalTotal) + "đ";
}
