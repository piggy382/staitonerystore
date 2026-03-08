/**
 * Admin Dashboard - Main Entry Point
 * Handles authentication checks, sidebar navigation, and session management.
 * @module AdminMain
 */
document.addEventListener("DOMContentLoaded", () => {
    // 1. Authentication & Authorization Check
    let user = null;
    try {
        if (typeof getCurrentUser === "function") {
            user = getCurrentUser();
        }
    } catch (e) {
        console.error("Auth check failed", e);
    }

    if (!user || user.role !== "admin") {
        alert("Bạn không có quyền truy cập trang này!");
        window.location.href = "./homepage.html";
        return;
    }

    const nameDisplay = document.getElementById("admin-name-display");
    if (nameDisplay) nameDisplay.textContent = user.name;

    // 2. Sidebar Toggles (Responsive Design)
    const sidebar = document.getElementById("admin-sidebar");
    const toggleBtn = document.getElementById("toggle-sidebar-btn");
    const closeBtn = document.getElementById("close-sidebar-btn");

    if (toggleBtn) toggleBtn.addEventListener("click", () => sidebar.classList.add("open"));
    if (closeBtn) closeBtn.addEventListener("click", () => sidebar.classList.remove("open"));

    // 3. Menu Navigation Logic
    const menuItems = document.querySelectorAll(".admin-menu-item[data-target]");
    const sections = document.querySelectorAll(".admin-section");

    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            menuItems.forEach(i => i.classList.remove("active"));
            sections.forEach(s => s.classList.remove("active"));
            item.classList.add("active");

            const targetId = item.getAttribute("data-target");
            const targetEl = document.getElementById(targetId);
            if (targetEl) targetEl.classList.add("active");
            sidebar.classList.remove("open");

            // Re-render specific sections context
            if (targetId === "dashboard-section") renderDashboard();
            else if (targetId === "orders-section") renderOrdersTable();
            else if (targetId === "products-section") renderProductsTable();
            else if (targetId === "users-section") renderUsersTable();
            else if (targetId === "categories-section") renderCategoriesTable();
        });
    });

    const logoutBtn = document.getElementById("admin-logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("currentUser");
            window.location.href = "./login.html";
        });
    }

    // Initialize Local DBs
    Promise.all([initLocalCategories(), initLocalProducts()]).then(() => {
        renderDashboard();
        // Initial render will be dashboard as per .active class in HTML
    });

    // Setup Product Search
    const searchInput = document.getElementById("admin-product-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const val = e.target.value.toLowerCase();
            const filtered = localProducts.filter(p =>
                p.name.toLowerCase().includes(val) ||
                (p.category && p.category.toLowerCase().includes(val))
            );
            renderProductsTable(filtered);
        });
    }

    // Setup Product Form Submit
    const prodForm = document.getElementById("admin-product-form");
    if (prodForm) {
        prodForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const id = document.getElementById("admin-prod-id").value;
            const name = document.getElementById("admin-prod-name").value.trim();
            const price = document.getElementById("admin-prod-price").value.trim();
            const category = document.getElementById("admin-prod-category").value;
            const stock = document.getElementById("admin-prod-stock").value || 0;
            const img = document.getElementById("admin-prod-img").value.trim();

            // Extract variants
            const variantRows = document.querySelectorAll(".variant-row");
            const variants = Array.from(variantRows).map(row => {
                const vName = row.querySelector(".v-name").value.trim();
                const vOpts = row.querySelector(".v-options").value.trim().split(",").map(o => o.trim()).filter(o => o);
                return { name: vName, options: vOpts };
            }).filter(v => v.name && v.options.length > 0);

            if (id) {
                // Edit
                const idx = localProducts.findIndex(p => String(p.id) === String(id));
                if (idx > -1) {
                    localProducts[idx] = {
                        ...localProducts[idx],
                        name, price, category, stock: parseInt(stock), image: img, variants
                    };
                }
            } else {
                // Add
                const newId = Date.now().toString().slice(-6);
                localProducts.unshift({
                    id: newId,
                    name, price, category, stock: parseInt(stock), image: img,
                    variants, sold: 0, ratings: 5, reviews: []
                });
            }

            localStorage.setItem("local_products", JSON.stringify(localProducts));
            closeProductModal();
            renderProductsTable();
            renderDashboard();
            if (window.showToast) window.showToast("Đã lưu thông tin sản phẩm!", "success");
        });
    }

    // Setup Category Form Submit
    const catForm = document.getElementById("admin-category-form");
    if (catForm) {
        catForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const id = document.getElementById("admin-cat-id").value;
            const name = document.getElementById("admin-cat-name").value.trim();
            const slug = document.getElementById("admin-cat-slug").value.trim();
            const img = document.getElementById("admin-cat-img").value.trim();

            if (id) {
                const idx = localCategories.findIndex(c => String(c.id) === String(id));
                if (idx > -1) {
                    localCategories[idx] = { id: slug, name, image: img };
                }
            } else {
                localCategories.push({ id: slug, name, image: img });
            }

            localStorage.setItem("local_categories", JSON.stringify(localCategories));
            closeCategoryModal();
            renderCategoriesTable();
            if (window.showToast) window.showToast("Đã lưu danh mục!", "success");
        });
    }
});

