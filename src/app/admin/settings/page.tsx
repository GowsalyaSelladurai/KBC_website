"use client";

import {
  useEffect,
  useState,
  type ElementType,
  type ReactNode,
  type ChangeEvent,
} from "react";

import {
  Settings,
  Building2,
  UserRound,
  Palette,
  Bell,
  Clock,
  CalendarDays,
  CreditCard,
  ShieldCheck,
  Save,
  RotateCcw,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Monitor,
  MessageCircle,
  CalendarCheck,
  IndianRupee,
  Upload,
  Sparkles,
  X,
  Globe,
  Lock,
} from "lucide-react";

type SettingsSection =
  | "General"
  | "Profile"
  | "Appearance"
  | "Notifications"
  | "Business"
  | "Booking"
  | "Payments"
  | "Security";

type SettingsData = {
  academyName: string;
  tagline: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  language: string;
  currency: string;
  timezone: string;
  openingTime: string;
  closingTime: string;
  workingDays: string[];
  appointmentDuration: string;
  cancellationHours: string;
  advanceBookingDays: string;
  taxRate: string;
  invoicePrefix: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  appointmentAlerts: boolean;
  paymentAlerts: boolean;
  lowStockAlerts: boolean;
  reminderAlerts: boolean;
  darkMode: boolean;
  compactMode: boolean;
  twoFactor: boolean;
};

const STORAGE_KEY = "kbc_admin_settings_v1";

const cardClass =
  "gold-ambient-card rounded-2xl border border-[#343832] bg-[#1B1F1D]";

const inputClass =
  "w-full rounded-xl border border-[#3A403A] bg-[#151917] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#858B82] focus:border-[#D9D19A]";

const primaryButtonClass =
  "flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#EFE8A8] to-[#C8BD79] px-5 py-3 text-xs font-bold text-[#171914] shadow-lg shadow-[#C8BD79]/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonClass =
  "flex items-center justify-center gap-2 rounded-xl border border-[#3A403A] bg-[#1B1F1D] px-4 py-3 text-xs font-medium text-[#C9CBBF] transition hover:border-[#D9D19A]/50 hover:text-[#EFE8A8]";

const defaultSettings: SettingsData = {
  academyName: "KBC Salon Academy",
  tagline: "Beauty • Education • Excellence",
  email: "info@kbcsalonacademy.com",
  phone: "+91 98765 43210",
  website: "www.kbcsalonacademy.com",
  address: "Salem, Tamil Nadu, India",
  adminName: "Administrator",
  adminEmail: "admin@kbcsalonacademy.com",
  adminPhone: "+91 98765 43210",
  language: "English",
  currency: "INR",
  timezone: "Asia/Kolkata",
  openingTime: "09:00",
  closingTime: "20:00",
  workingDays: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  appointmentDuration: "60",
  cancellationHours: "24",
  advanceBookingDays: "30",
  taxRate: "18",
  invoicePrefix: "KBC",
  emailNotifications: true,
  smsNotifications: false,
  whatsappNotifications: true,
  appointmentAlerts: true,
  paymentAlerts: true,
  lowStockAlerts: true,
  reminderAlerts: true,
  darkMode: true,
  compactMode: false,
  twoFactor: false,
};

const sections: {
  name: SettingsSection;
  description: string;
  icon: ElementType;
}[] = [
  {
    name: "General",
    description: "Academy information",
    icon: Building2,
  },
  {
    name: "Profile",
    description: "Admin account",
    icon: UserRound,
  },
  {
    name: "Appearance",
    description: "Theme and display",
    icon: Palette,
  },
  {
    name: "Notifications",
    description: "Alerts and reminders",
    icon: Bell,
  },
  {
    name: "Business",
    description: "Hours and preferences",
    icon: Clock,
  },
  {
    name: "Booking",
    description: "Appointment rules",
    icon: CalendarDays,
  },
  {
    name: "Payments",
    description: "Tax and invoices",
    icon: CreditCard,
  },
  {
    name: "Security",
    description: "Password and access",
    icon: ShieldCheck,
  },
];

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function loadSettings(): SettingsData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      return {
        ...defaultSettings,
        ...JSON.parse(stored),
      };
    }
  } catch {
    // Use defaults if saved settings cannot be read.
  }

  return defaultSettings;
}

