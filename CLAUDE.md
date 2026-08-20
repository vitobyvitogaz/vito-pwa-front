# Vito by Vitogaz — Front PWA

## Rôle de ce projet
Interface utilisateur principale — PWA destinée aux clients et revendeurs de Vitogaz Madagascar.
Application publique, grand public malgache. Priorités : lisibilité en plein soleil, rapidité sur réseau mobile, sobriété visuelle qui inspire confiance (marque énergie/gaz, pas une app « tech »).

## Stack technique (à jour)
- **Framework** : Next.js **16.0.7** (App Router) — *pas* Next 14.
- **React** : 19.2
- **Style** : Tailwind CSS 3.4 (config dans `tailwind.config.ts`)
- **Langage** : TypeScript strict — pas de `any`
- **Type** : PWA via `next-pwa` (manifest + service worker)
- **Internationalisation** : next-intl / i18next — routing `[locale]` (fr, mg, en)
- **Cartes** : Leaflet + react-leaflet ; Google Maps JS API en complément
- **Déploiement** : Vercel (auto-deploy sur push `main`) ; backend NestJS sur Render.com

## Points d'attention techniques
- **Configs en double** : le fichier de config réel est `next.config.js` (il contient toute la logique PWA + `runtimeCaching` + images). `next.config.ts` est un stub vide généré par défaut — **ne rien mettre dedans** et ne pas le laisser prendre le dessus, sinon toute la config PWA saute silencieusement. Idem `postcss.config.js` (réel) vs `postcss.config.mjs`. À terme : supprimer les stubs vides.
- **Variables d'environnement** : définies sur Vercel ET en local dans `.env.local`. Ne jamais hardcoder de clé API.
- **Appels API côté serveur** : `NEXT_PUBLIC_API_URL` est `undefined` dans les route handlers Next côté serveur. Pour les appels server-side, utiliser `API_URL` (sans le préfixe). Pour transmettre l'IP visiteur au backend, passer l'en-tête `x-forwarded-for` depuis le route handler (Vercel capture sinon sa propre IP serveur).
- **Backend Render.com** : comportement de mise en veille — prévoir une logique de retry sur les premiers appels.
- **Google Maps API** : vérifier que la variable d'env est bien chargée avant tout appel.

## Communication avec le backend
- API REST via le backend NestJS (`vito-backend-supabase.onrender.com/api/v1`).
- Tous les écrits passent par NestJS (service_role, bypass RLS). Le front lit certaines tables en direct.

---

# Design system — conventions à respecter impérativement

> Objectif transverse : un rendu **pixel-parfait et intentionnel**, qui ne « sent » jamais le template généré automatiquement. Chaque écart de couleur, de rayon ou de graisse par rapport à ces règles est un défaut à corriger, pas une variation.

## Typographie
Deux familles chargées via `next/font/google` dans `src/app/layout.tsx`, déclarées dans `tailwind.config.ts` (et miroir cosmétique dans `src/styles/theme.ts`).

