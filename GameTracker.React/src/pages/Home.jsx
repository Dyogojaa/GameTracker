import React from "react";
import { motion } from "framer-motion";
import Chester from "../assets/Chester.png"; // 👈 Certifique-se de que está em src/assets/

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-gray-900 to-black flex items-center justify-center text-white p-6">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {/* 🔰 LOGO */}
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          KingHyperDyo <span className="text-emerald-300">GameTracker</span>
        </motion.h1>

        {/* 🖼️ IMAGEM */}
        <motion.div
          className="relative mx-auto w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.6)] border-4 border-emerald-600"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <img
            src={Chester}
            alt="KingHyperDyo Logo"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* ✨ SUBTÍTULO */}
        <motion.p
          className="mt-6 text-lg md:text-xl text-gray-300 max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Gerencie, acompanhe e conquiste seus jogos com estilo.
        </motion.p>

        {/* 🚀 BOTÃO DE ENTRAR */}
        <motion.a
          href="/dashboard"
          className="inline-block mt-8 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-emerald-400/40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          Entrar no Dashboard
        </motion.a>
      </motion.div>
    </div>
  );
}
