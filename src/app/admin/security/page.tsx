
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Lock,
  KeyRound,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  EyeOff,
  Bell,
  LogOut,
  Trash2,
  MoreVertical,
  Plus,
  Search,
  X,
  ChevronRight,
  Fingerprint,
  Globe,
  RefreshCw,
  Settings,
  Activity,
  Wifi,
  Copy,
  Check,
  CalendarDays,
  User,
  History,
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

  const days = Math.floor(hours / 24);
  return `${days} days ago`;
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
  const [settings, setSettings] =
    useState<SecuritySettings>(defaultSettings);

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

      setDevices(
        savedDevices ? JSON.parse(savedDevices) : initialDevices
      );
      setActivity(
        savedActivity ? JSON.parse(savedActivity) : initialActivity
      );

      if (savedSettings) {
        setSettings({
          ...defaultSettings,
          ...JSON.parse(savedSettings),
        });
      }
    } catch {
      setDevices(initialDevices);
      setActivity(initialActivity);
      setSettings(defaultSettings);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(DEVICE_KEY, JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
  }, [activity]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

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
        [
          device.name,
          device.type,
          device.browser,
          device.os,
          device.location,
        ]
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
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));

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
    ) {
      return;
    }

    setDevices((current) => current.filter((d) => d.current));
    addActivity("Signed out other listed devices");
    setToast("Other devices removed from this demo list");
  };

  const toggleTrust = (id: string) => {
    setDevices((current) =>
      current.map((device) =>
        device.id === id
          ? { ...device, trusted: !device.trusted }
          : device
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

    // Demo UI only: no actual authentication password is changed.
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
      setTimeout(() => setCopiedIp(false), 1800);
      setToast("Displayed demo IP copied");
    } catch {
      setToast("Could not copy IP address");
    }
  };

  const statusStyle = (status: LoginActivity["status"]) => {
    if (status === "Successful") {
      return "bg-[#8DCBA5]/10 text-[#8DCBA5]";
    }
    if (status === "Failed") {
      return "bg-[#E7AD75]/10 text-[#E7AD75]";
    }
    return "bg-[#F18C8C]/10 text-[#F18C8C]";
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
    <main className="min-h-screen bg-[#121414] p-4 text-[#F5F2E9] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-7">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#A9A58A]">
              <ShieldCheck size={15} />
              KBC Admin Center
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Security & Devices
            </h1>
            <p className="mt-2 text-sm text-[#92968E]">
              Protect your academy account and manage connected devices.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2 rounded-xl border border-[#454A40] px-4 py-3 text-sm text-[#D9D6C9] transition hover:border-[#EFE8A8] hover:text-[#EFE8A8]"
            >
              <KeyRound size={17} />
              Change password
            </button>

            <button
              onClick={signOutOtherDevices}
              className="flex items-center gap-2 rounded-xl bg-[#EFE8A8] px-4 py-3 text-sm font-semibold text-[#24251F] transition hover:bg-[#DED49A]"
            >
              <LogOut size={17} />
              Sign out other devices
            </button>
          </div>
        </div>

        {/* Security score */}
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-[#47493C] bg-gradient-to-br from-[#252A25] to-[#1B1F1D] p-6 sm:p-7 xl:col-span-2">
            <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-[#EFE8A8]/[0.06] blur-3xl" />

            <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2 text-sm text-[#B9BBAE]">
                  <ShieldCheck size={18} className="text-[#EFE8A8]" />
                  Account security score
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-semibold tracking-tight text-[#EFE8A8]">
                    {securityScore}
                  </span>
                  <span className="text-lg text-[#8C9287]">/ 100</span>
                </div>

                <p className="mt-3 max-w-md text-sm leading-6 text-[#92988D]">
                  {securityScore >= 85
                    ? "Your demo security settings are looking strong. Continue reviewing your account regularly."
                    : "Strengthen your account by enabling additional security options."}
                </p>

                <div className="mt-5 h-2 max-w-md overflow-hidden rounded-full bg-[#42483F]">
                  <div
                    className="h-full rounded-full bg-[#EFE8A8] transition-all duration-500"
                    style={{ width: `${securityScore}%` }}
                  />
                </div>
              </div>

              <div className="flex h-32 w-32 shrink-0 items-center justify-center self-center rounded-full border-[7px] border-[#EFE8A8]/20 sm:self-auto">
                <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-[#EFE8A8]/10">
                  <ShieldCheck size={34} className="text-[#EFE8A8]" />
                  <span className="mt-1 text-[10px] uppercase tracking-wider text-[#C4C0A3]">
                    Protected
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
            <div className="rounded-2xl border border-[#303530] bg-[#1B1F1D] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9BA096]">Active devices</span>
                <Monitor size={19} className="text-[#EFE8A8]" />
              </div>
              <div className="mt-3 text-3xl font-semibold">
                {activeDevices}
              </div>
              <p className="mt-1 text-xs text-[#777D74]">
                Listed in this browser demo
              </p>
            </div>

            <div className="rounded-2xl border border-[#303530] bg-[#1B1F1D] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9BA096]">Trusted devices</span>
                <CheckCircle2 size={19} className="text-[#8DCBA5]" />
              </div>
              <div className="mt-3 text-3xl font-semibold">
                {trustedDevices}
              </div>
              <p className="mt-1 text-xs text-[#777D74]">
                Marked as trusted
              </p>
            </div>
          </div>
        </section>

        {/* Alert */}
        {failedLogins > 0 && (
          <div className="flex flex-col gap-3 rounded-xl border border-[#B47C4A]/30 bg-[#E7AD75]/[0.06] p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="shrink-0 text-[#E7AD75]" />
              <div>
                <p className="text-sm font-semibold text-[#E7AD75]">
                  Login activity needs review
                </p>
                <p className="mt-1 text-xs text-[#AFA99A]">
                  {failedLogins} failed or blocked login record(s) appear in
                  the demo activity list.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("Activity")}
              className="ml-auto text-xs font-semibold text-[#EFE8A8] hover:underline"
            >
              Review activity →
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto border-b border-[#303530] pb-3">
          {(
            ["Overview", "Devices", "Activity", "Settings"] as const
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 rounded-xl px-5 py-3 text-sm transition ${
                activeTab === tab
                  ? "bg-[#EFE8A8] font-semibold text-[#24251F]"
                  : "text-[#9CA297] hover:bg-[#242A25] hover:text-[#EFE8A8]"
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
              <div className="rounded-2xl border border-[#303530] bg-[#1B1F1D] p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">Recent devices</h2>
                    <p className="mt-1 text-xs text-[#858B82]">
                      Devices listed for this account demo.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("Devices")}
                    className="text-xs text-[#EFE8A8] hover:underline"
                  >
                    View all
                  </button>
                </div>

                <div className="space-y-3">
                  {devices.slice(0, 3).map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center gap-4 rounded-xl border border-[#343A33] bg-[#151A17] p-4"
                    >
                      <div className="rounded-xl bg-[#EFE8A8]/10 p-3 text-[#EFE8A8]">
                        <DeviceIcon type={device.type} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-medium">
                            {device.name}
                          </p>
                          {device.current && (
                            <span className="rounded-md bg-[#8DCBA5]/10 px-2 py-1 text-[10px] text-[#8DCBA5]">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-[#838A80]">
                          {device.browser} · {device.os}
                        </p>
                        <p className="mt-1 text-xs text-[#6F786D]">
                          {device.location} · {timeAgo(device.lastActive)}
                        </p>
                      </div>

                      <div className="hidden text-xs text-[#8DCBA5] sm:block">
                        {device.trusted ? "Trusted" : "Not trusted"}
                      </div>
                    </div>
                  ))}

                  {devices.length === 0 && (
                    <p className="py-8 text-center text-sm text-[#858B82]">
                      No devices are listed.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-[#303530] bg-[#1B1F1D] p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">Recent login activity</h2>
                    <p className="mt-1 text-xs text-[#858B82]">
                      Latest recorded demo events.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("Activity")}
                    className="text-xs text-[#EFE8A8] hover:underline"
                  >
                    View history
                  </button>
                </div>

                <div className="space-y-4">
                  {activity.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="mt-1">
                        {item.status === "Successful" ? (
                          <CheckCircle2
                            size={18}
                            className="text-[#8DCBA5]"
                          />
                        ) : item.status === "Failed" ? (
                          <AlertTriangle
                            size={18}
                            className="text-[#E7AD75]"
                          />
                        ) : (
                          <ShieldAlert
                            size={18}
                            className="text-[#F18C8C]"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#D6D8CE]">
                          {item.description}
                        </p>
                        <p className="mt-1 text-xs text-[#7F877C]">
                          {item.device} · {item.location}
                        </p>
                      </div>
                      <span className="whitespace-nowrap text-[11px] text-[#747B72]">
                        {timeAgo(item.time)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <div className="rounded-2xl border border-[#303530] bg-[#1B1F1D] p-5">
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-[#EFE8A8]" />
                  <h2 className="font-semibold">Quick security</h2>
                </div>

                <div className="mt-5 space-y-4">
                  {[
                    {
                      label: "Two-factor authentication",
                      enabled: settings.twoFactor,
                    },
                    {
                      label: "Login alerts",
                      enabled: settings.loginAlerts,
                    },
                    {
                      label: "New device alerts",
                      enabled: settings.newDeviceAlerts,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-xs text-[#AEB3A9]">
                        {item.label}
                      </span>
                      <span
                        className={`rounded-md px-2 py-1 text-[10px] ${
                          item.enabled
                            ? "bg-[#8DCBA5]/10 text-[#8DCBA5]"
                            : "bg-[#E7AD75]/10 text-[#E7AD75]"
                        }`}
                      >
                        {item.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setActiveTab("Settings")}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#474C40] py-3 text-xs text-[#EFE8A8] transition hover:bg-[#EFE8A8]/10"
                >
                  Manage security settings
                  <ChevronRight size={15} />
                </button>
              </div>

              <div className="rounded-2xl border border-[#303530] bg-[#1B1F1D] p-5">
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-[#EFE8A8]" />
                  <h2 className="font-semibold">Current session</h2>
                </div>

                {devices.find((d) => d.current) ? (
                  <>
                    <p className="mt-4 text-sm font-medium">
                      {devices.find((d) => d.current)?.name}
                    </p>
                    <p className="mt-1 text-xs text-[#858B82]">
                      {devices.find((d) => d.current)?.browser}
                    </p>
                    <div className="mt-4 flex items-center justify-between rounded-lg bg-[#141816] p-3">
                      <div>
                        <p className="text-[10px] text-[#737A70]">
                          Displayed IP
                        </p>
                        <p className="mt-1 text-xs">
                          {devices.find((d) => d.current)?.ip}
                        </p>
                      </div>
                      <button
                        onClick={copyCurrentIp}
                        className="rounded-lg p-2 text-[#A9A58A] hover:bg-[#303630]"
                      >
                        {copiedIp ? <Check size={15} /> : <Copy size={15} />}
                      </button>
                    </div>
                    <p className="mt-3 text-[10px] leading-5 text-[#737A70]">
                      The displayed device and IP details are sample data,
                      not verified browser or network information.
                    </p>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-[#858B82]">
                    No current device is marked.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Devices */}
        {activeTab === "Devices" && (
          <section className="rounded-2xl border border-[#303530] bg-[#1B1F1D]">
            <div className="flex flex-col justify-between gap-4 border-b border-[#303530] p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <h2 className="font-semibold">Connected devices</h2>
                <p className="mt-1 text-xs text-[#858B82]">
                  Review and manage devices listed in this demo.
                </p>
              </div>

              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777D74]"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search devices..."
                  className="w-full rounded-xl border border-[#383E38] bg-[#141816] py-3 pl-9 pr-3 text-sm outline-none focus:border-[#A9A58A] sm:w-64"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 sm:p-6 lg:grid-cols-2">
              {filteredDevices.map((device) => (
                <div
                  key={device.id}
                  className="relative rounded-2xl border border-[#363C35] bg-[#151A17] p-5 transition hover:border-[#77745D]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-[#EFE8A8]/10 p-3 text-[#EFE8A8]">
                        <DeviceIcon type={device.type} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold">
                            {device.name}
                          </h3>
                          {device.current && (
                            <span className="rounded-md bg-[#8DCBA5]/10 px-2 py-1 text-[9px] text-[#8DCBA5]">
                              Current session
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-[#858B82]">
                          {device.type}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setDeviceMenu(
                          deviceMenu === device.id ? null : device.id
                        )
                      }
                      className="rounded-lg p-2 text-[#858B82] hover:bg-[#303630]"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {deviceMenu === device.id && (
                      <div className="absolute right-5 top-14 z-20 w-48 rounded-xl border border-[#42483F] bg-[#202521] p-1 shadow-2xl">
                        <button
                          onClick={() => {
                            setRenameDevice(device);
                            setRenameValue(device.name);
                            setDeviceMenu(null);
                          }}
                          className="w-full rounded-lg px-3 py-2.5 text-left text-xs text-[#D2D4CA] hover:bg-[#303630]"
                        >
                          Rename device
                        </button>

                        <button
                          onClick={() => toggleTrust(device.id)}
                          className="w-full rounded-lg px-3 py-2.5 text-left text-xs text-[#D2D4CA] hover:bg-[#303630]"
                        >
                          {device.trusted
                            ? "Remove trusted status"
                            : "Mark as trusted"}
                        </button>

                        {!device.current && (
                          <button
                            onClick={() => removeDevice(device.id)}
                            className="w-full rounded-lg px-3 py-2.5 text-left text-xs text-[#F18C8C] hover:bg-[#F18C8C]/10"
                          >
                            Remove device
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 space-y-3 border-t border-[#303630] pt-4">
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
                          <span className="flex items-center gap-2 text-[#7F877C]">
                            <Icon size={14} />
                            {row.label}
                          </span>
                          <span className="text-right text-[#C1C5BA]">
                            {row.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#303630] pt-4">
                    <span
                      className={`flex items-center gap-2 text-xs ${
                        device.trusted
                          ? "text-[#8DCBA5]"
                          : "text-[#E7AD75]"
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {device.trusted ? "Trusted device" : "Not trusted"}
                    </span>
                    <span className="text-[10px] text-[#777D74]">
                      {timeAgo(device.lastActive)}
                    </span>
                  </div>
                </div>
              ))}

              {filteredDevices.length === 0 && (
                <div className="col-span-full py-14 text-center text-sm text-[#858B82]">
                  No matching devices found.
                </div>
              )}
            </div>
          </section>
        )}

        {/* Activity */}
        {activeTab === "Activity" && (
          <section className="overflow-hidden rounded-2xl border border-[#303530] bg-[#1B1F1D]">
            <div className="flex flex-col justify-between gap-3 border-b border-[#303530] p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <h2 className="font-semibold">Login activity</h2>
                <p className="mt-1 text-xs text-[#858B82]">
                  Review successful, failed and blocked sign-in records.
                </p>
              </div>
              <div className="rounded-lg bg-[#EFE8A8]/10 px-3 py-2 text-xs text-[#EFE8A8]">
                {activity.length} records
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="bg-[#151A17] text-[10px] uppercase tracking-wider text-[#858B82]">
                  <tr>
                    <th className="px-5 py-4 font-medium">Device</th>
                    <th className="px-5 py-4 font-medium">Location</th>
                    <th className="px-5 py-4 font-medium">IP address</th>
                    <th className="px-5 py-4 font-medium">Date & time</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#303530]">
                  {activity.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-[#252B26]"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm text-[#D5D8CE]">
                          {item.device}
                        </p>
                        <p className="mt-1 text-xs text-[#777D74]">
                          {item.browser}
                        </p>
                        <p className="mt-1 text-[10px] text-[#777D74]">
                          {item.description}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-xs text-[#AEB3A9]">
                        {item.location}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-[#AEB3A9]">
                        {item.ip}
                      </td>
                      <td className="px-5 py-4 text-xs text-[#AEB3A9]">
                        {formatDate(item.time)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold ${statusStyle(
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
                <p className="py-12 text-center text-sm text-[#858B82]">
                  No login activity recorded.
                </p>
              )}
            </div>
          </section>
        )}

        {/* Settings */}
        {activeTab === "Settings" && (
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="rounded-2xl border border-[#303530] bg-[#1B1F1D] p-5 sm:p-6 xl:col-span-2">
              <div className="mb-6">
                <h2 className="font-semibold">Security preferences</h2>
                <p className="mt-1 text-xs text-[#858B82]">
                  Manage your account protection preferences.
                </p>
              </div>

              <div className="space-y-2">
                {preferenceRows.map((row) => {
                  const Icon = row.icon;
                  const enabled = settings[row.key];

                  return (
                    <div
                      key={row.key}
                      className="flex flex-col justify-between gap-4 rounded-xl border border-[#343A33] bg-[#151A17] p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-[#EFE8A8]/10 p-2.5 text-[#EFE8A8]">
                          <Icon size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">
                            {row.title}
                          </h3>
                          <p className="mt-1 max-w-lg text-xs leading-5 text-[#858B82]">
                            {row.description}
                          </p>
                        </div>
                      </div>

                      <button
                        role="switch"
                        aria-checked={enabled}
                        onClick={() => toggleSetting(row.key)}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                          enabled ? "bg-[#EFE8A8]" : "bg-[#454B43]"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full transition ${
                            enabled
                              ? "left-6 bg-[#24251F]"
                              : "left-1 bg-[#B9BDB3]"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-[#303530] bg-[#1B1F1D] p-5">
                <div className="flex items-center gap-2">
                  <KeyRound size={19} className="text-[#EFE8A8]" />
                  <h2 className="font-semibold">Password</h2>
                </div>
                <p className="mt-3 text-xs leading-6 text-[#858B82]">
                  Update your account password regularly and use a strong,
                  unique password.
                </p>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="mt-5 w-full rounded-xl border border-[#555746] py-3 text-xs font-semibold text-[#EFE8A8] hover:bg-[#EFE8A8]/10"
                >
                  Change password
                </button>
              </div>

              <div className="rounded-2xl border border-[#303530] bg-[#1B1F1D] p-5">
                <div className="flex items-center gap-2">
                  <LogOut size={19} className="text-[#F18C8C]" />
                  <h2 className="font-semibold">Session control</h2>
                </div>
                <p className="mt-3 text-xs leading-6 text-[#858B82]">
                  Remove all other devices from the local demo list.
                </p>
                <button
                  onClick={signOutOtherDevices}
                  className="mt-5 w-full rounded-xl border border-[#A15D5D]/40 py-3 text-xs font-semibold text-[#F18C8C] hover:bg-[#F18C8C]/10"
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
            <div className="w-full max-w-md rounded-2xl border border-[#454A40] bg-[#1B1F1D] p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Rename device</h2>
                <button
                  onClick={() => setRenameDevice(null)}
                  className="rounded-lg p-2 text-[#92988D] hover:bg-[#303630]"
                >
                  <X size={18} />
                </button>
              </div>

              <label className="mt-5 block text-xs text-[#AEB3A9]">
                Device name
              </label>
              <input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#454A40] bg-[#141816] px-4 py-3 text-sm outline-none focus:border-[#EFE8A8]"
                placeholder="Enter device name"
              />

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setRenameDevice(null)}
                  className="rounded-xl border border-[#454A40] px-4 py-3 text-xs text-[#B8BDB2]"
                >
                  Cancel
                </button>
                <button
                  onClick={saveRename}
                  className="rounded-xl bg-[#EFE8A8] px-5 py-3 text-xs font-semibold text-[#24251F]"
                >
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
              className="w-full max-w-md rounded-2xl border border-[#454A40] bg-[#1B1F1D] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Change password</h2>
                  <p className="mt-1 text-xs text-[#858B82]">
                    Enter your current and new password.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="rounded-lg p-2 text-[#92988D] hover:bg-[#303630]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs text-[#AEB3A9]">
                    Current password
                  </label>
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-xl border border-[#454A40] bg-[#141816] px-4 py-3 pr-12 text-sm outline-none focus:border-[#EFE8A8]"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#858B82]"
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#AEB3A9]">
                    New password
                  </label>
                  <div className="relative mt-2">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-[#454A40] bg-[#141816] px-4 py-3 pr-12 text-sm outline-none focus:border-[#EFE8A8]"
                      placeholder="Minimum 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(!showNewPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#858B82]"
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
                  <label className="text-xs text-[#AEB3A9]">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#454A40] bg-[#141816] px-4 py-3 text-sm outline-none focus:border-[#EFE8A8]"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-[#EFE8A8]/5 p-3 text-xs leading-5 text-[#AEB3A9]">
                This is a front-end demonstration. Connect your authentication
                backend before using this form to change a real password.
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="rounded-xl border border-[#454A40] px-4 py-3 text-xs text-[#B8BDB2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#EFE8A8] px-5 py-3 text-xs font-semibold text-[#24251F]"
                >
                  Save password
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-[70] flex max-w-[calc(100vw-3rem)] items-center gap-3 rounded-xl border border-[#66644D] bg-[#252A25] px-5 py-4 text-sm text-[#EFE8A8] shadow-2xl">
            <CheckCircle2 size={18} />
            {toast}
            <button
              onClick={() => setToast("")}
              className="ml-2 text-[#92988D] hover:text-white"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
