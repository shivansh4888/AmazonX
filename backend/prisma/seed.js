// Seed file: Populates the database with realistic product data
// Run with: npx prisma db seed

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const products = [
  // Electronics
  {
    name: "Apple iPhone 15 Pro Max 256GB",
    description: "Experience the pinnacle of smartphone technology with the iPhone 15 Pro Max. Features the A17 Pro chip, a stunning 6.7-inch Super Retina XDR display, and a pro camera system with 5x optical zoom. Built with titanium for exceptional strength and lightweight feel.",
    price: 134900,
    stock: 45,
    category: "Electronics",
    brand: "Apple",
    rating: 4.8,
    reviewCount: 12453,
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600",
      "https://images.unsplash.com/photo-1707412911484-7b0440f2830c?w=600",
      "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600"
    ],
    specs: {
      "Display": "6.7-inch Super Retina XDR",
      "Chip": "A17 Pro",
      "Camera": "48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto",
      "Battery": "Up to 29 hours video playback",
      "Storage": "256GB",
      "OS": "iOS 17",
      "5G": "Yes"
    }
  },
  {
    name: "Samsung 65\" 4K QLED Smart TV",
    description: "Immerse yourself in breathtaking 4K QLED picture quality with Quantum HDR. Smart TV features with built-in Alexa, Google Assistant, and Samsung's Tizen OS. Perfect for gaming with Game Mode and 120Hz refresh rate.",
    price: 89990,
    stock: 12,
    category: "Electronics",
    brand: "Samsung",
    rating: 4.6,
    reviewCount: 3421,
    images: [
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600",
      "https://images.unsplash.com/photo-1601944179066-29786cb9d32a?w=600"
    ],
    specs: {
      "Screen Size": "65 inches",
      "Resolution": "4K UHD (3840 x 2160)",
      "Display Type": "QLED",
      "Refresh Rate": "120Hz",
      "HDR": "Quantum HDR 12X",
      "Smart TV": "Tizen OS",
      "Ports": "4x HDMI, 2x USB"
    }
  },
  {
    name: "Sony WH-1000XM5 Wireless Headphones",
    description: "Industry-leading noise canceling headphones with Auto NC Optimizer. Features 30-hour battery life, multipoint connectivity, and crystal-clear hands-free calling. Lightweight design with premium comfort for all-day wear.",
    price: 29990,
    stock: 78,
    category: "Electronics",
    brand: "Sony",
    rating: 4.7,
    reviewCount: 8932,
    images: [
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600",
      "https://images.unsplash.com/photo-1545127398-14699f92334b?w=600"
    ],
    specs: {
      "Driver Size": "30mm",
      "Frequency Response": "4Hz-40,000Hz",
      "Battery Life": "30 hours",
      "Charging": "USB-C, 3 min charge = 3 hours playback",
      "Noise Canceling": "Yes - Industry Leading",
      "Weight": "250g",
      "Connectivity": "Bluetooth 5.2, 3.5mm"
    }
  },
  {
    name: "MacBook Pro 14\" M3 Pro Chip 18GB",
    description: "Supercharged by M3 Pro chip, MacBook Pro 14-inch delivers extraordinary performance. With up to 18 hours of battery life, stunning Liquid Retina XDR display, and a host of pro ports, this laptop redefines what a pro laptop can do.",
    price: 199900,
    stock: 23,
    category: "Electronics",
    brand: "Apple",
    rating: 4.9,
    reviewCount: 5621,
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
      "https://images.unsplash.com/photo-1611186871525-7a5ea64a79de?w=600"
    ],
    specs: {
      "Chip": "Apple M3 Pro",
      "Memory": "18GB unified memory",
      "Storage": "512GB SSD",
      "Display": "14.2-inch Liquid Retina XDR",
      "Battery": "Up to 18 hours",
      "Ports": "3x Thunderbolt 4, HDMI, SD Card, MagSafe",
      "Weight": "1.61kg"
    }
  },
  // Books
  {
    name: "Atomic Habits by James Clear",
    description: "No matter your goals, Atomic Habits offers a proven framework for improving—every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
    price: 599,
    stock: 234,
    category: "Books",
    brand: "Penguin Random House",
    rating: 4.8,
    reviewCount: 45823,
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600"
    ],
    specs: {
      "Author": "James Clear",
      "Pages": "320",
      "Publisher": "Penguin Random House",
      "Language": "English",
      "Format": "Paperback",
      "ISBN": "9780735211292"
    }
  },
  {
    name: "The Psychology of Money",
    description: "Timeless lessons on wealth, greed, and happiness doing well with money isn't necessarily about what you know. It's about how you behave. And behavior is hard to teach, even to really smart people.",
    price: 449,
    stock: 156,
    category: "Books",
    brand: "Harriman House",
    rating: 4.7,
    reviewCount: 28934,
    images: [
      "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600"
    ],
    specs: {
      "Author": "Morgan Housel",
      "Pages": "256",
      "Publisher": "Harriman House",
      "Language": "English",
      "Format": "Paperback"
    }
  },
  // Clothing
 
  {
    name: "Levi's 511 Slim Fit Jeans",
    description: "A modern slim through the seat and thigh with a narrow leg opening. The 511 Slim Fit Jeans sit below the waist with a slim fit through the seat and thigh. Made with stretch fabric for all-day comfort and movement.",
    price: 3999,
    stock: 89,
    category: "Clothing",
    brand: "Levi's",
    rating: 4.4,
    reviewCount: 15234,
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"
    ],
    specs: {
      "Fit": "Slim",
      "Rise": "Below Waist",
      "Fabric": "99% Cotton, 1% Elastane",
      "Care": "Machine Wash",
      "Available Colors": "Blue, Black, Grey",
      "Available Sizes": "28-38"
    }
  },
  // Home & Kitchen
  {
    name: "Instant Pot Duo 7-in-1 Electric Pressure Cooker",
    description: "The Instant Pot Duo is the #1 selling multi-cooker. It replaces 7 kitchen appliances: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker and warmer. 13 built-in smart programs for ribs, soups, beans, rice, poultry, yogurt, desserts and more.",
    price: 8999,
    stock: 34,
    category: "Home & Kitchen",
    brand: "Instant Pot",
    rating: 4.7,
    reviewCount: 34521,
    images: [
      "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600"
    ],
    specs: {
      "Capacity": "6 Quart",
      "Functions": "7-in-1",
      "Programs": "13 Smart Programs",
      "Pressure Settings": "High/Low",
      "Safety Features": "10+",
      "Material": "Stainless Steel",
      "Power": "1000W"
    }
  },
  {
    name: "Dyson V15 Detect Cordless Vacuum",
    description: "The Dyson V15 Detect automatically optimizes suction and run time, with a built-in particle sensor that counts and measures microscopic dust. The laser detects dust you can't see. LCD screen shows what's been picked up in real time.",
    price: 52900,
    stock: 18,
    category: "Home & Kitchen",
    brand: "Dyson",
    rating: 4.6,
    reviewCount: 4231,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"
    ],
    specs: {
      "Suction Power": "240 AW",
      "Run Time": "Up to 60 minutes",
      "Bin Volume": "0.76L",
      "Weight": "3.1kg",
      "Filtration": "HEPA",
      "Charging Time": "4.5 hours"
    }
  },
  // Sports
  {
    name: "Nike Air Zoom Pegasus 40 Running Shoes",
    description: "Lightweight and responsive running shoes featuring Nike Zoom Air cushioning and breathable mesh upper. Designed for daily training with excellent grip and comfort.",
    price: 7499, stock: 36, category: "Shoes", brand: "Nike",
    rating: 4.6, reviewCount: 8421,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"],
    specs: { "Material": "Mesh + Synthetic", "Sole": "Rubber", "Closure": "Lace-Up", "Usage": "Running" }
  },
 
  {
    name: "Sparx Men's Running Shoes SM-482",
    description: "Affordable and comfortable running shoes with breathable upper and flexible sole. Ideal for daily wear and light workouts.",
    price: 1499, stock: 64, category: "Shoes", brand: "Sparx",
    rating: 4.1, reviewCount: 5230,
    images: ["https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600"],
    specs: { "Material": "Mesh", "Sole": "EVA", "Closure": "Lace-Up", "Usage": "Daily Wear" }
  },
  {
    name: "Bata Formal Leather Shoes for Men",
    description: "Elegant formal shoes crafted from premium leather. Designed for office and formal occasions with superior comfort and classic styling.",
    price: 3299, stock: 27, category: "Shoes", brand: "Bata",
    rating: 4.2, reviewCount: 1980,
    images: ["https://images.unsplash.com/photo-1539185441755-769473a23570?w=600"],
    specs: { "Material": "Leather", "Sole": "TPR", "Closure": "Slip-On", "Usage": "Formal" }
  },
  
  {
    name: "Yoga Mat Premium Non-Slip 6mm",
    description: "Premium yoga mat with superior grip and cushioning. Made from eco-friendly TPE material, this mat provides excellent stability during practice. The alignment lines help with proper positioning and the carrying strap makes it easy to transport.",
    price: 1499,
    stock: 67,
    category: "Sports",
    brand: "Boldfit",
    rating: 4.3,
    reviewCount: 9823,
    images: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600"
    ],
    specs: {
      "Material": "TPE (Eco-friendly)",
      "Thickness": "6mm",
      "Dimensions": "183cm x 61cm",
      "Weight": "1.2kg",
      "Features": "Non-slip, Alignment Lines",
      "Includes": "Carrying Strap"
    }
  },
  {
    name: "Adidas Ultraboost 23 Running Shoes",
    description: "Responsive running shoes engineered for performance. Features BOOST midsole technology for incredible energy return, Primeknit+ upper for a snug adaptive fit, and Continental rubber outsole for exceptional grip in all conditions.",
    price: 17999,
    stock: 3,
    category: "Sports",
    brand: "Adidas",
    rating: 4.6,
    reviewCount: 5421,
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600"
    ],
    specs: {
      "Upper": "Primeknit+",
      "Midsole": "BOOST",
      "Outsole": "Continental Rubber",
      "Drop": "10mm",
      "Weight": "310g",
      "Available Sizes": "UK 6-12"
    }
  },
  // Beauty
{
  name: "Maybelline New York Fit Me Foundation",
  description: "Fit Me Matte + Poreless Foundation is specifically formulated for normal to oily skin. The pore-minimizing formula controls shine and leaves a seamless matte finish that stays put all day.",
  price: 499, stock: 143, category: "Beauty", brand: "Maybelline",
  rating: 4.3, reviewCount: 18432,
  images: ["https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600"],
  specs: { "Finish": "Matte", "Coverage": "Medium to Full", "Skin Type": "Normal to Oily", "SPF": "None", "Volume": "30ml" }
},
{
  name: "L'Oreal Paris Revitalift Night Cream",
  description: "Revitalift Anti-Wrinkle + Firming Night Cream with Pro-Retinol and Centella Asiatica visibly reduces wrinkles and firms skin overnight while you sleep.",
  price: 899, stock: 67, category: "Beauty", brand: "L'Oreal",
  rating: 4.5, reviewCount: 9823,
  images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600"],
  specs: { "Type": "Night Cream", "Key Ingredient": "Pro-Retinol", "Skin Type": "All", "Weight": "50ml", "Fragrance": "Light" }
},
// Toys
{
  name: "LEGO Classic Creative Bricks Set 1500pcs",
  description: "Endless creative possibilities! This set includes 1500 bricks in 33 different colors. Perfect for children and adults who love building and creating. Includes wheels, windows, and special pieces.",
  price: 3499, stock: 28, category: "Toys", brand: "LEGO",
  rating: 4.8, reviewCount: 6754,
  images: ["https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600"],
  specs: { "Pieces": "1500", "Age": "4+", "Colors": "33 colors", "Theme": "Classic", "Dimensions": "37.8 x 26.2 x 7.2 cm" }
},
{
  name: "Rubik's Cube 3x3 Speed Cube",
  description: "The original Rubik's Cube, now with a smooth mechanism for faster solving. Features carbon fiber stickers, adjustable tension, and comes with a stand. Perfect for beginner to advanced cubers.",
  price: 799, stock: 89, category: "Toys", brand: "Rubik's",
  rating: 4.4, reviewCount: 12341,
  images: ["https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=600"],
  specs: { "Size": "3x3x3", "Material": "ABS Plastic", "Mechanism": "Spring-loaded", "Includes": "Stand + Guide Book" }
},
{
  name: "Wooden Montessori Shape Sorting Box",
  description: "A premium wooden shape sorter designed for early childhood development. Enhances problem-solving, motor skills, and color recognition. Made from eco-friendly polished wood with smooth edges.",
  price: 1299, stock: 52, category: "Toys", brand: "Skillmatics",
  rating: 4.6, reviewCount: 2841,
  images: ["https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600"],
  specs: { "Material": "Natural Wood", "Age": "2+", "Pieces": "12 Shapes", "Finish": "Non-toxic Polish" }
},

