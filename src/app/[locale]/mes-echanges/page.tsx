"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Gift, CheckCircle, XCircle, Clock, Package } from "lucide-react";

const VITOGAZ_GREEN = "#008B7F";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vito-backend-supabase.onrender.com/api/v1";
const ITEMS_PER_PAGE = 10;

interface Exchange {
  id: string;
  phone: string;
  name: string;
  reward_item_id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  reward_item?: {
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
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setExchanges(sorted);
    } catch (error) {
      console.error("Erreur fetch exchanges:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          icon: Clock,
          label: "En attente",
          bgColor: "bg-amber-100",
          textColor: "text-amber-700",
          iconColor: "text-amber-500",
        };
      case "APPROVED":
        return {
          icon: CheckCircle,
          label: "Validé",
          bgColor: "bg-emerald-100",
          textColor: "text-emerald-700",
          iconColor: "text-emerald-500",
        };
      case "REJECTED":
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

  const pendingCount = exchanges.filter((e) => e.status === "PENDING").length;
  const approvedCount = exchanges.filter((e) => e.status === "APPROVED").length;

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

                return (
                  <div
                    key={exchange.id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                  >
                    <div className="p-4">
                      {/* Header avec statut */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          {exchange.reward_item?.image_url ? (
                            <img
                              src={exchange.reward_item.image_url}
                              alt={exchange.reward_item.name}
                              className="w-16 h-16 object-cover rounded-xl"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">
                              {exchange.reward_item?.name || "Article"}
                            </h3>
                            {exchange.reward_item?.category && (
                              <p className="text-xs text-gray-500 mt-1">
                                {exchange.reward_item.category}
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
                            {exchange.reward_item?.points_cost?.toLocaleString() || "—"} pts
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Date de demande</span>
                          <span className="text-gray-900 text-xs">
                            {formatDate(exchange.created_at)}
                          </span>
                        </div>
                        {exchange.admin_notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-500 mb-1">Note admin</p>
                            <p className="text-sm text-gray-700">{exchange.admin_notes}</p>
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
    </div>
  );
}