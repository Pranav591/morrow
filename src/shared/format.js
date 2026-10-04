export const formatMoney = (amount, compact = false, decimals = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    notation: compact ? "compact" : "standard",
  }).format(amount);

export const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(
    new Date(`${date}T00:00:00`),
  );

export const monthLabel = (date = new Date()) =>
  new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(
    date,
  );

export const accountLabel = (account) => {
  if (account === "Main account") return "UPI";
  if (account === "Everyday card") return "Debit card";
  return account;
};
