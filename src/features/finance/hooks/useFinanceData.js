import { useEffect, useMemo, useState } from "react";
import { seedBudgets, seedTransactions } from "../data/seed.js";
import { financeApi } from "../services/api.js";

const DATA_KEY = "morrow-finance-v1";
const LEGACY_DATA_KEY = "ledgerly-data-v1";

function readSavedData() {
  try {
    for (const key of [DATA_KEY, LEGACY_DATA_KEY]) {
      const saved = JSON.parse(localStorage.getItem(key));
      if (
        saved &&
        Array.isArray(saved.transactions) &&
        Array.isArray(saved.budgets)
      )
        return saved;
    }
  } catch {
    // A damaged browser entry should not prevent the app from opening.
  }
  return {
    transactions: seedTransactions,
    budgets: seedBudgets,
    balanceAdjustment: 0,
  };
}

export function useFinanceData() {
  const [data, setData] = useState(readSavedData);

  useEffect(() => {
    const hasLocalData = Boolean(
      localStorage.getItem(DATA_KEY) || localStorage.getItem(LEGACY_DATA_KEY),
    );
    financeApi
      .getState()
      .then((remote) => {
        if (!remote?.transactions || !remote?.budgets) return;
        if (!hasLocalData) return setData(remote);
        setData((current) => {
          const existingKeys = new Set(
            current.transactions.map(
              (item) => `${item.date}|${item.name}|${item.amount}|${item.type}`,
            ),
          );
          const mergedRemote = remote.transactions.filter(
            (item) =>
              !existingKeys.has(
                `${item.date}|${item.name}|${item.amount}|${item.type}`,
              ),
          );
          return {
            transactions: [...mergedRemote, ...current.transactions],
            budgets: current.budgets,
            balanceAdjustment:
              current.balanceAdjustment ?? remote.balanceAdjustment ?? 0,
          };
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }, [data]);

  const summary = useMemo(() => {
    const income = data.transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);
    const expenses = data.transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);
    return {
      income,
      expenses,
      balance: income - expenses + (data.balanceAdjustment || 0),
    };
  }, [data.transactions]);

  const addTransaction = (transaction) => {
    const next = { ...transaction, id: crypto.randomUUID() };
    setData((current) => ({
      ...current,
      transactions: [next, ...current.transactions],
    }));
    financeApi.createTransaction(next).catch(() => {});
  };

  const removeTransaction = (id) => {
    setData((current) => ({
      ...current,
      transactions: current.transactions.filter(
        (transaction) => transaction.id !== id,
      ),
    }));
    financeApi.deleteTransaction(id).catch(() => {});
  };

  const updateBudget = (category, limit) => {
    setData((current) => ({
      ...current,
      budgets: current.budgets.map((budget) =>
        budget.category === category ? { ...budget, limit } : budget,
      ),
    }));
    financeApi.updateBudget(category, limit).catch(() => {});
  };

  const importTransactions = (transactions) => {
    setData((current) => ({
      ...current,
      transactions: [...transactions, ...current.transactions],
    }));
    transactions.forEach((transaction) =>
      financeApi.createTransaction(transaction).catch(() => {}),
    );
  };

  return {
    ...data,
    summary,
    addTransaction,
    removeTransaction,
    updateBudget,
    importTransactions,
  };
}
