/**
 * Tải danh sách sản phẩm từ file data.json và hiển thị lên giao diện.
 * @async
 * @function loadProducts
 * @returns {Promise<void>}
 */
async function loadProducts() {
  try {
    const res = await fetch("../json/data.json");
    const products = await res.json();
    renderProducts(products);
    console.log("Products loaded:", products);
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

/**
 * Hiển thị danh sách sản phẩm ra ngoài HTML.
 * Nếu đang ở trang chủ (homepage.html), chỉ hiển thị tối đa 6 sản phẩm.
 * 
 * @function renderProducts
 * @param {Array<Object>} products - Mảng các đối tượng sản phẩm lấy từ JSON.
 */
function renderProducts(products) {
  const productList = document.getElementById("product-list");
  if (!productList) return;

  productList.innerHTML = "";

  // If we are on the homepage, maybe only show the first 6 items
  const isHomepage = window.location.pathname.includes("homepage.html");
  const productsToRender = isHomepage ? products.slice(0, 6) : products;

  productsToRender.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.classList.add("product-card");

    const addText = window.t ? window.t("add_to_cart") : "Thêm vào giỏ";

    productCard.innerHTML = `
            <a href="../html/product-detail.html?id=${product.id}" style="text-decoration: none; color: inherit;">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
            </a>
            <p class="price" style="color: var(--price-color);">${product.price}đ</p>
            <button onclick="addToCart('${product.id}', '${product.name}', '${product.price}', '${product.image}')"><i class="fas fa-cart-plus"></i> ${addText}</button>
        `;

    productList.appendChild(productCard);
  });
}

/** Cờ lưu trữ key cho giỏ hàng trong LocalStorage */
const CART_STORAGE_KEY = "cartkey";

/**
 * Thêm sản phẩm vào giỏ hàng và lưu vào LocalStorage.
 * Nếu sản phẩm đã tồn tại, tăng số lượng lên 1.
 * Cập nhật số lượng trên giao diện nếu hàm updateCartCount tồn tại.
 * 
 * @function addToCart
 * @param {string|number} id - Mã định danh sản phẩm.
 * @param {string} name - Tên sản phẩm.
 * @param {string} price - Giá sản phẩm (định dạng chuỗi).
 * @param {string} image - URL hình ảnh sản phẩm.
 * @returns {void}
 */
window.addToCart = function (id, name, price, image) {
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
  const existingItem = cart.find(item => String(item.id) === String(id));

  if (existingItem) {
    // Nếu có rồi thì tăng số lượng lên 1
    existingItem.quantity += 1;
  } else {
    // Nếu chưa có, thêm object sản phẩm mới vào mảng
    // Convert price string like "10.000" to number to be safe, or just keep as string
    // Here we keep string but remove extra spaces from JSON
    const cleanPrice = price.trim();
    cart.push({
      id: id,
      name: name,
      price: cleanPrice,
      image: image,
      quantity: 1
    });
  }

  // 3. Lưu mảng giỏ hàng mới quay lại LocalStorage
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));

  // 4. Thông báo và cập nhật số lượng trên icon giỏ hàng
  alert(`Đã thêm "${name}" vào giỏ hàng!`);

  if (typeof window.updateCartCount === "function") {
    window.updateCartCount();
  }
};

document.addEventListener("DOMContentLoaded", loadProducts);