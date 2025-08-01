// server/config/database.js
const mongoose = require("mongoose");

// 🌐 Configuración de conexión a MongoDB
const connectDB = async () => {
  try {
    // Opciones de conexión (versión simplificada sin deprecated)
    const options = {
      maxPoolSize: 10, // Máximo 10 conexiones en el pool
      serverSelectionTimeoutMS: 5000, // 5 segundos timeout
      socketTimeoutMS: 45000, // 45 segundos socket timeout
    };

    // Conectar a MongoDB Atlas
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(
      `🔌 Connection State: ${getConnectionState(conn.connection.readyState)}`
    );

    // Event listeners para monitoring
    mongoose.connection.on("connected", () => {
      console.log("✅ Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ Mongoose disconnected from MongoDB");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🔌 MongoDB connection closed through app termination");
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);

    // Log detalles del error para debugging
    if (error.name === "MongoServerSelectionError") {
      console.error("💡 Posibles soluciones:");
      console.error(
        "   - Verificar que MONGODB_URI esté correctamente configurado"
      );
      console.error("   - Verificar conectividad a internet");
      console.error(
        "   - Verificar que la IP esté en whitelist de MongoDB Atlas"
      );
    }

    process.exit(1);
  }
};

// 🔍 Helper para obtener estado legible de la conexión
const getConnectionState = (state) => {
  const states = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Disconnecting",
  };
  return states[state] || "Unknown";
};

// 🔧 Función para verificar el estado de la conexión
const checkConnection = () => {
  const state = mongoose.connection.readyState;
  return {
    isConnected: state === 1,
    state: getConnectionState(state),
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  };
};

// 📊 Función para obtener estadísticas de la base de datos
const getDatabaseStats = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database not connected");
    }

    const stats = await mongoose.connection.db.stats();
    return {
      collections: stats.collections,
      dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
      indexSize: `${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`,
      totalSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`,
      documents: stats.objects,
    };
  } catch (error) {
    console.error("Error getting database stats:", error);
    return null;
  }
};

module.exports = {
  connectDB,
  checkConnection,
  getDatabaseStats,
};
