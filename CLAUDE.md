# Portfolio Audrey Garoscio — Contexte projet pour Claude

Portfolio personnel d'Audrey (recherche d'emploi + soutenance) : « le portfolio doit être parfait ». Site Astro dans le sous-dossier **`site/`** (racine du repo : `…\Bureau\portfolio`). Les autres dossiers de la racine (golyeo, sumo, PoolParty, img) sont des sources d'assets et de contenus des projets présentés.

## Concept et direction artistique

**« Théâtre contemporain / scène blanche »** : lexique du spectacle (didascalies, À l'affiche, saison). Refus explicites d'Audrey : fonds noirs omniprésents, vert néon, violet « template UX/UI », chiffres artificiels type « 100 % de réussite », tout ce qui donne l'impression d'un thème acheté.

## Design tokens (verrouillés — ne jamais introduire une couleur hors tokens)

- **Un seul accent : bordeaux #6E1F2A** (rouge « rideaux de théâtre »). Jamais de rose résiduel, jamais plusieurs rouges (« ça fait arc en ciel » — consigne répétée 5 fois, ne plus jamais y revenir).
- Thème clair : ivoire / encre / voile. Thème sombre « salle obscure » : fond #08111E, texte #F2ECE0, surfaces #11192A.
- Typographies : **Fraunces** (titres, italiques de didascalie) / **Manrope** (corps).

## Composants et interactions

- **3 types de boutons maximum** : primaire (encre plein), secondaire (souligné bordeaux), tertiaire. Ne pas en inventer d'autres.
- **Hover = passage en semi-bold**, jamais de fill plein, jamais d'éclaircissement, jamais d'effet agressif.
- Les flèches (→) ne sont **jamais soulignées**, même dans un lien souligné.
- Toutes les tuiles d'une même famille ont **exactement la même taille**.
- Icônes : fond transparent obligatoire (détourées), jamais de contour blanc.

## Accessibilité (exigence permanente)

Tout composant et toute couleur doivent respecter **WCAG 2.2 AA et RGAA**, vérifiés dans les **deux** thèmes (clair ET sombre). Après chaque changement de couleur : re-vérifier les contrastes des deux thèmes avant d'annoncer le fix.

## Contenus fixes

- Email : **product.garoscio@gmail.com** (l'ancienne bonjour@audreygaroscio.fr ne doit plus apparaître nulle part).
- LinkedIn : audrey-garoscio-3a4660106. Localisation : Noisy-le-Grand, Île-de-France. Mention RQTH dans le profil.

## Environnement et workflow

- Le code vit dans `site/` : exécuter npm/node **depuis `site/`**. Pas de Python sur la machine ; traitement d'images avec **sharp** (devDependency de `site/`, scripts lancés depuis `site/`).
- Serveur dev : `npm run dev` dans `site/` ; vérifier que le localhost répond avant d'envoyer un lien à Audrey (les « accès refusé » venaient de serveurs morts). En fin de session, éteindre les serveurs si Audrey le demande.
- `npm run build` après chaque série de modifications.
- Déploiement : push GitHub → Vercel. Proposer spontanément commit + push quand des modifs sont validées.
- Après tout fix visuel : capture Edge headless en 500 / 768 / **1280 (écran 14 pouces d'Audrey)** / 1440 px et vérification AVANT d'annoncer « corrigé ».
- **Modification chirurgicale** : ne jamais supprimer ou réécrire du contenu existant non concerné par la demande ; en cas de refonte, lister ce qui sera retiré AVANT d'éditer (des suppressions accidentelles ont déjà « gâché son travail »).
