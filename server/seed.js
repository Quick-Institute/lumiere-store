const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const items = [
  { name: "Floral Midi Dress", category: "dresses", price: 12400, oldPrice: 15500, discount: 20, rating: 4.5, reviews: 124, sizes: ["XS", "S", "M", "L"], colors: ["#000000", "#d9c3b8", "#c46b72", "#3b5b8a"], image: "/images/products/p1.jpg", stock: 15 },
  { name: "Ribbed Knit Sweater", category: "tops", price: 8900, rating: 4.5, reviews: 98, sizes: ["S", "M", "L", "XL"], colors: ["#f2ede8", "#d9c3b8", "#000000"], image: "/images/products/p2.jpg", stock: 3 },
  { name: "Elegant Blazer", category: "jackets", price: 17900, rating: 4.5, reviews: 76, sizes: ["S", "M", "L"], colors: ["#c9ad93", "#000000"], image: "/images/products/p3.jpg", stock: 12 },
  { name: "Wide Leg Pants", category: "pants", price: 10500, rating: 4, reviews: 62, sizes: ["XS", "S", "M", "L", "XL"], colors: ["#000000"], image: "/images/products/p4.jpg", stock: 5 },
  { name: "Satin Slip Dress", category: "dresses", price: 14900, oldPrice: 18600, discount: 20, rating: 5, reviews: 54, sizes: ["XS", "S", "M"], colors: ["#c46b72", "#000000"], image: "/images/products/p1.jpg", stock: 18 },
  { name: "Cotton Button Blouse", category: "tops", price: 7500, rating: 4, reviews: 41, sizes: ["S", "M", "L"], colors: ["#f2ede8", "#3b5b8a"], image: "/images/products/p2.jpg", stock: 2 },
  { name: "Linen Trousers", category: "pants", price: 9800, oldPrice: 12250, discount: 20, rating: 4.5, reviews: 33, sizes: ["S", "M", "L", "XL"], colors: ["#c9ad93", "#f2ede8"], image: "/images/products/p4.jpg", stock: 9 },
  { name: "Denim Jacket", category: "jackets", price: 13500, rating: 4, reviews: 47, sizes: ["S", "M", "L"], colors: ["#3b5b8a"], image: "/images/products/p3.jpg", stock: 14 },
  { name: "Linen Maxi Dress", category: "dresses", price: 16200, rating: 4.5, reviews: 29, sizes: ["S", "M", "L", "XL"], colors: ["#d9c3b8", "#f2ede8"], image: "/images/products/p1.jpg", stock: 10 },
  { name: "Leather Tote Bag", category: "bags", price: 11900, rating: 5, reviews: 88, sizes: [], colors: ["#000000", "#c9ad93"], image: "/images/products/p3.jpg", stock: 8 },
  { name: "Mini Shoulder Bag", category: "bags", price: 6900, oldPrice: 8600, discount: 20, rating: 4, reviews: 36, sizes: [], colors: ["#c46b72", "#000000"], image: "/images/products/p2.jpg", stock: 20 },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany({});
  await Product.insertMany(items);
  console.log(`Seeded ${items.length} products`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});