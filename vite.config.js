import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        portfolio: "index.html",
        inferenceTimeCalc: "Stanfords/InferenceTimeCalc/index.html",
        wordDetective: "Stanfords/WordDetective/index.html",
        preventiveMaintenance: "BBPVP/JadwalTahunan-PM/index.html",
        mpu6050: "BBPVP/MPU6050/index.html",
        autodeskInventor: "BBPVP/AutodeskInventor/index.html",
      },
    },
  },
});
