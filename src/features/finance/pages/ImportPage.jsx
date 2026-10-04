import { useRef, useState } from "react";
import { Check, FileUp, Upload, X } from "lucide-react";
import { categories } from "../data/seed.js";

function normalizeHeader(value) {
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z]/g, "");
}

function parseCsv(text) {
  const rows = text
    .trim()
    .split(/\r?\n/)
    .map((row) =>
      row.split(",").map((cell) => cell.trim().replace(/^"|"$/g, "")),
    );
  if (rows.length < 2) return [];
  const headers = rows.shift().map(normalizeHeader);
  const find = (names) =>
    names.map((name) => headers.indexOf(name)).find((index) => index >= 0);
  const dateIndex = find(["date", "transactiondate"]);
  const nameIndex = find(["description", "name", "merchant", "title"]);
  const amountIndex = find(["amount", "amountinr", "value", "price"]);
  const categoryIndex = find(["category"]);
  const typeIndex = find(["type", "transactiontype"]);
  return rows
    .map((row, index) => {
      const amount = Math.abs(
        Number(String(row[amountIndex] || "").replace(/[^0-9.-]/g, "")),
      );
      const rawType = String(row[typeIndex] || "").toLowerCase();
      const type =
        rawType === "credit" || rawType === "income" ? "income" : "expense";
      const rawCategory = String(row[categoryIndex] || "").toLowerCase();
      const category =
        categories.find((item) => item.name.toLowerCase() === rawCategory)
          ?.name || (type === "income" ? "Income" : "Lifestyle");
      return {
        id: `csv-${Date.now()}-${index}`,
        name: row[nameIndex] || "Imported expense",
        category,
        account: type === "income" ? "UPI" : "Debit card",
        date: row[dateIndex] || new Date().toISOString().slice(0, 10),
        amount,
        type,
        note: "Imported from CSV",
      };
    })
    .filter((item) => item.amount > 0);
}

function ImportPage({ onImport }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");
  const readFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setRows(parseCsv(String(reader.result)));
    reader.readAsText(file);
  };
  const importRows = () => {
    onImport(rows);
    setMessage(`${rows.length} expenses imported successfully.`);
    setRows([]);
  };
  return (
    <div className="import-page page-enter">
      <div className="page-heading">
        <div>
          <p className="eyebrow">BRING YOUR HISTORY WITH YOU</p>
          <h1>
            Import CSV<span className="heading-period">.</span>
          </h1>
          <p className="page-subtitle">
            Upload an export from your bank or spreadsheet.
          </p>
        </div>
      </div>
      <section className="panel import-panel">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={(event) => readFile(event.target.files?.[0])}
        />
        <button
          className="import-dropzone"
          onClick={() => inputRef.current?.click()}
        >
          <span className="import-icon">
            <Upload size={22} />
          </span>
          <strong>{fileName || "Choose a CSV file"}</strong>
          <span>
            {fileName
              ? "Choose another file"
              : "Drop it here or browse from your device"}
          </span>
        </button>
        {rows.length > 0 && (
          <div className="import-preview">
            <div className="import-preview-head">
              <div>
                <span className="panel-kicker">READY TO IMPORT</span>
                <strong>{rows.length} rows found</strong>
              </div>
              <button
                className="row-action"
                onClick={() => setRows([])}
                aria-label="Clear import"
              >
                <X size={16} />
              </button>
            </div>
            <div className="import-preview-list">
              {rows.slice(0, 4).map((row) => (
                <div key={row.id}>
                  <span>
                    <FileUp size={14} />
                    {row.name}
                  </span>
                  <strong>₹{row.amount.toLocaleString("en-IN")}</strong>
                </div>
              ))}
            </div>
            <button
              className="button button-primary import-confirm"
              onClick={importRows}
            >
              <Check size={15} /> Import expenses
            </button>
          </div>
        )}
        {message && (
          <p className="import-success">
            <Check size={15} /> {message}
          </p>
        )}
      </section>
      <section className="import-help">
        <strong>Expected columns</strong>
        <span>Date</span>
        <span>Description or Name</span>
        <span>Amount</span>
        <span>
          Category <em>optional</em>
        </span>
      </section>
    </div>
  );
}

export default ImportPage;
