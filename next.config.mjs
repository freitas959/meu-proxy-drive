/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // A lista de projetos virou um modal dentro do wizard. Quem tiver a URL
      // antiga aberta ou salva cai no lugar certo em vez de num 404.
      {
        source: "/projetos",
        destination: "/app?projetos=1",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
