"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Gift, CheckCircle, XCircle, Clock, Package, X } from "lucide-react";

const VITOGAZ_GREEN = "#008B7F";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vito-backend-supabase.onrender.com/api/v1";
const ITEMS_PER_PAGE = 10;

interface Exchange {
  id: string;
  phone: string;
  name: string;
  reward_item_id: string;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  requested_at: string;
  validated_at: string | null;
  reward_items?: {
    name: string;
    points_cost: number;
    image_url: string | null;
    category: string | null;
  };
}

export default function MesEchangesPage() {
  const router = useRouter();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);

  useEffect(() => {
    fetchExchanges();
  }, []);

  const fetchExchanges = async () => {
    try {
      setLoading(true);
      const phone = localStorage.getItem("vito_user_phone");
      if (!phone) {
        router.push("/fr/login");
        return;
      }

      const response = await fetch(`${API_URL}/points-exchange?phone=${phone}`);
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const data = await response.json();
      
      // Trier par date décroissante (plus récent en premier)
      const sorted = data.sort((a: Exchange, b: Exchange) => 
        new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
      );
      
      setExchanges(sorted);

      // Marquer tous les échanges comme vus
      const exchangeIds = sorted.map((ex: Exchange) => ex.id);
      localStorage.setItem("vito_seen_exchanges", JSON.stringify(exchangeIds));

      // Déclencher event pour mettre à jour le badge dans Header
      window.dispatchEvent(new Event("exchanges-viewed"));
    } catch (error) {
      console.error("Erreur fetch exchanges:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectClick = (exchange: Exchange) => {
    setSelectedExchange(exchange);
    setShowRejectModal(true);
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "pending":
        return {
          icon: Clock,
          label: "En attente",
          bgColor: "bg-amber-100",
          textColor: "text-amber-700",
          iconColor: "text-amber-500",
        };
      case "validated":
      case "approved":
        return {
          icon: CheckCircle,
          label: "Validé",
          bgColor: "bg-emerald-100",
          textColor: "text-emerald-700",
          iconColor: "text-emerald-500",
        };
      case "rejected":
        return {
          icon: XCircle,
          label: "Refusé",
          bgColor: "bg-red-100",
          textColor: "text-red-700",
          iconColor: "text-red-500",
        };
      default:
        return {
          icon: Clock,
          label: status,
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          iconColor: "text-gray-500",
        };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Date invalide";
      }
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      return "Date invalide";
    }
  };

  // Pagination
  const totalPages = Math.ceil(exchanges.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedExchanges = exchanges.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const pendingCount = exchanges.filter((e) => e.status.toLowerCase() === "pending").length;
  const approvedCount = exchanges.filter((e) => {
    const status = e.status.toLowerCase();
    return status === "validated" || status === "approved";
  }).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.push("/fr/reward-items")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mes échanges</h1>
              <p className="text-sm text-gray-500">Historique de vos demandes</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 p-3 rounded-xl text-center">
              <p className="text-xs text-gray-500 mb-1">Total</p>
              <p className="text-lg font-bold text-gray-900">{exchanges.length}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl text-center">
              <p className="text-xs text-amber-600 mb-1">En attente</p>
              <p className="text-lg font-bold text-amber-700">{pendingCount}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl text-center">
              <p className="text-xs text-emerald-600 mb-1">Validés</p>
              <p className="text-lg font-bold text-emerald-700">{approvedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des échanges */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-[#008B7F] rounded-full animate-spin" />
            <p className="text-sm text-gray-500 mt-3">Chargement...</p>
          </div>
        ) : exchanges.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-4">Aucun échange pour le moment</p>
            <button
              onClick={() => router.push("/fr/reward-items")}
              className="px-6 py-2.5 rounded-full text-white text-sm font-medium"
              style={{ backgroundColor: VITOGAZ_GREEN }}
            >
              Découvrir le catalogue
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedExchanges.map((exchange) => {
                const statusInfo = getStatusBadge(exchange.status);
                const StatusIcon = statusInfo.icon;
                const isRejected = exchange.status.toLowerCase() === "rejected";

                return (
                  <div
                    key={exchange.id}
                    className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${
                      isRejected && exchange.admin_notes ? "cursor-pointer hover:shadow-md transition-shadow" : ""
                    }`}
                    onClick={() => isRejected && exchange.admin_notes && handleRejectClick(exchange)}
                  >
                    <div className="p-4">
                      {/* Header avec statut */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          {exchange.reward_items?.image_url ? (
                            <img
                              src={exchange.reward_items.image_url}
                              alt={exchange.reward_items.name}
                              className="w-16 h-16 object-cover rounded-xl"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">
                              {exchange.reward_items?.name || "Article"}
                            </h3>
                            {exchange.reward_items?.category && (
                              <p className="text-xs text-gray-500 mt-1">
                                {exchange.reward_items.category}
                              </p>
                            )}
                          </div>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusInfo.bgColor} flex-shrink-0`}
                        >
                          <StatusIcon className={`w-4 h-4 ${statusInfo.iconColor}`} />
                          <span className={`text-xs font-medium ${statusInfo.textColor}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      {/* Détails */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Points utilisés</span>
                          <span className="font-semibold" style={{ color: VITOGAZ_GREEN }}>
                            {exchange.reward_items?.points_cost?.toLocaleString() || "—"} pts
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Date de demande</span>
                          <span className="text-gray-900 text-xs">
                            {formatDate(exchange.requested_at)}
                          </span>
                        </div>
                        {isRejected && exchange.admin_notes && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                            <p className="text-xs text-red-600 font-medium mb-1">
                              ⚠️ Voir motif de refus
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-full transition-colors ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-full transition-colors ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Footer info */}
            <p className="text-xs text-center text-gray-400 mt-6">
              {startIndex + 1}-{Math.min(endIndex, exchanges.length)} sur {exchanges.length}{" "}
              échange(s)
            </p>
          </>
        )}
      </div>

      {/* Modal Refus */}
      {showRejectModal && selectedExchange && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 mb-24 sm:mb-0 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Demande refusée</h3>
                  <p className="text-sm text-gray-500">Motif du refus</p>
                </div>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {selectedExchange.admin_notes}
              </p>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Article demandé</span>
                <span className="font-medium text-gray-900">
                  {selectedExchange.reward_items?.name || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Points concernés</span>
                <span className="font-semibold" style={{ color: VITOGAZ_GREEN }}>
                  {selectedExchange.reward_items?.points_cost?.toLocaleString() || "—"} pts
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowRejectModal(false)}
              className="w-full py-3 rounded-full text-white font-medium"
              style={{ backgroundColor: VITOGAZ_GREEN }}
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
}