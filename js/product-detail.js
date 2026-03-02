/**
 * product-detail.js
 * Lấy tham số ID từ URL, tìm sản phẩm tương ứng trong data.json và hiển thị chi tiết.
 */

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("product-detail-content");

    // Lấy ID từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        container.innerHTML = `<h2 style="text-align:center; color: red;">Khong tìm thấy mã sản phẩm.</h2>`;
        return;
    }

    try {
        // Fetch dữ liệu từ data.json
        const response = await fetch("../json/data.json");
        const products = await response.json();
        const product = products.find(p => String(p.id) === String(productId));

        if (!product) {
            container.innerHTML = `<h2 style="text-align:center; color: red;">Không tìm thấy sản phẩm.</h2>`;
            return;
        }

        const addText = window.t ? window.t("add_to_cart") : "Thêm vào giỏ";

        // Render dữ liệu
        container.innerHTML = `
            <div class="product-detail-layout">
                <div class="product-image-box">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info-box">
                    <h1>${product.name}</h1>
                    <p class="price">${product.price}đ</p>
                    <div class="description">
                        <p><strong>Mô tả:</strong> Sản phẩm chất lượng cao, phù hợp cho học sinh và văn phòng. ${product.name} được đảm bảo thiết kế đẹp và bền bỉ suốt quá trình sử dụng.</p>
                        <p><strong>Bảo hành:</strong> Đổi trả trong 7 ngày nếu lỗi từ nhà sản xuất.</p>
                    </div>
                    <div class="actions">
                        <button class="btn-add" onclick="addToCart('${product.id}', '${product.name}', '${product.price}', '${product.image}')">
                            <i class="fas fa-cart-plus"></i> ${addText}
                        </button>
                    </div>
                    <a href="../html/homepage.html" class="btn-back"><i class="fas fa-arrow-left"></i> Quay lại trang chủ</a>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu sản phẩm", error);
        container.innerHTML = `<h2 style="text-align:center; color: red;">Đã xảy ra lỗi khi tải dữ liệu.</h2>`;
    }
});
