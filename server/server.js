// server/server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { connectDB, checkConnection } = require("./config/database");
const productsRoutes = require("./routes/products");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de seguridad y logging
app.use(helmet());
app.use(morgan("combined"));

// Configurar CORS para desarrollo y producción
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL
      : "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Middleware para parsing JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba básica
app.get("/", (req, res) => {
  const dbStatus = checkConnection();
  res.json({
    message: "Truck 360° Viewer API está funcionando",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// 📦 Rutas de productos
app.use("/api/products", productsRoutes);

// Ruta de health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error stack:", err.stack);

  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Error interno del servidor"
      : err.message;

  res.status(status).json({
    error: true,
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: `Ruta ${req.originalUrl} no encontrada`,
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // 🌐 Conectar a MongoDB primero
    await connectDB();

    // 🚀 Iniciar servidor Express
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `📊 Database: ${
          checkConnection().isConnected ? "✅ Connected" : "❌ Disconnected"
        }`
      );
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
};

startServer();
