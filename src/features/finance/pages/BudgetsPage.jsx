import { useState } from "react";
import { ArrowRight, Check, Pencil, X } from "lucide-react";
import { categories } from "../data/seed.js";
import { formatMoney, monthLabel } from "../../../shared/format.js";

const marks = {
  "Food & drink": "◒",
  Transport: "↗",
  Shopping: "◇",
  Bills: "▤",
  Health: "✳",
  Lifestyle: "✦",
};

function BudgetsPage({ transactions, budgets, updateBudget, selectedMonth }) {
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const budgetMonth = selectedMonth
    ? new Date(`${selectedMonth}-01T00:00:00`)
    : new Date();
  const spent = (category) =>
    transactions
      .filter((item) => item.type === "expense" && item.category === category)
      .reduce((sum, item) => sum + item.amount, 0);
  const totalBudget = budgets.reduce((sum, item) => sum + item.limit, 0);
  const totalSpent = budgets.reduce(
    (sum, item) => sum + spent(item.category),
    0,
  );
  const remaining = totalBudget - totalSpent;
  const startEdit = (budget) => {
    setEditing(budget.category);
    setDraft(String(budget.limit));
  };
  const saveEdit = (category) => {
    if (Number(draft) > 0) updateBudget(category, Number(draft));
    setEditing(null);
  };

  return (
    <div className="budgets-page page-enter">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SPEND WITH INTENTION</p>
          <h1>
            Your budgets<span className="heading-period">.</span>
          </h1>
          <p className="page-subtitle">
            A plan, not a set of rules. Adjust as life happens.
          </p>
        </div>
        <div className="budget-month-pill">
          {monthLabel(budgetMonth)} <span>⌄</span>
        </div>
      </div>
      <section className="budget-overview">
        <div className="budget-overview-main">
          <span className="panel-kicker">MONTHLY SPENDING PLAN</span>
          <div className="budget-overview-numbers">
            <div>
              <strong>{formatMoney(totalSpent)}</strong>
              <span>spent this month</span>
            </div>
            <div className="budget-overview-divider" />
            <div>
              <strong>{formatMoney(Math.max(0, remaining))}</strong>
              <span>{remaining >= 0 ? "left to spend" : "over budget"}</span>
            </div>
          </div>
          <div className="overall-progress budget-large-progress">
            <span
              style={{
                width: `${Math.min(100, totalBudget ? (totalSpent / totalBudget) * 100 : 0)}%`,
              }}
            />
          </div>
          <div className="budget-overview-foot">
            <span>
              {Math.round(totalBudget ? (totalSpent / totalBudget) * 100 : 0)}%
              of monthly budget used
            </span>
            <span>
              Total planned <strong>{formatMoney(totalBudget)}</strong>
            </span>
          </div>
        </div>
        <div className="budget-overview-aside">
          <div
            className="ring-chart"
            style={{
              "--ring-progress": `${Math.min(100, totalBudget ? (totalSpent / totalBudget) * 100 : 0)}%`,
            }}
          >
            <div>
              <strong>
                {Math.round(totalBudget ? (totalSpent / totalBudget) * 100 : 0)}
                <small>%</small>
              </strong>
              <span>used</span>
            </div>
          </div>
          <span className="ring-caption">
            You’re doing great.
            <br />
            Keep the steady pace.
          </span>
        </div>
      </section>
      <div className="budget-section-heading">
        <div>
          <span className="panel-kicker">BY CATEGORY</span>
          <h2>Monthly limits</h2>
        </div>
        <span className="budget-section-note">
          <span className="budget-legend-dot" />
          Spending <span className="budget-legend-dot limit-dot" />
          Limit
        </span>
      </div>
      <div className="budget-card-grid">
        {budgets.map((budget) => {
          const category = categories.find(
            (item) => item.name === budget.category,
          );
          const amount = spent(budget.category);
          const percent = Math.min(
            100,
            Math.round((amount / budget.limit) * 100),
          );
          const over = amount > budget.limit;
          return (
            <article className="category-budget-card" key={budget.category}>
              <div className="category-budget-head">
                <span
                  className="category-budget-mark"
                  style={{ "--category-color": category.color }}
                >
                  {marks[budget.category]}
                </span>
                <button
                  className="row-action"
                  onClick={() => startEdit(budget)}
                  aria-label={`Edit ${budget.category} budget`}
                >
                  <Pencil size={14} />
                </button>
              </div>
              <h3>{budget.category}</h3>
              <div className="budget-card-amount">
                <strong>{formatMoney(amount)}</strong>
                <span>of {formatMoney(budget.limit)}</span>
              </div>
              <div
                className={`category-budget-progress ${over ? "is-over" : ""}`}
              >
                <span
                  style={{
                    width: `${percent}%`,
                    "--category-color": category.color,
                  }}
                />
              </div>
              <div className="category-budget-foot">
                <span className={over ? "over-label" : ""}>
                  {over
                    ? `${formatMoney(amount - budget.limit)} over`
                    : `${formatMoney(budget.limit - amount)} left`}
                </span>
                <span>{percent}%</span>
              </div>
              {editing === budget.category && (
                <form
                  className="budget-edit-row"
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveEdit(budget.category);
                  }}
                >
                  <span>₹</span>
                  <input
                    autoFocus
                    type="number"
                    min="1"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    aria-label={`${budget.category} monthly budget`}
                  />
                  <button type="submit" aria-label="Save budget">
                    <Check size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    aria-label="Cancel edit"
                  >
                    <X size={15} />
                  </button>
                </form>
              )}
            </article>
          );
        })}
      </div>
      <div className="budgets-tip">
        <span className="tip-mark">✳</span>
        <p>
          Keep your budget realistic and adjust it anytime as your spending
          changes.
        </p>
        <button
          className="text-link"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Back to top <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default BudgetsPage;
