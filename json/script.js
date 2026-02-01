async function loadProducts() {
  try {
    const res = await fetch("data.json");
    const products = await res.json();
    renderProducts(products);
  } catch (error) {
    console.log("err", error);
  }
}

function renderProducts(products) {
  const productList = document.getElementById("product-list");
  if(!productList) return;

  productList.innerHTML = "";

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.classList.add("product-card");

    productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">${product.price}</p>
            <button onclick="addToCart(${product.id})">Thêm vào giỏ</button>
        `;

    productList.appendChild(productCard);
  });
}

function addToCart(id) {
  alert("Đã thêm sản phẩm có ID: " + id + " vào giỏ hàng!");
}
