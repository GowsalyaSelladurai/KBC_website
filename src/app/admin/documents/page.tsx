
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  FileText,
  Files,
  FileCheck,
  Clock,
  AlertTriangle,
  Search,
  Plus,
  Upload,
  Download,
  Eye,
  Pencil,
  Trash2,
  X,
  Check,
  XCircle,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  MoreVertical,
  Filter,
  ChevronDown,
  CalendarDays,
  User,
  Hash,
  Sparkles,
  Printer,
  RefreshCw,
  ShieldCheck,
  FolderOpen,
  ArrowUpRight,
} from "lucide-react";

type Category =
  | "Certificate"
  | "Student Record"
  | "Staff Document"
  | "Course Material"
  | "Academy Document"
  | "Other";

type Status = "Approved" | "Pending" | "Rejected";

type DocumentItem = {
  id: string;
  title: string;
  category: Category;
  fileName: string;
  fileType: string;
  fileSize: string;
  owner: string;
  ownerType: "Student" | "Staff" | "Academy";
  course: string;
  status: Status;
  issueDate: string;
  expiryDate: string;
  certificateNumber: string;
  notes: string;
  fileData?: string;
};

const STORAGE_KEY = "kbc_documents_v1";

const categories: Category[] = [
  "Certificate",
  "Student Record",
  "Staff Document",
  "Course Material",
  "Academy Document",
  "Other",
];

const initialDocuments: DocumentItem[] = [
  {
    id: "DOC-1001",
    title: "Professional Makeup Certificate",
    category: "Certificate",
    fileName: "professional-makeup-certificate.pdf",
    fileType: "PDF",
    fileSize: "245 KB",
    owner: "Priya Sharma",
    ownerType: "Student",
    course: "Professional Makeup",
    status: "Approved",
    issueDate: "2026-10-15",
    expiryDate: "",
    certificateNumber: "KBC-CERT-2026-001",
    notes: "Course completion certificate.",
  },
  {
    id: "DOC-1002",
    title: "Hair Styling Course Certificate",
    category: "Certificate",
    fileName: "hair-styling-certificate.pdf",
    fileType: "PDF",
    fileSize: "180 KB",
    owner: "Ananya Kumar",
    ownerType: "Student",
    course: "Advanced Hair Styling",
    status: "Pending",
    issueDate: "2026-11-20",
    expiryDate: "",
    certificateNumber: "KBC-CERT-2026-002",
    notes: "Awaiting academy approval.",
  },
  {
    id: "DOC-1003",
    title: "Student Admission Form",
    category: "Student Record",
    fileName: "student-admission-form.pdf",
    fileType: "PDF",
    fileSize: "120 KB",
    owner: "Meena Raj",
    ownerType: "Student",
    course: "Beauty Therapy",
    status: "Approved",
    issueDate: "2026-09-10",
    expiryDate: "",
    certificateNumber: "",
    notes: "Admission documentation.",
  },
  {
    id: "DOC-1004",
    title: "Staff Employment Agreement",
    category: "Staff Document",
    fileName: "employment-agreement.pdf",
    fileType: "PDF",
    fileSize: "310 KB",
    owner: "Divya Lakshmi",
    ownerType: "Staff",
    course: "Administration",
    status: "Approved",
    issueDate: "2026-01-01",
    expiryDate: "2027-01-01",
    certificateNumber: "",
    notes: "Employment agreement.",
  },
  {
    id: "DOC-1005",
    title: "Beauty Therapy Study Material",
    category: "Course Material",
    fileName: "beauty-therapy-notes.pdf",
    fileType: "PDF",
    fileSize: "1.2 MB",
    owner: "KBC Academy",
    ownerType: "Academy",
    course: "Beauty Therapy",
    status: "Approved",
    issueDate: "2026-08-12",
    expiryDate: "",
    certificateNumber: "",
    notes: "Course learning material.",
  },
  {
    id: "DOC-1006",
    title: "Academy Registration Document",
    category: "Academy Document",
    fileName: "academy-registration.pdf",
    fileType: "PDF",
    fileSize: "420 KB",
    owner: "KBC Academy",
    ownerType: "Academy",
    course: "Administration",
    status: "Approved",
    issueDate: "2025-12-01",
    expiryDate: "2026-12-15",
    certificateNumber: "",
    notes: "Academy registration record.",
  },
];

