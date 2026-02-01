const mongoose = require('mongoose');

// Cadena de conexión a MongoDB Atlas.
const uri = process.env.MONGO_URI;

/**
 * Establece la conexión con la base de datos utilizando Mongoose.
 * Es una función asíncrona para que el servidor espere a que la conexión esté lista.
 */
async function connect() {
  try {
    // Intentamos conectar con las opciones predeterminadas de Mongoose
    await mongoose.connect(uri);

    console.log("¡MongoDB conectado exitosamente vía Mongoose!");

  } catch (err) {
    console.error("Error de conexión a MongoDB:", err);
    // Si falla la conexión crítica, cerramos el proceso para evitar que la app corra sin BD
    process.exit(1);
  }
}

module.exports = { connect };