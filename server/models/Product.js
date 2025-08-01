// server/models/Product.js
const mongoose = require("mongoose");

// 🎬 Schema para videos del producto
const ProductVideoSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["tutorial", "demo", "guide", "installation", "maintenance"],
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

// 📦 Schema principal del producto
const ProductSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    totalImages: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      default: 40,
    },
    images360: [
      {
        type: String,
        required: true,
      },
    ],
    videos: [ProductVideoSchema],
    // 🏷️ Metadatos adicionales
    category: {
      type: String,
      default: "truck-parts",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // 🔧 Cloudinary info
    cloudinaryFolder: {
      type: String,
      default: function () {
        return `truck-parts/${this.id}`;
      },
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🎯 Índices para mejor performance (sin duplicados)
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ category: 1 });

// 🔄 Virtual para generar URLs de imágenes dinámicamente
ProductSchema.virtual("imageUrls").get(function () {
  const baseUrl =
    process.env.CLOUDINARY_BASE_URL ||
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}`;

  return Array.from({ length: this.totalImages }, (_, index) => {
    const frameNumber = String(index + 1).padStart(3, "0");
    return `${baseUrl}/image/upload/c_fit,w_800,h_600,q_auto,f_auto/${this.cloudinaryFolder}/360/truck_${frameNumber}.png`;
  });
});

// 🎬 Virtual para URLs de videos
ProductSchema.virtual("videoUrls").get(function () {
  const baseUrl =
    process.env.CLOUDINARY_BASE_URL ||
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}`;

  return this.videos.map((video) => ({
    ...video.toObject(),
    videoUrl: `${baseUrl}/video/upload/q_auto/${this.cloudinaryFolder}/videos/${video.id}.mp4`,
    thumbnailUrl: `${baseUrl}/image/upload/c_fill,w_400,h_225,q_auto/${this.cloudinaryFolder}/videos/${video.id}_thumbnail.jpg`,
  }));
});

// 🔍 Método estático para buscar productos activos
ProductSchema.statics.findActive = function () {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

// 🔍 Método de instancia para generar URL de imagen específica
ProductSchema.methods.getImageUrl = function (
  frameNumber,
  transformations = "c_fit,w_800,h_600,q_auto,f_auto"
) {
  const baseUrl =
    process.env.CLOUDINARY_BASE_URL ||
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}`;
  const paddedFrame = String(frameNumber).padStart(3, "0");

  return `${baseUrl}/image/upload/${transformations}/${this.cloudinaryFolder}/360/truck_${paddedFrame}.png`;
};

// 🎥 Método para obtener URL de video específico
ProductSchema.methods.getVideoUrl = function (
  videoId,
  transformations = "q_auto"
) {
  const baseUrl =
    process.env.CLOUDINARY_BASE_URL ||
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}`;

  return `${baseUrl}/video/upload/${transformations}/${this.cloudinaryFolder}/videos/${videoId}.mp4`;
};

// 📊 Middleware pre-save para validaciones
ProductSchema.pre("save", function (next) {
  // Asegurar que images360 tenga el número correcto de elementos
  if (this.images360.length !== this.totalImages) {
    this.images360 = this.imageUrls;
  }

  // Validar que el SKU tenga formato correcto
  if (!/^[A-Z0-9-]+$/.test(this.sku)) {
    const error = new Error(
      "SKU must contain only uppercase letters, numbers, and hyphens"
    );
    return next(error);
  }

  next();
});

// 📋 Middleware post-save para logging
ProductSchema.post("save", function (doc) {
  console.log(`✅ Product saved: ${doc.name} (${doc.sku})`);
});

// 🗑️ Middleware pre-remove para cleanup
ProductSchema.pre("remove", function (next) {
  console.log(`🗑️ Removing product: ${this.name}`);
  // Aquí podrías agregar lógica para limpiar archivos de Cloudinary
  next();
});

// 📦 Crear y exportar el modelo
const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
