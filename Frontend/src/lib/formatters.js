export const formatCurrency = (n, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);

export const formatCompact = (n) =>
  new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n);

export const formatPct = (n) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
