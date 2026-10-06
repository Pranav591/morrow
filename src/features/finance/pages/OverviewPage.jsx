import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { categories } from "../data/seed.js";
import {
  accountLabel,
  formatDate,
  formatMoney,
} from "../../../shared/format.js";
import MonthlyInsight from "../components/MonthlyInsight.jsx";

const icons = {
  "Food & drink": "◒",
  Transport: "↗",
  Shopping: "◇",
  Bills: "▤",
  Health: "✳",
  Lifestyle: "✦",
  Income: "↙",
};

function OverviewPage({ transactions, budgets, summary, onAdd, onExport }) {
  const expenses = transactions.filter((item) => item.type === "expense");
  const spentByCategory = budgets.map((budget) => ({
    ...budget,
    spent: expenses
      .filter((item) => item.category === budget.category)
      .reduce((sum, item) => sum + item.amount, 0),
  }));
  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
  const expenseBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0);
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const now = new Date();
  const budgetProgress = Math.min(
    100,
    Math.round((totalSpent / expenseBudget) * 100),
  );
  const categoryRows = [...spentByCategory]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 4);
  const weeklyFlow = Array.from({ length: 5 }, (_, index) => ({
    label: `Week ${index + 1}`,
    income: 0,
    expense: 0,
  }));
  transactions.forEach((item) => {
    const date = new Date(`${item.date}T00:00:00`);
    if (
      date.getMonth() !== now.getMonth() ||
      date.getFullYear() !== now.getFullYear()
    )
      return;
    const week = Math.min(4, Math.floor((date.getDate() - 1) / 7));
    weeklyFlow[week][item.type] += item.amount;
  });
  const weeklyMaximum = Math.max(
    1,
    ...weeklyFlow.flatMap((week) => [week.income, week.expense]),
  );
  const transactionCount = transactions.filter(
    (item) => item.type === "expense",
  ).length;

  return (
    <div className="overview-page page-enter">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            MONDAY,{" "}
            {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long" })
              .format(now)
              .toUpperCase()}
          </p>
          <h1>
            Your money, <span>at a glance.</span>
          </h1>
          <p className="page-subtitle">
            Monthly summary of your income, spending, and balance.
          </p>
        </div>
        <button
          className="button button-secondary export-button"
          onClick={onExport}
        >
          <ArrowDownLeft size={15} /> Export report
        </button>
      </div>
      <section className="metric-grid" aria-label="Monthly financial summary">
        <article className="metric-card balance-card">
          <div className="metric-top">
            <span className="metric-label">TOTAL BALANCE</span>
            <span className="metric-icon balance-icon">
              <Wallet size={17} />
            </span>
          </div>
          <strong className="metric-value">
            {formatMoney(summary.balance, false, 2)}
          </strong>
          <div className="metric-foot">
            Includes balance carried forward from previous months
          </div>
        </article>
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">INCOME THIS MONTH</span>
            <span className="metric-icon income-icon">
              <ArrowDownLeft size={17} />
            </span>
          </div>
          <strong className="metric-value">
            {formatMoney(summary.income)}
          </strong>
          <div className="metric-foot">
            <span className="positive-change">
              <TrendingUp size={13} />{" "}
              {transactions.filter((item) => item.type === "income").length}{" "}
              deposits
            </span>
          </div>
        </article>
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">SPENT THIS MONTH</span>
            <span className="metric-icon expense-icon">
              <ArrowUpRight size={17} />
            </span>
          </div>
          <strong className="metric-value">
            {formatMoney(summary.expenses)}
          </strong>
          <div className="metric-foot">
            <span className="negative-change">
              <TrendingDown size={13} /> {transactionCount} transactions
            </span>
          </div>
        </article>
      </section>

      <div className="overview-grid">
        <section className="panel spending-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">INCOME VS EXPENSES</span>
              <h2>Weekly cash flow</h2>
            </div>
            <span className="chart-period">
              {new Intl.DateTimeFormat("en-IN", { month: "short" }).format(now)}
            </span>
          </div>
          <div className="chart-summary">
            <strong>{formatMoney(summary.expenses)}</strong>
            <span className="chart-summary-label">spent this month</span>
            <span className="chart-legend">
              <i /> Expenses <i className="legend-income" /> Income
            </span>
          </div>
          <div className="chart-wrap">
            <div className="chart-y-labels">
              {[1, 0.66, 0.33, 0].map((ratio) => (
                <span key={ratio}>
                  {formatMoney(weeklyMaximum * ratio, true)}
                </span>
              ))}
            </div>
            <div
              className="chart-bars"
              role="img"
              aria-label="Weekly income and expense totals for the current month"
            >
              <div className="chart-grid-lines" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </div>
              {weeklyFlow.map((week) => (
                <div className="chart-week" key={week.label}>
                  <div className="chart-column-group">
                    <span
                      className="chart-bar expense-bar"
                      style={{
                        height: `${week.expense ? Math.max(3, (week.expense / weeklyMaximum) * 100) : 0}%`,
                      }}
                      title={`${week.label} expenses: ${formatMoney(week.expense)}`}
                    />
                    <span
                      className="chart-bar income-bar"
                      style={{
                        height: `${week.income ? Math.max(3, (week.income / weeklyMaximum) * 100) : 0}%`,
                      }}
                      title={`${week.label} income: ${formatMoney(week.income)}`}
                    />
                  </div>
                  <span className="chart-week-label">
                    {week.label.replace("Week ", "W")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel budget-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">MONTHLY PLAN</span>
              <h2>Spending by category</h2>
            </div>
            <Link
              className="icon-link"
              to="/budgets"
              aria-label="View all budgets"
            >
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="budget-total-row">
            <strong>{formatMoney(totalSpent)}</strong>
            <span>of {formatMoney(expenseBudget)} budget</span>
          </div>
          <div className="overall-progress">
            <span style={{ width: `${budgetProgress}%` }} />
          </div>
          <div className="category-spend-list">
            {categoryRows.map((item) => (
              <div className="category-spend" key={item.category}>
                <span
                  className="category-symbol"
                  style={{
                    "--category-color": categories.find(
                      (c) => c.name === item.category,
                    )?.color,
                  }}
                >
                  {icons[item.category]}
                </span>
                <span className="category-name">{item.category}</span>
                <div className="category-progress">
                  <span
                    style={{
                      width: `${Math.min(100, (item.spent / item.limit) * 100)}%`,
                      "--category-color": categories.find(
                        (c) => c.name === item.category,
                      )?.color,
                    }}
                  />
                </div>
                <strong>{formatMoney(item.spent, true)}</strong>
              </div>
            ))}
          </div>
          <Link to="/budgets" className="text-link budget-link">
            View all budgets <ArrowRight size={14} />
          </Link>
        </section>
      </div>

      <section className="panel transactions-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">THE LATEST</span>
            <h2>Recent transactions</h2>
          </div>
          <div className="table-actions">
            <button
              className="button button-secondary compact-button"
              onClick={onAdd}
            >
              <Plus size={14} /> Add new
            </button>
            <Link to="/transactions" className="text-link">
              See all <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <div className="transaction-table-wrap">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>TRANSACTION</th>
                <th>CATEGORY</th>
                <th>DATE</th>
                <th>ACCOUNT</th>
                <th className="align-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((item) => {
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
                          {icons[item.category]}
                        </span>
                        <span>
                          <strong>{item.name}</strong>
                          <small>{item.note}</small>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <div className="overview-footer">
        <span>That’s your month, so far.</span>
        <button onClick={onAdd}>
          <Plus size={15} /> Record a transaction
        </button>
      </div>
      <MonthlyInsight
        spent={totalSpent}
        budget={expenseBudget}
        transactionCount={transactionCount}
      />
    </div>
  );
}

export default OverviewPage;
