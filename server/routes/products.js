// server/routes/products.js
const express = require("express");
const Product = require("../models/Product");
const router = express.Router();

// 🔧 Helper para responses consistentes
const sendResponse = (
  res,
  success,
  data = null,
  message = "",
  statusCode = 200
) => {
  res.status(statusCode).json({
    success,
    data,
    message,
    timestamp: new Date().toISOString(),
  });
};

// 🔍 GET /api/products - Obtener todos los productos
router.get("/", async (req, res) => {
  try {
    const { active = true, limit = 10, page = 1 } = req.query;

    // Build query
    const query = active === "true" ? { isActive: true } : {};

    // Calcular skip para paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Buscar productos con paginación
    const products = await Product.find(query)
      .select("-__v") // Excluir version key
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(); // Para mejor performance

    // Contar total de documentos
    const total = await Product.countDocuments(query);

    console.log(`📦 Fetched ${products.length} products (page ${page})`);

    sendResponse(
      res,
      true,
      {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalProducts: total,
          hasNext: skip + products.length < total,
          hasPrev: parseInt(page) > 1,
        },
      },
      "Products retrieved successfully"
    );
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    sendResponse(res, false, null, "Error fetching products", 500);
  }
});

// 🔍 GET /api/products/:id - Obtener producto específico
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar producto por ID
    const product = await Product.findOne({ id, isActive: true })
      .select("-__v")
      .lean();

    if (!product) {
      return sendResponse(
        res,
        false,
        null,
        `Product with ID '${id}' not found`,
        404
      );
    }

    console.log(`📦 Fetched product: ${product.name} (${product.sku})`);

    sendResponse(res, true, product, "Product retrieved successfully");
  } catch (error) {
    console.error(`❌ Error fetching product ${req.params.id}:`, error);
    sendResponse(res, false, null, "Error fetching product", 500);
  }
});

// 📝 POST /api/products - Crear nuevo producto
router.post("/", async (req, res) => {
  try {
    const productData = req.body;

    // Validaciones básicas
    if (!productData.name || !productData.sku || !productData.description) {
      return sendResponse(
        res,
        false,
        null,
        "Name, SKU, and description are required",
        400
      );
    }

    // Verificar que el SKU no exista
    const existingProduct = await Product.findOne({
      sku: productData.sku.toUpperCase(),
    });
    if (existingProduct) {
      return sendResponse(
        res,
        false,
        null,
        `Product with SKU '${productData.sku}' already exists`,
        409
      );
    }

    // Crear nuevo producto
    const product = new Product({
      ...productData,
      sku: productData.sku.toUpperCase(),
      id:
        productData.id ||
        productData.sku.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    });

    // Guardar en base de datos
    const savedProduct = await product.save();

    console.log(
      `✅ Product created: ${savedProduct.name} (${savedProduct.sku})`
    );

    sendResponse(res, true, savedProduct, "Product created successfully", 201);
  } catch (error) {
    console.error("❌ Error creating product:", error);

    // Manejar errores de validación
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return sendResponse(
        res,
        false,
        null,
        `Validation error: ${validationErrors.join(", ")}`,
        400
      );
    }

    // Manejar errores de duplicado
    if (error.code === 11000) {
      return sendResponse(
        res,
        false,
        null,
        "Product with this SKU or ID already exists",
        409
      );
    }

    sendResponse(res, false, null, "Error creating product", 500);
  }
});

// ✏️ PUT /api/products/:id - Actualizar producto
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remover campos que no se deben actualizar directamente
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;

    // Actualizar producto
    const updatedProduct = await Product.findOneAndUpdate(
      { id },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updatedProduct) {
      return sendResponse(
        res,
        false,
        null,
        `Product with ID '${id}' not found`,
        404
      );
    }

    console.log(
      `✏️ Product updated: ${updatedProduct.name} (${updatedProduct.sku})`
    );

    sendResponse(res, true, updatedProduct, "Product updated successfully");
  } catch (error) {
    console.error(`❌ Error updating product ${req.params.id}:`, error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return sendResponse(
        res,
        false,
        null,
        `Validation error: ${validationErrors.join(", ")}`,
        400
      );
    }

    sendResponse(res, false, null, "Error updating product", 500);
  }
});

// 🗑️ DELETE /api/products/:id - Eliminar producto (soft delete)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete - marcar como inactivo
    const deletedProduct = await Product.findOneAndUpdate(
      { id },
      { isActive: false, updatedAt: new Date() },
      { new: true }
    ).select("-__v");

    if (!deletedProduct) {
      return sendResponse(
        res,
        false,
        null,
        `Product with ID '${id}' not found`,
        404
      );
    }

    console.log(
      `🗑️ Product deactivated: ${deletedProduct.name} (${deletedProduct.sku})`
    );

    sendResponse(res, true, deletedProduct, "Product deactivated successfully");
  } catch (error) {
    console.error(`❌ Error deleting product ${req.params.id}:`, error);
    sendResponse(res, false, null, "Error deleting product", 500);
  }
});

// 🔍 GET /api/products/:id/images/:frame - Obtener URL de imagen específica
router.get("/:id/images/:frame", async (req, res) => {
  try {
    const { id, frame } = req.params;
    const frameNumber = parseInt(frame);

    // Buscar producto
    const product = await Product.findOne({ id, isActive: true });

    if (!product) {
      return sendResponse(
        res,
        false,
        null,
        `Product with ID '${id}' not found`,
        404
      );
    }

    // Validar frame number
    if (frameNumber < 1 || frameNumber > product.totalImages) {
      return sendResponse(
        res,
        false,
        null,
        `Frame must be between 1 and ${product.totalImages}`,
        400
      );
    }

    // Generar URL de imagen
    const imageUrl = product.getImageUrl(frameNumber);

    sendResponse(
      res,
      true,
      { imageUrl, frame: frameNumber },
      "Image URL generated successfully"
    );
  } catch (error) {
    console.error(`❌ Error generating image URL:`, error);
    sendResponse(res, false, null, "Error generating image URL", 500);
  }
});

// 🎬 GET /api/products/:id/videos/:videoId - Obtener URL de video específico
router.get("/:id/videos/:videoId", async (req, res) => {
  try {
    const { id, videoId } = req.params;

    // Buscar producto
    const product = await Product.findOne({ id, isActive: true });

    if (!product) {
      return sendResponse(
        res,
        false,
        null,
        `Product with ID '${id}' not found`,
        404
      );
    }

    // Buscar video específico
    const video = product.videos.find((v) => v.id === videoId);

    if (!video) {
      return sendResponse(
        res,
        false,
        null,
        `Video with ID '${videoId}' not found`,
        404
      );
    }

    // Generar URLs de video
    const videoUrl = product.getVideoUrl(videoId);
    const thumbnailUrl = product
      .getVideoUrl(videoId)
      .replace("/video/", "/image/")
      .replace(".mp4", "_thumbnail.jpg");

    sendResponse(
      res,
      true,
      {
        ...video.toObject(),
        videoUrl,
        thumbnailUrl,
      },
      "Video URLs generated successfully"
    );
  } catch (error) {
    console.error(`❌ Error generating video URL:`, error);
    sendResponse(res, false, null, "Error generating video URL", 500);
  }
});

module.exports = router;