/* =========================================
   REUSABLE FIELD
========================================= */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium text-[#A9ACA2]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />

      {hint && (
        <span className="block text-[10px] text-[#858B82]">
          {hint}
        </span>
      )}
    </label>
  );
}

/* =========================================
   REUSABLE SELECT
========================================= */

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium text-[#A9ACA2]">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} appearance-none`}
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
            className="bg-[#151917] text-white"
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

/* =========================================
   REUSABLE TOGGLE
========================================= */

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#343832] py-4 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#F5F2E9]">
          {label}
        </p>

        <p className="mt-1 text-xs leading-5 text-[#92978F]">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-gradient-to-r from-[#EFE8A8] to-[#C8BD79]"
            : "bg-[#444840]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full shadow transition ${
            checked
              ? "left-6 bg-[#171914]"
              : "left-1 bg-[#D4D5CC]"
          }`}
        />
      </button>
    </div>
  );
}

/* =========================================
   REUSABLE PANEL
========================================= */

function Panel({
  children,
  title,
  description,
  icon: Icon,
}: {
  children: ReactNode;
  title: string;
  description?: string;
  icon: ElementType;
}) {
  return (
    <section className={`${cardClass} p-0`}>
      <div className="flex items-center gap-3 border-b border-[#343832] px-5 py-5 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D9D19A]/20 bg-[#D9D19A]/10 text-[#EFE8A8]">
          <Icon size={19} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#F5F2E9]">
            {title}
          </h3>

          {description && (
            <p className="mt-1 text-[11px] text-[#92978F]">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

/* =========================================
   SETTINGS PAGE
========================================= */

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("General");

  const [settings, setSettings] =
    useState<SettingsData>(defaultSettings);

  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [logoPreview, setLogoPreview] = useState("");

  useEffect(() => {
    setSettings(loadSettings());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(""), 2800);

    return () => clearTimeout(timer);
  }, [toast]);

  function update<K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K]
  ) {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    setSaved(false);
  }

  function saveSettings() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );

      setSaved(true);
      setToast("Settings saved successfully.");
    } catch {
      setToast("Unable to save settings in this browser.");
    }
  }

  function resetSettings() {
    if (
      !window.confirm(
        "Reset all settings to their default values?"
      )
    ) {
      return;
    }

    setSettings(defaultSettings);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaultSettings)
    );

    setSaved(true);
    setToast("Settings restored to defaults.");
  }

  function toggleDay(day: string) {
    const next = settings.workingDays.includes(day)
      ? settings.workingDays.filter((d) => d !== day)
      : [...settings.workingDays, day];

    update("workingDays", next);
  }

  function handleLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast("Please choose an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setLogoPreview(String(reader.result));
      setToast(
        "Logo preview updated. Remember to save your settings."
      );
    };

    reader.readAsDataURL(file);
  }

  function changePassword() {
    if (password.length < 8) {
      setToast(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setToast("Passwords do not match.");
      return;
    }

    setPassword("");
    setConfirmPassword("");

    setToast(
      "Password form validated. Connect your authentication API to update it."
    );
  }

  const currentSection = sections.find(
    (s) => s.name === activeSection
  );

  return (
    <div className="min-h-screen bg-[#121414] p-4 text-[#F5F2E9] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-7">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#C8BD79]">
              <span className="h-px w-7 bg-[#EFE8A8]" />
              Administration
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-[#F5F2E9] sm:text-4xl">
              System{" "}
              <span className="text-[#EFE8A8]">
                Settings
              </span>
            </h1>

            <p className="mt-2 text-sm text-[#92978F]">
              Configure your academy, account and business preferences.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={resetSettings}
              className={secondaryButtonClass}
            >
              <RotateCcw size={15} />
              Reset
            </button>

            <button
              onClick={saveSettings}
              disabled={!loaded}
              className={primaryButtonClass}
            >
              <Save size={15} />
              Save Changes
            </button>
          </div>
        </div>

        {/* =====================================
            STATUS BANNER
        ===================================== */}

        <div className={`${cardClass} flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:px-6`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D9D19A]/20 bg-[#D9D19A]/10 text-[#EFE8A8]">
              <Sparkles size={19} />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#F5F2E9]">
                Academy Control Center
              </p>

              <p className="mt-1 text-xs text-[#92978F]">
                Manage your workspace preferences in one place.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#A9ACA2]">
            <span
              className={`h-2 w-2 rounded-full ${
                saved
                  ? "bg-emerald-400"
                  : "bg-[#D9D19A]"
              }`}
            />

            {saved
              ? "All changes saved"
              : "Unsaved changes may be present"}
          </div>
        </div>

        {/* =====================================
            SETTINGS LAYOUT
        ===================================== */}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">

          {/* =====================================
              NAVIGATION
          ===================================== */}

          <aside className={`${cardClass} p-3 lg:sticky lg:top-6`}>
            <p className="px-3 pb-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#858B82]">
              Settings Menu
            </p>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const active =
                  activeSection === section.name;

                return (
                  <button
                    key={section.name}
                    onClick={() =>
                      setActiveSection(section.name)
                    }
                    className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-[#D9D19A]/40 bg-[#D9D19A]/[0.08] shadow-[inset_3px_0_0_#D9D19A]"
                        : "border-transparent hover:border-[#3A403A] hover:bg-[#222723]"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                        active
                          ? "bg-[#D9D19A]/15 text-[#EFE8A8]"
                          : "bg-[#252B26] text-[#92978F] group-hover:text-[#EFE8A8]"
                      }`}
                    >
                      <Icon size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-semibold ${
                          active
                            ? "text-[#EFE8A8]"
                            : "text-[#D0D1C8]"
                        }`}
                      >
                        {section.name}
                      </p>

                      <p className="mt-1 hidden text-[10px] text-[#858B82] lg:block">
                        {section.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={14}
                      className={`hidden lg:block ${
                        active
                          ? "text-[#EFE8A8]"
                          : "text-[#656D64]"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </aside>

          {/* =====================================
              CONTENT
          ===================================== */}

          <main className="min-w-0 space-y-5">

            {/* SECTION HEADER */}

            <div className="mb-2">
              <div className="flex items-center gap-2 text-xs text-[#858B82]">
                <Settings size={14} />
                Settings
                <ChevronRight size={12} />

                <span className="text-[#EFE8A8]">
                  {activeSection}
                </span>
              </div>

              <h2 className="mt-3 text-2xl font-semibold text-[#F5F2E9]">
                {activeSection} Settings
              </h2>

              <p className="mt-1 text-xs text-[#92978F]">
                {currentSection?.description}
              </p>
            </div>

            {/* =====================================
                GENERAL
            ===================================== */}

            {activeSection === "General" && (
              <>
                <Panel
                  title="Academy Information"
                  description="Your academy's public identity and contact details."
                  icon={Building2}
                >
                  <div className="mb-6 flex flex-col gap-4 rounded-xl border border-[#343832] bg-[#151917] p-4 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#D9D19A]/30 bg-[#D9D19A]/10 text-[#EFE8A8]">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Academy logo preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold">
                          KBC
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#F5F2E9]">
                        Academy Logo
                      </p>

                      <p className="mt-1 text-xs text-[#92978F]">
                        Upload your academy logo.
                      </p>
                    </div>

                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#D9D19A]/30 bg-[#D9D19A]/[0.08] px-4 py-3 text-xs font-semibold text-[#EFE8A8] transition hover:bg-[#D9D19A]/15">
                      <Upload size={15} />
                      Upload Logo

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogo}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Academy Name"
                      value={settings.academyName}
                      onChange={(v) =>
                        update("academyName", v)
                      }
                    />

                    <Field
                      label="Tagline"
                      value={settings.tagline}
                      onChange={(v) =>
                        update("tagline", v)
                      }
                    />

                    <Field
                      label="Email Address"
                      type="email"
                      value={settings.email}
                      onChange={(v) =>
                        update("email", v)
                      }
                    />

                    <Field
                      label="Contact Number"
                      value={settings.phone}
                      onChange={(v) =>
                        update("phone", v)
                      }
                    />

                    <Field
                      label="Website"
                      value={settings.website}
                      onChange={(v) =>
                        update("website", v)
                      }
                    />

                    <Field
                      label="Location"
                      value={settings.address}
                      onChange={(v) =>
                        update("address", v)
                      }
                    />
                  </div>
                </Panel>

                <Panel
                  title="Regional Preferences"
                  description="Language, currency and local time settings."
                  icon={Globe}
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <SelectField
                      label="Language"
                      value={settings.language}
                      onChange={(v) =>
                        update("language", v)
                      }
                      options={[
                        "English",
                        "Tamil",
                        "Hindi",
                      ]}
                    />

                    <SelectField
                      label="Currency"
                      value={settings.currency}
                      onChange={(v) =>
                        update("currency", v)
                      }
                      options={[
                        "INR",
                        "USD",
                        "EUR",
                        "GBP",
                      ]}
                    />

                    <div className="sm:col-span-2">
                      <SelectField
                        label="Timezone"
                        value={settings.timezone}
                        onChange={(v) =>
                          update("timezone", v)
                        }
                        options={[
                          "Asia/Kolkata",
                          "Asia/Dubai",
                          "Europe/London",
                          "America/New_York",
                        ]}
                      />
                    </div>
                  </div>
                </Panel>
              </>
            )}

            {/* =====================================
                PROFILE
            ===================================== */}

            {activeSection === "Profile" && (
              <>
                <Panel
                  title="Administrator Profile"
                  description="Manage your personal account information."
                  icon={UserRound}
                >
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#D9D19A]/30 bg-gradient-to-br from-[#393626] to-[#22251F] text-xl font-bold text-[#EFE8A8]">
                      {settings.adminName
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#F5F2E9]">
                        {settings.adminName}
                      </p>

                      <p className="mt-1 text-xs text-[#92978F]">
                        Academy Administrator
                      </p>

                      <span className="mt-2 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] text-emerald-300">
                        Active Account
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Full Name"
                      value={settings.adminName}
                      onChange={(v) =>
                        update("adminName", v)
                      }
                    />

                    <Field
                      label="Email Address"
                      type="email"
                      value={settings.adminEmail}
                      onChange={(v) =>
                        update("adminEmail", v)
                      }
                    />

                    <Field
                      label="Phone Number"
                      value={settings.adminPhone}
                      onChange={(v) =>
                        update("adminPhone", v)
                      }
                    />
                  </div>
                </Panel>

                <Panel
                  title="Account Information"
                  description="Account role and profile permissions."
                  icon={ShieldCheck}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-[#343832] bg-[#151917] p-4">
                      <p className="text-[10px] uppercase tracking-wider text-[#858B82]">
                        Account Role
                      </p>

                      <p className="mt-2 text-sm font-semibold text-[#EFE8A8]">
                        Super Administrator
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#343832] bg-[#151917] p-4">
                      <p className="text-[10px] uppercase tracking-wider text-[#858B82]">
                        Access Level
                      </p>

                      <p className="mt-2 text-sm font-semibold text-[#F5F2E9]">
                        Full Access
                      </p>
                    </div>
                  </div>
                </Panel>
              </>
            )}

            {/* =====================================
                APPEARANCE
            ===================================== */}

            {activeSection === "Appearance" && (
              <>
                <Panel
                  title="Display Preferences"
                  description="Customize the appearance of your dashboard."
                  icon={Palette}
                >
                  <Toggle
                    label="Dark Theme"
                    description="Use the dark appearance throughout the admin dashboard."
                    checked={settings.darkMode}
                    onChange={(v) =>
                      update("darkMode", v)
                    }
                  />

                  <Toggle
                    label="Compact Layout"
                    description="Reduce spacing between dashboard elements."
                    checked={settings.compactMode}
                    onChange={(v) =>
                      update("compactMode", v)
                    }
                  />
                </Panel>

                <Panel
                  title="Theme Preview"
                  description="Your dashboard's current visual identity."
                  icon={Sparkles}
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-[#D9D19A]/30 bg-[#121414] p-4">
                      <div className="h-8 rounded-lg bg-[#EFE8A8]" />

                      <p className="mt-3 text-xs font-semibold text-[#F5F2E9]">
                        Champagne Gold
                      </p>

                      <p className="mt-1 text-[10px] text-[#92978F]">
                        #EFE8A8
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#3A403A] bg-[#1B1F1D] p-4">
                      <div className="h-8 rounded-lg bg-[#1B1F1D] ring-1 ring-[#3A403A]" />

                      <p className="mt-3 text-xs font-semibold text-[#F5F2E9]">
                        Card Surface
                      </p>

                      <p className="mt-1 text-[10px] text-[#92978F]">
                        #1B1F1D
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#3A403A] bg-[#121414] p-4">
                      <div className="h-8 rounded-lg bg-[#121414] ring-1 ring-[#3A403A]" />

                      <p className="mt-3 text-xs font-semibold text-[#F5F2E9]">
                        Background
                      </p>

                      <p className="mt-1 text-[10px] text-[#92978F]">
                        #121414
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-[11px] leading-5 text-[#858B82]">
                    These are preference settings and preview samples.
                    Applying a theme globally requires connecting them
                    to your shared layout.
                  </p>
                </Panel>
              </>
            )}

            {/* =====================================
                NOTIFICATIONS
            ===================================== */}

            {activeSection === "Notifications" && (
              <>
                <Panel
                  title="Notification Channels"
                  description="Choose how your academy sends updates."
                  icon={Bell}
                >
                  <Toggle
                    label="Email Notifications"
                    description="Receive important updates through email."
                    checked={settings.emailNotifications}
                    onChange={(v) =>
                      update("emailNotifications", v)
                    }
                  />

                  <Toggle
                    label="SMS Notifications"
                    description="Send alerts through SMS messages."
                    checked={settings.smsNotifications}
                    onChange={(v) =>
                      update("smsNotifications", v)
                    }
                  />

                  <Toggle
                    label="WhatsApp Notifications"
                    description="Send customer updates through WhatsApp."
                    checked={settings.whatsappNotifications}
                    onChange={(v) =>
                      update("whatsappNotifications", v)
                    }
                  />
                </Panel>

                <Panel
                  title="Alert Preferences"
                  description="Choose which business events should trigger notifications."
                  icon={MessageCircle}
                >
                  <Toggle
                    label="Appointment Alerts"
                    description="New bookings, cancellations and changes."
                    checked={settings.appointmentAlerts}
                    onChange={(v) =>
                      update("appointmentAlerts", v)
                    }
                  />

                  <Toggle
                    label="Payment Alerts"
                    description="Successful payments and pending transactions."
                    checked={settings.paymentAlerts}
                    onChange={(v) =>
                      update("paymentAlerts", v)
                    }
                  />

                  <Toggle
                    label="Low Stock Alerts"
                    description="Notify when products reach minimum stock."
                    checked={settings.lowStockAlerts}
                    onChange={(v) =>
                      update("lowStockAlerts", v)
                    }
                  />

                  <Toggle
                    label="Reminder Alerts"
                    description="Upcoming appointments and follow-ups."
                    checked={settings.reminderAlerts}
                    onChange={(v) =>
                      update("reminderAlerts", v)
                    }
                  />
                </Panel>
              </>
            )}

            {/* =====================================
                BUSINESS
            ===================================== */}

            {activeSection === "Business" && (
              <>
                <Panel
                  title="Business Hours"
                  description="Set your academy's opening and closing times."
                  icon={Clock}
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Opening Time"
                      type="time"
                      value={settings.openingTime}
                      onChange={(v) =>
                        update("openingTime", v)
                      }
                    />

                    <Field
                      label="Closing Time"
                      type="time"
                      value={settings.closingTime}
                      onChange={(v) =>
                        update("closingTime", v)
                      }
                    />
                  </div>

                  <div className="mt-6">
                    <p className="mb-3 text-xs font-medium text-[#A9ACA2]">
                      Working Days
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {days.map((day) => {
                        const active =
                          settings.workingDays.includes(day);

                        return (
                          <button
                            key={day}
                            onClick={() => toggleDay(day)}
                            className={`rounded-xl border px-3 py-2 text-xs transition ${
                              active
                                ? "border-[#D9D19A]/40 bg-[#D9D19A]/10 text-[#EFE8A8]"
                                : "border-[#3A403A] bg-[#151917] text-[#92978F] hover:border-[#D9D19A]/40 hover:text-[#EFE8A8]"
                            }`}
                          >
                            {active && (
                              <Check
                                size={11}
                                className="mr-1 inline"
                              />
                            )}

                            {day.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Panel>

                <Panel
                  title="Business Preferences"
                  description="Regional preferences for your academy."
                  icon={Globe}
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <SelectField
                      label="Currency"
                      value={settings.currency}
                      onChange={(v) =>
                        update("currency", v)
                      }
                      options={[
                        "INR",
                        "USD",
                        "EUR",
                        "GBP",
                      ]}
                    />

                    <SelectField
                      label="Timezone"
                      value={settings.timezone}
                      onChange={(v) =>
                        update("timezone", v)
                      }
                      options={[
                        "Asia/Kolkata",
                        "Asia/Dubai",
                        "Europe/London",
                      ]}
                    />
                  </div>
                </Panel>
              </>
            )}

            {/* =====================================
                BOOKING
            ===================================== */}

            {activeSection === "Booking" && (
              <>
                <Panel
                  title="Appointment Rules"
                  description="Set default appointment booking behavior."
                  icon={CalendarDays}
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <SelectField
                      label="Default Appointment Duration"
                      value={settings.appointmentDuration}
                      onChange={(v) =>
                        update("appointmentDuration", v)
                      }
                      options={[
                        "15",
                        "30",
                        "45",
                        "60",
                        "90",
                        "120",
                      ]}
                    />

                    <SelectField
                      label="Cancellation Notice (Hours)"
                      value={settings.cancellationHours}
                      onChange={(v) =>
                        update("cancellationHours", v)
                      }
                      options={[
                        "2",
                        "6",
                        "12",
                        "24",
                        "48",
                        "72",
                      ]}
                    />

                    <SelectField
                      label="Advance Booking Window (Days)"
                      value={settings.advanceBookingDays}
                      onChange={(v) =>
                        update("advanceBookingDays", v)
                      }
                      options={[
                        "7",
                        "14",
                        "30",
                        "60",
                        "90",
                      ]}
                    />
                  </div>
                </Panel>

                <Panel
                  title="Booking Information"
                  description="Current appointment configuration."
                  icon={CalendarCheck}
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-[#343832] bg-[#151917] p-4">
                      <Clock
                        size={18}
                        className="text-[#EFE8A8]"
                      />

                      <p className="mt-3 text-lg font-semibold text-[#F5F2E9]">
                        {settings.appointmentDuration} min
                      </p>

                      <p className="mt-1 text-[10px] text-[#92978F]">
                        Default duration
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#343832] bg-[#151917] p-4">
                      <CalendarDays
                        size={18}
                        className="text-[#EFE8A8]"
                      />

                      <p className="mt-3 text-lg font-semibold text-[#F5F2E9]">
                        {settings.advanceBookingDays} days
                      </p>

                      <p className="mt-1 text-[10px] text-[#92978F]">
                        Advance booking
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#343832] bg-[#151917] p-4">
                      <X
                        size={18}
                        className="text-[#EFE8A8]"
                      />

                      <p className="mt-3 text-lg font-semibold text-[#F5F2E9]">
                        {settings.cancellationHours} hrs
                      </p>

                      <p className="mt-1 text-[10px] text-[#92978F]">
                        Cancellation notice
                      </p>
                    </div>
                  </div>
                </Panel>
              </>
            )}

            {/* =====================================
                PAYMENTS
            ===================================== */}

            {activeSection === "Payments" && (
              <>
                <Panel
                  title="Tax Configuration"
                  description="Set the tax rate used in your billing configuration."
                  icon={IndianRupee}
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Tax Rate (%)"
                      type="number"
                      value={settings.taxRate}
                      onChange={(v) =>
                        update("taxRate", v)
                      }
                      hint="Confirm the applicable tax rate with your accountant."
                    />

                    <SelectField
                      label="Billing Currency"
                      value={settings.currency}
                      onChange={(v) =>
                        update("currency", v)
                      }
                      options={[
                        "INR",
                        "USD",
                        "EUR",
                        "GBP",
                      ]}
                    />
                  </div>
                </Panel>

                <Panel
                  title="Invoice Preferences"
                  description="Customize your invoice identification."
                  icon={CreditCard}
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Invoice Prefix"
                      value={settings.invoicePrefix}
                      onChange={(v) =>
                        update("invoicePrefix", v)
                      }
                      hint="Example: KBC-0001"
                    />

                    <div className="rounded-xl border border-[#D9D19A]/20 bg-[#151917] p-4">
                      <p className="text-[10px] uppercase tracking-wider text-[#92978F]">
                        Invoice Preview
                      </p>

                      <p className="mt-2 text-lg font-semibold text-[#EFE8A8]">
                        {settings.invoicePrefix || "KBC"}-0001
                      </p>
                    </div>
                  </div>
                </Panel>

                <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-4 text-xs leading-5 text-amber-100/70">
                  Payment gateway credentials and live payment
                  processing are not configured in this frontend
                  settings page.
                </div>
              </>
            )}

            {/* =====================================
                SECURITY
            ===================================== */}

            {activeSection === "Security" && (
              <>
                <Panel
                  title="Change Password"
                  description="Update the password for your administrator account."
                  icon={Lock}
                >
                  <div className="space-y-4">
                    <label className="block space-y-2">
                      <span className="text-xs font-medium text-[#A9ACA2]">
                        New Password
                      </span>

                      <div className="relative">
                        <input
                          type={
                            showPassword ? "text" : "password"
                          }
                          value={password}
                          onChange={(e) =>
                            setPassword(e.target.value)
                          }
                          placeholder="Enter new password"
                          className={`${inputClass} pr-12`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(!showPassword)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#858B82] transition hover:text-[#EFE8A8]"
                        >
                          {showPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>
                      </div>
                    </label>

                    <label className="block space-y-2">
                      <span className="text-xs font-medium text-[#A9ACA2]">
                        Confirm Password
                      </span>

                      <div className="relative">
                        <input
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          value={confirmPassword}
                          onChange={(e) =>
                            setConfirmPassword(e.target.value)
                          }
                          placeholder="Confirm new password"
                          className={`${inputClass} pr-12`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              !showConfirmPassword
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#858B82] transition hover:text-[#EFE8A8]"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>
                      </div>
                    </label>

                    <button
                      onClick={changePassword}
                      className={primaryButtonClass}
                    >
                      Validate Password Change
                    </button>
                  </div>
                </Panel>

                <Panel
                  title="Two-Factor Authentication"
                  description="Add another layer of protection to your administrator account."
                  icon={ShieldCheck}
                >
                  <Toggle
                    label="Enable Two-Factor Authentication"
                    description="Require a second verification step when signing in. A working authentication service is needed to enforce this."
                    checked={settings.twoFactor}
                    onChange={(v) =>
                      update("twoFactor", v)
                    }
                  />
                </Panel>

                <Panel
                  title="Session Information"
                  description="Device information for your current browser session."
                  icon={Monitor}
                >
                  <div className="flex items-center gap-4 rounded-xl border border-[#343832] bg-[#151917] p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D9D19A]/20 bg-[#D9D19A]/10 text-[#EFE8A8]">
                      <Monitor size={20} />
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#F5F2E9]">
                        Current Browser
                      </p>

                      <p className="mt-1 text-xs text-[#92978F]">
                        This device · Current session
                      </p>
                    </div>

                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] text-emerald-300">
                      Active
                    </span>
                  </div>
                </Panel>
              </>
            )}

            {/* =====================================
                BOTTOM ACTIONS
            ===================================== */}

            <div className={`${cardClass} flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:px-5`}>
              <p className="text-xs text-[#92978F]">
                Remember to save your changes before leaving this page.
              </p>

              <button
                onClick={saveSettings}
                disabled={!loaded}
                className={primaryButtonClass}
              >
                <Save size={15} />
                Save {activeSection} Settings
              </button>
            </div>
          </main>
        </div>

        {/* =====================================
            TOAST
        ===================================== */}

        {toast && (
          <div className="gold-ambient-card fixed bottom-6 right-6 z-[80] flex max-w-sm items-center gap-3 rounded-xl border border-[#D9D19A]/40 bg-[#1B1F1D] px-5 py-4 text-sm text-[#F5F2E9] shadow-2xl">
            <Check
              size={18}
              className="shrink-0 text-[#EFE8A8]"
            />

            <span>{toast}</span>

            <button
              onClick={() => setToast("")}
              className="ml-2 text-[#858B82] transition hover:text-[#EFE8A8]"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>

      {/* =========================================
          SOFT GOLD AMBIENT HOVER GLOW
      ========================================= */}

      <style jsx global>{`
        .gold-ambient-card {
          position: relative;
          isolation: isolate;
          -webkit-tap-highlight-color: transparent;

          transition:
            transform 0.35s ease,
            border-color 0.35s ease,
            box-shadow 0.35s ease;
        }

        .gold-ambient-card::before {
          content: "";
          position: absolute;
          inset: -3px;
          border-radius: inherit;
          pointer-events: none;
          z-index: -1;

          background: radial-gradient(
            ellipse at center,
            rgba(255, 226, 130, 0.25) 0%,
            rgba(239, 200, 85, 0.16) 35%,
            rgba(205, 157, 55, 0.08) 65%,
            transparent 100%
          );

          filter: blur(24px);
          opacity: 0;

          transition: opacity 0.35s ease;
        }

        .gold-ambient-card:hover,
        .gold-ambient-card:active,
        .gold-ambient-card:focus-visible {
          border-color: rgba(239, 210, 130, 0.45);

          box-shadow:
            0 0 12px rgba(239, 200, 85, 0.13),
            0 0 28px rgba(239, 200, 85, 0.12),
            0 0 50px rgba(239, 200, 85, 0.08),
            inset 0 0 18px rgba(239, 200, 85, 0.025);
        }

        .gold-ambient-card:hover::before,
        .gold-ambient-card:active::before,
        .gold-ambient-card:focus-visible::before {
          opacity: 1;
        }

        @media (hover: hover) and (pointer: fine) {
          .gold-ambient-card:hover {
            transform: translateY(-3px);
          }
        }

        @media (hover: none) {
          .gold-ambient-card:active {
            transform: scale(0.99);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gold-ambient-card,
          .gold-ambient-card::before {
            transition: none;
          }

          .gold-ambient-card:hover,
          .gold-ambient-card:active {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}