let localProducts = [];
let localCategories = [];
let dbUsers = [];
let allOrdersFlattened = [];

const itemsPerPage = 8;
let currentProductsPage = 1;
let currentUsersPage = 1;
let currentOrdersPage = 1;

/**
 * Initializes categories from LocalStorage or fetches from categories.json if empty.
 */
async function initLocalCategories() {
    try {
        const stored = localStorage.getItem("local_categories");
        if (stored) {
            localCategories = JSON.parse(stored);
        } else {
            const res = await fetch("../json/categories.json");
            localCategories = await res.json();
            localStorage.setItem("local_categories", JSON.stringify(localCategories));
        }
    } catch (e) {
        console.error("Category initialization error", e);
        localCategories = [];
    }
}

/**
 * Initializes products from LocalStorage or fetches from data.json if empty.
 */
async function initLocalProducts() {
    try {
        const stored = localStorage.getItem("local_products");
        if (stored) {
            localProducts = JSON.parse(stored);
        } else {
            const res = await fetch("../json/data.json");
            localProducts = await res.json();
            localStorage.setItem("local_products", JSON.stringify(localProducts));
        }
    } catch (e) {
        console.error("Product initialization error", e);
        localProducts = [];
    }
    try {
        dbUsers = JSON.parse(localStorage.getItem("users")) || [];
    } catch (e) { dbUsers = []; }
}

/**
 * Utility to refresh data for KPIs and tables.
 */
function refreshData() {
    localProducts = JSON.parse(localStorage.getItem("local_products")) || [];
    localCategories = JSON.parse(localStorage.getItem("local_categories")) || [];
    dbUsers = JSON.parse(localStorage.getItem("users")) || [];

    allOrdersFlattened = [];
    dbUsers.forEach(u => {
        if (u.orders) {
            u.orders.forEach(o => {
                allOrdersFlattened.push({ userId: u.id, userName: u.name, userEmail: u.email, ...o });
            });
        }
    });

    allOrdersFlattened.sort((a, b) => {
        const idA = parseInt(a.id.replace("MS-", "")) || 0;
        const idB = parseInt(b.id.replace("MS-", "")) || 0;
        return idB - idA;
    });
}

/**
 * Generic pagination renderer.
 */
function renderPagination(totalItems, currentPage, containerId, callbackName) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return;

    let html = "";
    const prevDisabled = currentPage === 1 ? "disabled" : "";
    html += `<button class="page-btn" ${prevDisabled} onclick="if(${currentPage} > 1) ${callbackName}(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    if (currentPage <= 3) endPage = Math.min(5, totalPages);
    if (currentPage >= totalPages - 2) startPage = Math.max(1, totalPages - 4);

    if (startPage > 1) {
        html += `<button class="page-btn" onclick="${callbackName}(1)">1</button>`;
        if (startPage > 2) html += `<span class="page-ellipsis">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="${callbackName}(${i})">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span class="page-ellipsis">...</span>`;
        html += `<button class="page-btn" onclick="${callbackName}(${totalPages})">${totalPages}</button>`;
    }

    const nextDisabled = currentPage === totalPages ? "disabled" : "";
    html += `<button class="page-btn" ${nextDisabled} onclick="if(${currentPage} < ${totalPages}) ${callbackName}(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;

    container.innerHTML = html;
}

window.changeProductsPage = (page) => { currentProductsPage = page; renderProductsTable(); };
window.changeOrdersPage = (page) => { currentOrdersPage = page; renderOrdersTable(); };
window.changeUsersPage = (page) => { currentUsersPage = page; renderUsersTable(); };

/**
 * Renders the dashboard KPI cards.
 */
