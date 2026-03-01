import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models/User";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/gym-saas";

async function seedSuperAdmin() {
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB conectado");

  const email = "christoscano96@gmail.com";

  const exists = await User.findOne({ email });
  if (exists) {
    console.log("El superadmin ya existe, actualizando rol...");
    exists.role = "superadmin";
    exists.active = true;
    await exists.save();
    console.log("Rol actualizado a superadmin");
  } else {
    const hashed = await bcrypt.hash("mandooreo", 10);
    await User.create({
      name: "Christian Toscano",
      email,
      password: hashed,
      role: "superadmin",
      active: true,
    });
    console.log("Superadmin creado exitosamente");
  }

  await mongoose.disconnect();
  console.log("Listo!");
  process.exit(0);
}

seedSuperAdmin().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
