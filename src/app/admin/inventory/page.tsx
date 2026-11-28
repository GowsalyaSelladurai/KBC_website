"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
  type ElementType,
} from "react";

import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Check,
  CircleDollarSign,
  Clock,
  Download,
  Edit,
  FileBarChart,
  Filter,
  LayoutGrid,
  Package,
  PackagePlus,
  Plus,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  Users,
  X,
  Boxes,
} from "lucide-react";

// ------------------------------------------------------
// TYPES
// ------------------------------------------------------

type Category =
  | "Hair Care"
  | "Skin Care"
  | "Makeup"
  | "Salon Supplies"
  | "Equipment";

type Product = {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: Category;
  brand: string;
  description: string;
  supplierId: string;
  quantity: number;
  minimumStock: number;
  purchasePrice: number;
  sellingPrice: number;
  manufacturingDate: string;
  expiryDate: string;
  unit: string;
  createdAt: string;
};

type Supplier = {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
};

type Movement = {
  id: string;
  productId: string;
  productName: string;
  type: "Stock In" | "Stock Out" | "Adjustment";
  quantity: number;
  date: string;
  note: string;
};

type ProductForm = Omit<Product, "id" | "createdAt">;

type Tab =
  | "Overview"
  | "Products"
  | "Stock Management"
  | "Suppliers"
  | "Reports";

// ------------------------------------------------------
// CONSTANTS
// ------------------------------------------------------

const CATEGORIES: Category[] = [
  "Hair Care",
  "Skin Care",
  "Makeup",
  "Salon Supplies",
  "Equipment",
];

const EMPTY_PRODUCT: ProductForm = {
  name: "",
  sku: "",
  barcode: "",
  category: "Hair Care",
  brand: "",
  description: "",
  supplierId: "",
  quantity: 0,
  minimumStock: 5,
  purchasePrice: 0,
  sellingPrice: 0,
  manufacturingDate: "",
  expiryDate: "",
  unit: "Pieces",
};

const STORAGE = {
  products: "kbc_inventory_products_v1",
  suppliers: "kbc_inventory_suppliers_v1",
  movements: "kbc_inventory_movements_v1",
};

// ------------------------------------------------------
// HELPERS
// ------------------------------------------------------

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function dateLabel(value: string) {
  if (!value) return "Not set";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function expiryDays(value: string) {
  if (!value) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(`${value}T00:00:00`);

  if (Number.isNaN(expiry.getTime())) return null;

  return Math.ceil(
    (expiry.getTime() - today.getTime()) / 86400000
  );
}

function categoryColor(category: Category) {
  const colors: Record<Category, string> = {
    "Hair Care": "bg-purple-500/15 text-purple-200 border-purple-400/25",
    "Skin Care": "bg-blue-500/15 text-blue-200 border-blue-400/25",
    Makeup: "bg-pink-500/15 text-pink-200 border-pink-400/25",
    "Salon Supplies": "bg-orange-500/15 text-orange-200 border-orange-400/25",
    Equipment: "bg-cyan-500/15 text-cyan-200 border-cyan-400/25",
  };

  return colors[category] ?? "bg-white/10 text-gray-200 border-white/15";
}

function csvDownload(
  filename: string,
  rows: (string | number)[][]
) {
  const csv = rows
    .map((row) =>
      row
        .map((value) => {
          const text = String(value ?? "");
          return `"${text.replace(/"/g, '""')}"`;
        })
        .join(",")
    )
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

// ------------------------------------------------------
// SHARED STYLES
// ------------------------------------------------------

const inputClass =
  "w-full rounded-xl border border-[#E8D39A]/30 bg-[#121414] px-3.5 py-3 text-sm text-[#F5F2E9] outline-none transition placeholder:text-[#858B82] focus:border-[#FFF4CE] focus:ring-2 focus:ring-[#E8D39A]/15";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FFF4CE] via-[#E8D39A] to-[#C9A45C] px-5 py-3 text-sm font-semibold text-[#17140D] shadow-md shadow-[#C9A45C]/25 transition hover:-translate-y-0.5 hover:brightness-105";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8D39A]/40 bg-[#121414] px-4 py-3 text-sm font-medium text-[#FFF4CE] shadow-sm transition hover:bg-gradient-to-r hover:from-[#FFF4CE] hover:via-[#E8D39A] hover:to-[#C9A45C] hover:text-[#17140D]";

// ------------------------------------------------------
// FOLDED CORNER CARD
// ------------------------------------------------------

function FoldedCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`folded-card gold-ambient-card ${className}`}>
      <div className="folded-card-content">{children}</div>
    </div>
  );
}

// ------------------------------------------------------
// SMALL COMPONENTS
// ------------------------------------------------------

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "gold",
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: ElementType;
  accent?: "gold" | "red" | "green" | "blue";
}) {
  const accentStyles = {
    gold: "bg-[#E8D39A]/15 text-[#FFF4CE]",
    red: "bg-red-500/15 text-red-300",
    green: "bg-emerald-500/15 text-emerald-300",
    blue: "bg-blue-500/15 text-blue-300",
  };

  return (
    <FoldedCard className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="gold-card-muted text-sm text-[#A9ACA2]">{title}</p>
          <h3 className="gold-card-title mt-3 break-words text-2xl font-semibold tracking-tight text-[#F5F2E9]">
            {value}
          </h3>
          <p className="gold-card-muted mt-2 text-xs text-[#858B82]">{subtitle}</p>
        </div>

        <div className={`gold-card-icon rounded-xl p-3 ${accentStyles[accent]}`}>
          <Icon size={21} />
        </div>
      </div>
    </FoldedCard>
  );
}