function renderDashboard() {
    refreshData();
    const kpiUsers = document.getElementById("kpi-users");
    const kpiProducts = document.getElementById("kpi-products");
    const kpiOrders = document.getElementById("kpi-orders");
    const kpiRevenue = document.getElementById("kpi-revenue");

    if (kpiUsers) kpiUsers.textContent = dbUsers.length;
    if (kpiProducts) kpiProducts.textContent = localProducts.length;
    if (kpiOrders) kpiOrders.textContent = allOrdersFlattened.length;

    const totalRev = allOrdersFlattened.reduce((sum, o) => o.status !== "Đã hủy" ? sum + o.totalPrice : sum, 0);
    if (kpiRevenue) kpiRevenue.textContent = new Intl.NumberFormat('vi-VN').format(totalRev) + "đ";
}

/**
 * Renders the Categories table.
 */
function renderCategoriesTable() {
    refreshData();
    const tbody = document.getElementById("admin-categories-table");
    if (!tbody) return;

    if (localCategories.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Chưa có danh mục nào</td></tr>`;
        return;
    }

    let html = "";
    localCategories.forEach(cat => {
        html += `
            <tr>
                <td><code>${cat.id}</code></td>
                <td><img src="${cat.image}" class="table-img" alt="${cat.name}" onerror="this.src='../img/placeholder.jpg'"></td>
                <td><strong>${cat.name}</strong></td>
                <td>
                    <button class="action-btn edit" onclick="editCategory('${cat.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="deleteCategory('${cat.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

/**
 * Renders the Products table.
 */
function renderProductsTable(dataset = null) {
    if (!dataset) refreshData();
    const list = dataset || localProducts;
    const tbody = document.getElementById("admin-products-table");
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Chưa có sản phẩm nào</td></tr>`;
        const pagin = document.getElementById("products-pagination");
        if (pagin) pagin.innerHTML = "";
        return;
    }

    const startIndex = (currentProductsPage - 1) * itemsPerPage;
    const paginated = list.slice(startIndex, startIndex + itemsPerPage);

    let html = "";
    paginated.forEach(prod => {
        // Map slug to readable name if possible
        const catObj = localCategories.find(c => c.id === prod.category);
        const catDisplay = catObj ? catObj.name : prod.category;
        const stockStatus = (prod.stock || 0) <= 5 ? `<br><small style="color:#e3342f;">Sắp hết: ${prod.stock || 0}</small>` : `<br><small style="color:#888;">Kho: ${prod.stock || 0}</small>`;

        html += `
            <tr>
                <td>#${prod.id}</td>
                <td><img src="${prod.image}" class="table-img" alt="${prod.name}"></td>
                <td>
                    <strong>${prod.name}</strong>
                    ${stockStatus}
                </td>
                <td>${prod.price}đ</td>
                <td><span class="badge badge-info">${catDisplay}</span></td>
                <td>
                    <button class="action-btn edit" onclick="editProduct('${prod.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="deleteProduct('${prod.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
    renderPagination(list.length, currentProductsPage, "products-pagination", "window.changeProductsPage");
}

/**
 * Category Modal Handlers
 */
window.openCategoryModal = function () {
    const modal = document.getElementById("admin-category-modal");
    if (modal) {
        modal.style.display = "flex";
        document.getElementById("admin-cat-modal-title").textContent = "Thêm Danh Mục Mới";
        document.getElementById("admin-category-form").reset();
        document.getElementById("admin-cat-id").value = "";
    }
}
window.closeCategoryModal = function () {
    const modal = document.getElementById("admin-category-modal");
    if (modal) modal.style.display = "none";
}
window.editCategory = function (id) {
    const cat = localCategories.find(c => c.id === id);
    if (!cat) return;
    openCategoryModal();
    document.getElementById("admin-cat-modal-title").textContent = "Chỉnh Sửa Danh Mục";
    document.getElementById("admin-cat-id").value = cat.id;
    document.getElementById("admin-cat-name").value = cat.name;
    document.getElementById("admin-cat-slug").value = cat.id;
    document.getElementById("admin-cat-img").value = cat.image;
}
window.deleteCategory = function (id) {
    if (confirm("Xóa danh mục này có thể ảnh hưởng đến hiển thị sản phẩm liên quan. Tiếp tục?")) {
        localCategories = localCategories.filter(c => c.id !== id);
        localStorage.setItem("local_categories", JSON.stringify(localCategories));
        renderCategoriesTable();
        if (window.showToast) window.showToast("Đã xóa danh mục!", "info");
    }
}

/**
 * Product Modal Handlers
 */
window.openProductModal = function () {
    const modal = document.getElementById("admin-product-modal");
    if (!modal) return;

    // Populate Categories Dropdown
    const catSelect = document.getElementById("admin-prod-category");
    if (catSelect) {
        catSelect.innerHTML = localCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    }

    modal.style.display = "flex";
    document.getElementById("admin-modal-title").textContent = "Thêm Sản Phẩm Mới";
    document.getElementById("admin-product-form").reset();
    document.getElementById("admin-prod-id").value = "";
    document.getElementById("admin-prod-variants-list").innerHTML = "";
    document.getElementById("admin-prod-img").value = "../img/product-default.png";
}

window.closeProductModal = function () {
    const modal = document.getElementById("admin-product-modal");
    if (modal) modal.style.display = "none";
}

window.editProduct = function (id) {
    const prod = localProducts.find(p => String(p.id) === String(id));
    if (!prod) return;

    openProductModal();
    document.getElementById("admin-modal-title").textContent = "Chỉnh Sửa Sản Phẩm";

    document.getElementById("admin-prod-id").value = prod.id;
    document.getElementById("admin-prod-name").value = prod.name;
    document.getElementById("admin-prod-price").value = prod.price;
    document.getElementById("admin-prod-category").value = prod.category;
    document.getElementById("admin-prod-stock").value = prod.stock || 0;
    document.getElementById("admin-prod-img").value = prod.image;

    // Load Variants
    const variantList = document.getElementById("admin-prod-variants-list");
    variantList.innerHTML = "";
    if (prod.variants) {
        prod.variants.forEach(v => addVariantField(v.name, v.options.join(", ")));
    }
}

window.deleteProduct = function (id) {
    if (confirm("Xác nhận xóa sản phẩm?")) {
        localProducts = localProducts.filter(p => String(p.id) !== String(id));
        localStorage.setItem("local_products", JSON.stringify(localProducts));
        renderProductsTable();
        renderDashboard();
        if (window.showToast) window.showToast("Đã xóa sản phẩm", "info");
    }
}

/**
 * Variant management inside Product Modal
 */
window.addVariantField = function (name = "", options = "") {
    const container = document.getElementById("admin-prod-variants-list");
    const div = document.createElement("div");
    div.className = "variant-row";
    div.style = "display: flex; gap: 8px; align-items: center;";
    div.innerHTML = `
        <input type="text" class="admin-input v-name" placeholder="Tên (VD: Màu)" value="${name}" style="flex: 1;">
        <input type="text" class="admin-input v-options" placeholder="Tùy chọn (VD: Đỏ, Xanh)" value="${options}" style="flex: 2;">
        <i class="fas fa-times-circle" style="color: #e3342f; cursor: pointer;" onclick="this.parentElement.remove()"></i>
    `;
    container.appendChild(div);
}

/**
 * Orders Management
 */
function renderOrdersTable() {
    refreshData();
    const tbody = document.getElementById("admin-orders-table");
    if (!tbody) return;

    if (allOrdersFlattened.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Chưa có đơn hàng nào</td></tr>`;
        return;
    }

    const startIndex = (currentOrdersPage - 1) * itemsPerPage;
    const paginated = allOrdersFlattened.slice(startIndex, startIndex + itemsPerPage);

    let html = "";
    paginated.forEach(order => {
        html += `
            <tr>
                <td><strong>${order.id}</strong></td>
                <td>${order.userName}<br><small>${order.userEmail}</small></td>
                <td>${order.date}</td>
                <td><strong>${new Intl.NumberFormat('vi-VN').format(order.totalPrice)}đ</strong></td>
                <td>
                    <select class="admin-input" style="padding: 5px; font-size: 0.85rem;" onchange="updateOrderStatus('${order.userId}', '${order.id}', this.value)">
                        <option value="Đang xử lý" ${order.status === 'Đang xử lý' ? 'selected' : ''}>Đang xử lý</option>
                        <option value="Đang giao" ${order.status === 'Đang giao' ? 'selected' : ''}>Đang giao</option>
                        <option value="Giao thành công" ${order.status === 'Giao thành công' ? 'selected' : ''}>Giao thành công</option>
                        <option value="Đã hủy" ${order.status === 'Đã hủy' ? 'selected' : ''}>Đã hủy</option>
                    </select>
                </td>
                <td><button class="action-btn" onclick="viewOrderDetails('${order.id}', '${order.userId}')"><i class="fas fa-eye"></i></button></td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
    renderPagination(allOrdersFlattened.length, currentOrdersPage, "orders-pagination", "window.changeOrdersPage");
}

window.updateOrderStatus = function (userId, orderId, status) {
    const uIdx = dbUsers.findIndex(u => String(u.id) === String(userId));
    if (uIdx > -1) {
        const oIdx = dbUsers[uIdx].orders.findIndex(o => o.id === orderId);
        if (oIdx > -1) {
            dbUsers[uIdx].orders[oIdx].status = status;
            localStorage.setItem("users", JSON.stringify(dbUsers));
            renderDashboard();
            if (window.showToast) window.showToast("Đã cập nhật trạng thái đơn hàng!", "success");
        }
    }
}

window.viewOrderDetails = function (orderId, userId) {
    const user = dbUsers.find(u => String(u.id) === String(userId));
    const order = user?.orders.find(o => o.id === orderId);
    if (!order) return;

    const modal = document.getElementById("admin-order-modal");
    const content = document.getElementById("admin-order-details-content");
    document.getElementById("admin-order-modal-title").textContent = `Chi Tiết Đơn Hàng ${orderId}`;

    let itemsHtml = `
        <table class="admin-table" style="margin-bottom: 20px;">
            <thead><tr><th>Ảnh</th><th>Sản phẩm</th><th>Giá</th><th>SL</th><th>Tổng</th></tr></thead>
            <tbody>
                ${order.items.map(item => `
                    <tr>
                        <td><img src="${item.image}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;"></td>
                        <td><strong>${item.name}</strong>${item.variant ? `<br><small>Loại: ${item.variant}</small>` : ''}</td>
                        <td>${item.price}đ</td><td>${item.quantity}</td>
                        <td><strong>${new Intl.NumberFormat('vi-VN').format(parseInt(String(item.price).replace(/\./g, "")) * item.quantity)}đ</strong></td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
        <div style="background: var(--card-bg); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); display: flex; justify-content: space-between;">
            <div><p><strong>Khách:</strong> ${user.name}</p><p><strong>Ngày:</strong> ${order.date}</p></div>
            <div style="text-align: right;"><p>Tổng cộng</p><h2 style="color: #e3342f;">${new Intl.NumberFormat('vi-VN').format(order.totalPrice)}đ</h2></div>
        </div>
    `;
    content.innerHTML = itemsHtml;
    modal.style.display = "flex";
}
window.closeOrderModal = () => document.getElementById("admin-order-modal").style.display = "none";

/**
 * Users management
 */
function renderUsersTable() {
    refreshData();
    const tbody = document.getElementById("admin-users-table");
    if (!tbody) return;

    const startIndex = (currentUsersPage - 1) * itemsPerPage;
    const paginated = dbUsers.slice(startIndex, startIndex + itemsPerPage);

    let html = "";
    paginated.forEach(u => {
        html += `
            <tr style="${u.isBanned ? 'opacity: 0.6;' : ''}">
                <td>${u.id || '-'}</td>
                <td><strong>${u.name}</strong><br><small>${u.username}</small></td>
                <td>${u.email}</td>
                <td><span class="badge ${u.role === 'admin' ? 'badge-danger' : 'badge-info'}">${(u.role || 'user').toUpperCase()}</span></td>
                <td><span class="badge ${u.isBanned ? 'badge-danger' : 'badge-success'}">${u.isBanned ? 'Đã khóa' : 'Hoạt động'}</span></td>
                <td>
                    <button class="action-btn edit" onclick="toggleUserRole('${u.id}')"><i class="fas fa-user-shield"></i></button>
                    <button class="action-btn delete" onclick="toggleBanUser('${u.id}')"><i class="fas ${u.isBanned ? 'fa-unlock' : 'fa-ban'}"></i></button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
    renderPagination(dbUsers.length, currentUsersPage, "users-pagination", "window.changeUsersPage");
}

window.toggleUserRole = (id) => {
    const u = dbUsers.find(u => String(u.id) === String(id));
    if (u && confirm(`Đổi quyền sang ${u.role === 'admin' ? 'USER' : 'ADMIN'}?`)) {
        u.role = u.role === 'admin' ? 'user' : 'admin';
        localStorage.setItem("users", JSON.stringify(dbUsers));
        renderUsersTable();
    }
}

window.toggleBanUser = (id) => {
    const u = dbUsers.find(u => String(u.id) === String(id));
    if (u) {
        if (u.role === 'admin') return alert("Không thể khóa Admin!");
        u.isBanned = !u.isBanned;
        localStorage.setItem("users", JSON.stringify(dbUsers));
        renderUsersTable();
    }
}
