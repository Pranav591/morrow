import { useEffect, useState } from "react";
import {
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowLeftRight,
  ArrowUpRight,
  ChartNoAxesCombined,
  ChevronDown,
  CircleHelp,
  CreditCard,
  FileUp,
  LayoutDashboard,
  Menu,
  PieChart,
  Plus,
  Settings2,
  Wallet,
  X,
  UserRound,
} from "lucide-react";
import { useFinanceData } from "./hooks/useFinanceData.js";
import "./styles/Finance.css";
import { accountLabel } from "../../shared/format.js";
import OverviewPage from "./pages/OverviewPage.jsx";
import TransactionsPage from "./pages/TransactionsPage.jsx";
import BudgetsPage from "./pages/BudgetsPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import AccountsPage from "./pages/AccountsPage.jsx";
import ImportPage from "./pages/ImportPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

const navItems = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/budgets", label: "Budgets", icon: ChartNoAxesCombined },
  { to: "/reports", label: "Reports", icon: PieChart },
  { to: "/accounts", label: "Accounts", icon: CreditCard },
  { to: "/import", label: "Import CSV", icon: FileUp },
  { to: "/settings", label: "Settings", icon: UserRound },
];
const THEME_KEY = "morrow-theme";
const ACCENT_KEY = "morrow-accent";
const WORKSPACE_KEY = "morrow-workspaces";
const ACTIVE_WORKSPACE_KEY = "morrow-active-workspace";
const ACTIVE_MONTH_KEY = "morrow-active-month";

const defaultWorkspaces = [{ id: "personal", name: "Personal space" }];

function monthKey(date) {
  return date.slice(0, 7);
}

