import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-6 pt-[65px] pb-24 text-center font-sans">
      <p className="text-sm font-medium text-primary tabular-nums">Erreur 404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
        Cette page n&apos;existe pas
      </h1>
      <p className="mt-2 max-w-sm text-neutral-600 dark:text-neutral-400">
        L&apos;adresse est peut-être incorrecte ou la page a été déplacée.
      </p>
      <Link
        href="/fr"
        className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-600 transition-colors duration-200"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  )
}
