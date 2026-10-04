import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  FileText,
  PieChart,
  ReceiptText,
} from "lucide-react";
import { categories } from "../data/seed.js";
import { formatMoney } from "../../../shared/format.js";

function ReportsPage({ transactions, summary, onExport }) {
  const expenses = transactions.filter((item) => item.type === "expense");
  const categoryTotals = categories
    .filter((item) => item.name !== "Income")
    .map((category) => ({
      ...category,
      total: expenses
        .filter((item) => item.category === category.name)
        .reduce((sum, item) => sum + item.amount, 0),
    }))
    .sort((a, b) => b.total - a.total);
  const maxTotal = Math.max(1, ...categoryTotals.map((item) => item.total));
  const average = expenses.length
    ? Math.round(summary.expenses / expenses.length)
    : 0;

  return (
    <div className="reports-page page-enter">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MAKE SENSE OF THE MONTH</p>
          <h1>
            Reports<span className="heading-period">.</span>
          </h1>
          <p className="page-subtitle">Simple patterns, useful decisions.</p>
        </div>
        <button className="button button-secondary" onClick={onExport}>
          <Download size={15} /> Export report
        </button>
      </div>
      <div className="report-stat-grid">
        <article className="report-stat">
          <span>
            <ArrowDownLeft size={15} /> Total income
          </span>
          <strong>{formatMoney(summary.income)}</strong>
          <small>
            {transactions.filter((item) => item.type === "income").length}{" "}
            deposits
          </small>
        </article>
        <article className="report-stat">
          <span>
            <ArrowUpRight size={15} /> Total spending
          </span>
          <strong>{formatMoney(summary.expenses)}</strong>
          <small>{expenses.length} transactions</small>
        </article>
        <article className="report-stat">
          <span>
            <ReceiptText size={15} /> Average expense
          </span>
          <strong>{formatMoney(average)}</strong>
          <small>per transaction</small>
        </article>
      </div>
      <div className="report-grid">
        <section className="panel report-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">WHERE IT GOES</span>
              <h2>Category breakdown</h2>
            </div>
            <PieChart size={18} color="#315de8" />
          </div>
          <div className="report-bars">
            {categoryTotals.map((item) => (
              <div className="report-bar-row" key={item.name}>
                <span className="report-bar-label">{item.name}</span>
                <div className="report-bar-track">
                  <span
                    style={{
                      width: `${Math.max(2, (item.total / maxTotal) * 100)}%`,
                      background: item.color,
                    }}
                  />
                </div>
                <strong>{formatMoney(item.total, true)}</strong>
              </div>
            ))}
          </div>
        </section>
        <section className="panel report-panel report-note-panel">
          <div className="report-note-icon">
            <FileText size={18} />
          </div>
          <span className="panel-kicker">A SMALL OBSERVATION</span>
          <h2>
            {categoryTotals[0]?.name || "Your spending"} is your biggest
            category.
          </h2>
          <p>
            You have spent {formatMoney(categoryTotals[0]?.total || 0)} here so
            far. Use the budgets screen to decide whether that feels right for
            the rest of the month.
          </p>
        </section>
      </div>
    </div>
  );
}

export default ReportsPage;