function monthTitle(value) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}-01T00:00:00`));
}

function FinanceApp() {
  const finance = useFinanceData();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [notice, setNotice] = useState("");
  const [workspaces, setWorkspaces] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(WORKSPACE_KEY));
      return Array.isArray(saved) && saved.length > 0
        ? saved
        : defaultWorkspaces;
    } catch {
      return defaultWorkspaces;
    }
  });
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(
    () => localStorage.getItem(ACTIVE_WORKSPACE_KEY) || "personal",
  );
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(() => currentMonthKey);
  const [theme, setTheme] = useState(
    () => localStorage.getItem(THEME_KEY) || "cobalt",
  );
  const [accentColor, setAccentColor] = useState(
    () => localStorage.getItem(ACCENT_KEY) || "#315de8",
  );
  const activeLabel =
    navItems.find((item) => item.to === location.pathname)?.label || "Overview";
  const activeWorkspace =
    workspaces.find((workspace) => workspace.id === activeWorkspaceId) ||
    workspaces[0];

  useEffect(() => {
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_WORKSPACE_KEY, activeWorkspace.id);
  }, [activeWorkspace.id]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_MONTH_KEY, selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(ACCENT_KEY, accentColor);
    document.documentElement.style.setProperty("--accent", accentColor);
    document.documentElement.style.setProperty(
      "--accent-strong",
      `color-mix(in srgb, ${accentColor} 78%, #000)`,
    );
    document.documentElement.style.setProperty(
      "--accent-soft",
      `color-mix(in srgb, ${accentColor} 12%, #fff)`,
    );
  }, [accentColor]);

  const exportCsv = () => {
    const rows = [
      ["Date", "Description", "Category", "Account", "Type", "Amount"],
      ...finance.transactions.map((item) => [
        item.date,
        item.name,
        item.category,
        accountLabel(item.account),
        item.type,
        item.amount,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "morrow-transactions.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const openAddTransaction = () => navigate("/transactions?new=1");

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const selectWorkspace = (workspaceId) => {
    setActiveWorkspaceId(workspaceId);
    setWorkspaceOpen(false);
    const workspace = workspaces.find((item) => item.id === workspaceId);
    showNotice(`${workspace?.name || "Workspace"} is now active.`);
  };

  const createWorkspace = (event) => {
    event.preventDefault();
    const name = workspaceName.trim();
    if (!name) return;

    const workspace = {
      id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      name,
    };
    setWorkspaces((current) => [...current, workspace]);
    setActiveWorkspaceId(workspace.id);
    setWorkspaceName("");
    setWorkspaceDialogOpen(false);
    setWorkspaceOpen(false);
    showNotice(`${name} was created and selected.`);
  };

  const monthOptions = [
    ...new Set([
      new Date().toISOString().slice(0, 7),
      ...finance.transactions.map((item) => monthKey(item.date)),
    ]),
  ].sort((a, b) => b.localeCompare(a));

  const monthFinance = {
    ...finance,
    transactions: finance.transactions.filter((item) =>
      item.date.startsWith(selectedMonth),
    ),
  };
  monthFinance.summary = monthFinance.transactions.reduce(
    (summary, transaction) => {
      if (transaction.type === "income") {
        summary.income += transaction.amount;
      } else {
        summary.expenses += transaction.amount;
      }
      summary.balance = summary.income - summary.expenses;
      return summary;
    },
    { income: 0, expenses: 0, balance: 0 },
  );
  monthFinance.summary.balance = finance.transactions.reduce(
    (balance, transaction) => {
      if (monthKey(transaction.date) > selectedMonth) return balance;
      return (
        balance +
        (transaction.type === "income"
          ? transaction.amount
          : -transaction.amount)
      );
    },
    finance.balanceAdjustment || 0,
  );

  const selectMonth = (value) => {
    setSelectedMonth(value);
    setMonthOpen(false);
    navigate("/transactions");
  };

  return (
    <div className="finance-app">
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <span className="brand-mark">
            <Wallet size={19} strokeWidth={2.2} />
          </span>
          <span>
            morrow<span className="brand-period">.</span>
          </span>
        </div>
        <button
          className="workspace-switch"
          onClick={() => setWorkspaceOpen((open) => !open)}
          aria-expanded={workspaceOpen}
          aria-haspopup="menu"
        >
          <span className="workspace-avatar">P</span>
          <span className="workspace-copy">
            <strong>{activeWorkspace.name}</strong>
            <small>Free plan</small>
          </span>
          <ChevronDown size={15} />
        </button>
        {workspaceOpen && (
          <div className="workspace-popover" role="menu">
            <div className="workspace-popover-heading">
              <span className="workspace-avatar">P</span>
              <span>
                <strong>{activeWorkspace.name}</strong>
                <small>Currently selected</small>
              </span>
            </div>
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                role="menuitem"
                className={
                  workspace.id === activeWorkspace.id
                    ? "workspace-selected"
                    : ""
                }
                onClick={() => selectWorkspace(workspace.id)}
              >
                {workspace.id === activeWorkspace.id ? "✓ " : ""}
                {workspace.name}
              </button>
            ))}
            <button
              role="menuitem"
              onClick={() => {
                setWorkspaceDialogOpen(true);
              }}
            >
              + Create workspace
            </button>
          </div>
        )}
        <p className="nav-caption">WORKSPACE</p>
        <nav className="primary-nav" aria-label="Main navigation">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `side-link ${isActive ? "side-link-active" : ""}`
              }
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
              {label === "Transactions" && (
                <span className="nav-count">{finance.transactions.length}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="side-budget-note">
          <div className="note-icon">
            <CreditCard size={16} />
          </div>
          <strong>Money, in perspective.</strong>
          <p>A little clarity goes a long way.</p>
          <NavLink to="/budgets">
            Review your budgets <ArrowUpRight size={13} />
          </NavLink>
        </div>
        <div className="sidebar-bottom">
          <button
            className="side-utility"
            onClick={() => navigate("/settings")}
          >
            <Settings2 size={16} /> Settings
          </button>
          <button
            className="side-utility"
            onClick={() =>
              showNotice("Help center is ready for your questions.")
            }
          >
            <CircleHelp size={16} /> Help & support
          </button>
          <div className="profile-row">
            <div className="profile-avatar">P</div>
            <div className="profile-copy">
              <strong>Pranav Adhikari</strong>
              <small>Personal account</small>
            </div>
            <button
              className="icon-button profile-menu"
              aria-label="Profile menu"
              onClick={() => setProfileOpen((open) => !open)}
            >
              <Menu size={17} />
            </button>
            {profileOpen && (
              <div className="profile-popover">
                <strong>Pranav Adhikari</strong>
                <button onClick={() => navigate("/settings")}>
                  Account settings
                </button>
                <button
                  onClick={() =>
                    showNotice("You are already using your personal space.")
                  }
                >
                  Switch workspace
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
      {mobileNavOpen && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-button mobile-menu-button"
            aria-label="Open navigation"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumb">
            {activeWorkspace.name} <span>/</span> <strong>{activeLabel}</strong>
          </div>
          <div className="topbar-actions">
            <button
              className="month-chip"
              onClick={() => setMonthOpen((open) => !open)}
              aria-expanded={monthOpen}
            >
              <span className="month-dot" />
              {monthTitle(selectedMonth)}
              <ChevronDown size={14} />
            </button>
            {monthOpen && (
              <div className="month-popover">
                <strong>View a month</strong>
                <span>Choose a transaction period</span>
                {monthOptions.map((value) => (
                  <button
                    key={value}
                    className={value === selectedMonth ? "month-selected" : ""}
                    onClick={() => selectMonth(value)}
                  >
                    {value === selectedMonth ? "✓ " : ""}
                    {monthTitle(value)}
                  </button>
                ))}
              </div>
            )}
            <button
              className="button button-primary top-add-button"
              onClick={openAddTransaction}
            >
              <Plus size={16} /> Add transaction
            </button>
            <button
              className="icon-button mobile-close-button"
              aria-label="Close navigation"
              onClick={() => setMobileNavOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
        </header>
        <div className="content-area">
          <Routes>
            <Route
              path="/"
              element={
                <OverviewPage
                  {...monthFinance}
                  onAdd={openAddTransaction}
                  onExport={exportCsv}
                />
              }
            />
            <Route
              path="/transactions"
              element={
                <TransactionsPage
                  {...monthFinance}
                  selectedMonth={selectedMonth}
                  onExport={exportCsv}
                />
              }
            />
            <Route
              path="/budgets"
              element={<BudgetsPage {...monthFinance} />}
            />
            <Route
              path="/reports"
              element={<ReportsPage {...monthFinance} onExport={exportCsv} />}
            />
            <Route path="/accounts" element={<AccountsPage {...finance} />} />
            <Route
              path="/import"
              element={<ImportPage onImport={finance.importTransactions} />}
            />
            <Route
              path="/settings"
              element={
                <SettingsPage
                  theme={theme}
                  onThemeChange={setTheme}
                  accentColor={accentColor}
                  onAccentChange={setAccentColor}
                />
              }
            />
          </Routes>
        </div>
        {notice && (
          <div className="app-toast" role="status">
            {notice}
          </div>
        )}
        {workspaceDialogOpen && (
          <div
            className="modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget)
                setWorkspaceDialogOpen(false);
            }}
          >
            <section
              className="transaction-modal workspace-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="workspace-dialog-title"
            >
              <div className="modal-heading">
                <div>
                  <span className="panel-kicker">NEW WORKSPACE</span>
                  <h2 id="workspace-dialog-title">Create workspace</h2>
                </div>
                <button
                  className="icon-button"
                  onClick={() => setWorkspaceDialogOpen(false)}
                  aria-label="Close workspace dialog"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={createWorkspace}>
                <label className="form-field">
                  <span>Workspace name</span>
                  <input
                    autoFocus
                    required
                    value={workspaceName}
                    onChange={(event) => setWorkspaceName(event.target.value)}
                    placeholder="e.g. Freelance, Family budget"
                  />
                </label>
                <p className="modal-copy">
                  Use separate spaces to keep different financial goals
                  organized.
                </p>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setWorkspaceDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="button button-primary">
                    Create workspace
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default FinanceApp;