function StatusBadge({
  children,
  type = "neutral",
}: {
  children: ReactNode;
  type?: "success" | "warning" | "danger" | "neutral";
}) {
  const styles = {
    success: "bg-emerald-500/15 text-emerald-300 border-emerald-400/25",
    warning: "bg-amber-500/15 text-amber-200 border-amber-400/25",
    danger: "bg-red-500/15 text-red-300 border-red-400/25",
    neutral: "bg-white/10 text-gray-200 border-white/15",
  };

  return (
    <span
      className={`gold-card-pill inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[type]}`}
    >
      {children}
    </span>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-xs font-medium text-[#A9ACA2]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Modal({
  title,
  description,
  children,
  onClose,
  width = "max-w-2xl",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  width?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`my-auto w-full ${width} animate-[modalIn_.2s_ease-out] rounded-2xl border border-[#E8D39A]/50 bg-[#121414] text-[#F5F2E9] shadow-[0_0_40px_rgba(232,211,154,0.22)]`}
      >
        <div className="flex items-start justify-between border-b border-[#E8D39A]/20 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-[#FFF4CE]">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-[#92978F]">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#A9ACA2] transition hover:bg-[#FFF4CE] hover:text-[#17140D]"
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------
// MAIN PAGE
// ------------------------------------------------------

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [stockFilter, setStockFilter] = useState("All Stock");
  const [sortBy, setSortBy] = useState("name");

  const [productModal, setProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(EMPTY_PRODUCT);

  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState("1");
  const [adjustType, setAdjustType] = useState<"Stock In" | "Stock Out" | "Adjustment">("Stock In");
  const [adjustNote, setAdjustNote] = useState("");

  const [supplierModal, setSupplierModal] = useState(false);
  const [supplierForm, setSupplierForm] = useState<Omit<Supplier, "id">>({
    name: "",
    contact: "",
    email: "",
    address: "",
  });
  const [deleteSupplier, setDeleteSupplier] = useState<Supplier | null>(null);

  const [toast, setToast] = useState("");

  // ------------------------------------------------------
  // LOAD AND SAVE LOCAL STORAGE
  // ------------------------------------------------------

  useEffect(() => {
    const savedProducts = readStorage<Product[]>(STORAGE.products, []);
    const savedSuppliers = readStorage<Supplier[]>(STORAGE.suppliers, []);
    const savedMovements = readStorage<Movement[]>(STORAGE.movements, []);

    setProducts(Array.isArray(savedProducts) ? savedProducts : []);
    setSuppliers(Array.isArray(savedSuppliers) ? savedSuppliers : []);
    setMovements(Array.isArray(savedMovements) ? savedMovements : []);

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(STORAGE.products, JSON.stringify(products));
    } catch {
      setToast("Unable to save products in browser storage.");
    }
  }, [products, loaded]);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(STORAGE.suppliers, JSON.stringify(suppliers));
    } catch {
      setToast("Unable to save suppliers in browser storage.");
    }
  }, [suppliers, loaded]);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(STORAGE.movements, JSON.stringify(movements));
    } catch {
      setToast("Unable to save stock history in browser storage.");
    }
  }, [movements, loaded]);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // ------------------------------------------------------
  // CALCULATED DATA
  // ------------------------------------------------------

  const totalUnits = products.reduce(
    (sum, product) => sum + Math.max(0, Number(product.quantity) || 0),
    0
  );

  const purchaseValue = products.reduce(
    (sum, product) => sum + product.quantity * product.purchasePrice,
    0
  );

  const sellingValue = products.reduce(
    (sum, product) => sum + product.quantity * product.sellingPrice,
    0
  );

  const potentialProfit = sellingValue - purchaseValue;

  const lowStockProducts = products.filter(
    (product) =>
      product.quantity > 0 &&
      product.quantity <= product.minimumStock
  );

  const outOfStockProducts = products.filter(
    (product) => product.quantity <= 0
  );

  const expiredProducts = products.filter((product) => {
    const days = expiryDays(product.expiryDate);
    return days !== null && days < 0;
  });

  const expiringProducts = products.filter((product) => {
    const days = expiryDays(product.expiryDate);
    return days !== null && days >= 0 && days <= 30;
  });

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((product) =>
        [
          product.name,
          product.sku,
          product.barcode,
          product.brand,
          product.category,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        )
      );
    }

    if (categoryFilter !== "All Categories") {
      result = result.filter(
        (product) => product.category === categoryFilter
      );
    }

    if (stockFilter === "Low Stock") {
      result = result.filter(
        (product) =>
          product.quantity > 0 &&
          product.quantity <= product.minimumStock
      );
    }

    if (stockFilter === "Out of Stock") {
      result = result.filter((product) => product.quantity <= 0);
    }

    if (stockFilter === "In Stock") {
      result = result.filter(
        (product) => product.quantity > product.minimumStock
      );
    }

    if (stockFilter === "Expiring Soon") {
      result = result.filter((product) => {
        const days = expiryDays(product.expiryDate);
        return days !== null && days >= 0 && days <= 30;
      });
    }

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "quantity") {
      result.sort((a, b) => a.quantity - b.quantity);
    } else if (sortBy === "value") {
      result.sort(
        (a, b) =>
          b.quantity * b.purchasePrice -
          a.quantity * a.purchasePrice
      );
    } else if (sortBy === "expiry") {
      result.sort((a, b) =>
        (a.expiryDate || "9999").localeCompare(b.expiryDate || "9999")
      );
    }

    return result;
  }, [products, search, categoryFilter, stockFilter, sortBy]);

  const categoryStats = CATEGORIES.map((category) => ({
    name: category,
    count: products.filter((p) => p.category === category).length,
  }));

  // ------------------------------------------------------
  // PRODUCT ACTIONS
  // ------------------------------------------------------

  function openAddProduct() {
    setEditingProduct(null);

    setProductForm({
      ...EMPTY_PRODUCT,
      sku: `KBC-${Date.now().toString().slice(-6)}`,
    });

    setProductModal(true);
  }

  function openEditProduct(product: Product) {
    setEditingProduct(product);

    setProductForm({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      category: product.category,
      brand: product.brand,
      description: product.description,
      supplierId: product.supplierId,
      quantity: product.quantity,
      minimumStock: product.minimumStock,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      manufacturingDate: product.manufacturingDate,
      expiryDate: product.expiryDate,
      unit: product.unit,
    });

    setProductModal(true);
  }

  function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!productForm.name.trim()) {
      setToast("Please enter a product name.");
      return;
    }

    if (!productForm.sku.trim()) {
      setToast("Please enter a product SKU.");
      return;
    }

    if (productForm.purchasePrice < 0 || productForm.sellingPrice < 0) {
      setToast("Prices cannot be negative.");
      return;
    }

    if (productForm.quantity < 0 || productForm.minimumStock < 0) {
      setToast("Stock quantities cannot be negative.");
      return;
    }

    if (
      productForm.manufacturingDate &&
      productForm.expiryDate &&
      productForm.expiryDate < productForm.manufacturingDate
    ) {
      setToast("Expiry date cannot be before manufacturing date.");
      return;
    }

    const duplicateSku = products.some(
      (product) =>
        product.sku.toLowerCase() === productForm.sku.toLowerCase() &&
        product.id !== editingProduct?.id
    );

    if (duplicateSku) {
      setToast("This SKU already exists.");
      return;
    }

    if (editingProduct) {
      setProducts((current) =>
        current.map((product) =>
          product.id === editingProduct.id
            ? { ...product, ...productForm }
            : product
        )
      );

      setToast("Product updated successfully.");
    } else {
      const newProduct: Product = {
        ...productForm,
        id: makeId(),
        createdAt: new Date().toISOString(),
      };

      setProducts((current) => [newProduct, ...current]);

      if (productForm.quantity > 0) {
        setMovements((current) => [
          {
            id: makeId(),
            productId: newProduct.id,
            productName: newProduct.name,
            type: "Stock In",
            quantity: productForm.quantity,
            date: new Date().toISOString(),
            note: "Initial product stock",
          },
          ...current,
        ]);
      }

      setToast("Product added successfully.");
    }

    setProductModal(false);
  }

  function confirmDeleteProduct() {
    if (!deleteProduct) return;

    setProducts((current) =>
      current.filter((product) => product.id !== deleteProduct.id)
    );

    setMovements((current) =>
      current.filter((movement) => movement.productId !== deleteProduct.id)
    );

    setToast("Product deleted successfully.");
    setDeleteProduct(null);
  }

  // ------------------------------------------------------
  // STOCK ACTIONS
  // ------------------------------------------------------

  function saveStockAdjustment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!adjustProduct) return;

    const quantity = Number(adjustQuantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setToast("Enter a valid quantity.");
      return;
    }

    let newQuantity = adjustProduct.quantity;

    if (adjustType === "Stock In") {
      newQuantity += quantity;
    } else if (adjustType === "Stock Out") {
      newQuantity -= quantity;
    } else {
      newQuantity = quantity;
    }

    if (newQuantity < 0) {
      setToast("Not enough stock available.");
      return;
    }

    setProducts((current) =>
      current.map((product) =>
        product.id === adjustProduct.id
          ? { ...product, quantity: newQuantity }
          : product
      )
    );

    setMovements((current) => [
      {
        id: makeId(),
        productId: adjustProduct.id,
        productName: adjustProduct.name,
        type: adjustType,
        quantity:
          adjustType === "Adjustment"
            ? newQuantity
            : quantity,
        date: new Date().toISOString(),
        note: adjustNote || "Manual stock update",
      },
      ...current,
    ]);

    setToast("Stock updated successfully.");
    setAdjustProduct(null);
    setAdjustQuantity("1");
    setAdjustNote("");
  }

  // ------------------------------------------------------
  // SUPPLIER ACTIONS
  // ------------------------------------------------------

  function saveSupplier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supplierForm.name.trim()) {
      setToast("Please enter supplier name.");
      return;
    }

    setSuppliers((current) => [
      {
        ...supplierForm,
        id: makeId(),
      },
      ...current,
    ]);

    setSupplierForm({
      name: "",
      contact: "",
      email: "",
      address: "",
    });

    setSupplierModal(false);
    setToast("Supplier added successfully.");
  }

  function confirmDeleteSupplier() {
    if (!deleteSupplier) return;

    setSuppliers((current) =>
      current.filter((supplier) => supplier.id !== deleteSupplier.id)
    );

    setProducts((current) =>
      current.map((product) =>
        product.supplierId === deleteSupplier.id
          ? { ...product, supplierId: "" }
          : product
      )
    );

    setDeleteSupplier(null);
    setToast("Supplier deleted successfully.");
  }

  // ------------------------------------------------------
  // EXPORTS
  // ------------------------------------------------------

  function exportProducts() {
    const rows: (string | number)[][] = [
      [
        "Product",
        "SKU",
        "Category",
        "Brand",
        "Supplier",
        "Quantity",
        "Unit",
        "Minimum Stock",
        "Purchase Price",
        "Selling Price",
        "Stock Purchase Value",
        "Stock Selling Value",
        "Manufacturing Date",
        "Expiry Date",
      ],
      ...filteredProducts.map((product) => [
        product.name,
        product.sku,
        product.category,
        product.brand,
        suppliers.find((s) => s.id === product.supplierId)?.name ?? "",
        product.quantity,
        product.unit,
        product.minimumStock,
        product.purchasePrice,
        product.sellingPrice,
        product.quantity * product.purchasePrice,
        product.quantity * product.sellingPrice,
        product.manufacturingDate,
        product.expiryDate,
      ]),
    ];

    csvDownload("kbc-inventory-products.csv", rows);
    setToast("Product report exported.");
  }

  function exportMovements() {
    const rows: (string | number)[][] = [
      ["Product", "Movement Type", "Quantity", "Date", "Note"],
      ...movements.map((movement) => [
        movement.productName,
        movement.type,
        movement.quantity,
        new Date(movement.date).toLocaleString("en-IN"),
        movement.note,
      ]),
    ];

    csvDownload("kbc-stock-movement-report.csv", rows);
    setToast("Stock movement report exported.");
  }

  function exportExpiryReport() {
    const expiryList = products.filter((product) => product.expiryDate);

    const rows: (string | number)[][] = [
      ["Product", "SKU", "Category", "Quantity", "Expiry Date", "Days Remaining"],
      ...expiryList.map((product) => [
        product.name,
        product.sku,
        product.category,
        product.quantity,
        product.expiryDate,
        expiryDays(product.expiryDate) ?? "",
      ]),
    ];

    csvDownload("kbc-expiry-report.csv", rows);
    setToast("Expiry report exported.");
  }

  function exportValuationReport() {
    const rows: (string | number)[][] = [
      [
        "Product",
        "SKU",
        "Quantity",
        "Purchase Price",
        "Selling Price",
        "Purchase Value",
        "Selling Value",
        "Estimated Profit",
      ],
      ...products.map((product) => [
        product.name,
        product.sku,
        product.quantity,
        product.purchasePrice,
        product.sellingPrice,
        product.quantity * product.purchasePrice,
        product.quantity * product.sellingPrice,
        product.quantity * (product.sellingPrice - product.purchasePrice),
      ]),
    ];

    csvDownload("kbc-inventory-valuation.csv", rows);
    setToast("Valuation report exported.");
  }

  // ------------------------------------------------------
  // STATUS HELPERS
  // ------------------------------------------------------

  function stockStatus(product: Product) {
    if (product.quantity <= 0) {
      return <StatusBadge type="danger">Out of Stock</StatusBadge>;
    }

    if (product.quantity <= product.minimumStock) {
      return <StatusBadge type="warning">Low Stock</StatusBadge>;
    }

    return <StatusBadge type="success">In Stock</StatusBadge>;
  }

  function expiryStatus(product: Product) {
    if (!product.expiryDate) {
      return <span className="gold-card-muted text-xs text-[#858B82]">Not tracked</span>;
    }

    const days = expiryDays(product.expiryDate);

    if (days === null) return <StatusBadge>Invalid Date</StatusBadge>;

    if (days < 0) {
      return <StatusBadge type="danger">Expired</StatusBadge>;
    }

    if (days <= 30) {
      return (
        <StatusBadge type="warning">
          {days === 0 ? "Expires today" : `${days} days left`}
        </StatusBadge>
      );
    }

    return <StatusBadge type="success">Good</StatusBadge>;
  }

  const tabs: { name: Tab; icon: ElementType }[] = [
    { name: "Overview", icon: LayoutGrid },
    { name: "Products", icon: Package },
    { name: "Stock Management", icon: Boxes },
    { name: "Suppliers", icon: Truck },
    { name: "Reports", icon: FileBarChart },
  ];

  // ------------------------------------------------------
  // RENDER
  // ------------------------------------------------------

  return (
    <main className="min-h-screen bg-[#FAF5ED] px-4 py-6 text-[#F5F2E9] sm:px-6 lg:px-8">
      <style jsx global>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .inventory-fade {
          animation: fadeIn .35s ease both;
        }

        .inventory-scroll::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }

        .inventory-scroll::-webkit-scrollbar-thumb {
          background: #c9a45c;
          border-radius: 20px;
        }

        /* ------------------------------------------
           FOLDED CORNER CARD (DEEP CHARCOAL DEFAULT)
        ------------------------------------------ */

        .folded-card {
          position: relative;
          isolation: isolate;
          background-color: #121414;
          color: #f5f2e9;
          border: 1px solid rgba(232, 211, 154, 0.52);
          border-radius: 17px;
          box-shadow:
            0 0 14px rgba(232, 211, 154, 0.18),
            0 0 30px rgba(201, 164, 92, 0.12),
            0 10px 24px rgba(18, 20, 20, 0.14);
          transition:
            transform .32s cubic-bezier(0.22, 1, 0.36, 1),
            border-color .32s ease,
            box-shadow .32s ease,
            background .32s ease,
            color .32s ease;
        }

        .folded-card::before {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 43px;
          height: 43px;
          background: linear-gradient(
            135deg,
            #9c8549 0%,
            #FFF4CE 48%,
            #C9A45C 100%
          );
          clip-path: polygon(0 0, 100% 0, 100% 100%);
          opacity: .95;
          z-index: 2;
          transition: width .3s ease, height .3s ease;
        }

        .folded-card::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 43px;
          height: 43px;
          background: linear-gradient(
            135deg,
            rgba(20, 22, 18, .08),
            rgba(10, 12, 10, .8)
          );
          clip-path: polygon(0 0, 0 100%, 100% 100%);
          opacity: .55;
          z-index: 1;
          pointer-events: none;
        }

        .folded-card:hover::before {
          width: 51px;
          height: 51px;
        }

        .folded-card-content {
          position: relative;
          z-index: 3;
          height: 100%;
        }

        /* ------------------------------------------
           PRODUCT FOLDED CORNER CARD
        ------------------------------------------ */

        .product-fold {
          position: relative;
          isolation: isolate;
          background-color: #121414;
          color: #f5f2e9;
          border: 1px solid rgba(232, 211, 154, 0.55);
          border-radius: 17px;
          box-shadow:
            0 0 14px rgba(232, 211, 154, 0.18),
            0 0 30px rgba(201, 164, 92, 0.12),
            0 10px 24px rgba(18, 20, 20, 0.14);
          transition:
            transform .32s cubic-bezier(0.22, 1, 0.36, 1),
            border-color .32s ease,
            box-shadow .32s ease,
            background .32s ease,
            color .32s ease;
        }

        .product-fold::before {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #9c8549, #FFF4CE 55%, #C9A45C);
          clip-path: polygon(0 0, 100% 0, 100% 100%);
          z-index: 2;
          transition: width .3s ease, height .3s ease;
        }

        .product-fold::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 48px;
          height: 48px;
          background: rgba(10, 12, 10, .48);
          clip-path: polygon(0 0, 0 100%, 100% 100%);
          z-index: 1;
          pointer-events: none;
        }

        .product-fold:hover::before {
          width: 57px;
          height: 57px;
        }

        .product-fold-content {
          position: relative;
          z-index: 3;
          height: 100%;
        }

        /* ------------------------------------------
           CHAMPAGNE HOVER, OUTER GLOW & TOUCH EFFECT
           Preserves folded-corner pseudo-elements on
           FoldedCard and ProductFold while applying
           full champagne gradient & outer glow.
        ------------------------------------------ */

        .gold-ambient-card {
          position: relative;
          isolation: isolate;
          background-color: #121414;
          color: #f5f2e9;
          border: 1px solid rgba(232, 211, 154, 0.52);
          box-shadow:
            0 0 14px rgba(232, 211, 154, 0.18),
            0 0 30px rgba(201, 164, 92, 0.12),
            0 10px 24px rgba(18, 20, 20, 0.14);
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          transition:
            transform .32s cubic-bezier(0.22, 1, 0.36, 1),
            border-color .32s ease,
            box-shadow .32s ease,
            background .32s ease,
            color .32s ease;
        }

        .gold-ambient-card:hover,
        .gold-ambient-card:active,
        .gold-ambient-card:focus-visible {
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
            inset 0 1px 0 rgba(255, 255, 255, 0.72);
        }

        .gold-ambient-card:hover .gold-card-title,
        .gold-ambient-card:active .gold-card-title,
        .gold-ambient-card:focus-visible .gold-card-title,
        .gold-ambient-card:hover .gold-card-accent,
        .gold-ambient-card:active .gold-card-accent,
        .gold-ambient-card:focus-visible .gold-card-accent {
          color: #17140d !important;
        }

        .gold-ambient-card:hover .gold-card-muted,
        .gold-ambient-card:active .gold-card-muted,
        .gold-ambient-card:focus-visible .gold-card-muted {
          color: rgba(23, 20, 13, 0.8) !important;
        }

        .gold-ambient-card:hover .gold-card-icon,
        .gold-ambient-card:active .gold-card-icon,
        .gold-ambient-card:focus-visible .gold-card-icon {
          background-color: rgba(23, 20, 13, 0.14) !important;
          border-color: rgba(23, 20, 13, 0.24) !important;
          color: #17140d !important;
        }

        .gold-ambient-card:hover .gold-card-pill,
        .gold-ambient-card:active .gold-card-pill,
        .gold-ambient-card:focus-visible .gold-card-pill {
          background-color: rgba(23, 20, 13, 0.14) !important;
          border-color: rgba(23, 20, 13, 0.25) !important;
          color: #17140d !important;
        }

        .gold-ambient-card:hover .gold-card-subpanel,
        .gold-ambient-card:active .gold-card-subpanel,
        .gold-ambient-card:focus-visible .gold-card-subpanel {
          background-color: rgba(23, 20, 13, 0.12) !important;
          border-color: rgba(23, 20, 13, 0.22) !important;
          color: #17140d !important;
        }

        .gold-ambient-card:hover .gold-card-track,
        .gold-ambient-card:active .gold-card-track {
          background-color: rgba(23, 20, 13, 0.18) !important;
        }

        .gold-ambient-card:hover .gold-card-bar,
        .gold-ambient-card:active .gold-card-bar {
          background: #17140d !important;
        }

        @media (hover: hover) and (pointer: fine) {
          .gold-ambient-card:hover {
            transform: translateY(-3px);
          }
        }

        @media (hover: none) {
          .gold-ambient-card:active {
            transform: scale(.99);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gold-ambient-card {
            transition: none;
          }

          .gold-ambient-card:hover,
          .gold-ambient-card:active {
            transform: none;
          }
        }

        .gold-divider {
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(232, 211, 154, .45),
            transparent
          );
        }
      `}</style>

      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* HEADER */}

        <div className="gold-ambient-card flex flex-col justify-between gap-5 rounded-2xl bg-[#121414] p-5 sm:p-6 xl:flex-row xl:items-center">
          <div>
            <div className="gold-card-muted mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#E8D39A]">
              <Sparkles size={14} className="gold-card-accent" />
              KBC Salon Academy
            </div>

            <h1 className="gold-card-title text-2xl font-semibold tracking-tight text-[#FFF4CE] sm:text-3xl">
              Inventory &amp; Products
            </h1>

            <p className="gold-card-muted mt-2 text-sm text-[#9CA097]">
              Manage products, monitor stock, track expiry dates and suppliers.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={exportProducts}
              className={secondaryButton}
            >
              <Download size={16} />
              Export CSV
            </button>

            <button
              type="button"
              onClick={openAddProduct}
              className={primaryButton}
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>
        </div>

        {/* ALERTS */}

        {(outOfStockProducts.length > 0 ||
          lowStockProducts.length > 0 ||
          expiredProducts.length > 0 ||
          expiringProducts.length > 0) && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {outOfStockProducts.length > 0 && (
              <div className="gold-ambient-card flex items-center gap-3 rounded-xl bg-[#121414] p-4">
                <AlertTriangle className="gold-card-accent shrink-0 text-red-400" size={20} />
                <div>
                  <p className="gold-card-title text-sm font-medium text-red-300">
                    Out of stock
                  </p>
                  <p className="gold-card-muted text-xs text-red-200/75">
                    {outOfStockProducts.length} products need restocking
                  </p>
                </div>
              </div>
            )}

            {lowStockProducts.length > 0 && (
              <div className="gold-ambient-card flex items-center gap-3 rounded-xl bg-[#121414] p-4">
                <AlertTriangle className="gold-card-accent shrink-0 text-amber-300" size={20} />
                <div>
                  <p className="gold-card-title text-sm font-medium text-amber-200">
                    Low stock alert
                  </p>
                  <p className="gold-card-muted text-xs text-amber-100/75">
                    {lowStockProducts.length} products below minimum
                  </p>
                </div>
              </div>
            )}

            {expiredProducts.length > 0 && (
              <div className="gold-ambient-card flex items-center gap-3 rounded-xl bg-[#121414] p-4">
                <CalendarDays className="gold-card-accent shrink-0 text-red-400" size={20} />
                <div>
                  <p className="gold-card-title text-sm font-medium text-red-300">
                    Expired products
                  </p>
                  <p className="gold-card-muted text-xs text-red-200/75">
                    {expiredProducts.length} products have expired
                  </p>
                </div>
              </div>
            )}

            {expiringProducts.length > 0 && (
              <div className="gold-ambient-card flex items-center gap-3 rounded-xl bg-[#121414] p-4">
                <Clock className="gold-card-accent shrink-0 text-amber-300" size={20} />
                <div>
                  <p className="gold-card-title text-sm font-medium text-amber-200">
                    Expiring soon
                  </p>
                  <p className="gold-card-muted text-xs text-amber-100/75">
                    {expiringProducts.length} products within 30 days
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STATISTICS */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Products"
            value={String(products.length)}
            subtitle={`${totalUnits} total units in inventory`}
            icon={Package}
          />

          <StatCard
            title="Purchase Value"
            value={money(purchaseValue)}
            subtitle="Current inventory cost"
            icon={ShoppingCart}
            accent="blue"
          />

          <StatCard
            title="Potential Selling Value"
            value={money(sellingValue)}
            subtitle="Value if all stock is sold"
            icon={CircleDollarSign}
            accent="green"
          />

          <StatCard
            title="Estimated Profit"
            value={money(potentialProfit)}
            subtitle="Selling value minus purchase value"
            icon={TrendingUp}
          />
        </div>

        {/* TABS */}

        <div className="inventory-scroll overflow-x-auto border-b border-[#C9A45C]/35">
          <div className="flex min-w-max gap-2">
            {tabs.map(({ name, icon: Icon }) => (
              <button
                type="button"
                key={name}
                onClick={() => setActiveTab(name)}
                className={`relative flex items-center gap-2 rounded-t-xl px-4 py-3 text-sm transition ${
                  activeTab === name
                    ? "bg-[#121414] font-semibold text-[#FFF4CE] shadow-[0_0_16px_rgba(232,211,154,0.25)]"
                    : "text-[#5C5549] hover:bg-[#121414]/10 hover:text-[#17140D]"
                }`}
              >
                <Icon size={16} />
                {name}

                {activeTab === name && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#FFF4CE]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* OVERVIEW */}

        {activeTab === "Overview" && (
          <div className="inventory-fade space-y-6">
            <div className="grid gap-5 xl:grid-cols-3">
              <FoldedCard className="p-5 xl:col-span-2">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="gold-card-title font-semibold text-[#FFF4CE]">
                      Category Overview
                    </h2>
                    <p className="gold-card-muted mt-1 text-xs text-[#92978F]">
                      Products grouped by category
                    </p>
                  </div>
                  <Tag className="gold-card-accent text-[#E8D39A]" size={19} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {categoryStats.map((category) => {
                    const percentage =
                      products.length > 0
                        ? (category.count / products.length) * 100
                        : 0;

                    return (
                      <div
                        key={category.name}
                        className="gold-ambient-card gold-card-subpanel rounded-xl bg-[#121414] p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="gold-card-title text-sm text-[#D9D6C4]">
                            {category.name}
                          </p>
                          <span className="gold-card-accent text-lg font-semibold text-[#FFF4CE]">
                            {category.count}
                          </span>
                        </div>

                        <div className="gold-card-track mt-4 h-1.5 overflow-hidden rounded-full bg-[#262A28]">
                          <div
                            className="gold-card-bar h-full rounded-full bg-gradient-to-r from-[#C9A45C] to-[#FFF4CE] transition-all duration-700"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <p className="gold-card-muted mt-2 text-xs text-[#858B82]">
                          {percentage.toFixed(1)}% of all products
                        </p>
                      </div>
                    );
                  })}
                </div>
              </FoldedCard>

              <FoldedCard className="p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="gold-card-title font-semibold text-[#FFF4CE]">
                      Stock Health
                    </h2>
                    <p className="gold-card-muted mt-1 text-xs text-[#92978F]">
                      Current inventory condition
                    </p>
                  </div>
                  <Activity className="gold-card-accent text-[#E8D39A]" size={19} />
                </div>

                <div className="space-y-5">
                  {[
                    {
                      label: "Healthy stock",
                      count: products.filter((p) => p.quantity > p.minimumStock).length,
                      color: "bg-emerald-400",
                    },
                    {
                      label: "Low stock",
                      count: lowStockProducts.length,
                      color: "bg-amber-400",
                    },
                    {
                      label: "Out of stock",
                      count: outOfStockProducts.length,
                      color: "bg-red-400",
                    },
                    {
                      label: "Expired",
                      count: expiredProducts.length,
                      color: "bg-purple-400",
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="gold-card-muted text-[#A9ACA2]">
                          {item.label}
                        </span>
                        <span className="gold-card-accent font-semibold text-[#FFF4CE]">
                          {item.count}
                        </span>
                      </div>
                      <div className="gold-card-track h-2 overflow-hidden rounded-full bg-[#262A28]">
                        <div
                          className={`gold-card-bar h-full rounded-full ${item.color}`}
                          style={{
                            width: `${
                              products.length
                                ? (item.count / products.length) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </FoldedCard>
            </div>

            {/* ATTENTION LIST */}

            <FoldedCard className="p-5">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="gold-card-title font-semibold text-[#FFF4CE]">
                    Requires Attention
                  </h2>
                  <p className="gold-card-muted mt-1 text-xs text-[#92978F]">
                    Products that need your attention
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("Products");
                    setStockFilter("Low Stock");
                  }}
                  className="gold-card-title text-sm font-medium text-[#FFF4CE] transition hover:underline"
                >
                  View products →
                </button>
              </div>

              {[...outOfStockProducts, ...lowStockProducts].length === 0 ? (
                <div className="gold-card-subpanel rounded-xl border border-dashed border-[#E8D39A]/25 bg-[#121414] py-10 text-center">
                  <Check className="gold-card-accent mx-auto mb-2 text-emerald-400" size={28} />
                  <p className="gold-card-title text-sm text-[#D5D2BD]">
                    All products have healthy stock levels.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {[...outOfStockProducts, ...lowStockProducts]
                    .slice(0, 6)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="gold-ambient-card gold-card-subpanel rounded-xl bg-[#121414] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="gold-card-title truncate text-sm font-medium text-[#E6E2CF]">
                              {product.name}
                            </p>
                            <p className="gold-card-muted mt-1 text-xs text-[#858B82]">
                              {product.sku}
                            </p>
                          </div>
                          {stockStatus(product)}
                        </div>
                        <div className="gold-divider my-3" />
                        <div className="flex justify-between text-xs">
                          <span className="gold-card-muted text-[#92978F]">
                            Current stock
                          </span>
                          <span className="gold-card-title text-[#E6E2CF]">
                            {product.quantity} {product.unit}
                          </span>
                        </div>
                        <div className="mt-2 flex justify-between text-xs">
                          <span className="gold-card-muted text-[#92978F]">
                            Minimum stock
                          </span>
                          <span className="gold-card-muted text-[#A9ACA2]">
                            {product.minimumStock}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </FoldedCard>

            {/* EXPIRY LIST */}

            <FoldedCard className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="gold-card-title font-semibold text-[#FFF4CE]">
                    Expiry Monitoring
                  </h2>
                  <p className="gold-card-muted mt-1 text-xs text-[#92978F]">
                    Products expiring within the next 30 days
                  </p>
                </div>
                <CalendarDays className="gold-card-accent text-[#E8D39A]" size={20} />
              </div>

              {expiringProducts.length === 0 && expiredProducts.length === 0 ? (
                <p className="gold-card-muted rounded-xl border border-dashed border-[#E8D39A]/25 bg-[#121414] p-6 text-center text-sm text-[#92978F]">
                  No expired or soon-to-expire products found.
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {[...expiredProducts, ...expiringProducts]
                    .slice(0, 6)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="gold-ambient-card gold-card-subpanel flex flex-col justify-between gap-3 rounded-xl bg-[#121414] p-4 sm:flex-row sm:items-center"
                      >
                        <div>
                          <p className="gold-card-title text-sm font-medium text-[#E6E2CF]">
                            {product.name}
                          </p>
                          <p className="gold-card-muted mt-1 text-xs text-[#92978F]">
                            {product.category} · {product.sku}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="gold-card-muted text-xs text-[#A9ACA2]">
                            {dateLabel(product.expiryDate)}
                          </span>
                          {expiryStatus(product)}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </FoldedCard>
          </div>
        )}

        {/* PRODUCTS */}

        {activeTab === "Products" && (
          <div className="inventory-fade space-y-5">
            <div className="gold-ambient-card flex flex-col justify-between gap-4 rounded-2xl bg-[#121414] p-5 lg:flex-row lg:items-center">
              <div>
                <h2 className="gold-card-title text-lg font-semibold text-[#FFF4CE]">
                  Product Inventory
                </h2>
                <p className="gold-card-muted mt-1 text-sm text-[#92978F]">
                  {filteredProducts.length} products displayed
                </p>
              </div>

              <button
                type="button"
                onClick={openAddProduct}
                className={primaryButton}
              >
                <Plus size={17} />
                Add New Product
              </button>
            </div>

            {/* FILTERS */}

            <div className="gold-ambient-card flex flex-col gap-3 rounded-2xl bg-[#121414] p-4 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#858B82]"
                  size={17}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search product, SKU, barcode or brand..."
                  className={`${inputClass} pl-10`}
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`${inputClass} lg:w-48`}
              >
                <option className="bg-[#121414] text-[#F5F2E9]">All Categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} className="bg-[#121414] text-[#F5F2E9]">
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className={`${inputClass} lg:w-44`}
              >
                {[
                  "All Stock",
                  "In Stock",
                  "Low Stock",
                  "Out of Stock",
                  "Expiring Soon",
                ].map((item) => (
                  <option key={item} className="bg-[#121414] text-[#F5F2E9]">
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`${inputClass} lg:w-40`}
              >
                <option value="name" className="bg-[#121414] text-[#F5F2E9]">
                  Sort: Name
                </option>
                <option value="quantity" className="bg-[#121414] text-[#F5F2E9]">
                  Sort: Quantity
                </option>
                <option value="value" className="bg-[#121414] text-[#F5F2E9]">
                  Sort: Value
                </option>
                <option value="expiry" className="bg-[#121414] text-[#F5F2E9]">
                  Sort: Expiry
                </option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("All Categories");
                  setStockFilter("All Stock");
                  setSortBy("name");
                }}
                className={secondaryButton}
              >
                <Filter size={16} />
                Reset
              </button>
            </div>

            {/* PRODUCT CARDS */}

            {filteredProducts.length === 0 ? (
              <div className="gold-ambient-card rounded-2xl bg-[#121414] px-5 py-16 text-center">
                <Package className="gold-card-accent mx-auto mb-3 text-[#E8D39A]" size={35} />
                <p className="gold-card-title font-medium text-[#D5D2BD]">
                  No products found
                </p>
                <p className="gold-card-muted mt-1 text-sm text-[#858B82]">
                  Add a product or change your search filters.
                </p>
                <button
                  type="button"
                  onClick={openAddProduct}
                  className={`${primaryButton} mt-4`}
                >
                  Add your first product
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="product-fold gold-ambient-card">
                    <div className="product-fold-content flex h-full flex-col p-5">
                      {/* PRODUCT HEADER */}

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="gold-card-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#E8D39A]/25 bg-[#E8D39A]/15 text-[#FFF4CE] shadow-inner">
                            <Package size={22} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="gold-card-title truncate pr-2 text-sm font-semibold text-[#F5F2E9]">
                              {product.name}
                            </h3>
                            <p className="gold-card-muted mt-1 text-xs text-[#858B82]">
                              {product.sku}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* CATEGORY */}

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span
                          className={`gold-card-pill inline-flex rounded-lg border px-2.5 py-1 text-xs ${categoryColor(
                            product.category
                          )}`}
                        >
                          {product.category}
                        </span>

                        {stockStatus(product)}
                      </div>

                      {/* STOCK QUANTITY */}

                      <div className="gold-card-subpanel mt-5 rounded-xl border border-[#E8D39A]/15 bg-[#121414] p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="gold-card-muted text-xs text-[#92978F]">
                              Available quantity
                            </p>
                            <p className="gold-card-accent mt-1 text-2xl font-semibold text-[#FFF4CE]">
                              {product.quantity}
                              <span className="gold-card-muted ml-1.5 text-xs font-normal text-[#A9ACA2]">
                                {product.unit}
                              </span>
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="gold-card-muted text-xs text-[#858B82]">
                              Minimum
                            </p>
                            <p className="gold-card-title mt-1 text-lg font-medium text-[#C9C6B7]">
                              {product.minimumStock}
                            </p>
                          </div>
                        </div>

                        <div className="gold-card-track mt-3 h-1.5 overflow-hidden rounded-full bg-[#262A28]">
                          <div
                            className={`gold-card-bar h-full rounded-full transition-all ${
                              product.quantity <= 0
                                ? "bg-red-400"
                                : product.quantity <= product.minimumStock
                                  ? "bg-amber-400"
                                  : "bg-emerald-400"
                            }`}
                            style={{
                              width: `${
                                product.quantity <= 0
                                  ? 0
                                  : Math.min(
                                      100,
                                      (product.quantity /
                                        Math.max(product.minimumStock * 2, 1)) *
                                        100
                                    )
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* PRICE DETAILS */}

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                          <p className="gold-card-muted text-[11px] uppercase tracking-wider text-[#858B82]">
                            Purchase
                          </p>
                          <p className="gold-card-title mt-1 text-sm font-medium text-[#C9C6B7]">
                            {money(product.purchasePrice)}
                          </p>
                        </div>

                        <div>
                          <p className="gold-card-muted text-[11px] uppercase tracking-wider text-[#858B82]">
                            Selling
                          </p>
                          <p className="gold-card-accent mt-1 text-sm font-semibold text-[#FFF4CE]">
                            {money(product.sellingPrice)}
                          </p>
                        </div>
                      </div>

                      <div className="gold-divider my-4" />

                      {/* PRODUCT DETAILS */}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="gold-card-muted text-[#858B82]">
                            Brand
                          </span>
                          <span className="gold-card-title truncate text-right text-[#C9C6B7]">
                            {product.brand || "Not specified"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="gold-card-muted text-[#858B82]">
                            Expiry date
                          </span>
                          <span className="gold-card-title text-right text-[#C9C6B7]">
                            {dateLabel(product.expiryDate)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="gold-card-muted text-[#858B82]">
                            Expiry status
                          </span>
                          {expiryStatus(product)}
                        </div>

                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="gold-card-muted text-[#858B82]">
                            Stock value
                          </span>
                          <span className="gold-card-accent font-medium text-[#FFF4CE]">
                            {money(product.quantity * product.purchasePrice)}
                          </span>
                        </div>
                      </div>

                      {/* ACTIONS */}

                      <div className="mt-auto flex gap-2 border-t border-[#E8D39A]/15 pt-4">
                        <button
                          type="button"
                          title="Adjust stock"
                          onClick={() => {
                            setAdjustProduct(product);
                            setAdjustQuantity("1");
                            setAdjustType("Stock In");
                            setAdjustNote("");
                          }}
                          className="gold-card-pill flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-2 py-2.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20"
                        >
                          <PackagePlus size={15} />
                          Stock
                        </button>

                        <button
                          type="button"
                          title="Edit product"
                          onClick={() => openEditProduct(product)}
                          className="gold-card-pill flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#E8D39A]/25 bg-[#E8D39A]/10 px-2 py-2.5 text-xs font-medium text-[#FFF4CE] transition hover:bg-[#E8D39A]/20"
                        >
                          <Edit size={15} />
                          Edit
                        </button>

                        <button
                          type="button"
                          title="Delete product"
                          onClick={() => setDeleteProduct(product)}
                          className="gold-card-pill flex items-center justify-center rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2.5 text-red-300 transition hover:bg-red-500/20"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STOCK MANAGEMENT */}

        {activeTab === "Stock Management" && (
          <div className="inventory-fade space-y-5">
            <div className="gold-ambient-card rounded-2xl bg-[#121414] p-5">
              <h2 className="gold-card-title text-lg font-semibold text-[#FFF4CE]">
                Stock Management
              </h2>
              <p className="gold-card-muted mt-1 text-sm text-[#92978F]">
                Manage stock additions, usage and adjustments.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                title="Stock In Records"
                value={String(movements.filter((m) => m.type === "Stock In").length)}
                subtitle="Stock additions"
                icon={ArrowDown}
                accent="green"
              />
              <StatCard
                title="Stock Out Records"
                value={String(movements.filter((m) => m.type === "Stock Out").length)}
                subtitle="Stock usage or removal"
                icon={ArrowUp}
                accent="red"
              />
              <StatCard
                title="Adjustments"
                value={String(movements.filter((m) => m.type === "Adjustment").length)}
                subtitle="Manual corrections"
                icon={SlidersHorizontal}
                accent="blue"
              />
            </div>

            <FoldedCard>
              <div className="flex flex-col justify-between gap-3 border-b border-[#E8D39A]/15 p-5 sm:flex-row sm:items-center">
                <div>
                  <h3 className="gold-card-title font-semibold text-[#FFF4CE]">
                    Stock Movement History
                  </h3>
                  <p className="gold-card-muted mt-1 text-xs text-[#92978F]">
                    Every stock change recorded in this browser
                  </p>
                </div>

                <button
                  type="button"
                  onClick={exportMovements}
                  className={secondaryButton}
                >
                  <Download size={16} />
                  Export History
                </button>
              </div>

              {movements.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <Activity className="gold-card-accent mx-auto mb-3 text-[#E8D39A]" size={32} />
                  <p className="gold-card-title text-sm text-[#D5D2BD]">
                    No stock movements recorded yet.
                  </p>
                  <p className="gold-card-muted mt-1 text-xs text-[#858B82]">
                    Add products or adjust existing stock to see history.
                  </p>
                </div>
              ) : (
                <div className="inventory-scroll overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="bg-[#121414] text-xs text-[#92978F]">
                      <tr>
                        <th className="px-5 py-4 font-medium">Product</th>
                        <th className="px-4 py-4 font-medium">Movement</th>
                        <th className="px-4 py-4 font-medium">Quantity</th>
                        <th className="px-4 py-4 font-medium">Date</th>
                        <th className="px-5 py-4 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.map((movement) => (
                        <tr key={movement.id} className="border-t border-[#E8D39A]/10">
                          <td className="gold-card-title px-5 py-4 font-medium text-[#E6E2CF]">
                            {movement.productName}
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge
                              type={
                                movement.type === "Stock In"
                                  ? "success"
                                  : movement.type === "Stock Out"
                                    ? "danger"
                                    : "warning"
                              }
                            >
                              {movement.type}
                            </StatusBadge>
                          </td>
                          <td className="gold-card-title px-4 py-4 text-[#D5D2BD]">
                            {movement.quantity}
                          </td>
                          <td className="gold-card-muted px-4 py-4 text-xs text-[#A9ACA2]">
                            {new Date(movement.date).toLocaleString("en-IN")}
                          </td>
                          <td className="gold-card-muted px-5 py-4 text-xs text-[#92978F]">
                            {movement.note}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </FoldedCard>

            <FoldedCard className="p-5">
              <h3 className="gold-card-title mb-4 font-semibold text-[#FFF4CE]">
                Products requiring restock
              </h3>

              {lowStockProducts.length + outOfStockProducts.length === 0 ? (
                <p className="gold-card-muted text-sm text-[#92978F]">
                  No products currently need restocking.
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {[...outOfStockProducts, ...lowStockProducts].map((product) => (
                    <div
                      key={product.id}
                      className="gold-ambient-card gold-card-subpanel flex flex-col justify-between gap-3 rounded-xl bg-[#121414] p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="gold-card-title text-sm font-medium text-[#E6E2CF]">
                          {product.name}
                        </p>
                        <p className="gold-card-muted mt-1 text-xs text-[#92978F]">
                          Current: {product.quantity} · Minimum: {product.minimumStock}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAdjustProduct(product);
                          setAdjustType("Stock In");
                          setAdjustQuantity("1");
                          setAdjustNote("Restock");
                        }}
                        className={primaryButton}
                      >
                        Restock product
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </FoldedCard>
          </div>
        )}

        {/* SUPPLIERS */}

        {activeTab === "Suppliers" && (
          <div className="inventory-fade space-y-5">
            <div className="gold-ambient-card flex flex-col justify-between gap-3 rounded-2xl bg-[#121414] p-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="gold-card-title text-lg font-semibold text-[#FFF4CE]">
                  Supplier Management
                </h2>
                <p className="gold-card-muted mt-1 text-sm text-[#92978F]">
                  Manage your salon product suppliers.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSupplierModal(true)}
                className={primaryButton}
              >
                <Plus size={17} />
                Add Supplier
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {suppliers.map((supplier) => {
                const supplierProducts = products.filter(
                  (product) => product.supplierId === supplier.id
                );

                return (
                  <FoldedCard key={supplier.id} className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="gold-card-icon flex h-12 w-12 items-center justify-center rounded-xl border border-[#E8D39A]/25 bg-[#E8D39A]/15 text-[#FFF4CE]">
                        <Truck size={22} />
                      </div>

                      <button
                        type="button"
                        onClick={() => setDeleteSupplier(supplier)}
                        className="gold-card-pill rounded-lg p-2 text-red-400 transition hover:bg-red-400/15"
                        title="Delete supplier"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    <h3 className="gold-card-title mt-4 font-semibold text-[#FFF4CE]">
                      {supplier.name}
                    </h3>

                    <div className="gold-card-muted mt-4 space-y-2 text-sm text-[#A9ACA2]">
                      <p>{supplier.contact || "No contact number"}</p>
                      <p className="break-all">{supplier.email || "No email"}</p>
                      <p>{supplier.address || "No address"}</p>
                    </div>

                    <div className="gold-divider my-4" />

                    <div className="flex items-center justify-between">
                      <span className="gold-card-muted text-xs text-[#92978F]">
                        Supplied products
                      </span>
                      <span className="gold-card-accent font-semibold text-[#FFF4CE]">
                        {supplierProducts.length}
                      </span>
                    </div>
                  </FoldedCard>
                );
              })}
            </div>

            {suppliers.length === 0 && (
              <div className="gold-ambient-card rounded-2xl bg-[#121414] px-5 py-16 text-center">
                <Users className="gold-card-accent mx-auto mb-3 text-[#E8D39A]" size={36} />
                <p className="gold-card-title font-medium text-[#D5D2BD]">
                  No suppliers added yet
                </p>
                <p className="gold-card-muted mt-1 text-sm text-[#858B82]">
                  Add your supplier details to connect them with products.
                </p>
                <button
                  type="button"
                  onClick={() => setSupplierModal(true)}
                  className={`${primaryButton} mt-4`}
                >
                  Add your first supplier
                </button>
              </div>
            )}
          </div>
        )}

        {/* REPORTS */}

        {activeTab === "Reports" && (
          <div className="inventory-fade space-y-5">
            <div className="gold-ambient-card rounded-2xl bg-[#121414] p-5">
              <h2 className="gold-card-title text-lg font-semibold text-[#FFF4CE]">
                Inventory Reports
              </h2>
              <p className="gold-card-muted mt-1 text-sm text-[#92978F]">
                Export inventory insights and stock reports.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Product Report",
                  description: "Product details, category, supplier and stock.",
                  icon: Package,
                  action: exportProducts,
                },
                {
                  title: "Stock Movement",
                  description: "All stock additions, removals and adjustments.",
                  icon: Activity,
                  action: exportMovements,
                },
                {
                  title: "Expiry Report",
                  description: "Manufacturing and expiry date information.",
                  icon: CalendarDays,
                  action: exportExpiryReport,
                },
                {
                  title: "Valuation Report",
                  description: "Purchase value, selling value and estimated profit.",
                  icon: CircleDollarSign,
                  action: exportValuationReport,
                },
              ].map((report) => {
                const Icon = report.icon;

                return (
                  <FoldedCard key={report.title} className="flex flex-col p-5">
                    <div className="gold-card-icon flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8D39A]/15 text-[#FFF4CE]">
                      <Icon size={21} />
                    </div>

                    <h3 className="gold-card-title mt-4 font-semibold text-[#E6E2CF]">
                      {report.title}
                    </h3>

                    <p className="gold-card-muted mt-2 min-h-10 text-xs leading-5 text-[#92978F]">
                      {report.description}
                    </p>

                    <button
                      type="button"
                      onClick={report.action}
                      className="gold-card-pill mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8D39A]/35 px-3 py-3 text-sm font-medium text-[#FFF4CE] transition hover:bg-[#E8D39A]/15"
                    >
                      <Download size={16} />
                      Export CSV
                    </button>
                  </FoldedCard>
                );
              })}
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <FoldedCard className="p-5">
                <h3 className="gold-card-title font-semibold text-[#FFF4CE]">
                  Inventory Valuation
                </h3>

                <div className="mt-5 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="gold-card-muted text-[#A9ACA2]">
                      Total purchase value
                    </span>
                    <span className="gold-card-title font-semibold text-[#E6E2CF]">
                      {money(purchaseValue)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="gold-card-muted text-[#A9ACA2]">
                      Potential selling value
                    </span>
                    <span className="gold-card-accent font-semibold text-[#FFF4CE]">
                      {money(sellingValue)}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-[#E8D39A]/15 pt-4 text-sm">
                    <span className="gold-card-muted text-[#A9ACA2]">
                      Estimated gross profit
                    </span>
                    <span
                      className={`gold-card-title font-semibold ${
                        potentialProfit >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {money(potentialProfit)}
                    </span>
                  </div>

                  <p className="gold-card-muted text-xs leading-5 text-[#858B82]">
                    This is an estimate based on current stock and entered prices.
                    It does not represent actual sales or realized profit.
                  </p>
                </div>
              </FoldedCard>

              <FoldedCard className="p-5">
                <h3 className="gold-card-title font-semibold text-[#FFF4CE]">
                  Expiry Summary
                </h3>

                <div className="mt-5 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="gold-card-muted text-[#A9ACA2]">
                      Products with expiry dates
                    </span>
                    <span className="gold-card-title text-[#E6E2CF]">
                      {products.filter((p) => p.expiryDate).length}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="gold-card-muted text-[#A9ACA2]">
                      Expired products
                    </span>
                    <span className="gold-card-title text-red-400">
                      {expiredProducts.length}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="gold-card-muted text-[#A9ACA2]">
                      Expiring within 30 days
                    </span>
                    <span className="gold-card-title text-amber-300">
                      {expiringProducts.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={exportExpiryReport}
                    className="gold-card-pill mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#E8D39A]/35 px-3 py-3 text-sm font-medium text-[#FFF4CE] transition hover:bg-[#E8D39A]/15"
                  >
                    <Download size={16} />
                    Download expiry report
                  </button>
                </div>
              </FoldedCard>
            </div>

            <FoldedCard className="p-5">
              <h3 className="gold-card-title font-semibold text-[#FFF4CE]">
                Category Valuation
              </h3>

              <div className="mt-4 space-y-4">
                {categoryStats.map((category) => {
                  const value = products
                    .filter((p) => p.category === category.name)
                    .reduce(
                      (sum, p) => sum + p.quantity * p.purchasePrice,
                      0
                    );

                  return (
                    <div key={category.name}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="gold-card-title text-[#C9C6B7]">
                          {category.name}
                        </span>
                        <span className="gold-card-accent text-[#FFF4CE]">
                          {money(value)}
                        </span>
                      </div>

                      <div className="gold-card-track h-2 overflow-hidden rounded-full bg-[#262A28]">
                        <div
                          className="gold-card-bar h-full rounded-full bg-gradient-to-r from-[#C9A45C] to-[#FFF4CE]"
                          style={{
                            width: `${
                              purchaseValue > 0
                                ? (value / purchaseValue) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </FoldedCard>
          </div>
        )}

        {/* PRODUCT MODAL */}

        {productModal && (
          <Modal
            title={editingProduct ? "Edit Product" : "Add New Product"}
            description="Enter the product details and inventory information."
            onClose={() => setProductModal(false)}
            width="max-w-3xl"
          >
            <form onSubmit={saveProduct} className="space-y-6">
              <div>
                <h3 className="mb-4 text-sm font-semibold text-[#FFF4CE]">
                  Basic Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Product Name *">
                    <input
                      required
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm({ ...productForm, name: e.target.value })
                      }
                      placeholder="Enter product name"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="SKU *">
                    <input
                      required
                      value={productForm.sku}
                      onChange={(e) =>
                        setProductForm({ ...productForm, sku: e.target.value })
                      }
                      placeholder="Product SKU"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Barcode">
                    <input
                      value={productForm.barcode}
                      onChange={(e) =>
                        setProductForm({ ...productForm, barcode: e.target.value })
                      }
                      placeholder="Barcode number"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Category *">
                    <select
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          category: e.target.value as Category,
                        })
                      }
                      className={inputClass}
                    >
                      {CATEGORIES.map((category) => (
                        <option
                          key={category}
                          className="bg-[#121414] text-[#F5F2E9]"
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Brand">
                    <input
                      value={productForm.brand}
                      onChange={(e) =>
                        setProductForm({ ...productForm, brand: e.target.value })
                      }
                      placeholder="Brand name"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Supplier">
                    <select
                      value={productForm.supplierId}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          supplierId: e.target.value,
                        })
                      }
                      className={inputClass}
                    >
                      <option value="" className="bg-[#121414] text-[#F5F2E9]">
                        Select supplier
                      </option>
                      {suppliers.map((supplier) => (
                        <option
                          key={supplier.id}
                          value={supplier.id}
                          className="bg-[#121414] text-[#F5F2E9]"
                        >
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Description" className="sm:col-span-2">
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Product description..."
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>

              <div className="border-t border-[#E8D39A]/15 pt-5">
                <h3 className="mb-4 text-sm font-semibold text-[#FFF4CE]">
                  Stock &amp; Pricing
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Current Quantity *">
                    <input
                      type="number"
                      min="0"
                      required
                      value={productForm.quantity}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          quantity: Number(e.target.value),
                        })
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Minimum Stock Level *">
                    <input
                      type="number"
                      min="0"
                      required
                      value={productForm.minimumStock}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          minimumStock: Number(e.target.value),
                        })
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Unit">
                    <select
                      value={productForm.unit}
                      onChange={(e) =>
                        setProductForm({ ...productForm, unit: e.target.value })
                      }
                      className={inputClass}
                    >
                      {[
                        "Pieces",
                        "Bottles",
                        "Boxes",
                        "Packs",
                        "Sets",
                        "Kg",
                        "Litres",
                        "Grams",
                        "Pairs",
                      ].map((unit) => (
                        <option
                          key={unit}
                          className="bg-[#121414] text-[#F5F2E9]"
                        >
                          {unit}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Purchase Price (₹) *">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={productForm.purchasePrice}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          purchasePrice: Number(e.target.value),
                        })
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Selling Price (₹) *">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={productForm.sellingPrice}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          sellingPrice: Number(e.target.value),
                        })
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="gold-ambient-card mt-4 rounded-xl bg-[#121414] p-4">
                  <p className="gold-card-muted text-xs text-[#A9ACA2]">
                    Estimated profit per unit
                  </p>
                  <p className="gold-card-accent mt-1 text-xl font-semibold text-[#FFF4CE]">
                    {money(
                      productForm.sellingPrice - productForm.purchasePrice
                    )}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#E8D39A]/15 pt-5">
                <h3 className="mb-4 text-sm font-semibold text-[#FFF4CE]">
                  Expiry Tracking
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Manufacturing Date">
                    <input
                      type="date"
                      value={productForm.manufacturingDate}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          manufacturingDate: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Expiry Date">
                    <input
                      type="date"
                      value={productForm.expiryDate}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          expiryDate: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>

                <p className="mt-2 text-xs text-[#858B82]">
                  Expiry alerts are calculated automatically from the saved expiry date.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#E8D39A]/15 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setProductModal(false)}
                  className="rounded-xl border border-[#E8D39A]/35 px-5 py-3 text-sm text-[#C9C6B7] transition hover:bg-[#FFF4CE] hover:text-[#17140D]"
                >
                  Cancel
                </button>

                <button type="submit" className={primaryButton}>
                  {editingProduct ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* STOCK ADJUSTMENT MODAL */}

        {adjustProduct && (
          <Modal
            title="Update Stock"
            description={`Manage stock for ${adjustProduct.name}`}
            onClose={() => setAdjustProduct(null)}
            width="max-w-lg"
          >
            <form onSubmit={saveStockAdjustment} className="space-y-5">
              <div className="gold-ambient-card rounded-xl bg-[#121414] p-4">
                <p className="gold-card-muted text-xs text-[#92978F]">
                  Current available stock
                </p>
                <p className="gold-card-accent mt-1 text-2xl font-semibold text-[#FFF4CE]">
                  {adjustProduct.quantity} {adjustProduct.unit}
                </p>
              </div>

              <Field label="Movement Type">
                <select
                  value={adjustType}
                  onChange={(e) =>
                    setAdjustType(e.target.value as typeof adjustType)
                  }
                  className={inputClass}
                >
                  <option value="Stock In" className="bg-[#121414] text-[#F5F2E9]">
                    Stock In – Add quantity
                  </option>
                  <option value="Stock Out" className="bg-[#121414] text-[#F5F2E9]">
                    Stock Out – Remove quantity
                  </option>
                  <option value="Adjustment" className="bg-[#121414] text-[#F5F2E9]">
                    Adjustment – Set exact quantity
                  </option>
                </select>
              </Field>

              <Field
                label={
                  adjustType === "Adjustment" ? "New Total Quantity" : "Quantity"
                }
              >
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Reason / Note">
                <textarea
                  rows={3}
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="e.g. New purchase, salon usage, damaged items..."
                  className={inputClass}
                />
              </Field>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setAdjustProduct(null)}
                  className="rounded-xl border border-[#E8D39A]/35 px-5 py-3 text-sm text-[#C9C6B7] transition hover:bg-[#FFF4CE] hover:text-[#17140D]"
                >
                  Cancel
                </button>
                <button type="submit" className={primaryButton}>
                  Save Stock Update
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* SUPPLIER MODAL */}

        {supplierModal && (
          <Modal
            title="Add New Supplier"
            description="Enter supplier contact information."
            onClose={() => setSupplierModal(false)}
            width="max-w-lg"
          >
            <form onSubmit={saveSupplier} className="space-y-4">
              <Field label="Supplier Name *">
                <input
                  required
                  value={supplierForm.name}
                  onChange={(e) =>
                    setSupplierForm({ ...supplierForm, name: e.target.value })
                  }
                  placeholder="Company or supplier name"
                  className={inputClass}
                />
              </Field>

              <Field label="Contact Number">
                <input
                  value={supplierForm.contact}
                  onChange={(e) =>
                    setSupplierForm({ ...supplierForm, contact: e.target.value })
                  }
                  placeholder="Phone number"
                  className={inputClass}
                />
              </Field>

              <Field label="Email Address">
                <input
                  type="email"
                  value={supplierForm.email}
                  onChange={(e) =>
                    setSupplierForm({ ...supplierForm, email: e.target.value })
                  }
                  placeholder="supplier@example.com"
                  className={inputClass}
                />
              </Field>

              <Field label="Address">
                <textarea
                  rows={3}
                  value={supplierForm.address}
                  onChange={(e) =>
                    setSupplierForm({ ...supplierForm, address: e.target.value })
                  }
                  placeholder="Supplier address"
                  className={inputClass}
                />
              </Field>

              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setSupplierModal(false)}
                  className="rounded-xl border border-[#E8D39A]/35 px-5 py-3 text-sm text-[#C9C6B7] transition hover:bg-[#FFF4CE] hover:text-[#17140D]"
                >
                  Cancel
                </button>
                <button type="submit" className={primaryButton}>
                  Save Supplier
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* DELETE PRODUCT CONFIRMATION */}

        {deleteProduct && (
          <Modal
            title="Delete Product?"
            description="This action cannot be undone."
            onClose={() => setDeleteProduct(null)}
            width="max-w-md"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-red-500/15 p-3 text-red-300">
                <Trash2 size={23} />
              </div>
              <div>
                <p className="text-sm text-[#E6E2CF]">
                  Are you sure you want to delete{" "}
                  <strong>{deleteProduct.name}</strong>?
                </p>
                <p className="mt-2 text-xs leading-5 text-[#92978F]">
                  The product and its stock movement history will be removed from this browser.
                </p>
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteProduct(null)}
                className="rounded-xl border border-[#E8D39A]/35 px-4 py-2.5 text-sm text-[#C9C6B7] transition hover:bg-[#FFF4CE] hover:text-[#17140D]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Delete Product
              </button>
            </div>
          </Modal>
        )}

        {/* DELETE SUPPLIER CONFIRMATION */}

        {deleteSupplier && (
          <Modal
            title="Delete Supplier?"
            description="Confirm supplier removal."
            onClose={() => setDeleteSupplier(null)}
            width="max-w-md"
          >
            <p className="text-sm text-[#D5D2BD]">
              Delete supplier <strong>{deleteSupplier.name}</strong>?
              Products linked to this supplier will remain saved, but their supplier link will be cleared.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteSupplier(null)}
                className="rounded-xl border border-[#E8D39A]/35 px-4 py-2.5 text-sm text-[#C9C6B7] transition hover:bg-[#FFF4CE] hover:text-[#17140D]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteSupplier}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
              >
                Delete Supplier
              </button>
            </div>
          </Modal>
        )}

        {/* TOAST */}

        {toast && (
          <div className="gold-ambient-card fixed bottom-5 right-5 z-[150] flex max-w-[calc(100vw-40px)] items-center gap-3 rounded-xl bg-[#121414] px-5 py-4 text-sm font-medium text-[#FFF4CE] shadow-2xl animate-[fadeIn_.2s_ease-out]">
            <Check size={18} className="gold-card-accent" />
            <span className="gold-card-title">{toast}</span>
            <button
              type="button"
              onClick={() => setToast("")}
              className="gold-card-muted ml-2 text-[#A9ACA2] hover:text-[#17140D]"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}