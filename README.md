# Morrow

A personal finance workspace for tracking spending, income, and category budgets. Built with React and Vite; transactions and budget settings are saved locally and synced to the included API when it is running.

## Setup

```bash
npm install
npm run dev
```

Then open the printed local URL (typically http://localhost:5173). The development command starts both the Vite client and the local API server.

To run the API separately:

```bash
npm run dev:api
```

To build for production:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  main.jsx                     React root + BrowserRouter
  App.jsx                      Finance app entry
  index.css                    Global reset
  features/finance/
    FinanceApp.jsx              Navigation shell and routes
    pages/                       Route-level screens
      OverviewPage.jsx           Cash flow, budgets, recent transactions
      TransactionsPage.jsx       Searchable ledger and transaction form
      BudgetsPage.jsx            Editable category budget limits
      ReportsPage.jsx            Category and monthly spending reports
      AccountsPage.jsx           Account balances and account overview
      ImportPage.jsx             CSV expense import workflow
      SettingsPage.jsx           Profile, appearance, and privacy settings
    components/                  Reusable finance UI
      MonthlyInsight.jsx         Class component for the monthly summary
    hooks/
      useFinanceData.js           Local persistence and finance calculations
    services/
      api.js                      Express API client
    data/
      seed.js                     Sample transactions and budget defaults
    styles/
      Finance.css                 Responsive finance workspace styles
  shared/format.js               Currency and date formatters
server/index.js                  Express API server and JSON persistence
```

## Features

- Monthly income, expense, and balance summary.
- Cash-flow visualization and category spending breakdown.
- Add, search, filter, and delete income or expense transactions.
- Set and adjust monthly budgets by category.
- Export transaction data as CSV.
- Import expense history from CSV with preview before saving.
- Reports, accounts, import, and settings screens in addition to overview, transactions, and budgets.
- Express.js JSON API at `/api/state`, `/api/transactions`, and `/api/budgets`.
- Responsive navigation and layouts for desktop and mobile.
- Local browser persistence; sample INR data is loaded on first use.

## Modifications made

- Replaced the original task-management concept with Morrow, a personal finance workspace.
- Added seven screens: Overview, Transactions, Budgets, Reports, Accounts, Import CSV, and Settings.
- Added INR income, expense, balance, cash-flow, category, account, and budget views.
- Added transaction creation, search, filtering, deletion, CSV export, and CSV import with preview.
- Imported September 2026 transaction data with Debit/Credit mapping and duplicate protection.
- Added editable category budgets with live progress and remaining-budget calculations.
- Added Express.js API routes for state, transactions, and budgets with JSON persistence.
- Added localStorage fallback so the app continues working when the API is unavailable.
- Added Cobalt, Midnight, Warm Paper, and custom accent-color appearance settings.
- Added responsive mobile navigation, keyboard transaction search using `/`, dropdown menus, dialogs, and feedback toasts.
- Reorganized the code into pages, components, hooks, services, data, and styles folders.
- Added a reusable class component, `MonthlyInsight`, for the monthly summary.

## Adding new records

- Create transactions from the **Add transaction** button or the Transactions screen. The form is owned by `pages/TransactionsPage.jsx`, state updates live in `hooks/useFinanceData.js`, and persistence is handled by `services/api.js` and the Express server.
- Edit category budgets from the Budgets screen. The inline editor is in `pages/BudgetsPage.jsx` and saves through `PATCH /api/budgets/:category`.
- Add future finance UI in `pages/`, reusable pieces in `components/`, calculations in `hooks/`, and server calls in `services/`.

## YouTube reference

The broad admin-dashboard direction was inspired by this JavaScript Mastery tutorial:

[Build and Deploy a React Admin Dashboard App With Theming, Tables, Charts, Calendar, Kanban and More](https://www.youtube.com/watch?v=jx5hdo50a2M)

Morrow's finance workflows, visual design, and implementation are original to this project.
