# Portfolio Audrey Garoscio

Site portfolio. Astro + Tailwind CSS. V1 sobre, français.

## Lancer le site en local

1. Ouvrir le dossier dans VS Code.
2. Ouvrir le terminal (menu Terminal puis Nouveau terminal).
3. Installer les dépendances, une seule fois :

   ```
   npm install
   ```

4. Lancer le site :

   ```
   npm run dev
   ```

5. Ouvrir l'adresse affichée dans le terminal (en général http://localhost:4321).
   Le site se met à jour tout seul quand on enregistre un fichier.

## Pages

- `src/pages/index.astro` — Home
- `src/pages/works.astro` — La saison + Esquisses
- `src/pages/works/pool-party.astro`
- `src/pages/works/sumo-tournament.astro`
- `src/pages/works/pool-and-splash.astro`
- `src/pages/about.astro`
- `src/pages/contact.astro`

## Images

Tout est expliqué dans `public/images/_LISEZMOI.txt`.
Les emplacements "Maquette à venir" et "Portrait à venir" attendent les exports Figma.

## Direction artistique

- Palette : ivoire `#F8F5EF`, encre `#1A1A1F`, voile `#8A847A`, rose poudré `#ECD5CD`,
  réserve bleu brume `#C9D1D6` et vert sauge `#C5CFB8`.
  Tout est défini dans `src/styles/global.css` (bloc `@theme`).
- Typographies : Fraunces (titres, italiques) et Manrope (corps), chargées via Google Fonts
  dans `src/layouts/Base.astro`.

## Mettre en ligne (Vercel)

1. Créer un compte sur vercel.com.
2. Soit connecter un dépôt GitHub, soit glisser le dossier directement (sans `node_modules`).
3. Vercel détecte Astro tout seul. Cliquer sur Deploy.

## À compléter

- Remplacer l'email et le lien LinkedIn (dans `contact.astro` et `Footer.astro`).
- Valider le texte du About (premier jet à reprendre à ta main).
- Déposer le portrait et les maquettes.
