const API_BASE = "/api";

async function request(path, options) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json();
}

export const financeApi = {
  getState: () => request("/state"),
  createTransaction: (transaction) =>
    request("/transactions", {
      method: "POST",
      body: JSON.stringify(transaction),
    }),
  deleteTransaction: (id) =>
    request(`/transactions/${id}`, { method: "DELETE" }),
  updateBudget: (category, limit) =>
    request(`/budgets/${encodeURIComponent(category)}`, {
      method: "PATCH",
      body: JSON.stringify({ limit }),
    }),
};
