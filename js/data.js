// Product catalogue for Grab Your Mobile.
// Images are the phone photos already in the project folder.

const BRANDS = [
  { name: "Apple", logo: "apple.jpg" },
  { name: "Samsung", logo: "samsung.jpg" },
  { name: "Google", logo: "google.jpg" },
  { name: "OnePlus", logo: "oneplus.jpg" },
  { name: "Xiaomi", logo: "xiaomi.jpg" },
  { name: "Redmi", logo: "redmi1.png" },
  { name: "Poco", logo: "poco.jpg" },
  { name: "Vivo", logo: "vivo.jpg" },
  { name: "Oppo", logo: "oppo.jpg" },
  { name: "Motorola", logo: "moto.jpg" },
];

// mrp = original price, price = selling price.
// bankOffer: extra 5% instant discount on cards. exchange: max exchange discount.
const PRODUCTS = [
  { id: "ip15", brand: "Apple", name: "Apple iPhone 15", color: "Blue", storage: 128, image: "ip1.jpg", mrp: 69900, price: 64900, rating: 4.6, ratings: 12450, bankOffer: false },
  { id: "ip16", brand: "Apple", name: "Apple iPhone 16", color: "White", storage: 128, image: "ip2.jpg", mrp: 79900, price: 74900, rating: 4.7, ratings: 8320, bankOffer: false },
  { id: "ip16pro", brand: "Apple", name: "Apple iPhone 16 Pro", color: "Desert Titanium", storage: 256, image: "ip3.jpg", mrp: 129900, price: 120900, rating: 4.8, ratings: 5210, bankOffer: true },

  { id: "galflip3", brand: "Samsung", name: "Samsung Galaxy Z Flip3 5G", color: "Cream", storage: 256, image: "sa1.jpg", mrp: 59999, price: 49900, rating: 4.3, ratings: 3980, bankOffer: false },
  { id: "gala56", brand: "Samsung", name: "Samsung Galaxy A56 5G", color: "Olive", storage: 256, image: "sa2.jpg", mrp: 44999, price: 41999, rating: 4.4, ratings: 2875, bankOffer: false },
  { id: "galflip7", brand: "Samsung", name: "Samsung Galaxy Z Flip7 5G", color: "Blue Shadow", storage: 512, image: "sa3.jpg", mrp: 131999, price: 120900, rating: 4.6, ratings: 1260, bankOffer: true },

  { id: "pix9a", brand: "Google", name: "Google Pixel 9a", color: "Blue", storage: 256, image: "go1.jpg", mrp: 56999, price: 49900, rating: 4.5, ratings: 2240, bankOffer: false },
  { id: "pix9", brand: "Google", name: "Google Pixel 9", color: "White", storage: 128, image: "go2.jpg", mrp: 79999, price: 74900, rating: 4.5, ratings: 3105, bankOffer: false },
  { id: "pix9xl", brand: "Google", name: "Google Pixel 9 Pro XL", color: "Peony", storage: 256, image: "go3.jpg", mrp: 124999, price: 120900, rating: 4.7, ratings: 1490, bankOffer: true },

  { id: "op13r", brand: "OnePlus", name: "OnePlus 13R 5G", color: "Nebula Noir", storage: 256, image: "one1.jpg", mrp: 44999, price: 39900, rating: 4.5, ratings: 6720, bankOffer: false },
  { id: "op13s", brand: "OnePlus", name: "OnePlus 13s 5G", color: "Black Velvet", storage: 256, image: "one2.jpg", mrp: 57999, price: 51900, rating: 4.4, ratings: 1870, bankOffer: false },
  { id: "opopen", brand: "OnePlus", name: "OnePlus Open", color: "Black", storage: 512, image: "one3.jpg", mrp: 139999, price: 125900, rating: 4.6, ratings: 940, bankOffer: true },

  { id: "civi14", brand: "Xiaomi", name: "Xiaomi 14 CIVI (8GB RAM)", color: "Shadow Black", storage: 256, image: "xi1.jpg", mrp: 49999, price: 44900, rating: 4.3, ratings: 2310, bankOffer: false },
  { id: "xi12pro", brand: "Xiaomi", name: "Xiaomi 12 Pro (8GB RAM)", color: "Shadow Black", storage: 256, image: "xi2.jpg", mrp: 62999, price: 54900, rating: 4.2, ratings: 4120, bankOffer: false },
  { id: "xi15", brand: "Xiaomi", name: "Xiaomi 15", color: "White", storage: 512, image: "xi3.jpg", mrp: 99999, price: 95900, rating: 4.5, ratings: 860, bankOffer: true },

  { id: "rn14pp", brand: "Redmi", name: "Redmi Note 14 Pro+ 5G", color: "Blue", storage: 256, image: "red1.jpg", mrp: 34999, price: 30900, rating: 4.3, ratings: 9870, bankOffer: false },
  { id: "rn13pp", brand: "Redmi", name: "Redmi Note 13 Pro+ 5G", color: "Black", storage: 256, image: "red2.jpg", mrp: 33999, price: 29999, rating: 4.2, ratings: 15420, bankOffer: false },
  { id: "rn13p", brand: "Redmi", name: "Redmi Note 13 Pro", color: "Black", storage: 256, image: "red3.jpg", mrp: 27999, price: 23999, rating: 4.2, ratings: 18760, bankOffer: true },

  { id: "pocof7s", brand: "Poco", name: "POCO F7 5G Cyber Silver Edition", color: "Cyber Silver", storage: 512, image: "po1.jpg", mrp: 39999, price: 33900, rating: 4.4, ratings: 3420, bankOffer: false },
  { id: "pocox6", brand: "Poco", name: "POCO X6 Pro 5G", color: "Yellow", storage: 256, image: "po2.jpg", mrp: 34999, price: 30900, rating: 4.3, ratings: 11230, bankOffer: false },
  { id: "pocof7w", brand: "Poco", name: "POCO F7 5G", color: "Frost White", storage: 256, image: "po3.jpg", mrp: 37999, price: 33900, rating: 4.4, ratings: 2650, bankOffer: false },

  { id: "t4ultra", brand: "Vivo", name: "Vivo T4 Ultra 5G", color: "Grey", storage: 256, image: "vi1.jpg", mrp: 44999, price: 39900, rating: 4.4, ratings: 2980, bankOffer: false },
  { id: "x200fe", brand: "Vivo", name: "Vivo X200 FE", color: "Blue", storage: 512, image: "vi2.jpg", mrp: 64999, price: 59900, rating: 4.5, ratings: 1120, bankOffer: false },
  { id: "x200pro", brand: "Vivo", name: "Vivo X200 Pro 5G", color: "Grey", storage: 512, image: "vi3.jpg", mrp: 129999, price: 120900, rating: 4.7, ratings: 1380, bankOffer: true },

  { id: "reno14", brand: "Oppo", name: "OPPO Reno14 5G", color: "Mint Green", storage: 256, image: "op1.jpg", mrp: 42999, price: 37900, rating: 4.4, ratings: 1640, bankOffer: false },
  { id: "a3x", brand: "Oppo", name: "OPPO A3x", color: "Nebula Red", storage: 64, image: "op2.jpg", mrp: 12999, price: 9999, rating: 4.1, ratings: 21340, bankOffer: false },
  { id: "k12x", brand: "Oppo", name: "OPPO K12x 5G", color: "Desert Titanium", storage: 256, image: "op3.jpg", mrp: 16999, price: 12999, rating: 4.2, ratings: 8930, bankOffer: false },

  { id: "edge60f", brand: "Motorola", name: "Motorola Edge 60 Fusion 5G", color: "Pink", storage: 128, image: "moto1.jpg", mrp: 27999, price: 24900, rating: 4.3, ratings: 7650, bankOffer: false },
  { id: "edge60p", brand: "Motorola", name: "Motorola Edge 60 Pro 5G", color: "Blue", storage: 128, image: "moto2.jpg", mrp: 41999, price: 37900, rating: 4.4, ratings: 3210, bankOffer: false },
  { id: "edge50u", brand: "Motorola", name: "Motorola Edge 50 Ultra 5G", color: "Blue", storage: 512, image: "moto3.jpg", mrp: 59999, price: 44900, rating: 4.4, ratings: 2470, bankOffer: true },
];

const EXCHANGE_UPTO = 6350;

const COUPONS = {
  GRAB10: { label: "10% off (max ₹5,000)", type: "percent", value: 10, max: 5000, minOrder: 10000 },
  NEW500: { label: "Flat ₹500 off", type: "flat", value: 500, minOrder: 5000 },
};
