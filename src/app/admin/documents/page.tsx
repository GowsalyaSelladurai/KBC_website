
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  FileText,
  Files,
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
  MoreVertical,
  Sparkles,
  FolderOpen,
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

/* =========================================
   CATEGORY CONFIG
========================================= */

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

/* =========================================
   REUSABLE STYLES
========================================= */

const cardClass =
  "gold-ambient-card rounded-2xl border border-[#343832] bg-[#121414] p-5";

const inputClass =
  "w-full rounded-xl border border-[#D8CDBB] bg-white px-4 py-3 text-sm text-[#17140D] placeholder:text-[#928879] outline-none transition focus:border-[#C9A45C] focus:ring-2 focus:ring-[#C9A45C]/20";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#EFE8A8] to-[#C9A45C] px-4 py-2.5 text-sm font-semibold text-[#17140D] shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#C9A45C] bg-white px-4 py-2.5 text-sm font-medium text-[#17140D] transition hover:bg-[#FFF4CE] disabled:cursor-not-allowed disabled:opacity-40";

/* =========================================
   HELPERS
========================================= */

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
  return name.split(".").pop()?.toUpperCase() || "FILE";
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

function escapeCsv(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

/* =========================================
   MAIN COMPONENT
========================================= */

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

  /* LOAD STORAGE */

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

  /* SAVE STORAGE */

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch {
      setToast("Storage limit reached. Try a smaller file.");
    }
  }, [documents, loaded]);

  /* TOAST TIMER */

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  /* COUNTS */

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
    (item) => item.status === "Approved" && isExpired(item.expiryDate)
  ).length;

  const expiringCount = documents.filter(
    (item) =>
      item.status === "Approved" && isExpiringSoon(item.expiryDate)
  ).length;

  /* FILTER DOCUMENTS */

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
      .filter(
        (item) =>
          categoryFilter === "All" || item.category === categoryFilter
      )
      .filter(
        (item) =>
          statusFilter === "All" || item.status === statusFilter
      )
      .filter((item) => {
        const term = search.toLowerCase().trim();

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

  /* FORM HANDLERS */

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

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  /* SAVE DOCUMENT */

  const saveDocument = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
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

  /* DELETE DOCUMENT */

  const deleteDocument = (id: string) => {
    const item = documents.find((doc) => doc.id === id);
    if (!item) return;

    if (
      !window.confirm(
        `Delete "${item.title}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setDocuments((current) =>
      current.filter((doc) => doc.id !== id)
    );

    setMenuId(null);
    setToast("Document deleted");
  };

  /* UPDATE STATUS */

  const updateStatus = (id: string, status: Status) => {
    setDocuments((current) =>
      current.map((doc) =>
        doc.id === id ? { ...doc, status } : doc
      )
    );

    setMenuId(null);
    setToast(`Document marked as ${status.toLowerCase()}`);
  };

  /* DOWNLOAD DOCUMENT */

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

  /* EXPORT CSV */

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

  /* CREATE CERTIFICATE */

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

  /* CERTIFICATE PREVIEW */

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

  /* TABS */

  const tabs = [
    { name: "All", count: totalDocuments },
    { name: "Certificates", count: certificateCount },
    {
      name: "Documents",
      count: documents.filter((d) => d.category !== "Certificate").length,
    },
    { name: "Pending", count: pendingCount },
  ] as const;

  /* SUMMARY CARDS */

  const summaryCards = [
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
  ];

  /* =========================================
     RENDER
  ========================================= */

  return (
    <main className="min-h-screen bg-[#FAF5ED] px-4 py-6 text-[#17140D] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6">

        {/* HEADER */}

        <section className={cardClass}>
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#5A5438] bg-[#28291F] text-[#EFE8A8]">
                  <Files size={19} />
                </div>

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D9D19A]">
                  KBC Admin Center
                </span>
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Certificates & Documents
              </h1>

              <p className="mt-2 text-sm text-[#92978F]">
                Organize student certificates, academy records and important documents.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button onClick={exportCsv} className={secondaryButtonClass}>
                <Download size={16} />
                Export CSV
              </button>

              <button onClick={openAddForm} className={primaryButtonClass}>
                <Plus size={17} />
                Add document
              </button>
            </div>
          </div>
        </section>

        {/* SUMMARY CARDS */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className={cardClass}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-[#A9ACA2]">
                      {item.label}
                    </p>

                    <h2 className="mt-3 text-3xl font-semibold tabular-nums text-white">
                      {item.value}
                    </h2>

                    <p className="mt-2 text-xs text-[#858B82]">
                      {item.note}
                    </p>
                  </div>

                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#3A403A]"
                    style={{
                      backgroundColor: `${item.color}12`,
                      color: item.color,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* EXPIRY ALERT */}

        {(expiringCount > 0 || expiredCount > 0) && (
          <div className="gold-ambient-card flex flex-col gap-3 rounded-2xl border border-[#343832] bg-[#121414] p-4 sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7AD75]/10 text-[#E7AD75]">
              <AlertTriangle size={20} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-[#E7AD75]">
                Document expiry reminder
              </p>

              <p className="mt-1 text-xs text-[#A9ACA2]">
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
              className="text-sm font-medium text-[#EFE8A8] transition hover:text-white"
            >
              Review documents →
            </button>
          </div>
        )}

        {/* CATEGORY SHORTCUTS */}

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
                  setCategoryFilter(
                    categoryFilter === category ? "All" : category
                  );
                  setActiveTab("All");
                }}
                className={`gold-ambient-card rounded-2xl border bg-[#121414] p-4 text-left transition ${
                  categoryFilter === category
                    ? "border-[#756B42]"
                    : "border-[#343832]"
                }`}
              >
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#3A403A]"
                  style={{
                    backgroundColor: config.bg,
                    color: config.color,
                  }}
                >
                  <Icon size={18} />
                </div>

                <p className="text-xs font-medium text-[#C8CBBF]">
                  {category}
                </p>

                <p className="mt-2 text-xl font-semibold text-white">
                  {count}
                </p>
              </button>
            );
          })}
        </section>

        {/* DOCUMENT REGISTER */}

        <section className={cardClass}>
          <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Document Register
              </h2>

              <p className="mt-1 text-sm text-[#92978F]">
                View and manage all academy documents in one place.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#858B82]"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search documents..."
                  className={`${inputClass} pl-11 sm:w-64`}
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`${inputClass} sm:w-48`}
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
                className={`${inputClass} sm:w-40`}
              >
                <option value="All">All statuses</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* TABS */}

          <div className="mb-5 flex flex-wrap items-center gap-2 border-b border-[#343832] pb-5">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                  activeTab === tab.name
                    ? "border-[#756B42] bg-[#302F23] text-[#EFE8A8]"
                    : "border-[#343832] bg-[#151917] text-[#A9ACA2] hover:border-[#756B42] hover:text-[#EFE8A8]"
                }`}
              >
                {tab.name}

                <span
                  className={`rounded-md px-1.5 py-0.5 text-xs ${
                    activeTab === tab.name
                      ? "bg-[#4A4530] text-[#EFE8A8]"
                      : "bg-[#252A27] text-[#92978F]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto rounded-xl border border-[#343832]">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-[#151917] text-[10px] uppercase tracking-wider text-[#858B82]">
                <tr>
                  <th className="px-5 py-4 font-medium">Document</th>
                  <th className="px-5 py-4 font-medium">Owner</th>
                  <th className="px-5 py-4 font-medium">Category</th>
                  <th className="px-5 py-4 font-medium">Issue date</th>
                  <th className="px-5 py-4 font-medium">Expiry</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#343832]">
                {filteredDocuments.map((item) => {
                  const category = categoryConfig[item.category];
                  const CategoryIcon = category.icon;
                  const status = statusConfig[item.status];

                  const expired = isExpired(item.expiryDate);
                  const expiring = isExpiringSoon(item.expiryDate);

                  return (
                    <tr
                      key={item.id}
                      className="transition hover:bg-[#252A27]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                            style={{
                              backgroundColor: category.bg,
                              color: category.color,
                            }}
                          >
                            <CategoryIcon size={19} />
                          </div>

                          <div>
                            <p className="max-w-[250px] truncate text-sm font-medium text-[#E0E1D7]">
                              {item.title}
                            </p>

                            <p className="mt-1 text-xs text-[#858B82]">
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

                      <td className="px-5 py-4 text-xs text-[#A9ACA2]">
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
                                    : "text-[#A9ACA2]"
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
                          <span className="text-xs text-[#6F786D]">
                            No expiry
                          </span>
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
                            className="rounded-lg p-2 text-[#A9ACA2] transition hover:bg-[#EFE8A8]/10 hover:text-[#EFE8A8]"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            title="Download"
                            onClick={() => downloadDocument(item)}
                            className="rounded-lg p-2 text-[#A9ACA2] transition hover:bg-[#8DCBA5]/10 hover:text-[#8DCBA5]"
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
                              className="rounded-lg p-2 text-[#A9ACA2] transition hover:bg-[#303630] hover:text-white"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {menuId === item.id && (
                              <div className="absolute right-0 top-9 z-30 w-48 rounded-xl border border-[#343832] bg-[#1B1F1D] p-2 shadow-2xl">
                                <button
                                  onClick={() => openEditForm(item)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-[#C4C8BE] transition hover:bg-[#292D29] hover:text-[#EFE8A8]"
                                >
                                  <Pencil size={14} />
                                  Edit details
                                </button>

                                {item.status !== "Approved" && (
                                  <button
                                    onClick={() =>
                                      updateStatus(item.id, "Approved")
                                    }
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-[#8DCBA5] transition hover:bg-[#8DCBA5]/10"
                                  >
                                    <Check size={14} />
                                    Approve
                                  </button>
                                )}

                                {item.status !== "Rejected" && (
                                  <button
                                    onClick={() =>
                                      updateStatus(item.id, "Rejected")
                                    }
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-[#E7AD75] transition hover:bg-[#E7AD75]/10"
                                  >
                                    <XCircle size={14} />
                                    Reject
                                  </button>
                                )}

                                <button
                                  onClick={() => deleteDocument(item.id)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-[#F18C8C] transition hover:bg-[#F18C8C]/10"
                                >
                                  <Trash2 size={14} />
                                  Delete
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
              <div className="flex min-h-[280px] flex-col items-center justify-center bg-[#121414] px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#343832] bg-[#202522] text-[#D9D19A]">
                  <FolderOpen size={28} />
                </div>

                <h3 className="mt-4 text-base font-semibold text-white">
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
                  className={`${primaryButtonClass} mt-4`}
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>

          {/* TABLE FOOTER */}

          <div className="mt-5 flex flex-col justify-between gap-2 border-t border-[#343832] pt-5 text-xs text-[#858B82] sm:flex-row">
            <span>
              Showing {filteredDocuments.length} of {documents.length} records
            </span>

            <span className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#D9D19A]" />
              Document register · KBC Salon Academy
            </span>
          </div>
        </section>

        {/* ADD / EDIT MODAL */}

        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
          >
            <form
              onSubmit={saveDocument}
              onClick={(e) => e.stopPropagation()}
              className="gold-modal-card my-6 w-full max-w-3xl rounded-2xl border border-[#49483A] bg-[#1B1F1D] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#343832] p-5 sm:p-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {editingDocument ? "Edit document" : "Add new document"}
                  </h2>

                  <p className="mt-1 text-sm text-[#92978F]">
                    Enter the document details below.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#3A403A] bg-[#151917] text-[#A9ACA2] transition hover:border-[#756B42] hover:text-[#EFE8A8]"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-medium text-[#A9ACA2]">
                    Document title *
                  </label>

                  <input
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="Enter document title"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-[#A9ACA2]">
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
                    className={inputClass}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-[#A9ACA2]">
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
                    className={inputClass}
                  >
                    <option value="Student">Student</option>
                    <option value="Staff">Staff</option>
                    <option value="Academy">Academy</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-[#A9ACA2]">
                    Owner name *
                  </label>

                  <input
                    required
                    value={form.owner}
                    onChange={(e) =>
                      setForm({ ...form, owner: e.target.value })
                    }
                    placeholder="Student / Staff / Academy name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-[#A9ACA2]">
                    Course / Department
                  </label>

                  <input
                    value={form.course}
                    onChange={(e) =>
                      setForm({ ...form, course: e.target.value })
                    }
                    placeholder="Enter course or department"
                    className={inputClass}
                  />
                </div>

                {form.category === "Certificate" && (
                  <div>
                    <label className="mb-2 block text-xs font-medium text-[#A9ACA2]">
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
                      className={inputClass}
                    />
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-xs font-medium text-[#A9ACA2]">
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
                    className={inputClass}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-[#A9ACA2]">
                    Issue date
                  </label>

                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) =>
                      setForm({ ...form, issueDate: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-[#A9ACA2]">
                    Expiry date (optional)
                  </label>

                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) =>
                      setForm({ ...form, expiryDate: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                {/* FILE UPLOAD */}

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-medium text-[#A9ACA2]">
                    Upload file
                  </label>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="gold-ambient-card flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#5A5438] bg-[#121414] px-5 py-7 text-center transition"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#5A5438] bg-[#28291F] text-[#EFE8A8]">
                      <Upload size={22} />
                    </div>

                    <p className="mt-3 text-sm font-medium text-[#D7D9D1]">
                      {selectedFile
                        ? selectedFile.name
                        : "Click to upload a document"}
                    </p>

                    <p className="mt-1 text-xs text-[#858B82]">
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
                  <label className="mb-2 block text-xs font-medium text-[#A9ACA2]">
                    Notes
                  </label>

                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    placeholder="Additional information..."
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#343832] p-5 sm:flex-row sm:p-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className={secondaryButtonClass}
                >
                  Cancel
                </button>

                <button type="submit" className={primaryButtonClass}>
                  <Check size={16} />
                  {editingDocument ? "Save changes" : "Add document"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PREVIEW MODAL */}

        {previewDocument && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
            onClick={() => setPreviewDocument(null)}
          >
            <div
              className="gold-modal-card my-6 w-full max-w-2xl overflow-hidden rounded-2xl border border-[#49483A] bg-[#1B1F1D] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#343832] p-5">
                <div>
                  <h2 className="font-semibold text-white">
                    Document preview
                  </h2>

                  <p className="mt-1 text-xs text-[#858B82]">
                    {previewDocument.fileName}
                  </p>
                </div>

                <button
                  onClick={() => setPreviewDocument(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#3A403A] bg-[#151917] text-[#A9ACA2] transition hover:border-[#756B42] hover:text-[#EFE8A8]"
                >
                  <X size={17} />
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
                      <p className="text-[#82764C]">
                        Certificate number
                      </p>
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
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#5A5438] bg-[#28291F] text-[#EFE8A8]">
                    <FileText size={32} />
                  </div>

                  <h3 className="mt-4 font-semibold text-white">
                    {previewDocument.title}
                  </h3>

                  <p className="mt-2 text-sm text-[#858B82]">
                    {previewDocument.fileName}
                  </p>

                  <p className="mt-2 text-xs text-[#777D74]">
                    {previewDocument.fileType} · {previewDocument.fileSize}
                  </p>

                  {previewDocument.fileData ? (
                    <p className="mt-4 text-xs text-[#A9ACA2]">
                      Download the uploaded file to view its full contents.
                    </p>
                  ) : (
                    <p className="mt-4 text-xs text-[#A9ACA2]">
                      No uploaded file is attached to this record.
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3 border-t border-[#343832] p-5">
                {previewDocument.category === "Certificate" && (
                  <button
                    onClick={() =>
                      downloadCertificatePreview(previewDocument)
                    }
                    className={secondaryButtonClass}
                  >
                    <Download size={15} />
                    Download certificate preview
                  </button>
                )}

                {previewDocument.fileData && (
                  <button
                    onClick={() => downloadDocument(previewDocument)}
                    className={primaryButtonClass}
                  >
                    <Download size={15} />
                    Download uploaded file
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TOAST */}

        {toast && (
          <div className="fixed bottom-5 right-5 z-[70] flex max-w-[calc(100vw-40px)] items-center gap-3 rounded-xl border border-[#756B42] bg-[#25271F] px-4 py-3.5 text-sm text-[#EFE8A8] shadow-2xl">
            <CheckCircle2
              size={18}
              className="shrink-0 text-[#D9D19A]"
            />

            <span>{toast}</span>

            <button
              onClick={() => setToast("")}
              className="ml-2 text-[#A9ACA2] transition hover:text-white"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>

      {/* =====================================
          GLOBAL GOLDEN GLOW STYLES
      ===================================== */}

      <style jsx global>{`
        .gold-ambient-card {
          position: relative;
          isolation: isolate;
          -webkit-tap-highlight-color: transparent;
          background-color: #121414;
          border: 1px solid #343832;
          color: #f5f1e6;

          transition:
            transform 0.35s ease,
            background 0.35s ease,
            border-color 0.35s ease,
            box-shadow 0.35s ease;
        }

        /* GOLDEN GLOW AROUND THE CARD */

        .gold-ambient-card::before {
          content: "";
          position: absolute;
          inset: -3px;
          z-index: -1;
          border-radius: inherit;
          pointer-events: none;

          background: linear-gradient(
            135deg,
            #fff4ce 0%,
            #e8d39a 52%,
            #c9a45c 100%
          );

          filter: blur(24px);
          opacity: 0;

          transition: opacity 0.35s ease;
        }

        /* CHAMPAGNE GOLD HOVER */

        .gold-ambient-card:hover,
        .gold-ambient-card:active {
          background: linear-gradient(
            135deg,
            #fff4ce 0%,
            #e8d39a 52%,
            #c9a45c 100%
          ) !important;

          border-color: #fff0b8 !important;

          color: #17140d !important;

          box-shadow:
            0 0 10px rgba(255, 244, 206, 0.85),
            0 0 24px rgba(232, 211, 154, 0.75),
            0 0 45px rgba(201, 164, 92, 0.65),
            0 0 70px rgba(201, 164, 92, 0.35),
            inset 0 0 20px rgba(255, 255, 255, 0.3) !important;
        }

        /* DARK TEXT ON HOVER */

        .gold-ambient-card:hover h1,
        .gold-ambient-card:hover h2,
        .gold-ambient-card:hover h3,
        .gold-ambient-card:hover h4,
        .gold-ambient-card:hover p,
        .gold-ambient-card:hover span,
        .gold-ambient-card:hover label,
        .gold-ambient-card:active h1,
        .gold-ambient-card:active h2,
        .gold-ambient-card:active h3,
        .gold-ambient-card:active h4,
        .gold-ambient-card:active p,
        .gold-ambient-card:active span,
        .gold-ambient-card:active label {
          color: #17140d !important;
        }

        /* ICONS ON HOVER */

        .gold-ambient-card:hover svg,
        .gold-ambient-card:active svg {
          color: #17140d;
        }

        /* SHOW THE GOLDEN GLOW */

        .gold-ambient-card:hover::before,
        .gold-ambient-card:active::before {
          opacity: 1;
        }

        /* DESKTOP HOVER MOVEMENT */

        @media (hover: hover) and (pointer: fine) {
          .gold-ambient-card:hover {
            transform: translateY(-4px);
          }
        }

        /* MOBILE TOUCH EFFECT */

        @media (hover: none) {
          .gold-ambient-card:active {
            transform: scale(0.985);
            border-color: #fff0b8 !important;
          }

          .gold-ambient-card:active::before {
            opacity: 1;
          }
        }

        /* MODAL ANIMATION */

        .gold-modal-card {
          animation: modalAppear 0.25s ease-out;
        }

        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* REDUCED MOTION ACCESSIBILITY */

        @media (prefers-reduced-motion: reduce) {
          .gold-ambient-card,
          .gold-ambient-card::before,
          .gold-modal-card {
            transition: none;
            animation: none;
          }

          .gold-ambient-card:hover,
          .gold-ambient-card:active {
            transform: none;
          }
        }
      `}</style>
    </main>
  );
}
