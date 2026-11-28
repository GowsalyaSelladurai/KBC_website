
"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Plus,
  Search,
  Scissors,
  Clock,
  IndianRupee,
  Pencil,
  Trash2,
  X,
  ImagePlus,
  MoreHorizontal,
  Sparkles,
  Filter,
  CheckCircle2,
  Power,
  Tag,
  ArrowUpRight,
  Layers3,
  Eye,
  ChevronDown,
  Gem,
} from "lucide-react";

type ServiceStatus = "Active" | "Inactive";

type SalonService = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  status: ServiceStatus;
  createdAt: string;
};

const STORAGE_KEY = "kbc_salon_services_v1";

const categories = [
  "Hair Styling",
  "Hair Cutting",
  "Hair Coloring",
  "Bridal Makeup",
  "Makeup",
  "Facial & Skin Care",
  "Hair Treatment",
  "Nail Care",
  "Spa & Massage",
  "Other",
];

const initialForm = {
  name: "",
  category: "Hair Styling",
  description: "",
  price: "",
  duration: "60",
  image: "",
  status: "Active" as ServiceStatus,
};

export default function SalonServicesPage() {
  const [services, setServices] = useState<SalonService[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState("");

  const [menuId, setMenuId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // LOAD SERVICES
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setServices(parsed);
        }
      }
    } catch {
      console.error("Unable to load salon services.");
    }

    setLoaded(true);
  }, []);

  // SAVE SERVICES
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(services)
        );
      } catch {
        alert(
          "Unable to save services. An uploaded image may be too large."
        );
      }
    }
  }, [services, loaded]);

  // CLOSE ACTION MENU
  useEffect(() => {
    const closeMenu = () => setMenuId(null);

    window.addEventListener("click", closeMenu);

    return () => {
      window.removeEventListener("click", closeMenu);
    };
  }, []);

  // STATISTICS
  const stats = useMemo(
    () => ({
      total: services.length,
      active: services.filter(
        (s) => s.status === "Active"
      ).length,
      inactive: services.filter(
        (s) => s.status === "Inactive"
      ).length,
      categories: new Set(
        services.map((s) => s.category)
      ).size,
    }),
    [services]
  );

  // FILTER SERVICES
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        service.name.toLowerCase().includes(searchText) ||
        service.category.toLowerCase().includes(searchText) ||
        service.description.toLowerCase().includes(searchText);

      const activeCategory =
        selectedCategory !== "All"
          ? selectedCategory
          : categoryFilter;

      const matchesCategory =
        activeCategory === "All" ||
        service.category === activeCategory;

      const matchesStatus =
        statusFilter === "All" ||
        service.status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    services,
    search,
    categoryFilter,
    statusFilter,
    selectedCategory,
  ]);

  // FORMAT PRICE
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  // ADD SERVICE
  const openAddModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setImagePreview("");
    setModalOpen(true);
    setMenuId(null);
  };

  // EDIT SERVICE
  const openEditModal = (service: SalonService) => {
    setEditingId(service.id);

    setForm({
      name: service.name,
      category: service.category,
      description: service.description,
      price: String(service.price),
      duration: String(service.duration),
      image: service.image,
      status: service.status,
    });

    setImagePreview(service.image);
    setModalOpen(true);
    setMenuId(null);
  };

  // CLOSE MODAL
  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
    setImagePreview("");
  };

  // UPDATE FORM
  const updateForm = (
    key: keyof typeof initialForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  // IMAGE UPLOAD
  const handleImage = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Please select an image smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || "");

      setImagePreview(result);
      updateForm("image", result);
    };

    reader.readAsDataURL(file);
  };

  // SAVE SERVICE
  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter a service name.");
      return;
    }

    if (
      !form.price ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) < 0
    ) {
      alert("Please enter a valid service price.");
      return;
    }

    if (
      !form.duration ||
      !Number.isFinite(Number(form.duration)) ||
      Number(form.duration) <= 0
    ) {
      alert("Please enter a valid service duration.");
      return;
    }

    if (editingId) {
      setServices((previous) =>
        previous.map((service) =>
          service.id === editingId
            ? {
                ...service,
                name: form.name.trim(),
                category: form.category,
                description: form.description.trim(),
                price: Number(form.price),
                duration: Number(form.duration),
                image: form.image,
                status: form.status,
              }
            : service
        )
      );
    } else {
      const newService: SalonService = {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        price: Number(form.price),
        duration: Number(form.duration),
        image: form.image,
        status: form.status,
        createdAt: new Date().toISOString(),
      };

      setServices((previous) => [
        newService,
        ...previous,
      ]);
    }

    closeModal();
  };

  // DELETE SERVICE
  const deleteService = (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) return;

    setServices((previous) =>
      previous.filter((service) => service.id !== id)
    );

    setMenuId(null);
  };

  // ACTIVATE / DEACTIVATE
  const toggleStatus = (id: string) => {
    setServices((previous) =>
      previous.map((service) =>
        service.id === id
          ? {
              ...service,
              status:
                service.status === "Active"
                  ? "Inactive"
                  : "Active",
            }
          : service
      )
    );

    setMenuId(null);
  };

  // CLEAR FILTERS
  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setStatusFilter("All");
    setSelectedCategory("All");
  };

  const hasFilters =
    search !== "" ||
    categoryFilter !== "All" ||
    statusFilter !== "All" ||
    selectedCategory !== "All";

  return (
    <main className="salon-page min-h-screen bg-[#FAF5ED] text-[#121414] p-4 md:p-7 space-y-7">

      {/* EDITORIAL HEADER */}
      <section className="gold-ambient-card relative overflow-hidden rounded-[28px] border border-[#C9A45C]/40 bg-[#121414] text-[#F5F1E6]">

        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute -right-20 -top-32 w-96 h-96 rounded-full border border-[#C9A45C]/30" />
          <div className="absolute -right-8 -top-20 w-72 h-72 rounded-full border border-[#C9A45C]/30" />
          <div className="absolute right-20 -top-10 w-52 h-52 rounded-full bg-[#C9A45C]/20 blur-3xl" />
        </div>

        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-7 p-6 md:p-9">

          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[#C9A45C] text-[10px] font-bold tracking-[0.25em] uppercase mb-5">
              <Gem size={14} />
              KBC ACADEMY
              <span className="text-[#777568]">/</span>
              SERVICE ATELIER
            </div>

            <div className="flex items-center gap-3 mb-3">
              <span className="w-9 h-px bg-[#C9A45C]" />

              <span className="text-xs uppercase tracking-[0.2em] text-[#D2C9A9]">
                The art of beauty
              </span>
            </div>

            <h1 className="font-serif text-4xl md:text-6xl leading-tight tracking-tight">
              Salon{" "}
              <span className="italic text-[#EFE8A8]">
                Services.
              </span>
            </h1>

            <p className="text-sm md:text-base text-[#D0CBBE] mt-4 max-w-lg leading-7">
              Curate your signature treatments. Manage your service
              collection, pricing and appointment durations in one place.
            </p>

            <div className="flex items-center gap-3 mt-7">
              <div className="flex -space-x-2">
                {["#EFE8A8", "#C9A45C", "#E8D8C5"].map(
                  (color, index) => (
                    <span
                      key={index}
                      className="w-7 h-7 rounded-full border-2 border-[#121414]"
                      style={{ backgroundColor: color }}
                    />
                  )
                )}
              </div>

              <span className="text-xs text-[#C9C4B5]">
                Your complete beauty service collection
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3">

            <div className="text-left lg:text-right mb-1">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A45C]">
                Collection size
              </p>

              <p className="text-3xl font-serif text-[#EFE8A8] mt-1">
                {String(stats.total).padStart(2, "0")}

                <span className="text-sm text-[#D0CBBE] ml-2">
                  services
                </span>
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="group flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-[#EFE8A8] to-[#C9A45C] text-[#121414] font-semibold text-sm hover:brightness-110 transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-black/20"
            >
              <span className="w-7 h-7 flex items-center justify-center rounded-full bg-black/10">
                <Plus size={17} />
              </span>

              Create new service

              <ArrowUpRight
                size={16}
                className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </section>

      {/* OVERVIEW CARDS */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">

        <OverviewCard
          title="Total collection"
          value={stats.total}
          label="Services listed"
          icon={<Layers3 size={19} />}
          accent="gold"
        />

        <OverviewCard
          title="Available now"
          value={stats.active}
          label="Active services"
          icon={<CheckCircle2 size={19} />}
          accent="green"
        />

        <OverviewCard
          title="Paused services"
          value={stats.inactive}
          label="Inactive services"
          icon={<Power size={19} />}
          accent="muted"
        />

        <OverviewCard
          title="Service groups"
          value={stats.categories}
          label="Categories covered"
          icon={<Tag size={19} />}
          accent="gold"
        />
      </section>

      {/* CATEGORY EXPLORER */}
      <section className="space-y-4">

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#98763A] mb-2">
              Explore collection
            </p>

            <h2 className="text-xl md:text-2xl font-serif text-[#121414]">
              Browse by{" "}
              <span className="italic text-[#98763A]">
                category
              </span>
            </h2>
          </div>

          <span className="text-xs text-[#756D60] hidden sm:block">
            {categories.length} service groups
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 salon-scroll">

          <CategoryPill
            label="All services"
            active={selectedCategory === "All"}
            count={services.length}
            onClick={() => {
              setSelectedCategory("All");
              setCategoryFilter("All");
            }}
          />

          {categories.map((category) => {
            const count = services.filter(
              (service) => service.category === category
            ).length;

            return (
              <CategoryPill
                key={category}
                label={category}
                active={selectedCategory === category}
                count={count}
                onClick={() => {
                  setSelectedCategory(category);
                  setCategoryFilter("All");
                }}
              />
            );
          })}
        </div>
      </section>

      {/* SERVICE COLLECTION WORKSPACE */}
      <section className="gold-ambient-card rounded-[24px] border border-[#C9A45C]/30 bg-[#121414] text-[#F5F1E6] overflow-visible">

        <div className="p-5 md:p-6 border-b border-[#C9A45C]/20">

          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">

            <div>
              <div className="flex items-center gap-2 text-[#C9A45C] text-[10px] tracking-[0.2em] uppercase mb-2">
                <Sparkles size={13} />
                Curated collection
              </div>

              <h2 className="text-2xl font-serif">
                Service{" "}
                <span className="italic text-[#EFE8A8]">
                  directory
                </span>
              </h2>

              <p className="text-xs text-[#C7C1B3] mt-2">
                {filteredServices.length} matching services in your collection
              </p>
            </div>

            {/* SEARCH AND FILTERS */}
            <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">

              <div className="relative flex-1 md:min-w-[240px]">
                <Search
                  size={16}
                  strokeWidth={1.8}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A45C] pointer-events-none z-10"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search services..."
                  className="salon-input salon-search-input"
                />
              </div>

              <div className="relative w-full md:w-[190px] shrink-0">
                <Filter
                  size={15}
                  strokeWidth={1.8}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9A45C] pointer-events-none z-10"
                />

                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setSelectedCategory("All");
                  }}
                  className="salon-select salon-category-select"
                >
                  <option value="All">All categories</option>

                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={14}
                  strokeWidth={2}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#C9A45C] z-10"
                />
              </div>

              <div className="relative w-full md:w-[155px] shrink-0">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="salon-select salon-status-select"
                >
                  <option value="All">All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <ChevronDown
                  size={14}
                  strokeWidth={2}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#C9A45C] z-10"
                />
              </div>
            </div>
          </div>

          {/* ACTIVE FILTER TAGS */}
          {hasFilters && (
            <div className="flex items-center flex-wrap gap-2 mt-4">

              <span className="text-[10px] uppercase tracking-widest text-[#C9C4B5]">
                Active filters
              </span>

              {search && (
                <FilterTag label={`Search: ${search}`} />
              )}

              {categoryFilter !== "All" && (
                <FilterTag label={categoryFilter} />
              )}

              {selectedCategory !== "All" && (
                <FilterTag label={selectedCategory} />
              )}

              {statusFilter !== "All" && (
                <FilterTag label={statusFilter} />
              )}

              <button
                onClick={clearFilters}
                className="text-[11px] text-[#EFE8A8] hover:text-white underline underline-offset-4 ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* SERVICE GALLERY */}
        <div className="p-4 md:p-6">

          {filteredServices.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-[#C9A45C]/40 bg-[#191D1A] py-16 px-5 text-center">

              <div className="w-16 h-16 rounded-full border border-[#C9A45C]/30 bg-[#C9A45C]/10 flex items-center justify-center mx-auto mb-5 text-[#EFE8A8]">
                <Scissors size={27} />
              </div>

              <h3 className="text-xl font-serif text-[#F5F1E6]">
                Nothing in this collection yet
              </h3>

              <p className="text-sm text-[#C7C1B3] mt-2">
                {services.length === 0
                  ? "Start building your salon service collection."
                  : "Try another search or remove some filters."}
              </p>

              <div className="flex justify-center flex-wrap gap-3 mt-6">

                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-5 py-3 rounded-xl border border-[#C9A45C]/40 text-sm text-[#EFE8A8] hover:bg-[#C9A45C]/10"
                  >
                    Clear filters
                  </button>
                )}

                <button
                  onClick={openAddModal}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#EFE8A8] to-[#C9A45C] text-[#121414] text-sm font-semibold hover:brightness-110"
                >
                  <span className="flex items-center gap-2">
                    <Plus size={16} />
                    Add service
                  </span>
                </button>
              </div>
            </div>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

              {filteredServices.map((service, index) => (

                <article
                  key={service.id}
                  className="service-card gold-ambient-card group"
                  style={{
                    animationDelay: `${index * 60}ms`,
                  }}
                >

                  {/* IMAGE */}
                  <div className="relative h-56 bg-[#252C27] overflow-hidden rounded-t-[18px]">

                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#C9A45C] bg-gradient-to-br from-[#292B25] to-[#171C19]">
                        <Scissors
                          size={39}
                          strokeWidth={1}
                        />

                        <span className="text-[10px] tracking-[0.2em] uppercase mt-3">
                          KBC service
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-2">

                      <span className="px-3 py-1.5 rounded-full text-[10px] font-medium tracking-wide bg-black/55 backdrop-blur-md border border-white/10 text-[#EFE8A8]">
                        {service.category}
                      </span>

                      <span
                        className={`px-3 py-1.5 rounded-full text-[10px] font-semibold backdrop-blur-md border ${
                          service.status === "Active"
                            ? "bg-emerald-950/60 border-emerald-400/20 text-emerald-200"
                            : "bg-zinc-900/70 border-zinc-400/20 text-zinc-300"
                        }`}
                      >
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                        {service.status}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end">

                      <div>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-[#EFE8A8] mb-1">
                          Signature treatment
                        </p>

                        <h3 className="font-serif text-2xl text-white leading-tight">
                          {service.name}
                        </h3>
                      </div>

                      <span className="w-9 h-9 rounded-full border border-white/30 bg-black/30 backdrop-blur-sm flex items-center justify-center text-white">
                        <ArrowUpRight size={17} />
                      </span>
                    </div>
                  </div>

                  {/* CARD CONTENT */}
                  <div className="p-5">

                    <p className="text-xs text-[#C7C1B3] leading-6 min-h-[48px] line-clamp-2">
                      {service.description ||
                        "Professional salon service crafted with care and expertise."}
                    </p>

                    {/* PRICE AND DURATION */}
                    <div className="grid grid-cols-2 gap-3 mt-5">

                      <div className="rounded-xl bg-[#FAF5ED] border border-[#C9A45C]/40 p-3 text-[#121414]">
                        <p className="text-[9px] uppercase tracking-[0.15em] text-[#756D60] mb-2">
                          Service price
                        </p>

                        <p className="flex items-center gap-1 text-lg font-semibold text-[#8B682C]">
                          <IndianRupee size={15} />
                          {service.price.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#FAF5ED] border border-[#C9A45C]/40 p-3 text-[#121414]">
                        <p className="text-[9px] uppercase tracking-[0.15em] text-[#756D60] mb-2">
                          Duration
                        </p>

                        <p className="flex items-center gap-1.5 text-sm font-semibold text-[#121414]">
                          <Clock
                            size={14}
                            className="text-[#98763A]"
                          />
                          {service.duration} min
                        </p>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#C9A45C]/25">

                      <button
                        onClick={() => openEditModal(service)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-[#C9A45C]/50 text-[#EFE8A8] text-xs font-semibold hover:bg-[#C9A45C]/15 hover:border-[#EFE8A8] transition"
                      >
                        <Pencil size={14} />
                        Edit service
                      </button>

                      <div className="relative">

                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            setMenuId(
                              menuId === service.id
                                ? null
                                : service.id
                            );
                          }}
                          aria-label={`More options for ${service.name}`}
                          className="w-11 h-11 flex items-center justify-center rounded-lg border border-[#C9A45C]/40 text-[#EFE8A8] hover:bg-[#C9A45C]/15 transition"
                        >
                          <MoreHorizontal size={19} />
                        </button>

                        {menuId === service.id && (

                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute bottom-12 right-0 z-30 w-48 bg-[#FAF5ED] border border-[#C9A45C]/50 rounded-xl shadow-2xl p-1.5 animate-menu"
                          >

                            <button
                              onClick={() =>
                                openEditModal(service)
                              }
                              className="menu-item"
                            >
                              <Pencil size={14} />
                              Edit details
                            </button>

                            <button
                              onClick={() =>
                                toggleStatus(service.id)
                              }
                              className="menu-item"
                            >
                              <Power size={14} />
                              {service.status === "Active"
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                            <div className="h-px bg-[#D8CBAE] my-1" />

                            <button
                              onClick={() =>
                                deleteService(service.id)
                              }
                              className="menu-item text-red-700 hover:bg-red-100"
                            >
                              <Trash2 size={14} />
                              Delete service
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (

        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 md:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >

          <div className="modal-panel gold-ambient-card w-full max-w-3xl max-h-[94vh] overflow-y-auto bg-[#FAF5ED] text-[#121414] border border-[#C9A45C]/60 rounded-[24px] shadow-2xl animate-modal">

            {/* MODAL HEADER */}
            <div className="sticky top-0 z-20 flex items-center justify-between bg-[#FAF5ED]/95 backdrop-blur-xl border-b border-[#C9A45C]/30 px-5 md:px-7 py-5">

              <div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-[#98763A] mb-2">
                  KBC · Service atelier
                </div>

                <h2 className="text-2xl font-serif text-[#121414]">
                  {editingId
                    ? "Refine your service"
                    : "Create a new service"}
                </h2>

                <p className="text-xs text-[#756D60] mt-1">
                  Add the details that make this treatment special.
                </p>
              </div>

              <button
                onClick={closeModal}
                aria-label="Close modal"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[#C9A45C]/40 text-[#121414] hover:bg-[#EFE8A8]"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 md:p-7 space-y-7"
            >

              {/* IMAGE */}
              <div>
                <ModalSection
                  title="Visual identity"
                  number="01"
                />

                <label className="relative flex items-center justify-center h-48 md:h-56 mt-4 rounded-2xl border border-dashed border-[#C9A45C] bg-white cursor-pointer overflow-hidden hover:border-[#98763A] transition group">

                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Service preview"
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition" />

                      <span className="absolute bottom-4 right-4 bg-black/75 border border-white/10 text-white px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                        <ImagePlus size={15} />
                        Change image
                      </span>
                    </>
                  ) : (
                    <div className="text-center text-[#756D60]">

                      <div className="w-14 h-14 rounded-2xl bg-[#EFE8A8]/50 border border-[#C9A45C]/40 flex items-center justify-center mx-auto mb-3 text-[#98763A]">
                        <ImagePlus size={26} />
                      </div>

                      <p className="text-sm font-semibold text-[#121414]">
                        Upload service photography
                      </p>

                      <p className="text-xs mt-2">
                        JPG, PNG or WEBP · Maximum 2 MB
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImage(e.target.files?.[0])
                    }
                  />
                </label>
              </div>

              {/* SERVICE INFORMATION */}
              <div>
                <ModalSection
                  title="Service information"
                  number="02"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

                  <FormField label="Service name *">
                    <input
                      required
                      value={form.name}
                      onChange={(e) =>
                        updateForm("name", e.target.value)
                      }
                      placeholder="e.g. Signature Hair Spa"
                      className="form-input"
                    />
                  </FormField>

                  <FormField label="Category">
                    <select
                      value={form.category}
                      onChange={(e) =>
                        updateForm("category", e.target.value)
                      }
                      className="form-input"
                    >
                      {categories.map((category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Service price (₹) *">
                    <div className="relative">
                      <IndianRupee
                        size={15}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98763A]"
                      />

                      <input
                        required
                        type="number"
                        min="0"
                        step="1"
                        value={form.price}
                        onChange={(e) =>
                          updateForm("price", e.target.value)
                        }
                        placeholder="4500"
                        className="form-input pl-10"
                      />
                    </div>
                  </FormField>

                  <FormField label="Duration (minutes) *">
                    <div className="relative">
                      <Clock
                        size={15}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98763A]"
                      />

                      <input
                        required
                        type="number"
                        min="1"
                        value={form.duration}
                        onChange={(e) =>
                          updateForm("duration", e.target.value)
                        }
                        placeholder="60"
                        className="form-input pl-10"
                      />
                    </div>
                  </FormField>

                  <FormField label="Service status">
                    <select
                      value={form.status}
                      onChange={(e) =>
                        updateForm(
                          "status",
                          e.target.value as ServiceStatus
                        )
                      }
                      className="form-input"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </FormField>
                </div>

                <div className="mt-4">
                  <FormField label="Service description">
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(e) =>
                        updateForm(
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Describe the treatment, experience and what is included..."
                      className="form-input resize-none"
                    />
                  </FormField>
                </div>
              </div>

              {/* LIVE PREVIEW */}
              <div className="rounded-2xl bg-white border border-[#C9A45C]/40 p-4 md:p-5">

                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#98763A] mb-4">
                  <Eye size={14} />
                  Live service preview
                </div>

                <div className="flex items-center gap-4">

                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#EFE8A8]/40 flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Scissors
                        size={23}
                        className="text-[#98763A]"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-[10px] text-[#98763A] uppercase tracking-widest">
                      {form.category}
                    </p>

                    <h3 className="font-serif text-lg text-[#121414] truncate mt-1">
                      {form.name || "Your service name"}
                    </h3>

                    <p className="text-xs text-[#756D60] mt-1">
                      {form.duration || "0"} minutes
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-[#756D60]">
                      Price
                    </p>

                    <p className="text-lg font-semibold text-[#98763A] mt-1">
                      {form.price
                        ? formatPrice(Number(form.price) || 0)
                        : "₹0"}
                    </p>
                  </div>
                </div>
              </div>

              {/* MODAL ACTIONS */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end border-t border-[#D8CBAE] pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 rounded-xl border border-[#C9A45C]/50 text-sm text-[#121414] hover:bg-[#EFE8A8]/50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#EFE8A8] to-[#C9A45C] text-[#121414] font-semibold text-sm hover:brightness-105 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />

                  {editingId
                    ? "Save changes"
                    : "Create service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAGE STYLES */}
      <style jsx global>{`

        /* =========================================
           KBC WARM IVORY PAGE
        ========================================= */

        .salon-page {
          background: #FAF5ED;
          color: #121414;
        }

        /* =========================================
           STRONG GOLDEN CARD GLOW
        ========================================= */

        .gold-ambient-card {
          position: relative;
          isolation: isolate;
          -webkit-tap-highlight-color: transparent;

          transition:
            transform 0.35s ease,
            background 0.35s ease,
            background-image 0.35s ease,
            border-color 0.35s ease,
            box-shadow 0.35s ease;
        }

        .gold-ambient-card:hover,
        .gold-ambient-card:active,
        .gold-ambient-card:focus-visible {
          border-color: #C9A45C !important;

          box-shadow:
            0 0 10px rgba(201, 164, 92, 0.75),
            0 0 24px rgba(201, 164, 92, 0.55),
            0 0 42px rgba(201, 164, 92, 0.35),
            0 12px 30px rgba(90, 62, 20, 0.20);
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

        /* =========================================
           OVERVIEW CARDS
        ========================================= */

        .overview-card {
          background: #121414;
          color: #F5F1E6;
          border: 1px solid rgba(201, 164, 92, 0.3);
        }

        .overview-card:hover,
        .overview-card:active {
          background-image: linear-gradient(
            135deg,
            #FFF4CE 0%,
            #EFE8A8 42%,
            #E8D8C5 72%,
            #C9A45C 100%
          ) !important;
          color: #121414 !important;
        }

        .overview-card:hover h3,
        .overview-card:hover p,
        .overview-card:active h3,
        .overview-card:active p {
          color: #121414 !important;
        }

        /* =========================================
           SERVICE CARDS
        ========================================= */

        .service-card {
          position: relative;
          overflow: visible;
          background: #121414;
          color: #F5F1E6;
          border: 1px solid rgba(201, 164, 92, 0.3);
          border-radius: 19px;

          transition:
            transform 0.35s ease,
            border-color 0.35s ease,
            box-shadow 0.35s ease,
            background 0.35s ease;

          animation: serviceEnter 0.5s ease both;
        }

        .service-card:hover,
        .service-card:active {
          border-color: #C9A45C;

          box-shadow:
            0 0 12px rgba(201, 164, 92, 0.65),
            0 0 28px rgba(201, 164, 92, 0.45),
            0 0 48px rgba(201, 164, 92, 0.28),
            0 18px 40px rgba(90, 62, 20, 0.18);
        }

        /* =========================================
           SEARCH AND FILTER INPUTS
        ========================================= */

        .salon-input,
        .salon-select {
          display: block;
          width: 100%;
          height: 46px;
          min-height: 46px;
          box-sizing: border-box;

          background: #FAF5ED;
          border: 1px solid #C9A45C;
          border-radius: 11px;

          color: #121414;
          font-family: inherit;
          font-size: 12px;
          line-height: 1;

          outline: none;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .salon-search-input {
          padding: 0 14px 0 44px;
        }

        .salon-category-select {
          padding: 0 36px 0 38px;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
        }

        .salon-status-select {
          padding: 0 36px 0 14px;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
        }

        .salon-input:focus,
        .salon-select:focus,
        .form-input:focus {
          border-color: #98763A;
          box-shadow: 0 0 0 3px rgba(201, 164, 92, 0.20);
        }

        .salon-input::placeholder,
        .form-input::placeholder {
          color: #817969;
        }

        .salon-select option,
        .form-input option {
          background: #FAF5ED;
          color: #121414;
        }

        /* =========================================
           MODAL FORM INPUTS
        ========================================= */

        .form-input {
          display: block;
          width: 100%;
          min-height: 46px;
          box-sizing: border-box;

          background: #FFFFFF;
          border: 1px solid #C9A45C;
          color: #121414;

          border-radius: 11px;
          padding: 13px 14px;

          font-size: 13px;
          font-family: inherit;
          outline: none;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        /* =========================================
           ACTION MENU
        ========================================= */

        .menu-item {
          display: flex;
          align-items: center;
          gap: 10px;

          width: 100%;
          padding: 10px 11px;

          border-radius: 8px;
          font-size: 12px;
          color: #121414;

          transition: background 0.2s ease;
          text-align: left;
        }

        .menu-item:hover {
          background: #EFE8A8;
        }

        /* =========================================
           CATEGORY SCROLLBAR
        ========================================= */

        .salon-scroll {
          scrollbar-width: thin;
          scrollbar-color: #C9A45C transparent;
        }

        .salon-scroll::-webkit-scrollbar {
          height: 4px;
        }

        .salon-scroll::-webkit-scrollbar-thumb {
          background: #C9A45C;
          border-radius: 10px;
        }

        /* =========================================
           ANIMATIONS
        ========================================= */

        .animate-modal {
          animation: modalEnter 0.25s ease both;
        }

        .animate-menu {
          animation: menuEnter 0.15s ease both;
        }

        @keyframes serviceEnter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes modalEnter {
          from {
            opacity: 0;
            transform: translateY(15px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes menuEnter {
          from {
            opacity: 0;
            transform: translateY(5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 767px) {
          .salon-search-input,
          .salon-category-select,
          .salon-status-select {
            height: 46px;
          }
        }

        /* =========================================
           REDUCED MOTION
        ========================================= */

        @media (prefers-reduced-motion: reduce) {
          .gold-ambient-card,
          .service-card,
          .animate-modal,
          .animate-menu {
            animation: none;
            transition: none;
          }

          .gold-ambient-card:hover,
          .gold-ambient-card:active,
          .service-card:hover {
            transform: none;
          }
        }

      `}</style>
    </main>
  );
}

/* =========================================
   OVERVIEW CARD
========================================= */

function OverviewCard({
  title,
  value,
  label,
  icon,
  accent,
}: {
  title: string;
  value: number;
  label: string;
  icon: React.ReactNode;
  accent: "gold" | "green" | "muted";
}) {
  const iconColor =
    accent === "green"
      ? "text-emerald-700 bg-emerald-100"
      : accent === "muted"
      ? "text-[#756D60] bg-white/10"
      : "text-[#EFE8A8] bg-[#C9A45C]/15";

  return (
    <div className="overview-card gold-ambient-card relative overflow-hidden rounded-2xl p-4 md:p-5 group">

      <div className="absolute -right-7 -top-8 w-24 h-24 rounded-full bg-[#C9A45C]/10 blur-2xl group-hover:bg-[#C9A45C]/20 transition" />

      <div className="relative flex items-center justify-between gap-2">

        <p className="text-xs md:text-sm text-[#D0CBBE]">
          {title}
        </p>

        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColor}`}
        >
          {icon}
        </div>
      </div>

      <div className="relative mt-5 flex items-end justify-between gap-2">

        <h3 className="text-3xl md:text-4xl font-serif text-[#EFE8A8]">
          {value.toString().padStart(2, "0")}
        </h3>

        <span className="text-[10px] text-[#C7C1B3] text-right">
          {label}
        </span>
      </div>
    </div>
  );
}

/* =========================================
   CATEGORY PILL
========================================= */

function CategoryPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl border text-xs transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-[#EFE8A8] to-[#C9A45C] border-[#C9A45C] text-[#121414] font-semibold shadow-lg shadow-[#C9A45C]/20"
          : "bg-[#FFFFFF] border-[#D8CBAE] text-[#514A3D] hover:border-[#C9A45C] hover:text-[#121414]"
      }`}
    >
      {label}

      <span
        className={`text-[10px] rounded-full px-1.5 py-0.5 ${
          active
            ? "bg-black/10 text-[#121414]"
            : "bg-[#EFE8A8] text-[#75602D]"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

/* =========================================
   FILTER TAG
========================================= */

function FilterTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#EFE8A8] border border-[#C9A45C]/50 text-[10px] text-[#51401E]">
      {label}
    </span>
  );
}

/* =========================================
   MODAL SECTION
========================================= */

function ModalSection({
  title,
  number,
}: {
  title: string;
  number: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#D8CBAE] pb-3">

      <span className="text-xs font-serif text-[#98763A]">
        {number}
      </span>

      <h3 className="font-semibold text-sm text-[#121414]">
        {title}
      </h3>

      <span className="flex-1 h-px bg-[#D8CBAE]" />
    </div>
  );
}

/* =========================================
   FORM FIELD
========================================= */

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">

      <label className="block text-xs font-medium text-[#514A3D]">
        {label}
      </label>

      {children}
    </div>
  );
}