{
  name: "Plush Teddy Bear Soft Toy (3 ft)",
  description: "Ultra-soft premium teddy bear made with high-quality plush fabric. Perfect for gifting and cuddling. Safe for kids and durable stitching.",
  price: 1599, stock: 41, category: "Toys", brand: "Funskool",
  rating: 4.3, reviewCount: 2150,
  images: ["https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600"],
  specs: { "Height": "3 feet", "Material": "Plush Fabric", "Washable": "Yes", "Color": "Brown" }
},


// Automotive
{
  name: "Amazon Brand - Solimo High Speed Rechargeable Bicycle  with Headlights",
  description: "High-speed rechargeable bicycle light designed for enhanced visibility and safety. Features powerful LED headlights, multiple lighting modes, and long battery life. Durable build with easy mounting, suitable for night riding and outdoor use.",
  price: 799,
  stock: 45,
  category: "Sports",
  brand: "Amazon Brand - Solimo",
  rating: 4.2,
  reviewCount: 1240,
  images: ["https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=600"],
  specs: {
    "Type": "Rechargeable Bicycle Light",
    "Modes": "Multiple lighting modes",
    "Battery": "USB Rechargeable",
    "Material": "Durable ABS",
    "Usage": "Cycling / Outdoor",
    "Mounting": "Handlebar mount"
  }
},

