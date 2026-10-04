import express from "express";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  seedBudgets,
  seedTransactions,
} from "../src/features/finance/data/seed.js";

const app = express();
const port = 3001;
const directory = dirname(fileURLToPath(import.meta.url));
const dataFile = join(directory, "data.json");

app.use(express.json());
app.use((request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,DELETE,OPTIONS",
  );
  response.header("Access-Control-Allow-Headers", "Content-Type");
  if (request.method === "OPTIONS") return response.sendStatus(204);
  next();
});

function readData() {
  if (!existsSync(dataFile)) {
    return { transactions: seedTransactions, budgets: seedBudgets };
  }

  try {
    const data = JSON.parse(readFileSync(dataFile, "utf8"));
    return data?.transactions && data?.budgets
      ? data
      : { transactions: seedTransactions, budgets: seedBudgets };
  } catch {
    return { transactions: seedTransactions, budgets: seedBudgets };
  }
}

function saveData(data) {
  writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

app.get("/api/state", (_request, response) => {
  response.json(readData());
});

app.get("/api/transactions", (_request, response) => {
  response.json(readData().transactions);
});

app.post("/api/transactions", (request, response) => {
  const data = readData();
  const transaction = {
    ...request.body,
    id: request.body.id || crypto.randomUUID(),
  };
  data.transactions = [transaction, ...data.transactions];
  saveData(data);
  response.status(201).json(transaction);
});

app.delete("/api/transactions/:id", (request, response) => {
  const data = readData();
  data.transactions = data.transactions.filter(
    (transaction) => transaction.id !== request.params.id,
  );
  saveData(data);
  response.json({ ok: true });
});

app.get("/api/budgets", (_request, response) => {
  response.json(readData().budgets);
});

app.patch("/api/budgets/:category", (request, response) => {
  const data = readData();
  const category = decodeURIComponent(request.params.category);
  data.budgets = data.budgets.map((budget) =>
    budget.category === category
      ? { ...budget, limit: Number(request.body.limit) }
      : budget,
  );
  saveData(data);
  response.json(data.budgets.find((budget) => budget.category === category));
});

app.use((_request, response) => {
  response.status(404).json({ error: "Route not found" });
});

app.listen(port, () => {
  console.log(`Morrow Express API listening at http://localhost:${port}`);
});
