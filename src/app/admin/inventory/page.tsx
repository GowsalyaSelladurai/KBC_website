
"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
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

const GOLD = "#EFE8A8";

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
    "Hair Care": "bg-purple-500/10 text-purple-300 border-purple-400/20",
    "Skin Care": "bg-blue-500/10 text-blue-300 border-blue-400/20",
    Makeup: "bg-pink-500/10 text-pink-300 border-pink-400/20",
    "Salon Supplies": "bg-orange-500/10 text-orange-300 border-orange-400/20",
    Equipment: "bg-cyan-500/10 text-cyan-300 border-cyan-400/20",
  };

  return colors[category] ?? "bg-white/5 text-gray-300 border-white/10";
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
    <div className={`folded-card ${className}`}>
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
  icon: typeof Package;
  accent?: "gold" | "red" | "green" | "blue";
}) {
  const accentStyles = {
    gold: "bg-[#EFE8A8]/10 text-[#EFE8A8]",
    red: "bg-red-500/10 text-red-400",
    green: "bg-emerald-500/10 text-emerald-400",
    blue: "bg-blue-500/10 text-blue-400",
  };

  return (
    <FoldedCard className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-[#A9A58A]">{title}</p>
          <h3 className="mt-3 break-words text-2xl font-semibold tracking-tight text-[#F4F0D5]">
            {value}
          </h3>
          <p className="mt-2 text-xs text-[#898B80]">{subtitle}</p>
        </div>

        <div className={`rounded-xl p-3 ${accentStyles[accent]}`}>
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
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
    neutral: "bg-white/5 text-gray-300 border-white/10",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[type]}`}>
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
      <span className="text-xs font-medium text-[#C9C6B7]">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#3A3D34] bg-[#121614] px-3.5 py-3 text-sm text-[#F4F0D5] outline-none transition placeholder:text-[#77796E] focus:border-[#EFE8A8]/60 focus:ring-2 focus:ring-[#EFE8A8]/10";

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
      <div className={`my-auto w-full ${width} animate-[modalIn_.2s_ease-out] rounded-2xl border border-[#45483A] bg-[#1B1F1D] shadow-2xl`}>
        <div className="flex items-start justify-between border-b border-[#34372F] p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-[#EFE8A8]">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-[#929487]">
                {description}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#A9A58A] transition hover:bg-white/10 hover:text-white"
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
    localStorage.setItem(STORAGE.products, JSON.stringify(products));
  }, [products, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE.suppliers, JSON.stringify(suppliers));
  }, [suppliers, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE.movements, JSON.stringify(movements));
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
      return <span className="text-xs text-[#77796E]">Not tracked</span>;
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

  const tabs: { name: Tab; icon: typeof Package }[] = [
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
    <main className="min-h-screen bg-[#121414] px-4 py-6 text-[#F4F0D5] sm:px-6 lg:px-8">
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
          background: #555744;
          border-radius: 20px;
        }

        /* ------------------------------------------
           PREMIUM FOLDED CORNER CARD
        ------------------------------------------ */

        .folded-card {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          border: 1px solid rgba(239, 232, 168, .16);
          border-radius: 17px;
          background:
            linear-gradient(145deg, rgba(239, 232, 168, .035), transparent 38%),
            #1B1F1D;
          transition:
            transform .3s ease,
            border-color .3s ease,
            box-shadow .3s ease;
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
            #77734f 0%,
            #EFE8A8 45%,
            #b4aa70 100%
          );
          clip-path: polygon(0 0, 100% 0, 100% 100%);
          opacity: .9;
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

        .folded-card:hover {
          transform: translateY(-4px);
          border-color: rgba(239, 232, 168, .42);
          box-shadow:
            0 12px 32px rgba(0, 0, 0, .28),
            0 0 22px rgba(239, 232, 168, .055);
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

        /* Product card corner */
        .product-fold {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          border: 1px solid rgba(239, 232, 168, .17);
          border-radius: 17px;
          background:
            linear-gradient(145deg, rgba(239, 232, 168, .045), transparent 42%),
            #1B1F1D;
          transition: all .3s ease;
        }

        .product-fold::before {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #8f885d, #EFE8A8 55%, #bcb27a);
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

        .product-fold:hover {
          transform: translateY(-5px);
          border-color: rgba(239, 232, 168, .48);
          box-shadow:
            0 16px 35px rgba(0, 0, 0, .3),
            0 0 24px rgba(239, 232, 168, .07);
        }

        .product-fold:hover::before {
          width: 57px;
          height: 57px;
        }

        .product-fold-content {
          position: relative;
          z-index: 3;
        }

        .gold-divider {
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(239, 232, 168, .3),
            transparent
          );
        }
      `}</style>

      <div className="mx-auto max-w-[1600px] space-y-6">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#A9A58A]">
              <Sparkles size={14} />
              KBC Salon Academy
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-[#EFE8A8] sm:text-3xl">
              Inventory & Products
            </h1>

            <p className="mt-2 text-sm text-[#929487]">
              Manage products, monitor stock, track expiry dates and suppliers.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportProducts}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#45483A] px-4 py-3 text-sm text-[#D5D2BD] transition hover:border-[#EFE8A8]/50 hover:bg-[#EFE8A8]/5"
            >
              <Download size={16} />
              Export CSV
            </button>

            <button
              onClick={openAddProduct}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#EFE8A8] to-[#C9C18A] px-5 py-3 text-sm font-semibold text-[#171916] shadow-lg shadow-[#EFE8A8]/10 transition hover:-translate-y-0.5 hover:shadow-[#EFE8A8]/20"
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
              <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <AlertTriangle className="shrink-0 text-red-400" size={20} />
                <div>
                  <p className="text-sm font-medium text-red-300">Out of stock</p>
                  <p className="text-xs text-red-300/70">
                    {outOfStockProducts.length} products need restocking
                  </p>
                </div>
              </div>
            )}

            {lowStockProducts.length > 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <AlertTriangle className="shrink-0 text-amber-300" size={20} />
                <div>
                  <p className="text-sm font-medium text-amber-200">Low stock alert</p>
                  <p className="text-xs text-amber-200/70">
                    {lowStockProducts.length} products below minimum
                  </p>
                </div>
              </div>
            )}

            {expiredProducts.length > 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <CalendarDays className="shrink-0 text-red-400" size={20} />
                <div>
                  <p className="text-sm font-medium text-red-300">Expired products</p>
                  <p className="text-xs text-red-300/70">
                    {expiredProducts.length} products have expired
                  </p>
                </div>
              </div>
            )}

            {expiringProducts.length > 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <Clock className="shrink-0 text-amber-300" size={20} />
                <div>
                  <p className="text-sm font-medium text-amber-200">Expiring soon</p>
                  <p className="text-xs text-amber-200/70">
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

        <div className="inventory-scroll overflow-x-auto border-b border-[#34372F]">
          <div className="flex min-w-max gap-2">
            {tabs.map(({ name, icon: Icon }) => (
              <button
                key={name}
                onClick={() => setActiveTab(name)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm transition ${
                  activeTab === name
                    ? "font-semibold text-[#EFE8A8]"
                    : "text-[#929487] hover:text-[#E5E0C5]"
                }`}
              >
                <Icon size={16} />
                {name}

                {activeTab === name && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#EFE8A8]" />
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
                    <h2 className="font-semibold text-[#EFE8A8]">Category Overview</h2>
                    <p className="mt-1 text-xs text-[#929487]">
                      Products grouped by category
                    </p>
                  </div>
                  <Tag className="text-[#A9A58A]" size={19} />
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
                        className="rounded-xl border border-[#34372F] bg-[#151916] p-4 transition hover:border-[#EFE8A8]/30"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm text-[#D9D6C4]">
                            {category.name}
                          </p>
                          <span className="text-lg font-semibold text-[#EFE8A8]">
                            {category.count}
                          </span>
                        </div>

                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#34372F]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#A9A58A] to-[#EFE8A8] transition-all duration-700"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <p className="mt-2 text-xs text-[#77796E]">
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
                    <h2 className="font-semibold text-[#EFE8A8]">Stock Health</h2>
                    <p className="mt-1 text-xs text-[#929487]">
                      Current inventory condition
                    </p>
                  </div>
                  <Activity className="text-[#A9A58A]" size={19} />
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
                        <span className="text-[#C9C6B7]">{item.label}</span>
                        <span className="font-semibold text-[#EFE8A8]">
                          {item.count}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#34372F]">
                        <div
                          className={`h-full rounded-full ${item.color}`}
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
                  <h2 className="font-semibold text-[#EFE8A8]">Requires Attention</h2>
                  <p className="mt-1 text-xs text-[#929487]">
                    Products that need your attention
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveTab("Products");
                    setStockFilter("Low Stock");
                  }}
                  className="text-sm text-[#EFE8A8] transition hover:underline"
                >
                  View products →
                </button>
              </div>

              {[...outOfStockProducts, ...lowStockProducts].length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#45483A] py-10 text-center">
                  <Check className="mx-auto mb-2 text-emerald-400" size={28} />
                  <p className="text-sm text-[#D5D2BD]">
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
                        className="rounded-xl border border-[#34372F] bg-[#151916] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[#E6E2CF]">
                              {product.name}
                            </p>
                            <p className="mt-1 text-xs text-[#77796E]">
                              {product.sku}
                            </p>
                          </div>
                          {stockStatus(product)}
                        </div>
                        <div className="gold-divider my-3" />
                        <div className="flex justify-between text-xs">
                          <span className="text-[#929487]">Current stock</span>
                          <span className="text-[#E6E2CF]">
                            {product.quantity} {product.unit}
                          </span>
                        </div>
                        <div className="mt-2 flex justify-between text-xs">
                          <span className="text-[#929487]">Minimum stock</span>
                          <span className="text-[#A9A58A]">
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
                  <h2 className="font-semibold text-[#EFE8A8]">Expiry Monitoring</h2>
                  <p className="mt-1 text-xs text-[#929487]">
                    Products expiring within the next 30 days
                  </p>
                </div>
                <CalendarDays className="text-[#A9A58A]" size={20} />
              </div>

              {expiringProducts.length === 0 && expiredProducts.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#45483A] p-6 text-center text-sm text-[#929487]">
                  No expired or soon-to-expire products found.
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {[...expiredProducts, ...expiringProducts]
                    .slice(0, 6)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="flex flex-col justify-between gap-3 rounded-xl border border-[#34372F] bg-[#151916] p-4 sm:flex-row sm:items-center"
                      >
                        <div>
                          <p className="text-sm font-medium text-[#E6E2CF]">
                            {product.name}
                          </p>
                          <p className="mt-1 text-xs text-[#929487]">
                            {product.category} · {product.sku}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[#A9A58A]">
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
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-semibold text-[#EFE8A8]">
                  Product Inventory
                </h2>
                <p className="mt-1 text-sm text-[#929487]">
                  {filteredProducts.length} products displayed
                </p>
              </div>

              <button
                onClick={openAddProduct}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EFE8A8] px-4 py-3 text-sm font-semibold text-[#171916]"
              >
                <Plus size={17} />
                Add New Product
              </button>
            </div>

            {/* FILTERS */}

            <div className="flex flex-col gap-3 rounded-2xl border border-[#34372F] bg-[#1B1F1D] p-4 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77796E]"
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
                <option>All Categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
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
                  <option key={item}>{item}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`${inputClass} lg:w-40`}
              >
                <option value="name">Sort: Name</option>
                <option value="quantity">Sort: Quantity</option>
                <option value="value">Sort: Value</option>
                <option value="expiry">Sort: Expiry</option>
              </select>

              <button
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("All Categories");
                  setStockFilter("All Stock");
                  setSortBy("name");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#45483A] px-4 py-3 text-sm text-[#C9C6B7] transition hover:bg-white/5"
              >
                <Filter size={16} />
                Reset
              </button>
            </div>

            {/* FOLDED PRODUCT CARDS */}

            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#45483A] bg-[#1B1F1D] px-5 py-16 text-center">
                <Package className="mx-auto mb-3 text-[#77796E]" size={35} />
                <p className="font-medium text-[#D5D2BD]">No products found</p>
                <p className="mt-1 text-sm text-[#77796E]">
                  Add a product or change your search filters.
                </p>
                <button
                  onClick={openAddProduct}
                  className="mt-4 rounded-xl bg-[#EFE8A8] px-4 py-2.5 text-sm font-semibold text-[#171916]"
                >
                  Add your first product
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="product-fold">
                    <div className="product-fold-content flex h-full flex-col p-5">

                      {/* PRODUCT HEADER */}

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#EFE8A8]/20 bg-gradient-to-br from-[#EFE8A8]/15 to-[#EFE8A8]/5 text-[#EFE8A8] shadow-inner">
                            <Package size={22} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate pr-2 text-sm font-semibold text-[#F0ECD4]">
                              {product.name}
                            </h3>
                            <p className="mt-1 text-xs text-[#858779]">
                              {product.sku}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* CATEGORY */}

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs ${categoryColor(product.category)}`}>
                          {product.category}
                        </span>

                        {stockStatus(product)}
                      </div>

                      {/* STOCK QUANTITY */}

                      <div className="mt-5 rounded-xl border border-[#EFE8A8]/10 bg-[#121614] p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-[#929487]">
                              Available quantity
                            </p>
                            <p className="mt-1 text-2xl font-semibold text-[#EFE8A8]">
                              {product.quantity}
                              <span className="ml-1.5 text-xs font-normal text-[#A9A58A]">
                                {product.unit}
                              </span>
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-[#77796E]">Minimum</p>
                            <p className="mt-1 text-lg font-medium text-[#C9C6B7]">
                              {product.minimumStock}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#34372F]">
                          <div
                            className={`h-full rounded-full transition-all ${
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
                          <p className="text-[11px] uppercase tracking-wider text-[#77796E]">
                            Purchase
                          </p>
                          <p className="mt-1 text-sm font-medium text-[#C9C6B7]">
                            {money(product.purchasePrice)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-[#77796E]">
                            Selling
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[#EFE8A8]">
                            {money(product.sellingPrice)}
                          </p>
                        </div>
                      </div>

                      <div className="gold-divider my-4" />

                      {/* PRODUCT DETAILS */}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-[#858779]">Brand</span>
                          <span className="truncate text-right text-[#C9C6B7]">
                            {product.brand || "Not specified"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-[#858779]">Expiry date</span>
                          <span className="text-right text-[#C9C6B7]">
                            {dateLabel(product.expiryDate)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-[#858779]">Expiry status</span>
                          {expiryStatus(product)}
                        </div>

                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-[#858779]">Stock value</span>
                          <span className="font-medium text-[#EFE8A8]">
                            {money(product.quantity * product.purchasePrice)}
                          </span>
                        </div>
                      </div>

                      {/* ACTIONS */}

                      <div className="mt-auto flex gap-2 border-t border-[#34372F] pt-4">
                        <button
                          title="Adjust stock"
                          onClick={() => {
                            setAdjustProduct(product);
                            setAdjustQuantity("1");
                            setAdjustType("Stock In");
                            setAdjustNote("");
                          }}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2 py-2.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/15"
                        >
                          <PackagePlus size={15} />
                          Stock
                        </button>

                        <button
                          title="Edit product"
                          onClick={() => openEditProduct(product)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#EFE8A8]/20 bg-[#EFE8A8]/5 px-2 py-2.5 text-xs font-medium text-[#EFE8A8] transition hover:bg-[#EFE8A8]/15"
                        >
                          <Edit size={15} />
                          Edit
                        </button>

                        <button
                          title="Delete product"
                          onClick={() => setDeleteProduct(product)}
                          className="flex items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-red-400 transition hover:bg-red-500/15"
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
            <div>
              <h2 className="text-lg font-semibold text-[#EFE8A8]">
                Stock Management
              </h2>
              <p className="mt-1 text-sm text-[#929487]">
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

            <FoldedCard className="overflow-hidden">
              <div className="flex flex-col justify-between gap-3 border-b border-[#34372F] p-5 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-semibold text-[#EFE8A8]">
                    Stock Movement History
                  </h3>
                  <p className="mt-1 text-xs text-[#929487]">
                    Every stock change recorded in this browser
                  </p>
                </div>

                <button
                  onClick={exportMovements}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#45483A] px-4 py-2.5 text-sm text-[#D5D2BD] hover:bg-white/5"
                >
                  <Download size={16} />
                  Export History
                </button>
              </div>

              {movements.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <Activity className="mx-auto mb-3 text-[#77796E]" size={32} />
                  <p className="text-sm text-[#D5D2BD]">
                    No stock movements recorded yet.
                  </p>
                  <p className="mt-1 text-xs text-[#77796E]">
                    Add products or adjust existing stock to see history.
                  </p>
                </div>
              ) : (
                <div className="inventory-scroll overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="bg-[#151916] text-xs text-[#929487]">
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
                        <tr key={movement.id} className="border-t border-[#34372F]/70">
                          <td className="px-5 py-4 font-medium text-[#E6E2CF]">
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
                          <td className="px-4 py-4 text-[#D5D2BD]">
                            {movement.quantity}
                          </td>
                          <td className="px-4 py-4 text-xs text-[#A9A58A]">
                            {new Date(movement.date).toLocaleString("en-IN")}
                          </td>
                          <td className="px-5 py-4 text-xs text-[#929487]">
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
              <h3 className="mb-4 font-semibold text-[#EFE8A8]">
                Products requiring restock
              </h3>

              {lowStockProducts.length + outOfStockProducts.length === 0 ? (
                <p className="text-sm text-[#929487]">
                  No products currently need restocking.
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {[...outOfStockProducts, ...lowStockProducts].map((product) => (
                    <div
                      key={product.id}
                      className="flex flex-col justify-between gap-3 rounded-xl border border-[#34372F] bg-[#151916] p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#E6E2CF]">
                          {product.name}
                        </p>
                        <p className="mt-1 text-xs text-[#929487]">
                          Current: {product.quantity} · Minimum: {product.minimumStock}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setAdjustProduct(product);
                          setAdjustType("Stock In");
                          setAdjustQuantity("1");
                          setAdjustNote("Restock");
                        }}
                        className="rounded-lg bg-[#EFE8A8] px-4 py-2 text-xs font-semibold text-[#171916] hover:bg-[#D9D19A]"
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
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold text-[#EFE8A8]">
                  Supplier Management
                </h2>
                <p className="mt-1 text-sm text-[#929487]">
                  Manage your salon product suppliers.
                </p>
              </div>

              <button
                onClick={() => setSupplierModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EFE8A8] px-4 py-3 text-sm font-semibold text-[#171916]"
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
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#EFE8A8]/15 bg-[#EFE8A8]/10 text-[#EFE8A8]">
                        <Truck size={22} />
                      </div>

                      <button
                        onClick={() => setDeleteSupplier(supplier)}
                        className="rounded-lg p-2 text-red-400 hover:bg-red-400/10"
                        title="Delete supplier"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    <h3 className="mt-4 font-semibold text-[#EFE8A8]">
                      {supplier.name}
                    </h3>

                    <div className="mt-4 space-y-2 text-sm text-[#A9A58A]">
                      <p>{supplier.contact || "No contact number"}</p>
                      <p className="break-all">{supplier.email || "No email"}</p>
                      <p>{supplier.address || "No address"}</p>
                    </div>

                    <div className="gold-divider my-4" />

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#929487]">
                        Supplied products
                      </span>
                      <span className="font-semibold text-[#EFE8A8]">
                        {supplierProducts.length}
                      </span>
                    </div>
                  </FoldedCard>
                );
              })}
            </div>

            {suppliers.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#45483A] bg-[#1B1F1D] px-5 py-16 text-center">
                <Users className="mx-auto mb-3 text-[#77796E]" size={36} />
                <p className="font-medium text-[#D5D2BD]">
                  No suppliers added yet
                </p>
                <p className="mt-1 text-sm text-[#77796E]">
                  Add your supplier details to connect them with products.
                </p>
                <button
                  onClick={() => setSupplierModal(true)}
                  className="mt-4 rounded-xl bg-[#EFE8A8] px-4 py-2.5 text-sm font-semibold text-[#171916]"
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
            <div>
              <h2 className="text-lg font-semibold text-[#EFE8A8]">
                Inventory Reports
              </h2>
              <p className="mt-1 text-sm text-[#929487]">
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
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFE8A8]/10 text-[#EFE8A8]">
                      <Icon size={21} />
                    </div>

                    <h3 className="mt-4 font-semibold text-[#E6E2CF]">
                      {report.title}
                    </h3>

                    <p className="mt-2 min-h-10 text-xs leading-5 text-[#929487]">
                      {report.description}
                    </p>

                    <button
                      onClick={report.action}
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-[#45483A] px-3 py-3 text-sm text-[#EFE8A8] transition hover:bg-[#EFE8A8]/10"
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
                <h3 className="font-semibold text-[#EFE8A8]">
                  Inventory Valuation
                </h3>

                <div className="mt-5 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A9A58A]">Total purchase value</span>
                    <span className="font-semibold text-[#E6E2CF]">
                      {money(purchaseValue)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-[#A9A58A]">Potential selling value</span>
                    <span className="font-semibold text-[#EFE8A8]">
                      {money(sellingValue)}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-[#34372F] pt-4 text-sm">
                    <span className="text-[#A9A58A]">Estimated gross profit</span>
                    <span className={`font-semibold ${potentialProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {money(potentialProfit)}
                    </span>
                  </div>

                  <p className="text-xs leading-5 text-[#77796E]">
                    This is an estimate based on current stock and entered prices.
                    It does not represent actual sales or realized profit.
                  </p>
                </div>
              </FoldedCard>

              <FoldedCard className="p-5">
                <h3 className="font-semibold text-[#EFE8A8]">
                  Expiry Summary
                </h3>

                <div className="mt-5 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A9A58A]">Products with expiry dates</span>
                    <span className="text-[#E6E2CF]">
                      {products.filter((p) => p.expiryDate).length}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-[#A9A58A]">Expired products</span>
                    <span className="text-red-400">{expiredProducts.length}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-[#A9A58A]">Expiring within 30 days</span>
                    <span className="text-amber-300">{expiringProducts.length}</span>
                  </div>

                  <button
                    onClick={exportExpiryReport}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#45483A] px-3 py-3 text-sm text-[#EFE8A8] hover:bg-[#EFE8A8]/10"
                  >
                    <Download size={16} />
                    Download expiry report
                  </button>
                </div>
              </FoldedCard>
            </div>

            <FoldedCard className="p-5">
              <h3 className="font-semibold text-[#EFE8A8]">
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
                        <span className="text-[#C9C6B7]">
                          {category.name}
                        </span>
                        <span className="text-[#EFE8A8]">
                          {money(value)}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[#34372F]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#A9A58A] to-[#EFE8A8]"
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
                <h3 className="mb-4 text-sm font-semibold text-[#EFE8A8]">
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
                        <option key={category}>{category}</option>
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
                      <option value="">Select supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
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

              <div className="border-t border-[#34372F] pt-5">
                <h3 className="mb-4 text-sm font-semibold text-[#EFE8A8]">
                  Stock & Pricing
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
                        <option key={unit}>{unit}</option>
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

                <div className="mt-4 rounded-xl border border-[#EFE8A8]/15 bg-[#EFE8A8]/5 p-4">
                  <p className="text-xs text-[#A9A58A]">
                    Estimated profit per unit
                  </p>
                  <p className="mt-1 text-xl font-semibold text-[#EFE8A8]">
                    {money(
                      productForm.sellingPrice - productForm.purchasePrice
                    )}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#34372F] pt-5">
                <h3 className="mb-4 text-sm font-semibold text-[#EFE8A8]">
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

                <p className="mt-2 text-xs text-[#77796E]">
                  Expiry alerts are calculated automatically from the saved expiry date.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#34372F] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setProductModal(false)}
                  className="rounded-xl border border-[#45483A] px-5 py-3 text-sm text-[#C9C6B7] hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#EFE8A8] px-6 py-3 text-sm font-semibold text-[#171916] transition hover:bg-[#D9D19A]"
                >
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
              <div className="rounded-xl border border-[#34372F] bg-[#151916] p-4">
                <p className="text-xs text-[#929487]">Current available stock</p>
                <p className="mt-1 text-2xl font-semibold text-[#EFE8A8]">
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
                  <option value="Stock In">Stock In – Add quantity</option>
                  <option value="Stock Out">Stock Out – Remove quantity</option>
                  <option value="Adjustment">Adjustment – Set exact quantity</option>
                </select>
              </Field>

              <Field label={adjustType === "Adjustment" ? "New Total Quantity" : "Quantity"}>
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
                  className="rounded-xl border border-[#45483A] px-5 py-3 text-sm text-[#C9C6B7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#EFE8A8] px-6 py-3 text-sm font-semibold text-[#171916]"
                >
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
                  className="rounded-xl border border-[#45483A] px-5 py-3 text-sm text-[#C9C6B7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#EFE8A8] px-6 py-3 text-sm font-semibold text-[#171916]"
                >
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
              <div className="rounded-xl bg-red-500/10 p-3 text-red-400">
                <Trash2 size={23} />
              </div>
              <div>
                <p className="text-sm text-[#E6E2CF]">
                  Are you sure you want to delete{" "}
                  <strong>{deleteProduct.name}</strong>?
                </p>
                <p className="mt-2 text-xs leading-5 text-[#929487]">
                  The product and its stock movement history will be removed from this browser.
                </p>
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={() => setDeleteProduct(null)}
                className="rounded-xl border border-[#45483A] px-4 py-2.5 text-sm text-[#C9C6B7]"
              >
                Cancel
              </button>
              <button
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
                onClick={() => setDeleteSupplier(null)}
                className="rounded-xl border border-[#45483A] px-4 py-2.5 text-sm text-[#C9C6B7]"
              >
                Cancel
              </button>
              <button
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
          <div className="fixed bottom-5 right-5 z-[150] flex max-w-[calc(100vw-40px)] items-center gap-3 rounded-xl border border-[#EFE8A8]/30 bg-[#242822] px-5 py-4 text-sm text-[#EFE8A8] shadow-2xl animate-[fadeIn_.2s_ease-out]">
            <Check size={18} />
            {toast}
            <button
              onClick={() => setToast("")}
              className="ml-2 text-[#A9A58A] hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