const categoryConfig: Record<
  Category,
  { icon: typeof FileText; color: string; bg: string }
> = {
  Certificate: {
    icon: Award,
    color: "#EFE8A8",
    bg: "rgba(239,232,168,0.12)",
  },
  "Student Record": {
    icon: GraduationCap,
    color: "#B9A0E8",
    bg: "rgba(185,160,232,0.12)",
  },
  "Staff Document": {
    icon: Users,
    color: "#91BCE6",
    bg: "rgba(145,188,230,0.12)",
  },
  "Course Material": {
    icon: BookOpen,
    color: "#D7A4C9",
    bg: "rgba(215,164,201,0.12)",
  },
  "Academy Document": {
    icon: Building2,
    color: "#8DCBA5",
    bg: "rgba(141,203,165,0.12)",
  },
  Other: {
    icon: Files,
    color: "#E3A477",
    bg: "rgba(227,164,119,0.12)",
  },
};

const statusConfig: Record<Status, { color: string; bg: string }> = {
  Approved: {
    color: "#8DCBA5",
    bg: "rgba(141,203,165,0.12)",
  },
  Pending: {
    color: "#E7AD75",
    bg: "rgba(231,173,117,0.12)",
  },
  Rejected: {
    color: "#F18C8C",
    bg: "rgba(241,140,140,0.12)",
  },
};

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileType(name: string) {
  const extension = name.split(".").pop()?.toUpperCase() || "FILE";
  return extension;
}

function isExpired(expiryDate: string) {
  if (!expiryDate) return false;
  const date = new Date(`${expiryDate}T23:59:59`);
  return date.getTime() < Date.now();
}

