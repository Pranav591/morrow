import { Bell, Check, Database, Lock, Palette, UserRound } from "lucide-react";
import { useState } from "react";

const themes = [
  { id: "cobalt", label: "Cobalt", description: "Clean and focused" },
  { id: "midnight", label: "Midnight", description: "Low-light workspace" },
  { id: "paper", label: "Warm paper", description: "Soft and editorial" },
];
const accentPresets = ["#315de8", "#7b5ce1", "#18866d", "#d56b48", "#c04f83"];

function SettingsPage({ theme, onThemeChange, accentColor, onAccentChange }) {
  const [reminders, setReminders] = useState(false);
  const [notice, setNotice] = useState("");
  return (
    <div className="settings-page page-enter">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MAKE MORROW YOURS</p>
          <h1>
            Settings<span className="heading-period">.</span>
          </h1>
          <p className="page-subtitle">
            Small preferences, calmer money management.
          </p>
        </div>
      </div>
      <div className="settings-layout">
        <section className="panel settings-panel">
          <div className="settings-section settings-appearance-section">
            <div className="settings-section-icon">
              <UserRound size={17} />
            </div>
            <div className="settings-section-copy">
              <h2>Profile</h2>
              <p>Your personal details shown across the workspace.</p>
            </div>
            <div className="settings-profile">
              <strong>Pranav Adhikari</strong>
              <span>Personal account</span>
            </div>
          </div>
          <div className="settings-section">
            <div className="settings-section-icon">
              <Palette size={17} />
            </div>
            <div className="settings-section-copy">
              <h2>Appearance</h2>
              <p>Current interface theme</p>
            </div>
            <div
              className="theme-options"
              role="group"
              aria-label="Choose appearance"
            >
              {themes.map((option) => (
                <button
                  key={option.id}
                  className={`theme-option ${theme === option.id ? "theme-option-active" : ""}`}
                  onClick={() => onThemeChange(option.id)}
                  aria-pressed={theme === option.id}
                >
                  <i className={`theme-swatch theme-swatch-${option.id}`} />
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="settings-section settings-color-section">
            <div className="settings-section-icon">
              <Palette size={17} />
            </div>
            <div className="settings-section-copy">
              <h2>Accent color</h2>
              <p>Choose the color used for actions and highlights.</p>
            </div>
            <div className="accent-picker">
              <input
                type="color"
                value={accentColor}
                onChange={(event) => onAccentChange(event.target.value)}
                aria-label="Choose custom accent color"
              />
              <div className="accent-presets">
                {accentPresets.map((color) => (
                  <button
                    key={color}
                    className={`accent-preset ${accentColor.toLowerCase() === color ? "accent-preset-active" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => onAccentChange(color)}
                    aria-label={`Use ${color} accent color`}
                    aria-pressed={accentColor.toLowerCase() === color}
                  />
                ))}
              </div>
              <code>{accentColor.toUpperCase()}</code>
            </div>
          </div>
          <div className="settings-section">
            <div className="settings-section-icon">
              <Bell size={17} />
            </div>
            <div className="settings-section-copy">
              <h2>Reminders</h2>
              <p>Monthly budget check-in notifications</p>
            </div>
            <button
              className={`toggle-switch ${reminders ? "toggle-on" : ""}`}
              aria-label="Toggle reminders"
              aria-pressed={reminders}
              onClick={() => setReminders((enabled) => !enabled)}
            >
              <span />
            </button>
          </div>
        </section>
        <aside className="settings-side">
          <div className="settings-side-card">
            <Database size={19} />
            <strong>Local-first data</strong>
            <p>
              Your entries are saved on this device and synced to the local API
              when it is running.
            </p>
            <span className="api-status">
              <i /> API connected
            </span>
          </div>
          <div className="settings-side-card">
            <Lock size={19} />
            <strong>Your data stays yours</strong>
            <p>
              Morrow never sends your personal expenses to a third-party
              service.
            </p>
            <button
              className="text-link"
              onClick={() => setNotice("Privacy mode is enabled by default.")}
            >
              <Check size={14} /> Privacy by default
            </button>
          </div>
        </aside>
      </div>
      {notice && (
        <div className="app-toast settings-toast" role="status">
          {notice}
        </div>
      )}
      <div className="settings-live-preview">
        <span
          className="preview-dot"
          style={{ backgroundColor: accentColor }}
        />
        <span>Live preview</span>
        <strong style={{ color: accentColor }}>Your workspace accent</strong>
        <button
          className="button button-primary"
          onClick={() => setNotice("Appearance saved on this device.")}
        >
          Save appearance
        </button>
      </div>
    </div>
  );
}

export default SettingsPage;