{
  name: "Ambrane 20000mAh Car Jump Starter + Power Bank",
  description: "Multi-functional jump starter that starts your car up to 30 times on a single charge. Also works as a 20000mAh power bank with 3 USB outputs. Built-in LED flashlight with SOS mode.",
  price: 4999, stock: 19, category: "Automotive", brand: "Ambrane",
  rating: 4.3, reviewCount: 3421,
  images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"],
  specs: { "Capacity": "20000mAh", "Jump Starts": "Up to 30 times", "Peak Current": "1000A", "USB Ports": "3", "Safety": "Spark-proof clips" }
},
// Grocery
{
  name: "Tata Coffee Grand Premium Instant Coffee 200g",
  description: "Tata Coffee Grand offers a rich, aromatic coffee experience made from 100% pure coffee extract. The vacuum-sealed packaging ensures freshness. Makes 100 cups from one jar.",
  price: 349, stock: 234, category: "Grocery", brand: "Tata",
  rating: 4.2, reviewCount: 24521,
  images: ["https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600"],
  specs: { "Weight": "200g", "Type": "Instant Coffee", "Servings": "~100 cups", "Roast": "Medium", "Packaging": "Glass Jar" }
},
{
  name: "Organic India Tulsi Green Tea — 25 Bags",
  description: "A unique blend of Tulsi (Holy Basil) and Green Tea. Rich in antioxidants, this tea supports immunity and promotes mental clarity. 100% organic certified, no artificial flavors.",
  price: 225, stock: 312, category: "Grocery", brand: "Organic India",
  rating: 4.5, reviewCount: 15234,
  images: ["https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600"],
  specs: { "Count": "25 tea bags", "Type": "Green Tea + Tulsi", "Certified": "USDA Organic", "Caffeine": "Low", "Origin": "India" }
}
];

async function main() {
  console.log('🌱 Starting database seed...');
  
  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  
  // Seed products
  for (const product of products) {
    await prisma.product.create({ data: product });
    console.log(`✅ Created product: ${product.name}`);
  }
  
  console.log(`\n🎉 Seeded ${products.length} products successfully!`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
