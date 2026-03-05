const fs = require('fs');
const path = require('path');

const categories = [
    { id: "office", name: "Văn phòng phẩm", brand: "Thiên Long", img: "../img/butbi.jpg", pricePrefix: 10 },
    { id: "notebook", name: "Vở học sinh", brand: "Campus", img: "../img/vohocsinh200trang.jpg", pricePrefix: 15 },
    { id: "tool", name: "Dụng cụ học tập", brand: "Deli", img: "../img/thuocke20cm.jpg", pricePrefix: 5 },
    { id: "backpack", name: "Balo học sinh", brand: "Miti", img: "../img/balo_chong_gu.jpg", pricePrefix: 350 },
    { id: "uniform", name: "Đồng phục", brand: "Việt Tiến", img: "../img/ao_so_mi.jpg", pricePrefix: 120 },
    { id: "book", name: "Sách giáo khoa", brand: "NXB GD", img: "../img/sgk_toan.jpg", pricePrefix: 25 },
    { id: "calculator", name: "Máy tính cầm tay", brand: "Casio", img: "../img/casio.jpg", pricePrefix: 550 },
    { id: "art", name: "Mỹ thuật", brand: "Colokit", img: "../img/mau_sap.jpg", pricePrefix: 45 }
];

const products = [];
let idCounter = 1;

categories.forEach(cat => {
    for (let i = 1; i <= 30; i++) {
        const paddedIndex = i.toString().padStart(3, '0');
        const priceCalc = cat.pricePrefix * 1000 + (Math.floor(Math.random() * 5) * 1000);
        // Format to "10.000"
        const priceStr = priceCalc.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        products.push({
            id: idCounter++,
            name: `${cat.name} ${paddedIndex}`,
            price: priceStr,
            image: cat.img,
            description: `Mô tả cho ${cat.name} phiên bản mẫu số ${paddedIndex}. Sản phẩm chính hãng.`,
            brand: cat.brand,
            category: cat.id
        });
    }
});

const outputPath = path.join(__dirname, 'data.json');
fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf8');
console.log(`Generated ${products.length} products to ${outputPath}`);
