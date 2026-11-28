"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck, ShieldAlert, Lock, KeyRound, Smartphone, Laptop,
  Monitor, Tablet, MapPin, Clock, CheckCircle2, AlertTriangle,
  Eye, EyeOff, Bell, LogOut, MoreVertical, Search, X, ChevronRight,
  Fingerprint, Globe, Wifi, Copy, Check,
} from "lucide-react";

type DeviceType = "Desktop" | "Laptop" | "Mobile" | "Tablet";

type Device = {
  id: string;
  name: string;
  type: DeviceType;
  browser: string;
  os: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
  trusted: boolean;
};

type LoginActivity = {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  time: string;
  status: "Successful" | "Failed" | "Blocked";
  description: string;
};

type SecuritySettings = {
  twoFactor: boolean;
  loginAlerts: boolean;
  newDeviceAlerts: boolean;
  failedLoginAlerts: boolean;
  trustedDeviceOnly: boolean;
};

const DEVICE_KEY = "kbc_security_devices_v1";
const ACTIVITY_KEY = "kbc_security_activity_v1";
const SETTINGS_KEY = "kbc_security_settings_v1";

const initialDevices: Device[] = [
  {
    id: "device-1",
    name: "My Windows Desktop",
    type: "Desktop",
    browser: "Chrome 158",
    os: "Windows 11",
    location: "Salem, Tamil Nadu",
    ip: "192.168.1.105",
    lastActive: new Date().toISOString(),
    current: true,
    trusted: true,
  },
  {
    id: "device-2",
    name: "Office Laptop",
    type: "Laptop",
    browser: "Microsoft Edge",
    os: "Windows 11",
    location: "Salem, Tamil Nadu",
    ip: "192.168.1.108",
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    current: false,
    trusted: true,
  },
  {
    id: "device-3",
    name: "Mobile Device",
    type: "Mobile",
    browser: "Chrome Mobile",
    os: "Android",
    location: "Chennai, Tamil Nadu",
    ip: "10.0.0.21",
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    current: false,
    trusted: false,
  },
];

const initialActivity: LoginActivity[] = [
  {
    id: "activity-1",
    device: "Windows Desktop",
    browser: "Chrome 158",
    location: "Salem, Tamil Nadu",
    ip: "192.168.1.105",
    time: new Date().toISOString(),
    status: "Successful",
    description: "Current browser session",
  },
  {
    id: "activity-2",
    device: "Office Laptop",
    browser: "Microsoft Edge",
    location: "Salem, Tamil Nadu",
    ip: "192.168.1.108",
    time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    status: "Successful",
    description: "Trusted device login",
  },
  {
    id: "activity-3",
    device: "Unknown Browser",
    browser: "Unknown",
    location: "Unknown location",
    ip: "Not available",
    time: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    status: "Failed",
    description: "Incorrect password entered",
  },
];

const defaultSettings: SecuritySettings = {
  twoFactor: false,
  loginAlerts: true,
  newDeviceAlerts: true,
  failedLoginAlerts: true,
  trustedDeviceOnly: false,
};

const cardClass =
  "gold-ambient-card rounded-2xl bg-[#121414] p-5 text-[#F5F1E6]";

const inputClass =
  "w-full rounded-xl border border-[#E8D39A]/30 bg-[#121414] px-4 py-3 text-sm text-[#F5F1E6] outline-none transition placeholder:text-[#858B82] focus:border-[#FFF4CE]";

const primaryButtonClass =
  "flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FFF4CE] via-[#E8D39A] to-[#C9A45C] px-4 py-3 text-sm font-semibold text-[#17140D] shadow-md shadow-[#C9A45C]/25 transition hover:brightness-105";

const secondaryButtonClass =
  "flex items-center justify-center gap-2 rounded-xl border border-[#E8D39A]/40 bg-[#121414] px-4 py-3 text-sm font-medium text-[#FFF4CE] transition hover:bg-gradient-to-r hover:from-[#FFF4CE] hover:via-[#E8D39A] hover:to-[#C9A45C] hover:text-[#17140D]";

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const timeAgo = (value: string) => {
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;

  return `${Math.floor(hours / 24)} days ago`;
};

function DeviceIcon({ type }: { type: DeviceType }) {
  if (type === "Mobile") return <Smartphone size={21} />;
  if (type === "Tablet") return <Tablet size={21} />;
  if (type === "Laptop") return <Laptop size={21} />;
  return <Monitor size={21} />;
}

