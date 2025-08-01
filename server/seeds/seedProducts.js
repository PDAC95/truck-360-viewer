// server/seeds/seedProducts.js
const mongoose = require("mongoose");
const Product = require("../models/Product");
require("dotenv").config();

// 🌱 Datos de prueba para poblar la base de datos
const sampleProducts = [
  {
    id: "grille-001",
    name: "Custom Round Grille",
    sku: "12GA-GRL-R001",
    description:
      "Classic round openings for traditional styling and optimal airflow. Perfect for operators who prefer timeless design with modern performance standards.",
    totalImages: 40,
    images360: [], // Se generará automáticamente
    videos: [
      {
        id: "installation-guide",
        title: "Installation Guide",
        duration: "4:32",
        type: "installation",
        videoUrl:
          "https://res.cloudinary.com/demo/video/upload/truck-parts/grille-001/videos/installation-guide.mp4",
        thumbnailUrl:
          "https://res.cloudinary.com/demo/image/upload/c_fill,w_400,h_225/truck-parts/grille-001/videos/installation-guide_thumbnail.jpg",
        description:
          "Step-by-step installation process for the custom round grille",
      },
      {
        id: "product-demo",
        title: "Product Demo",
        duration: "2:15",
        type: "demo",
        videoUrl:
          "https://res.cloudinary.com/demo/video/upload/truck-parts/grille-001/videos/product-demo.mp4",
        thumbnailUrl:
          "https://res.cloudinary.com/demo/image/upload/c_fill,w_400,h_225/truck-parts/grille-001/videos/product-demo_thumbnail.jpg",
        description:
          "Features and benefits demonstration of the round grille design",
      },
      {
        id: "maintenance-tips",
        title: "Maintenance Tips",
        duration: "3:48",
        type: "maintenance",
        videoUrl:
          "https://res.cloudinary.com/demo/video/upload/truck-parts/grille-001/videos/maintenance-tips.mp4",
        thumbnailUrl:
          "https://res.cloudinary.com/demo/image/upload/c_fill,w_400,h_225/truck-parts/grille-001/videos/maintenance-tips_thumbnail.jpg",
        description:
          "Care and maintenance guidelines to keep your grille in perfect condition",
      },
    ],
    category: "grilles",
    isActive: true,
  },
  {
    id: "bumper-002",
    name: "Heavy Duty Front Bumper",
    sku: "12GA-BMP-F002",
    description:
      "Reinforced steel construction designed for maximum protection and durability. Built to withstand the toughest conditions while maintaining sleek aesthetics.",
    totalImages: 40,
    images360: [], // Se generará automáticamente
    videos: [
      {
        id: "bumper-install",
        title: "Bumper Installation",
        duration: "6:15",
        type: "installation",
        videoUrl:
          "https://res.cloudinary.com/demo/video/upload/truck-parts/bumper-002/videos/bumper-install.mp4",
        thumbnailUrl:
          "https://res.cloudinary.com/demo/image/upload/c_fill,w_400,h_225/truck-parts/bumper-002/videos/bumper-install_thumbnail.jpg",
        description: "Complete installation guide for heavy duty front bumper",
      },
      {
        id: "durability-test",
        title: "Durability Test",
        duration: "3:30",
        type: "demo",
        videoUrl:
          "https://res.cloudinary.com/demo/video/upload/truck-parts/bumper-002/videos/durability-test.mp4",
        thumbnailUrl:
          "https://res.cloudinary.com/demo/image/upload/c_fill,w_400,h_225/truck-parts/bumper-002/videos/durability-test_thumbnail.jpg",
        description: "Real-world durability and impact testing demonstration",
      },
    ],
    category: "bumpers",
    isActive: true,
  },
];

// 🔄 Función para conectar a la base de datos
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB for seeding");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// 🌱 Función para poblar la base de datos
const seedProducts = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Limpiar productos existentes (opcional)
    const existingCount = await Product.countDocuments();
    console.log(`📊 Found ${existingCount} existing products`);

    if (existingCount > 0) {
      console.log("🧹 Clearing existing products...");
      await Product.deleteMany({});
    }

    // Insertar productos de prueba
    console.log("📦 Inserting sample products...");

    for (const productData of sampleProducts) {
      const product = new Product(productData);
      await product.save();
      console.log(`✅ Created product: ${product.name} (${product.sku})`);
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log(`📊 Total products created: ${sampleProducts.length}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);

    if (error.name === "ValidationError") {
      console.error(
        "Validation errors:",
        Object.values(error.errors).map((err) => err.message)
      );
    }

    process.exit(1);
  }
};

// 🧪 Función para verificar los datos insertados
const verifySeeding = async () => {
  try {
    const products = await Product.find({ isActive: true });

    console.log("\n📋 VERIFICATION RESULTS:");
    console.log(`Total products: ${products.length}`);

    products.forEach((product) => {
      console.log(`\n📦 ${product.name}`);
      console.log(`   SKU: ${product.sku}`);
      console.log(`   Images: ${product.totalImages}`);
      console.log(`   Videos: ${product.videos.length}`);
      console.log(`   Category: ${product.category}`);
    });
  } catch (error) {
    console.error("❌ Error verifying data:", error);
  }
};

// 🚀 Ejecutar el proceso de seeding
const runSeeding = async () => {
  await connectDB();
  await seedProducts();
  await verifySeeding();

  console.log(
    "\n✨ Seeding process completed! You can now test your API endpoints."
  );
  process.exit(0);
};

// Ejecutar si el script se llama directamente
if (require.main === module) {
  runSeeding();
}

module.exports = { seedProducts, sampleProducts };
