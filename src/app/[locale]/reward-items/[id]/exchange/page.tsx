"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Package, Lock, CheckCircle, AlertCircle } from "lucide-react";

const VITOGAZ_GREEN = "#008B7F";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vito-backend-supabase.onrender.com/api/v1";

interface RewardItem {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  points_cost: number;
  stock_quantity: number;
  category: string | null;
}

export default function ExchangePage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const [item, setItem] = useState<RewardItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [hasPIN, setHasPIN] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pin: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const phone = localStorage.getItem("vito_user_phone");
    const name = localStorage.getItem("vito_user_name");
    
    if (!phone) {
      router.push("/fr/login");
      return;
    }

    setFormData((prev) => ({ ...prev, phone, name: name || "" }));
    
    fetchItem();
    fetchUserPoints();
    checkExistingPIN();
  }, [itemId]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/reward-items/${itemId}`);
      if (!response.ok) throw new Error("Article introuvable");
      const data = await response.json();
      setItem(data);
    } catch (error) {
      console.error("Erreur fetch item:", error);
      setError("Impossible de charger l'article");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const phone = localStorage.getItem("vito_user_phone");
      if (!phone) return;

      const response = await fetch(`${API_URL}/scan/points/${phone}`);
      if (!response.ok) throw new Error("Erreur points");
      const data = await response.json();
      setUserPoints(data.available_points || 0);
    } catch (error) {
      console.error("Erreur fetch points:", error);
    }
  };

  const checkExistingPIN = async () => {
    try {
      const phone = localStorage.getItem("vito_user_phone");
      if (!phone) return;

      // Vérifier si un PIN existe déjà en essayant de récupérer l'historique des échanges
      const response = await fetch(`${API_URL}/points-exchange?phone=${phone}`);
      if (response.ok) {
        const exchanges = await response.json();
        // Si au moins un échange existe, on suppose qu'un PIN est déjà créé
        setHasPIN(exchanges && exchanges.length > 0);
      }
    } catch (error) {
      console.error("Erreur check PIN:", error);
      setHasPIN(false);
    }
  };

  const handlePINInput = (value: string) => {
    // Accepter uniquement les chiffres, max 4
    const filtered = value.replace(/\D/g, "").slice(0, 4);
    setFormData((prev) => ({ ...prev, pin: filtered }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!item) return;

    // Validations
    if (!formData.name.trim()) {
      setError("Veuillez entrer votre nom");
      return;
    }

    if (formData.pin.length !== 4) {
      setError(hasPIN ? "PIN à 4 chiffres requis" : "Créez un PIN à 4 chiffres");
      return;
    }

    if (userPoints < item.points_cost) {
      setError(`Points insuffisants. Il vous manque ${item.points_cost - userPoints} points.`);
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        phone: formData.phone,
        name: formData.name,
        reward_item_id: itemId,
        pin: formData.pin,
      };

      const response = await fetch(`${API_URL}/points-exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de la demande");
      }

      // Sauvegarder le nom pour la prochaine fois
      localStorage.setItem("vito_user_name", formData.name);

      setSuccess(true);

      // Rediriger après 2 secondes
      setTimeout(() => {
        router.push("/fr/mes-echanges");
      }, 2000);
    } catch (error: any) {
      console.error("Erreur submit:", error);
      setError(error.message || "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-[#008B7F] rounded-full animate-spin" />
          <p className="text-sm text-gray-500 mt-3">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-gray-700 mb-4">Article introuvable</p>
          <button
            onClick={() => router.push("/fr/reward-items")}
            className="px-6 py-2.5 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: VITOGAZ_GREEN }}
          >
            Retour au catalogue
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "#e6f7f5" }}
          >
            <CheckCircle className="w-8 h-8" style={{ color: VITOGAZ_GREEN }} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Demande envoyée !</h2>
          <p className="text-sm text-gray-600 mb-6">
            Votre demande d'échange a été enregistrée. Un administrateur va la valider sous peu.
          </p>
          <p className="text-xs text-gray-400">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  const canAfford = userPoints >= item.points_cost;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Confirmer l'échange</h1>
              <p className="text-xs text-gray-500">Vérifiez les détails</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Article */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Article sélectionné</p>
          <div className="flex items-start gap-4">
            <div className="relative w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
              {item.image_url ? (
                <Image src={item.image_url} alt={item.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
              {item.category && <p className="text-xs text-gray-500 mb-2">{item.category}</p>}
              {item.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
              )}
            </div>
          </div>
          <div
            className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100"
          >
            <span className="text-sm text-gray-500">Coût</span>
            <span className="text-lg font-bold" style={{ color: VITOGAZ_GREEN }}>
              {item.points_cost.toLocaleString()} pts
            </span>
          </div>
        </div>

        {/* Solde */}
        <div
          className={`p-4 rounded-2xl mb-6 ${
            canAfford ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
          }`}
          style={{ borderWidth: "1px" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Votre solde</p>
              <p
                className={`text-xl font-bold ${
                  canAfford ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {userPoints.toLocaleString()} pts
              </p>
            </div>
            {!canAfford && (
              <AlertCircle className="w-6 h-6 text-red-500" />
            )}
          </div>
          {!canAfford && (
            <p className="text-xs text-red-600 mt-2">
              ❌ Points insuffisants (il manque {(item.points_cost - userPoints).toLocaleString()} pts)
            </p>
          )}
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">Vos informations</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Votre nom"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008B7F] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.phone}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-1" />
                  {hasPIN ? "Votre code PIN" : "Créer un code PIN"} (4 chiffres) *
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  required
                  maxLength={4}
                  value={formData.pin}
                  onChange={(e) => handlePINInput(e.target.value)}
                  placeholder="••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008B7F] focus:border-transparent text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {hasPIN
                    ? "Saisissez votre code PIN pour confirmer l'échange"
                    : "Ce code PIN sera requis pour vos futurs échanges"}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !canAfford}
            className={`w-full py-4 rounded-xl text-white font-semibold transition-all ${
              submitting || !canAfford
                ? "bg-gray-300 cursor-not-allowed"
                : "shadow-lg hover:shadow-xl"
            }`}
            style={
              submitting || !canAfford ? {} : { backgroundColor: VITOGAZ_GREEN }
            }
          >
            {submitting ? "Envoi en cours..." : "Confirmer l'échange"}
          </button>

          <p className="text-xs text-center text-gray-400">
            En confirmant, vous acceptez que {item.points_cost.toLocaleString()} points soient déduits
            de votre compte après validation par un administrateur.
          </p>
        </form>
      </div>
    </div>
  );
}