- **Poppins** — police **principale de toute l'UI**. C'est la valeur par défaut du `body`. Token : `font-sans` → `--font-poppins`. Le token `font-display` pointe aussi vers Poppins (titres d'interface : même famille, différenciée uniquement par la graisse et le `tracking`).
- **EB Garamond** — police **secondaire, éditoriale uniquement**. Police officielle imposée par le groupe Rubis. Token dédié : `font-editorial` → `--font-eb-garamond` (fallback `Georgia, serif`). **Réservée** à un petit ensemble de titres éditoriaux : titre du hero d'accueil, intros/titres des promotions, en-têtes de documents. **Ne jamais** l'utiliser sur la nav, les boutons, les labels, les cartes d'action, les données. Une serif dispersée partout casse la lisibilité et fait « bricolé ».
- Les anciennes polices **Inter** et **Montserrat** sont retirées — ne plus les référencer.
- Titres : `font-display` (Poppins) + `font-semibold` + `tracking-tight`. **Une seule graisse par niveau** — proscrire le mélange `font-bold` / `font-semibold` / `font-black` / `font-mono` sur des H1 équivalents.
- Colonnes de chiffres alignées : `tabular-nums`.

## Palette — discipline stricte
La marque, c'est **teal + navy + neutres**, avec des accents chauds **parcimonieux**. C'est tout.

- **Primary (teal)** : `#008B7F` (+ échelle `primary-50…900` déjà en config). Couleur de travail principale.
- **Navy** : `#1F3864` — profondeur, certains titres, éléments de structure.
- **Accents chauds, en accent seulement** : jaune `#F6C90E` (mises en avant, pastilles d'icônes) et rouge `#C8102E` (urgence, emphase CTA). Jamais comme code couleur systématique.
- **Neutres** : échelle `neutral-*` pour texte, bordures, surfaces ; `neutral-25` (#FAFAF9) en fond doux.

**Interdit — le tell n°1 « IA » :** le code couleur arc-en-ciel où chaque carte reçoit sa propre teinte pastel sans lien avec la marque (bleu, violet, purple, ambre, emerald, indigo…). Ces couleurs ne sont **pas** dans l'identité Vitogaz. Une grille de cartes se différencie par l'icône et le libellé, pas par une couleur de bonbon par tuile. Toute couleur doit venir d'un token Tailwind — **pas de hex en dur** dans `style={{}}` (bannir `#7C3AED`, `#FF8C00`, `#E53E3E`, etc. ; `#E53E3E` ≠ l'accent token `#C8102E`).

## Formes, icônes, profondeur
- **Rayons** : `rounded-2xl` pour les conteneurs/cartes ; `rounded-full` pour badges, pastilles, filtres, boutons ronds. Unifier — ne pas mélanger `rounded-xl` / `rounded-2xl` / `rounded-3xl` au hasard sur des éléments de même nature.
- **Icônes** : lucide-react, style outline, `strokeWidth={2}` de façon cohérente (pas de 1.5 par endroits).
- **Header** : hauteur unique `NAVBAR_HEIGHT = 65`. Le padding-top des pages doit correspondre exactement à la hauteur réelle du header — pas de valeurs divergentes (`h-16` / `h-[70px]` / `pt-14` / `pt-16`) qui créent un flottement de quelques px sous la barre.
- **Ombres** : privilégier les ombres douces (`shadow-sm`, `shadow-md`, `subtle`). Réserver `shadow-2xl` aux vraies surélévations (modales), pas aux cartes courantes.

## Retenue visuelle (anti « IA »)
- **Animation** : sobre et utile. Une entrée en fondu discrète suffit. Éviter d'animer *tout en même temps* — pas d'anneaux de pulsation simultanés sur toutes les cartes, pas de `animate-slide-up` avec `animationDelay` échelonné partout, `hover:scale`/`hover:-translate` avec parcimonie. « Moins, c'est plus » : l'excès d'effets est justement ce qui trahit une UI générée.
- **Glassmorphism** : à doser. Une carte `backdrop-blur` translucide posée sur la bannière avec `drop-shadow-2xl` sur chaque ligne de texte est un cliché « hero IA 2023 ». Si conservée, l'alléger (un seul niveau d'ombre, texte lisible sans dépendre du blur).
- **Textures** : pas de filtre de grain SVG (`feTurbulence`) en fond de section — c'est un ornement reconnaissable qui ne sert pas le propos.
- **Micro-copie** : plain verbs, sentence case, actif. Un bouton dit ce qui se passe (« Voir les revendeurs », pas « Découvrir → » répété sur chaque carte). Éviter le remplissage générique (triptyques de badges de confiance décoratifs, « Actions rapides » fourre-tout). Le libellé sert la navigation, il ne décore pas.

## Principe directeur
Dépenser l'audace à un seul endroit : un élément signature fort, et tout le reste calme et discipliné. La cohérence (mêmes rayons, mêmes graisses, mêmes tokens) prime sur l'effet. En cas de doute, retirer un ornement plutôt qu'en ajouter un.

---

## Commandes importantes
- `npm run dev` → développement (webpack)
- `npm run build` → **toujours vérifier que le build passe avant de committer**
- `npm run lint` → vérifier le code

## Conventions de code
- Composants React en PascalCase.
- Pages dans `/src/app/[locale]` ; composants réutilisables dans `/src/components`.
- TypeScript strict, pas de `any`.
- Livrables préférés : **fichiers complets corrigés** plutôt que diffs partiels.
- Workflow : une tâche = un sujet (polices, puis palette, puis finitions) → une branche + un Preview Vercel par sujet.
