import {
  ArrowUpRight,
  Banknote,
  CreditCard,
  Landmark,
  Plus,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { formatMoney } from "../../../shared/format.js";

function AccountsPage({ transactions }) {
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");
  const accounts = [
    {
      name: "Cash",
      aliases: ["Cash"],
      icon: WalletCards,
      type: "Physical cash",
    },
    {
      name: "UPI",
      aliases: ["UPI", "Main account"],
      icon: Landmark,
      type: "Digital payments",
    },
    {
      name: "Debit card",
      aliases: ["Debit card", "Everyday card"],
      icon: CreditCard,
      type: "Debit card",
    },
  ].map(({ name, aliases, icon: Icon, type }) => ({
    name,
    icon: Icon,
    balance: transactions
      .filter((item) => aliases.includes(item.account))
      .reduce(
        (sum, item) =>
          sum + (item.type === "income" ? item.amount : -item.amount),
        0,
      ),
    type,
  }));
  return (
    <div className="accounts-page page-enter">
      <div className="page-heading">
        <div>
          <p className="eyebrow">WHERE YOUR MONEY LIVES</p>
          <h1>
            Accounts<span className="heading-period">.</span>
          </h1>
          <p className="page-subtitle">
            A quick view across your connected spaces.
          </p>
        </div>
        <button
          className="button button-primary"
          onClick={() => setModal("add")}
        >
          <Plus size={16} /> Add account
        </button>
      </div>
      <section className="accounts-total panel">
        <div>
          <span className="panel-kicker">COMBINED BALANCE</span>
          <strong>
            {formatMoney(accounts.reduce((sum, item) => sum + item.balance, 0))}
          </strong>
          <p>Across {accounts.length} accounts</p>
        </div>
        <div className="account-total-mark">
          <Banknote size={27} />
        </div>
      </section>
      <div className="account-card-grid">
        {accounts.map(({ name, icon: Icon, balance, type }) => (
          <article className="account-card panel" key={name}>
            <div className="account-card-head">
              <span className="account-icon">
                <Icon size={18} />
              </span>
              <button
                className="row-action"
                aria-label={`Open ${name}`}
                onClick={() => setModal(name)}
              >
                <ArrowUpRight size={15} />
              </button>
            </div>
            <h2>{name}</h2>
            <p>{type}</p>
            <strong>{formatMoney(balance)}</strong>
            <div className="account-card-foot">
              <span>Updated just now</span>
              <span className="account-status">Active</span>
            </div>
          </article>
        ))}
      </div>
      <button className="account-connect" onClick={() => setModal("add")}>
        <span className="account-connect-mark">+</span>
        <div>
          <strong>Connect another account</strong>
          <p>Keep your complete financial picture together.</p>
        </div>
        <ArrowUpRight size={17} />
      </button>
      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setModal(null)
          }
        >
          <section
            className="transaction-modal account-modal"
            role="dialog"
            aria-modal="true"
          >
            <button
              className="icon-button modal-close"
              onClick={() => setModal(null)}
              aria-label="Close account dialog"
            >
              ×
            </button>
            {modal === "add" ? (
              <>
                <span className="panel-kicker">NEW CONNECTION</span>
                <h2>Add an account</h2>
                <p className="modal-copy">
                  Connect bank accounts are not required yet. You can keep
                  adding transactions to your existing accounts.
                </p>
                <button
                  className="button button-primary"
                  onClick={() => {
                    setModal(null);
                    setNotice("Account connection request saved.");
                  }}
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <span className="panel-kicker">ACCOUNT DETAILS</span>
                <h2>{modal}</h2>
                <p className="modal-copy">
                  This account is active and included in your combined balance.
                </p>
                <button
                  className="button button-secondary"
                  onClick={() => setModal(null)}
                >
                  Done
                </button>
              </>
            )}
          </section>
        </div>
      )}
      {notice && (
        <div className="app-toast" role="status">
          {notice}
        </div>
      )}
    </div>
  );
}

export default AccountsPage;
