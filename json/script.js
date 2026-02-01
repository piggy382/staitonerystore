const productList = document.getElementById('product-list');

function renderProducts() {
    productList.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">${product.price}</p>
            <button onclick="addToCart(${product.id})">Thêm vào giỏ</button>
        `;

        // Đưa thẻ sản phẩm vào container chính
        productList.appendChild(productCard);
    });
}

// Chạy hàm khi trang web tải xong
renderProducts();

function addToCart(id) {
    alert("Đã thêm sản phẩm có ID: " + id + " vào giỏ hàng!");
}