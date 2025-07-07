import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Configuración para permitir imágenes de cualquier origen
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],

    domains: [
      "firebasestorage.googleapis.com",
      "lh3.googleusercontent.com"
    ]

  },
};

export default nextConfig;
