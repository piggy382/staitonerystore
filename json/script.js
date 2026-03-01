async function loadProducts() {
  try {
    const res = await fetch("../json/data.json");
    const products = await res.json();
    renderProducts(products);
    console.log(products);

  } catch (error) {
    console.log("err", error);
  }
}

function renderProducts(products) {
  const productList = document.getElementById("product-list");
  if (!productList) return;

  productList.innerHTML = "";

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.classList.add("product-card");

    productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">${product.price}</p>
            <button onclick="addToCart('${product.id}', '${product.name}', '${product.price}', '${product.image}')">Thêm vào giỏ</button>
        `;

    productList.appendChild(productCard);
  });
}

// Phải trùng với key ở file cart.js
const CART_STORAGE_KEY = "cartkey";

function addToCart(id, name, price, image) {
  // 1. Lấy giỏ hàng hiện tại từ LocalStorage (nếu chưa có thì tạo mảng rỗng)
  let cart = [];
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    if (cartData) {
      cart = JSON.parse(cartData);
    }
  } catch (error) {
    console.error("Lỗi đọc dữ liệu giỏ hàng:", error);
    cart = [];
  }

  // 2. Kiểm tra xem sản phẩm đã tồn tại trong giỏ chưa
  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    // Nếu có rồi thì tăng số lượng lên 1
    existingItem.quantity += 1;
  } else {
    // Nếu chưa có, thêm object sản phẩm mới vào mảng
    cart.push({
      id: id,
      name: name,
      price: price,
      image: image,
      quantity: 1
    });
  }

  // 3. Lưu mảng giỏ hàng mới quay lại LocalStorage
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));

  // 4. Thông báo và cập nhật số lượng trên icon giỏ hàng (nếu có hàm này)
  alert(`Đã thêm "${name}" vào giỏ hàng!`);

  if (typeof updateHeaderCount === "function") {
    updateHeaderCount();
  }
}

loadProducts()