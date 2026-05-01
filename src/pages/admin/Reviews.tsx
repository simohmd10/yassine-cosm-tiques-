import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAllReviewsAdmin, updateReviewStatus } from "@/hooks/useOrders";
import type { AdminReview, ReviewStatus } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, X, Search, MessageSquare, Star, Clock, CheckCircle2, XCircle } from "lucide-react";

type FilterTab = "pending" | "approved" | "rejected" | "all";

const TAB_LABELS: Record<FilterTab, string> = {
  pending:  "Pending",
  approved: "Approved",
  rejected: "Rejected",
  all:      "All",
};

const STATUS_STYLES: Record<ReviewStatus, string> = {
  pending:  "bg-yellow-50 text-yellow-700 border-yellow-100",
  approved: "bg-green-50 text-green-700 border-green-100",
  rejected: "bg-red-50 text-red-700 border-red-100",
};

const STATUS_ICONS: Record<ReviewStatus, React.ElementType> = {
  pending:  Clock,
  approved: CheckCircle2,
  rejected: XCircle,
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<FilterTab>("pending");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const { data: reviews = [], isLoading } = useQuery<AdminReview[]>({
    queryKey: ["admin-reviews"],
    queryFn: fetchAllReviewsAdmin,
    staleTime: 30_000,
  });

  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  const filtered = reviews.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.user_name.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q) ||
      r.product_name.toLowerCase().includes(q)
    );
  });

  const handleStatusChange = async (id: string, status: ReviewStatus) => {
    setUpdating(id);
    try {
      await updateReviewStatus(id, status);
      await qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success(status === "approved" ? "Review approved" : "Review rejected");
    } catch {
      toast.error("Failed to update review status");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {reviews.length} total
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3" />
              {pendingCount} pending
            </span>
          )}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(["pending", "approved", "rejected", "all"] as FilterTab[]).map((tab) => {
          const count = tab === "all" ? reviews.length : reviews.filter((r) => r.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                filter === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {TAB_LABELS[tab]}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === tab ? "bg-gray-100 text-gray-700" : "bg-gray-200 text-gray-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by name, product, or comment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-6 h-6 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No reviews found</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  {["Product", "Customer", "Rating", "Comment", "Date", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className={`text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${
                        h === "Actions" ? "text-right" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((review) => {
                  const StatusIcon = STATUS_ICONS[review.status];
                  return (
                    <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 max-w-[140px] truncate">
                          {review.product_name || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700">{review.user_name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StarRow rating={review.rating} />
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600 max-w-[220px] line-clamp-2">{review.comment}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(review.created_at).toLocaleDateString("fr-MA", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[review.status]}`}>
                          <StatusIcon className="w-3 h-3" />
                          {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {review.status !== "approved" && (
                            <Button
                              size="sm"
                              className="h-7 px-2.5 bg-green-500 hover:bg-green-600 text-white gap-1"
                              disabled={updating === review.id}
                              onClick={() => handleStatusChange(review.id, "approved")}
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </Button>
                          )}
                          {review.status !== "rejected" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2.5 text-red-500 border-red-200 hover:bg-red-50 gap-1"
                              disabled={updating === review.id}
                              onClick={() => handleStatusChange(review.id, "rejected")}
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((review) => {
              const StatusIcon = STATUS_ICONS[review.status];
              return (
                <div key={review.id} className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{review.product_name || "—"}</p>
                      <p className="text-xs text-gray-500">{review.user_name}</p>
                    </div>
                    <span className={`flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[review.status]}`}>
                      <StatusIcon className="w-3 h-3" />
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRow rating={review.rating} />
                    <span className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString("fr-MA", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">{review.comment}</p>
                  <div className="flex gap-2 pt-1">
                    {review.status !== "approved" && (
                      <Button
                        size="sm"
                        className="flex-1 h-8 bg-green-500 hover:bg-green-600 text-white gap-1"
                        disabled={updating === review.id}
                        onClick={() => handleStatusChange(review.id, "approved")}
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </Button>
                    )}
                    {review.status !== "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-red-500 border-red-200 hover:bg-red-50 gap-1"
                        disabled={updating === review.id}
                        onClick={() => handleStatusChange(review.id, "rejected")}
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
