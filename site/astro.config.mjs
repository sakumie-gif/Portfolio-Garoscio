import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  // Liens de partage courts et à la marque. Ils redirigent vers la page
  // d'accueil avec les étiquettes UTM, pour distinguer dans Google Analytics
  // l'origine des visites (LinkedIn, QR code…) sans jamais montrer une URL
  // à rallonge. Un seul endroit à modifier si les campagnes changent.
  redirects: {
    "/linkedin":
      "https://www.agaroscio.fr/?utm_source=linkedin&utm_medium=social&utm_campaign=portfolio",
    "/qr":
      "https://www.agaroscio.fr/?utm_source=qrcode&utm_medium=print&utm_campaign=portfolio",
  },
});