export default function SecurityPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [activity, setActivity] = useState<LoginActivity[]>([]);
  const [settings, setSettings] = useState<SecuritySettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "Overview" | "Devices" | "Activity" | "Settings"
  >("Overview");

  const [search, setSearch] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deviceMenu, setDeviceMenu] = useState<string | null>(null);
  const [renameDevice, setRenameDevice] = useState<Device | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [toast, setToast] = useState("");
  const [copiedIp, setCopiedIp] = useState(false);

  useEffect(() => {
    try {
      const savedDevices = localStorage.getItem(DEVICE_KEY);
      const savedActivity = localStorage.getItem(ACTIVITY_KEY);
      const savedSettings = localStorage.getItem(SETTINGS_KEY);

      setDevices(savedDevices ? JSON.parse(savedDevices) : initialDevices);
      setActivity(savedActivity ? JSON.parse(savedActivity) : initialActivity);

      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      }
    } catch {
      setDevices(initialDevices);
      setActivity(initialActivity);
      setSettings(defaultSettings);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(DEVICE_KEY, JSON.stringify(devices));
  }, [devices, loaded]);

  useEffect(() => {
    if (loaded) localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
  }, [activity, loaded]);

  useEffect(() => {
    if (loaded) localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, loaded]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const activeDevices = devices.length;
  const trustedDevices = devices.filter((d) => d.trusted).length;

  const failedLogins = activity.filter(
    (a) => a.status === "Failed" || a.status === "Blocked"
  ).length;

  const securityScore = Math.min(
    100,
    55 +
      (settings.twoFactor ? 15 : 0) +
      (settings.loginAlerts ? 5 : 0) +
      (settings.newDeviceAlerts ? 5 : 0) +
      (settings.failedLoginAlerts ? 5 : 0) +
      (settings.trustedDeviceOnly ? 15 : 0)
  );

  const filteredDevices = useMemo(
    () =>
      devices.filter((device) =>
        [device.name, device.type, device.browser, device.os, device.location]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [devices, search]
  );

  const addActivity = (
    description: string,
    status: LoginActivity["status"] = "Successful"
  ) => {
    const entry: LoginActivity = {
      id: `activity-${Date.now()}`,
      device: "Current device",
      browser: "Current browser",
      location: "Not verified",
      ip: "Not available",
      time: new Date().toISOString(),
      status,
      description,
    };

    setActivity((current) => [entry, ...current]);
  };

  const toggleSetting = (key: keyof SecuritySettings) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
    setToast("Security preference updated");
  };

  const removeDevice = (id: string) => {
    const device = devices.find((d) => d.id === id);
    if (!device || device.current) return;

    if (!window.confirm(`Remove access for ${device.name}?`)) return;

    setDevices((current) => current.filter((d) => d.id !== id));
    setDeviceMenu(null);
    addActivity(`Device removed: ${device.name}`);
    setToast("Device removed from this demo list");
  };

  const signOutOtherDevices = () => {
    const otherDevices = devices.filter((d) => !d.current);

    if (otherDevices.length === 0) {
      setToast("There are no other devices to sign out");
      return;
    }

    if (
      !window.confirm(
        `Sign out ${otherDevices.length} other device(s) from this demo list?`
      )
    ) return;

    setDevices((current) => current.filter((d) => d.current));
    addActivity("Signed out other listed devices");
    setToast("Other devices removed from this demo list");
  };

  const toggleTrust = (id: string) => {
    setDevices((current) =>
      current.map((device) =>
        device.id === id ? { ...device, trusted: !device.trusted } : device
      )
    );
    setDeviceMenu(null);
    setToast("Device trust status updated");
  };

  const saveRename = () => {
    if (!renameDevice || !renameValue.trim()) return;

    setDevices((current) =>
      current.map((device) =>
        device.id === renameDevice.id
          ? { ...device, name: renameValue.trim() }
          : device
      )
    );

    setRenameDevice(null);
    setRenameValue("");
    setToast("Device name updated");
  };

  const changePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setToast("Please complete all password fields");
      return;
    }

    if (newPassword.length < 8) {
      setToast("Password must contain at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast("New passwords do not match");
      return;
    }

    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    addActivity("Password change form completed");
    setToast("Demo password form completed — connect authentication to change it");
  };

  const copyCurrentIp = async () => {
    const current = devices.find((device) => device.current);
    if (!current) return;

    try {
      await navigator.clipboard.writeText(current.ip);
      setCopiedIp(true);
      window.setTimeout(() => setCopiedIp(false), 1800);
      setToast("Displayed demo IP copied");
    } catch {
      setToast("Could not copy IP address");
    }
  };

  const statusStyle = (status: LoginActivity["status"]) => {
    if (status === "Successful") return "bg-[#8DCBA5]/15 text-[#8DCBA5]";
    if (status === "Failed") return "bg-[#E7AD75]/15 text-[#E7AD75]";
    return "bg-[#F18C8C]/15 text-[#F18C8C]";
  };

  const preferenceRows: {
    key: keyof SecuritySettings;
    title: string;
    description: string;
    icon: typeof Bell;
  }[] = [
    {
      key: "twoFactor",
      title: "Two-factor authentication",
      description: "Require an additional verification step when signing in.",
      icon: Fingerprint,
    },
    {
      key: "loginAlerts",
      title: "Login alerts",
      description: "Receive an alert when a new login is recorded.",
      icon: Bell,
    },
    {
      key: "newDeviceAlerts",
      title: "New device notifications",
      description: "Get notified when a new device is added.",
      icon: Smartphone,
    },
    {
      key: "failedLoginAlerts",
      title: "Failed login alerts",
      description: "Get notified about unsuccessful sign-in attempts.",
      icon: AlertTriangle,
    },
    {
      key: "trustedDeviceOnly",
      title: "Trusted devices only",
      description: "Restrict access to approved devices (requires backend enforcement).",
      icon: ShieldCheck,
    },
  ];

  return (
    <main className="security-page min-h-screen bg-[#FAF5ED] p-4 text-[#17140D] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-7">
        {/* Header */}
        <div className="gold-ambient-card flex flex-col justify-between gap-5 rounded-2xl bg-[#121414] p-5 text-[#F5F1E6] lg:flex-row lg:items-center">
          <div>
            <div className="gold-card-accent mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#E8D39A]">
              <ShieldCheck size={15} />
              KBC Admin Center
            </div>

            <h1 className="gold-card-title text-3xl font-semibold tracking-tight text-[#FFF4CE] sm:text-4xl">
              Security &amp; Devices
            </h1>

            <p className="gold-card-muted mt-2 text-sm text-[#C9C4B8]">
              Protect your academy account and manage connected devices.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className={secondaryButtonClass}
            >
              <KeyRound size={17} />
              Change password
            </button>

            <button onClick={signOutOtherDevices} className={primaryButtonClass}>
              <LogOut size={17} />
              Sign out other devices
            </button>
          </div>
        </div>

        {/* Security score */}
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className={`${cardClass} p-6 sm:p-7 xl:col-span-2`}>
            <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <div className="gold-card-muted flex items-center gap-2 text-sm text-[#D4CDBB]">
                  <ShieldCheck size={18} className="gold-card-accent text-[#FFF4CE]" />
                  Account security score
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="gold-card-accent text-5xl font-semibold tracking-tight text-[#FFF4CE]">
                    {securityScore}
                  </span>
                  <span className="gold-card-muted text-lg text-[#A8A18F]">/ 100</span>
                </div>

                <p className="gold-card-muted mt-3 max-w-md text-sm leading-6 text-[#C1BBAE]">
                  {securityScore >= 85
                    ? "Your demo security settings are looking strong. Continue reviewing your account regularly."
                    : "Strengthen your account by enabling additional security options."}
                </p>

                <div className="gold-card-track mt-5 h-2 max-w-md overflow-hidden rounded-full bg-[#262A28]">
                  <div
                    className="gold-card-bar h-full rounded-full bg-gradient-to-r from-[#FFF4CE] via-[#E8D39A] to-[#C9A45C] transition-all duration-500"
                    style={{ width: `${securityScore}%` }}
                  />
                </div>
              </div>

              <div className="gold-card-icon flex h-32 w-32 shrink-0 items-center justify-center self-center rounded-full border-[7px] border-[#E8D39A]/25 bg-[#191C1B] sm:self-auto">
                <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-[#E8D39A]/10">
                  <ShieldCheck size={34} className="gold-card-accent text-[#FFF4CE]" />
                  <span className="gold-card-muted mt-1 text-[10px] uppercase tracking-wider text-[#C4C0A3]">
                    Protected
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <span className="gold-card-muted text-xs text-[#D4CDBB]">
                  Active devices
                </span>
                <Monitor size={19} className="gold-card-accent text-[#FFF4CE]" />
              </div>
              <div className="gold-card-title mt-3 text-3xl font-semibold text-white">
                {activeDevices}
              </div>
              <p className="gold-card-muted mt-1 text-xs text-[#A8A18F]">
                Listed in this browser demo
              </p>
            </div>

            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <span className="gold-card-muted text-xs text-[#D4CDBB]">
                  Trusted devices
                </span>
                <CheckCircle2 size={19} className="gold-card-accent text-[#8DCBA5]" />
              </div>
              <div className="gold-card-title mt-3 text-3xl font-semibold text-white">
                {trustedDevices}
              </div>
              <p className="gold-card-muted mt-1 text-xs text-[#A8A18F]">
                Marked as trusted
              </p>
            </div>
          </div>
        </section>

        {/* Alert */}
        {failedLogins > 0 && (
          <div className="gold-ambient-card flex flex-col gap-3 rounded-2xl bg-[#121414] p-4 text-[#F5F1E6] sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="gold-card-accent shrink-0 text-[#E7AD75]" />
              <div>
                <p className="gold-card-title text-sm font-semibold text-[#E7AD75]">
                  Login activity needs review
                </p>
                <p className="gold-card-muted mt-1 text-xs text-[#C1BBAE]">
                  {failedLogins} failed or blocked login record(s) appear in
                  the demo activity list.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("Activity")}
              className="gold-card-title ml-auto text-xs font-semibold text-[#FFF4CE] hover:underline"
            >
              Review activity →
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto border-b border-[#C9A45C]/35 pb-3">
          {(["Overview", "Devices", "Activity", "Settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 rounded-xl px-5 py-3 text-sm transition ${
                activeTab === tab
                  ? "bg-gradient-to-r from-[#FFF4CE] via-[#E8D39A] to-[#C9A45C] font-semibold text-[#17140D] shadow-md shadow-[#C9A45C]/25"
                  : "text-[#5C5549] hover:bg-[#121414]/10 hover:text-[#17140D]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <section className="space-y-5 xl:col-span-2">
              <div className={cardClass}>
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="gold-card-title font-semibold text-white">
                      Recent devices
                    </h2>
                    <p className="gold-card-muted mt-1 text-xs text-[#A8A18F]">
                      Devices listed for this account demo.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("Devices")}
                    className="gold-card-title text-xs font-medium text-[#FFF4CE] hover:underline"
                  >
                    View all
                  </button>
                </div>

                <div className="space-y-3">
                  {devices.slice(0, 3).map((device) => (
                    <div
                      key={device.id}
                      className="gold-card-subpanel flex items-center gap-4 rounded-xl border border-[#E8D39A]/20 bg-[#121414] p-4 transition"
                    >
                      <div className="gold-card-icon rounded-xl bg-[#E8D39A]/15 p-3 text-[#FFF4CE]">
                        <DeviceIcon type={device.type} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="gold-card-title truncate text-sm font-medium text-white">
                            {device.name}
                          </p>
                          {device.current && (
                            <span className="gold-card-pill rounded-md bg-[#8DCBA5]/15 px-2 py-1 text-[10px] text-[#8DCBA5]">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="gold-card-muted mt-1 text-xs text-[#C1BBAE]">
                          {device.browser} · {device.os}
                        </p>
                        <p className="gold-card-muted mt-1 text-xs text-[#A8A18F]">
                          {device.location} · {timeAgo(device.lastActive)}
                        </p>
                      </div>

                      <div className="gold-card-title hidden text-xs font-medium text-[#8DCBA5] sm:block">
                        {device.trusted ? "Trusted" : "Not trusted"}
                      </div>
                    </div>
                  ))}

                  {devices.length === 0 && (
                    <p className="gold-card-muted py-8 text-center text-sm text-[#A8A18F]">
                      No devices are listed.
                    </p>
                  )}
                </div>
              </div>

              <div className={cardClass}>
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="gold-card-title font-semibold text-white">
                      Recent login activity
                    </h2>
                    <p className="gold-card-muted mt-1 text-xs text-[#A8A18F]">
                      Latest recorded demo events.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("Activity")}
                    className="gold-card-title text-xs font-medium text-[#FFF4CE] hover:underline"
                  >
                    View history
                  </button>
                </div>

                <div className="space-y-4">
                  {activity.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="mt-1">
                        {item.status === "Successful" ? (
                          <CheckCircle2 size={18} className="gold-card-accent text-[#8DCBA5]" />
                        ) : item.status === "Failed" ? (
                          <AlertTriangle size={18} className="gold-card-accent text-[#E7AD75]" />
                        ) : (
                          <ShieldAlert size={18} className="gold-card-accent text-[#F18C8C]" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="gold-card-title text-sm text-[#D6D8CE]">
                          {item.description}
                        </p>
                        <p className="gold-card-muted mt-1 text-xs text-[#A8A18F]">
                          {item.device} · {item.location}
                        </p>
                      </div>

                      <span className="gold-card-muted whitespace-nowrap text-[11px] text-[#A8A18F]">
                        {timeAgo(item.time)}
                      </span>
                    </div>
                  ))}

                  {activity.length === 0 && (
                    <p className="gold-card-muted py-6 text-center text-sm text-[#A8A18F]">
                      No login activity recorded.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <div className={cardClass}>
                <div className="flex items-center gap-2">
                  <Lock size={18} className="gold-card-accent text-[#FFF4CE]" />
                  <h2 className="gold-card-title font-semibold text-white">
                    Quick security
                  </h2>
                </div>

                <div className="mt-5 space-y-4">
                  {[
                    { label: "Two-factor authentication", enabled: settings.twoFactor },
                    { label: "Login alerts", enabled: settings.loginAlerts },
                    { label: "New device alerts", enabled: settings.newDeviceAlerts },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3">
                      <span className="gold-card-muted text-xs text-[#D4CDBB]">
                        {item.label}
                      </span>
                      <span
                        className={`gold-card-pill rounded-md px-2 py-1 text-[10px] font-medium ${
                          item.enabled
                            ? "bg-[#8DCBA5]/15 text-[#8DCBA5]"
                            : "bg-[#E7AD75]/15 text-[#E7AD75]"
                        }`}
                      >
                        {item.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setActiveTab("Settings")}
                  className="gold-card-pill mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#E8D39A]/40 bg-[#121414] py-3 text-xs font-medium text-[#FFF4CE] transition"
                >
                  Manage security settings
                  <ChevronRight size={15} />
                </button>
              </div>

              <div className={cardClass}>
                <div className="flex items-center gap-2">
                  <Globe size={18} className="gold-card-accent text-[#FFF4CE]" />
                  <h2 className="gold-card-title font-semibold text-white">
                    Current session
                  </h2>
                </div>

                {devices.find((d) => d.current) ? (
                  <>
                    <p className="gold-card-title mt-4 text-sm font-medium text-white">
                      {devices.find((d) => d.current)?.name}
                    </p>
                    <p className="gold-card-muted mt-1 text-xs text-[#A8A18F]">
                      {devices.find((d) => d.current)?.browser}
                    </p>

                    <div className="gold-card-subpanel mt-4 flex items-center justify-between rounded-lg border border-[#E8D39A]/20 bg-[#121414] p-3">
                      <div>
                        <p className="gold-card-muted text-[10px] text-[#A8A18F]">
                          Displayed IP
                        </p>
                        <p className="gold-card-title mt-1 text-xs text-white">
                          {devices.find((d) => d.current)?.ip}
                        </p>
                      </div>
                      <button
                        onClick={copyCurrentIp}
                        className="gold-card-pill rounded-lg p-2 text-[#FFF4CE] transition hover:bg-black/15"
                      >
                        {copiedIp ? <Check size={15} /> : <Copy size={15} />}
                      </button>
                    </div>

                    <p className="gold-card-muted mt-3 text-[10px] leading-5 text-[#A8A18F]">
                      The displayed device and IP details are sample data,
                      not verified browser or network information.
                    </p>
                  </>
                ) : (
                  <p className="gold-card-muted mt-4 text-sm text-[#A8A18F]">
                    No current device is marked.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Devices */}
        {activeTab === "Devices" && (
          <section className={`${cardClass} !p-0`}>
            <div className="gold-card-divider flex flex-col justify-between gap-4 border-b border-[#E8D39A]/15 p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <h2 className="gold-card-title font-semibold text-white">
                  Connected devices
                </h2>
                <p className="gold-card-muted mt-1 text-xs text-[#A8A18F]">
                  Review and manage devices listed in this demo.
                </p>
              </div>

              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A18F]"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search devices..."
                  className={`${inputClass} pl-9 sm:w-64`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 sm:p-6 lg:grid-cols-2">
              {filteredDevices.map((device) => (
                <div
                  key={device.id}
                  className="gold-ambient-card relative rounded-2xl bg-[#121414] p-5 text-[#F5F1E6]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="gold-card-icon rounded-xl bg-[#E8D39A]/15 p-3 text-[#FFF4CE]">
                        <DeviceIcon type={device.type} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="gold-card-title text-sm font-semibold text-white">
                            {device.name}
                          </h3>
                          {device.current && (
                            <span className="gold-card-pill rounded-md bg-[#8DCBA5]/15 px-2 py-1 text-[9px] text-[#8DCBA5]">
                              Current session
                            </span>
                          )}
                        </div>
                        <p className="gold-card-muted mt-1 text-xs text-[#A8A18F]">
                          {device.type}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setDeviceMenu(deviceMenu === device.id ? null : device.id)
                      }
                      className="gold-card-pill rounded-lg p-2 text-[#A8A18F] transition hover:bg-black/15 hover:text-[#17140D]"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {deviceMenu === device.id && (
                      <div className="absolute right-5 top-14 z-20 w-48 rounded-xl border border-[#E8D39A]/45 bg-[#121414] p-1 text-[#F5F1E6] shadow-2xl">
                        <button
                          onClick={() => {
                            setRenameDevice(device);
                            setRenameValue(device.name);
                            setDeviceMenu(null);
                          }}
                          className="w-full rounded-lg px-3 py-2.5 text-left text-xs text-[#F5F1E6] hover:bg-[#FFF4CE] hover:text-[#17140D]"
                        >
                          Rename device
                        </button>

                        <button
                          onClick={() => toggleTrust(device.id)}
                          className="w-full rounded-lg px-3 py-2.5 text-left text-xs text-[#F5F1E6] hover:bg-[#FFF4CE] hover:text-[#17140D]"
                        >
                          {device.trusted
                            ? "Remove trusted status"
                            : "Mark as trusted"}
                        </button>

                        {!device.current && (
                          <button
                            onClick={() => removeDevice(device.id)}
                            className="w-full rounded-lg px-3 py-2.5 text-left text-xs text-[#F18C8C] hover:bg-[#F18C8C]/15"
                          >
                            Remove device
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="gold-card-divider mt-5 space-y-3 border-t border-[#E8D39A]/15 pt-4">
                    {[
                      { icon: Globe, label: "Browser", value: device.browser },
                      { icon: Monitor, label: "Operating system", value: device.os },
                      { icon: MapPin, label: "Location", value: device.location },
                      { icon: Wifi, label: "IP address", value: device.ip },
                      {
                        icon: Clock,
                        label: "Last active",
                        value: formatDate(device.lastActive),
                      },
                    ].map((row) => {
                      const Icon = row.icon;
                      return (
                        <div
                          key={row.label}
                          className="flex items-center justify-between gap-3 text-xs"
                        >
                          <span className="gold-card-muted flex items-center gap-2 text-[#A8A18F]">
                            <Icon size={14} className="gold-card-accent" />
                            {row.label}
                          </span>
                          <span className="gold-card-title text-right text-[#D6D0C2]">
                            {row.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="gold-card-divider mt-4 flex items-center justify-between border-t border-[#E8D39A]/15 pt-4">
                    <span
                      className={`gold-card-title flex items-center gap-2 text-xs font-medium ${
                        device.trusted ? "text-[#8DCBA5]" : "text-[#E7AD75]"
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {device.trusted ? "Trusted device" : "Not trusted"}
                    </span>
                    <span className="gold-card-muted text-[10px] text-[#A8A18F]">
                      {timeAgo(device.lastActive)}
                    </span>
                  </div>
                </div>
              ))}

              {filteredDevices.length === 0 && (
                <div className="gold-card-muted col-span-full py-14 text-center text-sm text-[#A8A18F]">
                  No matching devices found.
                </div>
              )}
            </div>
          </section>
        )}

        {/* Activity */}
        {activeTab === "Activity" && (
          <section className={`${cardClass} !overflow-hidden !p-0`}>
            <div className="gold-card-divider flex flex-col justify-between gap-3 border-b border-[#E8D39A]/15 p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <h2 className="gold-card-title font-semibold text-white">
                  Login activity
                </h2>
                <p className="gold-card-muted mt-1 text-xs text-[#A8A18F]">
                  Review successful, failed and blocked sign-in records.
                </p>
              </div>

              <div className="gold-card-pill rounded-lg border border-[#E8D39A]/30 bg-[#E8D39A]/10 px-3 py-2 text-xs font-medium text-[#FFF4CE]">
                {activity.length} records
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="gold-table-head bg-[#121414] text-[10px] uppercase tracking-wider text-[#A8A18F]">
                  <tr>
                    <th className="px-5 py-4 font-medium">Device</th>
                    <th className="px-5 py-4 font-medium">Location</th>
                    <th className="px-5 py-4 font-medium">IP address</th>
                    <th className="px-5 py-4 font-medium">Date &amp; time</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E8D39A]/15">
                  {activity.map((item) => (
                    <tr
                      key={item.id}
                      className="gold-table-row transition hover:bg-black/15"
                    >
                      <td className="px-5 py-4">
                        <p className="gold-card-title text-sm text-[#F5F1E6]">
                          {item.device}
                        </p>
                        <p className="gold-card-muted mt-1 text-xs text-[#A8A18F]">
                          {item.browser}
                        </p>
                        <p className="gold-card-muted mt-1 text-[10px] text-[#A8A18F]">
                          {item.description}
                        </p>
                      </td>
                      <td className="gold-card-muted px-5 py-4 text-xs text-[#C1BBAE]">
                        {item.location}
                      </td>
                      <td className="gold-card-title px-5 py-4 font-mono text-xs text-[#C1BBAE]">
                        {item.ip}
                      </td>
                      <td className="gold-card-muted px-5 py-4 text-xs text-[#C1BBAE]">
                        {formatDate(item.time)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`gold-card-pill rounded-lg px-2.5 py-1.5 text-[10px] font-semibold ${statusStyle(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {activity.length === 0 && (
                <p className="gold-card-muted py-12 text-center text-sm text-[#A8A18F]">
                  No login activity recorded.
                </p>
              )}
            </div>
          </section>
        )}

        {/* Settings */}
        {activeTab === "Settings" && (
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className={`${cardClass} xl:col-span-2`}>
              <div className="mb-6">
                <h2 className="gold-card-title font-semibold text-white">
                  Security preferences
                </h2>
                <p className="gold-card-muted mt-1 text-xs text-[#A8A18F]">
                  Manage your account protection preferences.
                </p>
              </div>

              <div className="space-y-3">
                {preferenceRows.map((row) => {
                  const Icon = row.icon;
                  const enabled = settings[row.key];

                  return (
                    <div
                      key={row.key}
                      className="gold-card-subpanel flex flex-col justify-between gap-4 rounded-xl border border-[#E8D39A]/20 bg-[#121414] p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-start gap-3">
                        <div className="gold-card-icon rounded-lg bg-[#E8D39A]/15 p-2.5 text-[#FFF4CE]">
                          <Icon size={18} />
                        </div>
                        <div>
                          <h3 className="gold-card-title text-sm font-medium text-white">
                            {row.title}
                          </h3>
                          <p className="gold-card-muted mt-1 max-w-lg text-xs leading-5 text-[#A8A18F]">
                            {row.description}
                          </p>
                        </div>
                      </div>

                      <button
                        role="switch"
                        aria-checked={enabled}
                        onClick={() => toggleSetting(row.key)}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                          enabled ? "bg-[#FFF4CE]" : "bg-[#3A403A]"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full transition ${
                            enabled ? "left-6 bg-[#17140D]" : "left-1 bg-[#B9BDB3]"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-5">
              <div className={cardClass}>
                <div className="flex items-center gap-2">
                  <KeyRound size={19} className="gold-card-accent text-[#FFF4CE]" />
                  <h2 className="gold-card-title font-semibold text-white">
                    Password
                  </h2>
                </div>
                <p className="gold-card-muted mt-3 text-xs leading-6 text-[#A8A18F]">
                  Update your account password regularly and use a strong,
                  unique password.
                </p>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className={`${secondaryButtonClass} mt-5 w-full`}
                >
                  Change password
                </button>
              </div>

              <div className={cardClass}>
                <div className="flex items-center gap-2">
                  <LogOut size={19} className="gold-card-accent text-[#F18C8C]" />
                  <h2 className="gold-card-title font-semibold text-white">
                    Session control
                  </h2>
                </div>
                <p className="gold-card-muted mt-3 text-xs leading-6 text-[#A8A18F]">
                  Remove all other devices from the local demo list.
                </p>
                <button
                  onClick={signOutOtherDevices}
                  className="gold-card-pill mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#F18C8C]/40 bg-[#121414] py-3 text-xs font-semibold text-[#F18C8C] transition hover:bg-[#F18C8C]/15"
                >
                  Sign out other devices
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Rename device modal */}
        {renameDevice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-[#E8D39A]/50 bg-[#121414] p-6 text-[#F5F1E6] shadow-[0_0_40px_rgba(232,211,154,0.22)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#FFF4CE]">
                  Rename device
                </h2>
                <button
                  onClick={() => setRenameDevice(null)}
                  className="rounded-lg p-2 text-[#A8A18F] transition hover:bg-[#FFF4CE] hover:text-[#17140D]"
                >
                  <X size={18} />
                </button>
              </div>

              <label className="mt-5 block text-xs text-[#D4CDBB]">
                Device name
              </label>
              <input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className={`${inputClass} mt-2`}
                placeholder="Enter device name"
              />

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setRenameDevice(null)}
                  className={secondaryButtonClass}
                >
                  Cancel
                </button>
                <button onClick={saveRename} className={primaryButtonClass}>
                  Save changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <form
              onSubmit={changePassword}
              className="w-full max-w-md rounded-2xl border border-[#E8D39A]/50 bg-[#121414] p-6 text-[#F5F1E6] shadow-[0_0_40px_rgba(232,211,154,0.22)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#FFF4CE]">
                    Change password
                  </h2>
                  <p className="mt-1 text-xs text-[#A8A18F]">
                    Enter your current and new password.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="rounded-lg p-2 text-[#A8A18F] transition hover:bg-[#FFF4CE] hover:text-[#17140D]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs text-[#D4CDBB]">
                    Current password
                  </label>
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`${inputClass} pr-12`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A18F] transition hover:text-[#FFF4CE]"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#D4CDBB]">New password</label>
                  <div className="relative mt-2">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`${inputClass} pr-12`}
                      placeholder="Minimum 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A18F] transition hover:text-[#FFF4CE]"
                    >
                      {showNewPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#D4CDBB]">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${inputClass} mt-2`}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-[#E8D39A]/25 bg-[#191C1B] p-3 text-xs leading-5 text-[#C1BBAE]">
                This is a front-end demonstration. Connect your authentication
                backend before using this form to change a real password.
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className={secondaryButtonClass}
                >
                  Cancel
                </button>
                <button type="submit" className={primaryButtonClass}>
                  Save password
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="gold-ambient-card fixed bottom-6 right-6 z-[70] flex max-w-[calc(100vw-3rem)] items-center gap-3 rounded-xl bg-[#121414] px-5 py-4 text-sm font-medium text-[#FFF4CE] shadow-2xl">
            <CheckCircle2 size={18} className="gold-card-accent" />
            <span className="gold-card-title">{toast}</span>
            <button
              onClick={() => setToast("")}
              className="gold-card-muted ml-2 text-[#A8A18F] transition hover:text-[#17140D]"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Champagne hover, outer glow & mobile touch effects — scoped to this page */}
      <style jsx global>{`
        .security-page .gold-ambient-card {
          position: relative;
          isolation: isolate;
          background-color: #121414;
          color: #f5f1e6;
          border: 1px solid rgba(232, 211, 154, 0.55);
          box-shadow:
            0 0 14px rgba(232, 211, 154, 0.18),
            0 0 30px rgba(201, 164, 92, 0.12),
            0 10px 24px rgba(18, 20, 20, 0.14);
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          transition:
            transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.32s ease,
            box-shadow 0.32s ease,
            background 0.32s ease,
            color 0.32s ease;
        }

        .security-page .gold-ambient-card::before {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: inherit;
          pointer-events: none;
          z-index: -1;
          background: radial-gradient(
            ellipse at center,
            rgba(255, 244, 206, 0.38) 0%,
            rgba(232, 211, 154, 0.24) 40%,
            rgba(201, 164, 92, 0.12) 70%,
            transparent 100%
          );
          filter: blur(22px);
          opacity: 0;
          transition: opacity 0.32s ease;
        }

        .security-page .gold-ambient-card:hover,
        .security-page .gold-ambient-card:active,
        .security-page .gold-ambient-card:focus-visible {
          background: linear-gradient(
            135deg,
            #fff4ce 0%,
            #e8d39a 52%,
            #c9a45c 100%
          ) !important;
          color: #17140d !important;
          border-color: #fff4ce !important;
          box-shadow:
            0 0 18px rgba(255, 244, 206, 0.68),
            0 0 38px rgba(232, 211, 154, 0.48),
            0 0 64px rgba(201, 164, 92, 0.32),
            inset 0 1px 0 rgba(255, 255, 255, 0.72) !important;
        }

        .security-page .gold-ambient-card:hover .gold-card-title,
        .security-page .gold-ambient-card:active .gold-card-title,
        .security-page .gold-ambient-card:focus-visible .gold-card-title,
        .security-page .gold-ambient-card:hover .gold-card-accent,
        .security-page .gold-ambient-card:active .gold-card-accent,
        .security-page .gold-ambient-card:focus-visible .gold-card-accent {
          color: #17140d !important;
        }

        .security-page .gold-ambient-card:hover .gold-card-muted,
        .security-page .gold-ambient-card:active .gold-card-muted,
        .security-page .gold-ambient-card:focus-visible .gold-card-muted {
          color: rgba(23, 20, 13, 0.8) !important;
        }

        .security-page .gold-ambient-card:hover .gold-card-icon,
        .security-page .gold-ambient-card:active .gold-card-icon,
        .security-page .gold-ambient-card:focus-visible .gold-card-icon {
          background-color: rgba(23, 20, 13, 0.14) !important;
          color: #17140d !important;
        }

        .security-page .gold-ambient-card:hover .gold-card-pill,
        .security-page .gold-ambient-card:active .gold-card-pill,
        .security-page .gold-ambient-card:focus-visible .gold-card-pill {
          background-color: rgba(23, 20, 13, 0.14) !important;
          border-color: rgba(23, 20, 13, 0.25) !important;
          color: #17140d !important;
        }

        .security-page .gold-ambient-card:hover .gold-card-subpanel,
        .security-page .gold-ambient-card:active .gold-card-subpanel,
        .security-page .gold-ambient-card:focus-visible .gold-card-subpanel {
          background-color: rgba(23, 20, 13, 0.12) !important;
          border-color: rgba(23, 20, 13, 0.22) !important;
          color: #17140d !important;
        }

        .security-page .gold-ambient-card:hover .gold-card-track,
        .security-page .gold-ambient-card:active .gold-card-track {
          background-color: rgba(23, 20, 13, 0.18) !important;
        }

        .security-page .gold-ambient-card:hover .gold-card-bar,
        .security-page .gold-ambient-card:active .gold-card-bar {
          background: #17140d !important;
        }

        .security-page .gold-ambient-card:hover .gold-card-divider,
        .security-page .gold-ambient-card:active .gold-card-divider {
          border-color: rgba(23, 20, 13, 0.2) !important;
        }

        .security-page .gold-ambient-card:hover .gold-table-head,
        .security-page .gold-ambient-card:active .gold-table-head {
          color: rgba(23, 20, 13, 0.78) !important;
          border-color: rgba(23, 20, 13, 0.2) !important;
        }

        .security-page .gold-ambient-card:hover .gold-table-row,
        .security-page .gold-ambient-card:active .gold-table-row {
          border-color: rgba(23, 20, 13, 0.14) !important;
        }

        .security-page .gold-ambient-card:hover::before,
        .security-page .gold-ambient-card:active::before,
        .security-page .gold-ambient-card:focus-visible::before {
          opacity: 1;
        }

        @media (hover: hover) and (pointer: fine) {
          .security-page .gold-ambient-card:hover {
            transform: translateY(-3px);
          }
        }

        @media (hover: none) {
          .security-page .gold-ambient-card:active {
            transform: scale(0.99);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .security-page .gold-ambient-card,
          .security-page .gold-ambient-card::before {
            transition: none;
          }

          .security-page .gold-ambient-card:hover,
          .security-page .gold-ambient-card:active {
            transform: none;
          }
        }
      `}</style>
    </main>
  );
}