function isExpiringSoon(expiryDate: string) {
  if (!expiryDate || isExpired(expiryDate)) return false;

  const expiry = new Date(`${expiryDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days =
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  return days >= 0 && days <= 30;
}

function getStatus(item: DocumentItem): Status {
  return item.status;
}

function escapeCsv(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "All" | "Certificates" | "Documents" | "Pending"
  >("All");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] =
    useState<DocumentItem | null>(null);
  const [previewDocument, setPreviewDocument] =
    useState<DocumentItem | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    title: "",
    category: "Certificate" as Category,
    owner: "",
    ownerType: "Student" as DocumentItem["ownerType"],
    course: "",
    status: "Pending" as Status,
    issueDate: new Date().toISOString().slice(0, 10),
    expiryDate: "",
    certificateNumber: "",
    notes: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);
        setDocuments(Array.isArray(parsed) ? parsed : initialDocuments);
      } else {
        setDocuments(initialDocuments);
      }
    } catch {
      setDocuments(initialDocuments);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }, [documents, loaded]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const totalDocuments = documents.length;

  const certificateCount = documents.filter(
    (item) => item.category === "Certificate"
  ).length;

  const pendingCount = documents.filter(
    (item) => item.status === "Pending"
  ).length;

  const approvedCount = documents.filter(
    (item) => item.status === "Approved"
  ).length;

  const expiredCount = documents.filter(
    (item) =>
      item.status === "Approved" && isExpired(item.expiryDate)
  ).length;

  const expiringCount = documents.filter(
    (item) =>
      item.status === "Approved" &&
      isExpiringSoon(item.expiryDate)
  ).length;

  const filteredDocuments = useMemo(() => {
    return documents
      .filter((item) => {
        if (activeTab === "Certificates") {
          return item.category === "Certificate";
        }
        if (activeTab === "Documents") {
          return item.category !== "Certificate";
        }
        if (activeTab === "Pending") {
          return item.status === "Pending";
        }
        return true;
      })
      .filter((item) => {
        return (
          categoryFilter === "All" ||
          item.category === categoryFilter
        );
      })
      .filter((item) => {
        return statusFilter === "All" || item.status === statusFilter;
      })
      .filter((item) => {
        const term = search.toLowerCase();
        return [
          item.title,
          item.owner,
          item.course,
          item.fileName,
          item.certificateNumber,
          item.category,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);
      })
      .sort(
        (a, b) =>
          new Date(b.issueDate).getTime() -
          new Date(a.issueDate).getTime()
      );
  }, [documents, activeTab, categoryFilter, statusFilter, search]);

  const resetForm = () => {
    setForm({
      title: "",
      category: "Certificate",
      owner: "",
      ownerType: "Student",
      course: "",
      status: "Pending",
      issueDate: new Date().toISOString().slice(0, 10),
      expiryDate: "",
      certificateNumber: "",
      notes: "",
    });
    setSelectedFile(null);
    setEditingDocument(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (item: DocumentItem) => {
    setEditingDocument(item);
    setForm({
      title: item.title,
      category: item.category,
      owner: item.owner,
      ownerType: item.ownerType,
      course: item.course,
      status: item.status,
      issueDate: item.issueDate,
      expiryDate: item.expiryDate,
      certificateNumber: item.certificateNumber,
      notes: item.notes,
    });
    setSelectedFile(null);
    setShowForm(true);
    setMenuId(null);
  };

  const saveDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.title.trim() || !form.owner.trim()) {
      setToast("Please enter a document title and owner");
      return;
    }

    if (
      form.category === "Certificate" &&
      !form.certificateNumber.trim()
    ) {
      setToast("Please enter a certificate number");
      return;
    }

    let fileName = editingDocument?.fileName || "No file attached";
    let fileType = editingDocument?.fileType || "FILE";
    let fileSize = editingDocument?.fileSize || "—";
    let fileData = editingDocument?.fileData;

    if (selectedFile) {
      if (selectedFile.size > 3 * 1024 * 1024) {
        setToast("Please select a file smaller than 3 MB");
        return;
      }

      const allowed = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
      ];

      if (
        !allowed.includes(selectedFile.type) &&
        !/\.(pdf|doc|docx|jpg|jpeg|png)$/i.test(selectedFile.name)
      ) {
        setToast("Unsupported file format");
        return;
      }

      try {
        fileData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
      } catch {
        setToast("Could not read the selected file");
        return;
      }

      fileName = selectedFile.name;
      fileType = getFileType(selectedFile.name);
      fileSize = getFileSize(selectedFile.size);
    }

    const item: DocumentItem = {
      id: editingDocument?.id || `DOC-${Date.now()}`,
      ...form,
      fileName,
      fileType,
      fileSize,
      fileData,
    };

    if (editingDocument) {
      setDocuments((current) =>
        current.map((doc) => (doc.id === item.id ? item : doc))
      );
      setToast("Document updated successfully");
    } else {
      setDocuments((current) => [item, ...current]);
      setToast("Document added successfully");
    }

    setShowForm(false);
    resetForm();
  };

  const deleteDocument = (id: string) => {
    const item = documents.find((doc) => doc.id === id);
    if (!item) return;

    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) {
      return;
    }

    setDocuments((current) => current.filter((doc) => doc.id !== id));
    setMenuId(null);
    setToast("Document deleted");
  };

  const updateStatus = (id: string, status: Status) => {
    setDocuments((current) =>
      current.map((doc) => (doc.id === id ? { ...doc, status } : doc))
    );
    setMenuId(null);
    setToast(`Document marked as ${status.toLowerCase()}`);
  };

  const downloadDocument = (item: DocumentItem) => {
    if (!item.fileData) {
      setToast("No uploaded file is available for this document");
      return;
    }

    const link = document.createElement("a");
    link.href = item.fileData;
    link.download = item.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const exportCsv = () => {
    const headers = [
      "Document ID",
      "Title",
      "Category",
      "Owner",
      "Owner Type",
      "Course",
      "Status",
      "File Name",
      "Issue Date",
      "Expiry Date",
      "Certificate Number",
      "Notes",
    ];

    const rows = filteredDocuments.map((item) => [
      item.id,
      item.title,
      item.category,
      item.owner,
      item.ownerType,
      item.course,
      item.status,
      item.fileName,
      item.issueDate,
      item.expiryDate,
      item.certificateNumber,
      item.notes,
    ]);

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kbc-documents-register.csv";
    link.click();
    URL.revokeObjectURL(url);

    setToast("Document register exported");
  };

  const createCertificate = () => {
    setForm({
      title: "",
      category: "Certificate",
      owner: "",
      ownerType: "Student",
      course: "",
      status: "Pending",
      issueDate: new Date().toISOString().slice(0, 10),
      expiryDate: "",
      certificateNumber: `KBC-CERT-${new Date().getFullYear()}-${String(
        certificateCount + 1
      ).padStart(3, "0")}`,
      notes: "",
    });
    setEditingDocument(null);
    setSelectedFile(null);
    setShowForm(true);
  };

  const previewCertificate = (item: DocumentItem) => {
    setPreviewDocument(item);
    setMenuId(null);
  };

  const downloadCertificatePreview = (item: DocumentItem) => {
    const certificate = `
KBC SALON ACADEMY

CERTIFICATE OF COMPLETION

This is to certify that

${item.owner.toUpperCase()}

has successfully completed

${item.course || item.title}

Certificate Number: ${item.certificateNumber}
Issue Date: ${formatDate(item.issueDate)}

KBC SALON ACADEMY
    `.trim();

    const blob = new Blob([certificate], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${item.certificateNumber || item.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { name: "All", count: totalDocuments },
    { name: "Certificates", count: certificateCount },
    {
      name: "Documents",
      count: documents.filter((d) => d.category !== "Certificate").length,
    },
    { name: "Pending", count: pendingCount },
  ] as const;

  return (
    <main className="min-h-screen bg-[#121414] p-4 text-[#F5F2E9] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-7">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#A9A58A]">
              <Sparkles size={14} />
              KBC Admin Center
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Certificates & Documents
            </h1>

            <p className="mt-2 text-sm text-[#92968E]">
              Organize student certificates, academy records and important documents.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportCsv}
              className="flex items-center gap-2 rounded-xl border border-[#41473E] px-4 py-3 text-sm text-[#DAD6C8] transition hover:border-[#EFE8A8] hover:text-[#EFE8A8]"
            >
              <Download size={17} />
              Export CSV
            </button>

            <button
              onClick={openAddForm}
              className="flex items-center gap-2 rounded-xl bg-[#EFE8A8] px-4 py-3 text-sm font-semibold text-[#24251F] transition hover:bg-[#DED49A]"
            >
              <Plus size={17} />
              Add document
            </button>
          </div>
        </div>

        {/* Overview cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Documents",
              value: totalDocuments,
              icon: Files,
              color: "#EFE8A8",
              note: "All stored records",
            },
            {
              label: "Certificates Issued",
              value: certificateCount,
              icon: Award,
              color: "#B9A0E8",
              note: "Certificate records",
            },
            {
              label: "Pending Approval",
              value: pendingCount,
              icon: Clock3,
              color: "#E7AD75",
              note: "Waiting for review",
            },
            {
              label: "Expiring Soon",
              value: expiringCount,
              icon: AlertTriangle,
              color: "#F18C8C",
              note: `${expiredCount} expired`,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="group rounded-2xl border border-[#303530] bg-[#1B1F1D] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#77745D]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#A1A49B]">{item.label}</p>
                  <div
                    className="rounded-xl p-3"
                    style={{ backgroundColor: `${item.color}16` }}
                  >
                    <Icon size={19} style={{ color: item.color }} />
                  </div>
                </div>

                <p className="mt-4 text-3xl font-semibold">{item.value}</p>
                <p className="mt-2 text-xs text-[#777D74]">{item.note}</p>
              </div>
            );
          })}
        </section>

        {/* Expiry alert */}
        {(expiringCount > 0 || expiredCount > 0) && (
          <div className="flex flex-col gap-3 rounded-xl border border-[#A67D4B]/30 bg-[#E7AD75]/[0.06] p-4 sm:flex-row sm:items-center">
            <AlertTriangle size={21} className="shrink-0 text-[#E7AD75]" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#E7AD75]">
                Document expiry reminder
              </p>
              <p className="mt-1 text-xs text-[#AFA99A]">
                {expiredCount} expired document(s) and {expiringCount} document(s)
                expiring within 30 days. Please review them.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveTab("Documents");
                setCategoryFilter("All");
                setStatusFilter("All");
                setSearch("");
              }}
              className="text-xs font-semibold text-[#EFE8A8] hover:underline"
            >
              Review documents →
            </button>
          </div>
        )}

        {/* Category shortcuts */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {categories.map((category) => {
            const config = categoryConfig[category];
            const Icon = config.icon;
            const count = documents.filter(
              (item) => item.category === category
            ).length;

            return (
              <button
                key={category}
                onClick={() => {
                  setCategoryFilter(category);
                  setActiveTab("All");
                }}
                className={`rounded-xl border bg-[#1B1F1D] p-4 text-left transition hover:-translate-y-1 ${
                  categoryFilter === category
                    ? "border-[#EFE8A8]/60"
                    : "border-[#303530] hover:border-[#666B58]"
                }`}
              >
                <div
                  className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: config.bg }}
                >
                  <Icon size={18} style={{ color: config.color }} />
                </div>
                <p className="text-xs font-medium text-[#C8CBBF]">
                  {category}
                </p>
                <p className="mt-2 text-lg font-semibold">{count}</p>
              </button>
            );
          })}
        </section>

        {/* Document Register */}
        <section className="overflow-hidden rounded-2xl border border-[#303530] bg-[#1B1F1D]">
          <div className="border-b border-[#303530] p-4 sm:p-6">
            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
              <div>
                <h2 className="text-lg font-semibold">Document Register</h2>
                <p className="mt-1 text-xs text-[#858B82]">
                  View and manage all academy documents in one place.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777D74]"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search documents..."
                    className="w-full rounded-xl border border-[#383E38] bg-[#141816] py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#747B72] focus:border-[#A9A58A] sm:w-64"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-xl border border-[#383E38] bg-[#141816] px-4 py-3 text-sm text-[#D5D2C7] outline-none focus:border-[#A9A58A]"
                >
                  <option value="All">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-[#383E38] bg-[#141816] px-4 py-3 text-sm text-[#D5D2C7] outline-none focus:border-[#A9A58A]"
                >
                  <option value="All">All statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`rounded-xl px-4 py-2.5 text-sm transition ${
                    activeTab === tab.name
                      ? "bg-[#EFE8A8] font-semibold text-[#25261F]"
                      : "border border-[#363C36] text-[#AEB3A9] hover:border-[#77745D] hover:text-[#EFE8A8]"
                  }`}
                >
                  {tab.name}
                  <span className="ml-2 text-xs opacity-70">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-[#151A17] text-[10px] uppercase tracking-wider text-[#858B82]">
                <tr>
                  <th className="px-5 py-4 font-medium">Document</th>
                  <th className="px-5 py-4 font-medium">Owner</th>
                  <th className="px-5 py-4 font-medium">Category</th>
                  <th className="px-5 py-4 font-medium">Issue date</th>
                  <th className="px-5 py-4 font-medium">Expiry</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#303530]">
                {filteredDocuments.map((item) => {
                  const category = categoryConfig[item.category];
                  const CategoryIcon = category.icon;
                  const status = statusConfig[getStatus(item)];

                  const expired = isExpired(item.expiryDate);
                  const expiring = isExpiringSoon(item.expiryDate);

                  return (
                    <tr
                      key={item.id}
                      className="transition hover:bg-[#252B26]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="rounded-xl p-3"
                            style={{ backgroundColor: category.bg }}
                          >
                            <CategoryIcon
                              size={19}
                              style={{ color: category.color }}
                            />
                          </div>
                          <div>
                            <p className="max-w-[250px] truncate text-sm font-medium text-[#E0E1D7]">
                              {item.title}
                            </p>
                            <p className="mt-1 text-xs text-[#777D74]">
                              {item.fileName}
                            </p>
                            <p className="mt-1 text-[10px] text-[#777D74]">
                              {item.fileType} · {item.fileSize}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-[#C6C9BE]">
                          {item.owner}
                        </p>
                        <p className="mt-1 text-xs text-[#777D74]">
                          {item.ownerType}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className="rounded-lg px-2.5 py-1.5 text-[10px]"
                          style={{
                            color: category.color,
                            backgroundColor: category.bg,
                          }}
                        >
                          {item.category}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-[#AEB3A9]">
                        {formatDate(item.issueDate)}
                      </td>

                      <td className="px-5 py-4">
                        {item.expiryDate ? (
                          <div>
                            <p
                              className={`text-xs ${
                                expired
                                  ? "text-[#F18C8C]"
                                  : expiring
                                  ? "text-[#E7AD75]"
                                  : "text-[#AEB3A9]"
                              }`}
                            >
                              {formatDate(item.expiryDate)}
                            </p>
                            {expired && (
                              <span className="mt-1 block text-[10px] text-[#F18C8C]">
                                Expired
                              </span>
                            )}
                            {!expired && expiring && (
                              <span className="mt-1 block text-[10px] text-[#E7AD75]">
                                Expiring soon
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-[#6F786D]">No expiry</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className="rounded-lg px-2.5 py-1.5 text-[10px] font-semibold"
                          style={{
                            color: status.color,
                            backgroundColor: status.bg,
                          }}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            title="Preview"
                            onClick={() => previewCertificate(item)}
                            className="rounded-lg p-2 text-[#9EA497] transition hover:bg-[#EFE8A8]/10 hover:text-[#EFE8A8]"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            title="Download"
                            onClick={() => downloadDocument(item)}
                            className="rounded-lg p-2 text-[#9EA497] transition hover:bg-[#8DCBA5]/10 hover:text-[#8DCBA5]"
                          >
                            <Download size={16} />
                          </button>

                          <div className="relative">
                            <button
                              onClick={() =>
                                setMenuId(
                                  menuId === item.id ? null : item.id
                                )
                              }
                              className="rounded-lg p-2 text-[#9EA497] hover:bg-[#303630] hover:text-white"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {menuId === item.id && (
                              <div className="absolute right-0 top-9 z-30 w-48 rounded-xl border border-[#42483F] bg-[#202521] p-1 shadow-2xl">
                                <button
                                  onClick={() => openEditForm(item)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-[#D2D4CA] hover:bg-[#303630]"
                                >
                                  <Pencil size={14} /> Edit details
                                </button>

                                {item.status !== "Approved" && (
                                  <button
                                    onClick={() =>
                                      updateStatus(item.id, "Approved")
                                    }
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-[#8DCBA5] hover:bg-[#8DCBA5]/10"
                                  >
                                    <Check size={14} /> Approve
                                  </button>
                                )}

                                {item.status !== "Rejected" && (
                                  <button
                                    onClick={() =>
                                      updateStatus(item.id, "Rejected")
                                    }
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-[#E7AD75] hover:bg-[#E7AD75]/10"
                                  >
                                    <XCircle size={14} /> Reject
                                  </button>
                                )}

                                <button
                                  onClick={() => deleteDocument(item.id)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-[#F18C8C] hover:bg-[#F18C8C]/10"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredDocuments.length === 0 && (
              <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
                <FolderOpen size={35} className="text-[#777D74]" />
                <h3 className="mt-4 text-base font-semibold">
                  No documents found
                </h3>
                <p className="mt-2 text-sm text-[#858B82]">
                  Try changing your filters or add a new document.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setCategoryFilter("All");
                    setStatusFilter("All");
                    setActiveTab("All");
                  }}
                  className="mt-4 text-xs text-[#EFE8A8] hover:underline"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between gap-2 border-t border-[#303530] px-5 py-4 text-xs text-[#777D74] sm:flex-row">
            <span>
              Showing {filteredDocuments.length} of {documents.length} records
            </span>
            <span>Document register · KBC Salon Academy</span>
          </div>
        </section>

        {/* Add / Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
            <form
              onSubmit={saveDocument}
              className="my-6 w-full max-w-3xl rounded-2xl border border-[#454A40] bg-[#1B1F1D] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#343A33] p-5 sm:p-6">
                <div>
                  <h2 className="text-lg font-semibold">
                    {editingDocument ? "Edit document" : "Add new document"}
                  </h2>
                  <p className="mt-1 text-xs text-[#858B82]">
                    Enter the document details below.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="rounded-lg p-2 text-[#92988D] hover:bg-[#303630]"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
                <div className="sm:col-span-2">
                  <label className="text-xs text-[#B9BDB3]">
                    Document title *
                  </label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="Enter document title"
                    className="mt-2 w-full rounded-xl border border-[#454A40] bg-[#141816] px-4 py-3 text-sm outline-none focus:border-[#EFE8A8]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#B9BDB3]">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value as Category,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-[#454A40] bg-[#141816] px-4 py-3 text-sm outline-none focus:border-[#EFE8A8]"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#B9BDB3]">
                    Owner type *
                  </label>
                  <select
                    value={form.ownerType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        ownerType: e.target.value as DocumentItem["ownerType"],
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-[#454A40] bg-[#141816] px-4 py-3 text-sm outline-none focus:border-[#EFE8A8]"
                  >
                    <option value="Student">Student</option>
                    <option value="Staff">Staff</option>
                    <option value="Academy">Academy</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#B9BDB3]">
                    Owner name *
                  </label>
                  <input
                    required
                    value={form.owner}
                    onChange={(e) =>
                      setForm({ ...form, owner: e.target.value })
                    }
                    placeholder="Student / Staff / Academy name"
                    className="mt-2 w-full rounded-xl border border-[#454A40] bg-[#141816] px-4 py-3 text-sm outline-none focus:border-[#EFE8A8]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#B9BDB3]">
                    Course / Department
                  </label>
                  <input
                    value={form.course}
                    onChange={(e) =>
                      setForm({ ...form, course: e.target.value })
                    }
                    placeholder="Enter course or department"
                    className="mt-2 w-full rounded-xl border border-[#454A40] bg-[#141816] px-4 py-3 text-sm outline-none focus:border-[#EFE8A8]"
                  />
                </div>

                {form.category === "Certificate" && (
                  <div>
                    <label className="text-xs text-[#B9BDB3]">
                      Certificate number *
                    </label>
                    <input
                      required
                      value={form.certificateNumber}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          certificateNumber: e.target.value,
                        })
                      }
                      placeholder="KBC-CERT-2026-001"
                      className="mt-2 w-full rounded-xl border border-[#454A40] bg-[#141816] px-4 py-3 text-sm outline-none focus:border-[#EFE8A8]"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs text-[#B9BDB3]">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as Status,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-[#454A40] bg-[#141816] px-4 py-3 text-sm outline-none focus:border-[#EFE8A8]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#B9BDB3]">
                    Issue date
                  </label>
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) =>
                      setForm({ ...form, issueDate: e.target.value })
                    }
                    className="mt-2 w-full rounded-xl border border-[#454A40] bg-[#141816] px-4 py-3 text-sm text-white outline-none focus:border-[#EFE8A8]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#B9BDB3]">
                    Expiry date (optional)
                  </label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) =>
                      setForm({ ...form, expiryDate: e.target.value })
                    }
                    className="mt-2 w-full rounded-xl border border-[#454A40] bg-[#141816] px-4 py-3 text-sm text-white outline-none focus:border-[#EFE8A8]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-[#B9BDB3]">
                    Upload file
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#666B58] bg-[#141816] px-5 py-7 text-center transition hover:border-[#EFE8A8] hover:bg-[#EFE8A8]/5"
                  >
                    <Upload size={25} className="text-[#EFE8A8]" />
                    <p className="mt-3 text-sm text-[#D2D4CA]">
                      {selectedFile
                        ? selectedFile.name
                        : "Click to upload a document"}
                    </p>
                    <p className="mt-1 text-xs text-[#777D74]">
                      PDF, DOC, DOCX, JPG, PNG · Maximum 3 MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-[#B9BDB3]">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    placeholder="Additional information..."
                    className="mt-2 w-full resize-none rounded-xl border border-[#454A40] bg-[#141816] px-4 py-3 text-sm outline-none focus:border-[#EFE8A8]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#343A33] p-5 sm:p-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="rounded-xl border border-[#454A40] px-5 py-3 text-xs text-[#B8BDB2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-[#EFE8A8] px-6 py-3 text-xs font-semibold text-[#24251F] transition hover:bg-[#DED49A]"
                >
                  <Check size={15} />
                  {editingDocument ? "Save changes" : "Add document"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Preview modal */}
        {previewDocument && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
            onClick={() => setPreviewDocument(null)}
          >
            <div
              className="my-6 w-full max-w-2xl overflow-hidden rounded-2xl border border-[#555746] bg-[#1B1F1D] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#343A33] p-5">
                <div>
                  <h2 className="font-semibold">Document preview</h2>
                  <p className="mt-1 text-xs text-[#858B82]">
                    {previewDocument.fileName}
                  </p>
                </div>
                <button
                  onClick={() => setPreviewDocument(null)}
                  className="rounded-lg p-2 text-[#92988D] hover:bg-[#303630]"
                >
                  <X size={19} />
                </button>
              </div>

              {previewDocument.category === "Certificate" ? (
                <div className="m-5 border border-[#B6A96C] bg-[#F5F0D9] p-6 text-center text-[#292A22] sm:m-8 sm:p-10">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#9C8E4D]">
                    <Award size={30} className="text-[#8B783C]" />
                  </div>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#7E713D]">
                    KBC Salon Academy
                  </p>
                  <h3 className="mt-5 font-serif text-2xl font-bold sm:text-3xl">
                    Certificate of Completion
                  </h3>
                  <p className="mt-6 text-sm text-[#55513D]">
                    This is proudly presented to
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-[#5B4A20]">
                    {previewDocument.owner}
                  </p>
                  <p className="mt-5 text-sm text-[#55513D]">
                    for successfully completing
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {previewDocument.course || previewDocument.title}
                  </p>

                  <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[#C9BE92] pt-5 text-left text-xs">
                    <div>
                      <p className="text-[#82764C]">Certificate number</p>
                      <p className="mt-1 font-semibold">
                        {previewDocument.certificateNumber || "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#82764C]">Issue date</p>
                      <p className="mt-1 font-semibold">
                        {formatDate(previewDocument.issueDate)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-8 text-[10px] uppercase tracking-wider text-[#8A805C]">
                    KBC Salon Academy · Certificate preview
                  </p>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileText
                    size={45}
                    className="mx-auto text-[#EFE8A8]"
                  />
                  <h3 className="mt-4 font-semibold">
                    {previewDocument.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#858B82]">
                    {previewDocument.fileName}
                  </p>
                  <p className="mt-2 text-xs text-[#777D74]">
                    {previewDocument.fileType} · {previewDocument.fileSize}
                  </p>

                  {previewDocument.fileData ? (
                    <p className="mt-4 text-xs text-[#AEB3A9]">
                      Download the uploaded file to view its full contents.
                    </p>
                  ) : (
                    <p className="mt-4 text-xs text-[#AEB3A9]">
                      No uploaded file is attached to this record.
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3 border-t border-[#343A33] p-5">
                {previewDocument.category === "Certificate" && (
                  <button
                    onClick={() =>
                      downloadCertificatePreview(previewDocument)
                    }
                    className="flex items-center gap-2 rounded-xl border border-[#555746] px-4 py-3 text-xs text-[#EFE8A8] hover:bg-[#EFE8A8]/10"
                  >
                    <Download size={15} />
                    Download certificate preview
                  </button>
                )}
                {previewDocument.fileData && (
                  <button
                    onClick={() => downloadDocument(previewDocument)}
                    className="flex items-center gap-2 rounded-xl bg-[#EFE8A8] px-4 py-3 text-xs font-semibold text-[#24251F]"
                  >
                    <Download size={15} />
                    Download uploaded file
                  </button>
                )}
              </div>
            </div>
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
