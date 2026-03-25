# VIto by Vitogaz — Front PWA

## Rôle de ce projet
Interface utilisateur principale — PWA destinée aux clients et revendeurs Vitogaz Madagascar.

## Stack technique
- Framework : Next.js 14 (App Router)
- Style : Tailwind CSS
- Type : PWA (Progressive Web App)
- Internationalisation : next-intl (Français, Malagasy, Anglais)
- Déploiement : Vercel

## Points d'attention
- Les variables d'environnement doivent être définies sur Vercel ET en local dans .env.local
- Ne jamais hardcoder de clés API dans le code
- Google Maps API : vérifier que la variable d'env est bien chargée avant tout appel

## Commandes importantes
- npm run dev → lancer en développement
- npm run build → vérifier que le build passe avant de commiter
- npm run lint → vérifier le code

## Communication avec le backend
- API REST via le backend NestJS
- URL backend en variable d'environnement : NEXT_PUBLIC_API_URL

## Conventions
- Composants React en PascalCase
- Fichiers de pages dans /app
- Composants réutilisables dans /components
- TypeScript strict — pas de any
