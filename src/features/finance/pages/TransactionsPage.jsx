import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { categories } from "../data/seed.js";
import {
  accountLabel,
  formatDate,
  formatMoney,
  monthLabel,
} from "../../../shared/format.js";

const marks = {
  "Food & drink": "◒",
  Transport: "↗",
  Shopping: "◇",
  Bills: "▤",
  Health: "✳",
  Lifestyle: "✦",
  Income: "↙",
};
const todayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

function TransactionsPage({
  transactions,
  addTransaction,
  removeTransaction,
  selectedMonth,
  onExport,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(searchParams.get("new") === "1");
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "Food & drink",
    date: todayKey(),
    account: "Debit card",
    type: "expense",
    note: "",
  });

  useEffect(() => {
    if (searchParams.get("new") === "1") setModalOpen(true);
  }, [searchParams]);

  useEffect(() => {
    const handleSearchShortcut = (event) => {
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }

      if (
        event.key === "Escape" &&
        document.activeElement === searchInputRef.current
      ) {
        setQuery("");
        searchInputRef.current.blur();
      }
    };

    window.addEventListener("keydown", handleSearchShortcut);
    return () => window.removeEventListener("keydown", handleSearchShortcut);
  }, []);
  const filtered = useMemo(
    () =>
      [...transactions]
        .filter((item) => {
          const matchesQuery =
            `${item.name} ${item.category} ${item.note || ""}`
              .toLowerCase()
              .includes(query.toLowerCase());
          const matchesMonth = item.date.startsWith(selectedMonth);
          return (
            matchesQuery &&
            matchesMonth &&
            (typeFilter === "all" || item.type === typeFilter) &&
            (categoryFilter === "all" || item.category === categoryFilter)
          );
        })
        .sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, query, typeFilter, categoryFilter],
  );

  const closeModal = () => {
    setModalOpen(false);
    setSearchParams({});
  };
  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || Number(form.amount) <= 0) return;
    addTransaction({
      ...form,
      name: form.name.trim(),
      amount: Number(form.amount),
    });
    setForm((current) => ({
      ...current,
      name: "",
      amount: "",
      note: "",
      date: todayKey(),
    }));
    closeModal();
  };

  return (
    <div className="transactions-page page-enter">
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR MONEY, ITEMIZED</p>
          <h1>
            Transactions<span className="heading-period">.</span>
          </h1>
          <p className="page-subtitle">
            Every little detail, all in one place.
          </p>
        </div>
        <div className="heading-actions">
          <button className="button button-secondary" onClick={onExport}>
            <Download size={15} /> Export CSV
          </button>
          <button
            className="button button-primary"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={16} /> Add transaction
          </button>
        </div>
      </div>
      <div className="ledger-summary">
        <div>
          <span>Showing</span>
          <strong>{filtered.length} transactions</strong>
          <span>
            for {monthLabel(new Date(`${selectedMonth}-01T00:00:00`))}
          </span>
        </div>
        <div className="ledger-summary-total">
          <span>Net this month</span>
          <strong>
            {formatMoney(
              transactions.reduce(
                (sum, item) =>
                  sum + (item.type === "income" ? item.amount : -item.amount),
                0,
              ),
            )}
          </strong>
        </div>
      </div>
      <section className="panel ledger-panel">
        <div className="ledger-toolbar">
          <label className="search-box">
            <Search size={16} />
            <input
              ref={searchInputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search transactions"
              aria-label="Search transactions"
            />
            <kbd>/</kbd>
          </label>
          <div className="ledger-filters">
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              aria-label="Filter by type"
            >
              <option value="all">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item.name}>{item.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="transaction-table-wrap">
          <table className="transaction-table ledger-table">
            <thead>
              <tr>
                <th>TRANSACTION</th>
                <th>CATEGORY</th>
                <th>DATE</th>
                <th>ACCOUNT</th>
                <th className="align-right">AMOUNT</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const color = categories.find(
                  (c) => c.name === item.category,
                )?.color;
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="transaction-name">
                        <span
                          className="transaction-mark"
                          style={{ "--category-color": color }}
                        >
                          {marks[item.category]}
                        </span>
                        <span>
                          <strong>{item.name}</strong>
                          <small>{item.note || item.type}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="category-pill">
                        <i style={{ background: color }} />
                        {item.category}
                      </span>
                    </td>
                    <td>{formatDate(item.date)}</td>
                    <td>{accountLabel(item.account)}</td>
                    <td
                      className={`amount-cell ${item.type === "income" ? "amount-income" : ""}`}
                    >
                      {item.type === "income" ? "+" : "−"}
                      {formatMoney(item.amount)}
                    </td>
                    <td>
                      <button
                        className="row-action"
                        onClick={() => removeTransaction(item.id)}
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="table-empty">
              <Search size={22} />
              <strong>No transactions found</strong>
              <span>Try a different search or add a new transaction.</span>
            </div>
          )}
        </div>
        <div className="ledger-footer">
          <span>
            Showing {filtered.length} of {transactions.length} transactions
          </span>
          <span>
            Showing {monthLabel(new Date(`${selectedMonth}-01T00:00:00`))}
          </span>
        </div>
      </section>
      {modalOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="transaction-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-modal-title"
          >
            <div className="modal-heading">
              <div>
                <span className="panel-kicker">NEW ENTRY</span>
                <h2 id="transaction-modal-title">Add transaction</h2>
              </div>
              <button
                className="icon-button"
                onClick={closeModal}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submit}>
              <div
                className="type-switch"
                role="group"
                aria-label="Transaction type"
              >
                <button
                  type="button"
                  className={
                    form.type === "expense" ? "type-active expense-active" : ""
                  }
                  onClick={() =>
                    setForm({
                      ...form,
                      type: "expense",
                      category: "Food & drink",
                    })
                  }
                >
                  <ArrowUpRight size={15} /> Expense
                </button>
                <button
                  type="button"
                  className={
                    form.type === "income" ? "type-active income-active" : ""
                  }
                  onClick={() =>
                    setForm({ ...form, type: "income", category: "Income" })
                  }
                >
                  <ArrowDownLeft size={15} /> Income
                </button>
              </div>
              <label className="form-field">
                <span>Description</span>
                <input
                  autoFocus
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. Weekly groceries"
                />
              </label>
              <label className="form-field">
                <span>Amount</span>
                <div className="amount-input-wrap">
                  <b>₹</b>
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={form.amount}
                    onChange={(event) =>
                      setForm({ ...form, amount: event.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              </label>
              <div className="form-two-col">
                <label className="form-field">
                  <span>Category</span>
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                  >
                    {categories
                      .filter((item) =>
                        form.type === "income"
                          ? item.name === "Income"
                          : item.name !== "Income",
                      )
                      .map((item) => (
                        <option key={item.name}>{item.name}</option>
                      ))}
                  </select>
                </label>
                <label className="form-field">
                  <span>Date</span>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      setForm({ ...form, date: event.target.value })
                    }
                  />
                </label>
              </div>
              <div className="form-two-col">
                <label className="form-field">
                  <span>Account</span>
                  <select
                    value={form.account}
                    onChange={(event) =>
                      setForm({ ...form, account: event.target.value })
                    }
                  >
                    <option>Debit card</option>
                    <option>UPI</option>
                    <option>Cash</option>
                  </select>
                </label>
                <label className="form-field">
                  <span>
                    Note <em>optional</em>
                  </span>
                  <input
                    value={form.note}
                    onChange={(event) =>
                      setForm({ ...form, note: event.target.value })
                    }
                    placeholder="Add a little detail"
                  />
                </label>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  <Plus size={15} /> Save transaction
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default TransactionsPage;
