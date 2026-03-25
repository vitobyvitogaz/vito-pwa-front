'use client'

import { X, Share, Plus, ArrowDown } from 'lucide-react'

interface IOSInstallModalProps {
  onClose: () => void
}

export const IOSInstallModal: React.FC<IOSInstallModalProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-white dark:bg-dark-surface rounded-t-3xl shadow-2xl animate-slide-up"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <img src="/icons/icon-96x96.png" alt="Vito" className="w-10 h-10 rounded-xl" />
            <div>
              <p className="font-bold text-neutral-900 dark:text-white font-sans">Installer Vito</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">vitobyvitogaz.mg</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center active:scale-90 transition-transform"
          >
            <X className="w-5 h-5 text-neutral-500" strokeWidth={1.5} />
          </button>
        </div>

        {/* Instructions */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-sans mb-5">
            Suivez ces 3 étapes dans Safari pour installer l'application :
          </p>

          {/* Étape 1 */}
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary font-sans">1</span>
            </div>
            <div className="flex-1 pt-1">
              <p className="text-sm font-medium text-neutral-900 dark:text-white font-sans">
                Appuyez sur le bouton Partager
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans mt-0.5">
                En bas de Safari (icône avec une flèche vers le haut)
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center flex-shrink-0">
              <Share className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2} />
            </div>
          </div>

          {/* Séparateur */}
          <div className="flex justify-center">
            <ArrowDown className="w-4 h-4 text-neutral-300 dark:text-neutral-600" strokeWidth={2} />
          </div>

          {/* Étape 2 */}
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary font-sans">2</span>
            </div>
            <div className="flex-1 pt-1">
              <p className="text-sm font-medium text-neutral-900 dark:text-white font-sans">
                Faites défiler et appuyez sur
              </p>
              <p className="text-sm font-bold text-neutral-900 dark:text-white font-sans">
                "Sur l'écran d'accueil"
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center flex-shrink-0">
              <Plus className="w-4 h-4 text-neutral-600 dark:text-neutral-400" strokeWidth={2} />
            </div>
          </div>

          {/* Séparateur */}
          <div className="flex justify-center">
            <ArrowDown className="w-4 h-4 text-neutral-300 dark:text-neutral-600" strokeWidth={2} />
          </div>

          {/* Étape 3 */}
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary font-sans">3</span>
            </div>
            <div className="flex-1 pt-1">
              <p className="text-sm font-medium text-neutral-900 dark:text-white font-sans">
                Appuyez sur <span className="font-bold">"Ajouter"</span> en haut à droite
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans mt-0.5">
                L'application apparaîtra sur votre écran d'accueil
              </p>
            </div>
          </div>
        </div>

        {/* Bouton fermer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-sm font-sans active:scale-95 transition-transform"
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  )
}