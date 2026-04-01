"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Package, Gift, ChevronRight, Filter } from "lucide-react";

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
  status: string;
}

const CATEGORIES = [
  "Tous",
  "Électronique & High-Tech",
  "Mode & Vêtements",
  "Maison & Décoration",
  "Beauté & Bien-être",
  "Sport & Fitness",
  "Cartes cadeaux",
  "Alimentation & Boissons",
  "Culture & Divertissement",
  "Voyage & Hébergement",
  "Automobile & Mobilité",
  "Services & Abonnements",
  "Téléphonie & Internet",
  "Bricolage & Jardinage",
  "Jeux & Jouets",
  "Expériences & Loisirs",
];

export default function RewardItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState<RewardItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [userPoints, setUserPoints] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchUserPoints();
  }, []);

  useEffect(() => {
    if (selectedCategory === "Tous") {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter((item) => item.category === selectedCategory));
    }
  }, [selectedCategory, items]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/reward-items`);
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const data = await response.json();
      // Filtrer uniquement les articles actifs avec stock > 0
      const availableItems = data.filter(
        (item: RewardItem) => item.status === "ACTIVE" && item.stock_quantity > 0
      );
      setItems(availableItems);
      setFilteredItems(availableItems);
    } catch (error) {
      console.error("Erreur fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const phone = localStorage.getItem("vito_user_phone");
      if (!phone) return;

      const response = await fetch(`${API_URL}/qr/user-points/${phone}`);
      if (!response.ok) throw new Error("Erreur points");
      const data = await response.json();
      setUserPoints(data.points || 0);
    } catch (error) {
      console.error("Erreur fetch points:", error);
    }
  };

  const handleExchange = (item: RewardItem) => {
    if (userPoints < item.points_cost) {
      alert(`Vous n'avez pas assez de points. Il vous manque ${item.points_cost - userPoints} points.`);
      return;
    }
    // Navigation vers page d'échange avec l'ID de l'article
    router.push(`/fr/reward-items/${item.id}/exchange`);
  };

  const canAfford = (cost: number) => userPoints >= cost;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header fixe */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Catalogue Cadeaux</h1>
              <p className="text-sm text-gray-500">Échangez vos points</p>
            </div>
            <button
              onClick={() => router.push("/fr/mes-echanges")}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium"
              style={{ backgroundColor: VITOGAZ_GREEN }}
            >
              <Gift className="w-4 h-4" />
              Mes échanges
            </button>
          </div>

          {/* Solde points */}
          <div
            className="p-4 rounded-2xl"
            style={{ backgroundColor: "#f0faf9", borderColor: "#b2dbd8", borderWidth: "1px" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Votre solde</p>
                <p className="text-2xl font-bold" style={{ color: VITOGAZ_GREEN }}>
                  {userPoints.toLocaleString()} pts
                </p>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Bouton filtres */}
        <div className="px-4 pb-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 w-full justify-center"
          >
            <Filter className="w-4 h-4" />
            Filtrer par catégorie
            {selectedCategory !== "Tous" && (
              <span
                className="px-2 py-0.5 rounded-full text-xs text-white"
                style={{ backgroundColor: VITOGAZ_GREEN }}
              >
                {selectedCategory}
              </span>
            )}
          </button>
        </div>

        {/* Filtres catégories */}
        {showFilters && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setShowFilters(false);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? "text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  style={
                    selectedCategory === cat
                      ? { backgroundColor: VITOGAZ_GREEN }
                      : {}
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grille d'articles */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-[#008B7F] rounded-full animate-spin" />
            <p className="text-sm text-gray-500 mt-3">Chargement...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {selectedCategory === "Tous"
                ? "Aucun article disponible pour le moment"
                : `Aucun article dans la catégorie "${selectedCategory}"`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const affordable = canAfford(item.points_cost);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    {!affordable && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                          Points insuffisants
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                      {item.name}
                    </h3>
                    {item.category && (
                      <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm font-bold"
                        style={{ color: VITOGAZ_GREEN }}
                      >
                        {item.points_cost.toLocaleString()} pts
                      </span>
                      <button
                        onClick={() => handleExchange(item)}
                        disabled={!affordable}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
                          affordable
                            ? "text-white"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        style={affordable ? { backgroundColor: VITOGAZ_GREEN } : {}}
                      >
                        Échanger
                        {affordable && <ChevronRight className="w-3 h-3" />}
                      </button>
                    </div>
                    {item.stock_quantity <= 5 && (
                      <p className="text-xs text-amber-600 mt-2">
                        Plus que {item.stock_quantity} en stock
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}