'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { servicesService } from '@/services/services.service';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/types/auth.types';
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Zap,
  Wrench,
  Clock,
  Sparkles,
  ChevronRight,
  MessageSquare,
  CheckCircle2,
  Award,
  Headphones,
  ArrowRight,
  Tag,
  SlidersHorizontal,
  Layers,
  Check,
  Filter,
} from 'lucide-react';

const FALLBACK_CATEGORIES = [
  {
    id: 'ac-repair',
    name: 'AC Repair & Service',
    icon: '❄️',
    description: 'Expert AC chemical wash, gas refill, compressor troubleshooting, and mounting.',
    count: '5 Services',
    services: [
      {
        id: 'ac-master-clean',
        name: 'Split AC Master Chemical Wash',
        description: 'Complete high-pressure jet pump cleaning of indoor cooling coil, blower wheel, and outdoor condenser with antibacterial sanitization.',
        basePrice: 850,
        durationMin: 60,
        isFixedPrice: true,
      },
      {
        id: 'ac-gas-refill',
        name: 'AC Refrigerant Gas Top-Up (R22 / R410 / R32)',
        description: 'Complete flare leak inspection, vacuuming, and pure OEM refrigerant gas recharging.',
        basePrice: 1800,
        durationMin: 45,
        isFixedPrice: false,
      },
      {
        id: 'ac-install-uninstall',
        name: 'AC Installation & Shifting Support',
        description: 'Precision wall mounting, bracket installation, copper piping connection, and cooling load testing.',
        basePrice: 1500,
        durationMin: 90,
        isFixedPrice: true,
      },
      {
        id: 'ac-troubleshoot',
        name: 'AC Electrical & PCB Circuit Repair',
        description: 'Capacitor replacement, PCB motherboard diagnostic, sensor repair, and wiring insulation.',
        basePrice: 650,
        durationMin: 45,
        isFixedPrice: false,
      },
      {
        id: 'ac-drainage',
        name: 'AC Water Leakage & Drainage Clearing',
        description: 'Condensation tray clearing, drainage pipe unblocking, and insulation wrapping.',
        basePrice: 500,
        durationMin: 35,
        isFixedPrice: true,
      },
    ],
  },
  {
    id: 'electrical',
    name: 'Electrical & Wiring',
    icon: '⚡',
    description: 'Certified electricians for short circuits, circuit breaker DB box, switches, and fans.',
    count: '5 Services',
    services: [
      {
        id: 'elec-short-circuit',
        name: 'Emergency Short Circuit & Trip Isolation',
        description: 'Locate faulty wiring loops, burned sockets, and replace defective MCB/RCCB breakers.',
        basePrice: 450,
        durationMin: 40,
        isFixedPrice: false,
      },
      {
        id: 'elec-fan-light',
        name: 'Ceiling Fan & Chandelier Hanging Setup',
        description: 'Heavy ceiling fastener anchor installation, wire concealment, and regulator balancing.',
        basePrice: 350,
        durationMin: 30,
        isFixedPrice: true,
      },
      {
        id: 'elec-db-box',
        name: 'Main DB Distribution Box Overhaul',
        description: 'Load balancing, phase distributor replacement, and high-conductivity copper earth line connection.',
        basePrice: 1200,
        durationMin: 75,
        isFixedPrice: false,
      },
      {
        id: 'elec-switch',
        name: 'Switch & Smart Socket Replacement',
        description: 'Modular switchboard installation, gang switch wiring, and surge protection setup.',
        basePrice: 300,
        durationMin: 25,
        isFixedPrice: true,
      },
    ],
  },
  {
    id: 'plumbing',
    name: 'Plumbing & Sanitary',
    icon: '🔧',
    description: 'Concealed pipe leak repair, basin/commode replacement, water pump, and drain snaking.',
    count: '5 Services',
    services: [
      {
        id: 'plumb-leakage',
        name: 'Pipe Line Leakage & Water Tap Replacement',
        description: 'Concealed CPVC/PPR pipe pressure testing, angle stop valve repair, and Teflon sealing.',
        basePrice: 400,
        durationMin: 35,
        isFixedPrice: true,
      },
      {
        id: 'plumb-blockage',
        name: 'Drainage Blockage Clearing & Machine Snaking',
        description: 'Heavy duty motorized snake auger clearing for kitchen sink, floor drain, and commode line.',
        basePrice: 750,
        durationMin: 45,
        isFixedPrice: false,
      },
      {
        id: 'plumb-motor',
        name: 'Water Motor Pump Servicing & Float Switch',
        description: 'Centrifugal/submersible pump bearing replacement, capacitor fix, and auto overhead float switch.',
        basePrice: 950,
        durationMin: 60,
        isFixedPrice: false,
      },
      {
        id: 'plumb-flush',
        name: 'Commode & Flush Tank Mechanism Overhaul',
        description: 'Syphon kit replacement, push button repair, wax ring leak prevention, and silicone base seal.',
        basePrice: 650,
        durationMin: 50,
        isFixedPrice: true,
      },
    ],
  },
  {
    id: 'appliance',
    name: 'Home Appliances',
    icon: '📺',
    description: 'Expert repair of Refrigerator, Washing Machine, Microwave Oven, and Water Geysers.',
    count: '4 Services',
    services: [
      {
        id: 'app-refrigerator',
        name: 'Refrigerator Cooling & Gas Refill',
        description: 'Compressor relay check, defrost timer fix, condenser coil flushing, and refrigerant charge.',
        basePrice: 1200,
        durationMin: 60,
        isFixedPrice: false,
      },
      {
        id: 'app-washing-machine',
        name: 'Washing Machine Drum & Motor Repair',
        description: 'Top/front load spin cycle fix, drain pump replacement, suspension damper check, and belt change.',
        basePrice: 950,
        durationMin: 60,
        isFixedPrice: false,
      },
      {
        id: 'app-microwave',
        name: 'Microwave Oven Magnetron & Fuse Repair',
        description: 'High voltage diode test, magnetron replacement, turntable motor fix, and door interlock repair.',
        basePrice: 700,
        durationMin: 45,
        isFixedPrice: false,
      },
    ],
  },
  {
    id: 'cleaning',
    name: 'Deep Home Cleaning',
    icon: '🧹',
    description: 'Industrial floor scrubbing, kitchen degreasing, bathroom scaling, and sofa shampoo.',
    count: '4 Services',
    services: [
      {
        id: 'clean-deep-home',
        name: 'Full Home Deep Disinfection (Per Sqft)',
        description: 'High-speed rotary machine floor polishing, tile grout whitening, and eco-friendly antimicrobial fogging.',
        basePrice: 2200,
        durationMin: 180,
        isFixedPrice: true,
      },
      {
        id: 'clean-sofa-carpet',
        name: 'Sofa & Carpet Foam Shampoo Wash',
        description: 'Deep fabric extraction vacuuming, stain-lifting active foam wash, and dust-mite deodorizer.',
        basePrice: 850,
        durationMin: 60,
        isFixedPrice: true,
      },
      {
        id: 'clean-water-tank',
        name: 'Overhead & Underground Water Tank Cleaning',
        description: 'Sludge suctioning, high-pressure rotatory jet washing, and chlorine sterilization.',
        basePrice: 1500,
        durationMin: 90,
        isFixedPrice: true,
      },
    ],
  },
  {
    id: 'painting',
    name: 'Painting & Renovation',
    icon: '🎨',
    description: 'Interior wall painting, damp waterproofing, weather-coat, and drywall putty finishes.',
    count: '3 Services',
    services: [
      {
        id: 'paint-interior',
        name: 'Interior Wall Painting & Putty Touch-Up',
        description: 'Wall sanding, 2 coats primer + luxury silk emulsion paint with edge masking tape.',
        basePrice: 3500,
        durationMin: 240,
        isFixedPrice: false,
      },
      {
        id: 'paint-waterproof',
        name: 'Rooftop Damp & Waterproofing Sealer',
        description: 'Polymer elastomeric membrane coating, crack sealing, and UV reflective heat-reduction finish.',
        basePrice: 4500,
        durationMin: 180,
        isFixedPrice: false,
      },
    ],
  },
];

const ICONS_MAP: Record<string, string> = {
  'ac': '❄️',
  'air': '❄️',
  'electric': '⚡',
  'plumb': '🔧',
  'appliance': '📺',
  'clean': '🧹',
  'paint': '🎨',
  'cctv': '📹',
  'security': '📹',
  'wood': '🪚',
  'carpenter': '🪚',
};

function getCategoryIcon(name: string, iconUrl?: string | null): string {
  if (iconUrl && iconUrl.length <= 4) return iconUrl;
  const lower = name.toLowerCase();
  for (const key of Object.keys(ICONS_MAP)) {
    if (lower.includes(key)) return ICONS_MAP[key];
  }
  return '🛠️';
}

export default function HomePage() {
  const { user, activeRole, isAuthenticated } = useAuthStore();
  const servicesSectionRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [priceTypeFilter, setPriceTypeFilter] = useState<'ALL' | 'FIXED' | 'INSPECTION'>('ALL');

  // 1. Fetch categories from backend API
  const { data: dbCategories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => servicesService.getCategories(),
  });

  // 2. Normalise category list
  const displayCategories = React.useMemo(() => {
    if (dbCategories && dbCategories.length > 0) {
      return dbCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || 'Professional and verified service technicians.',
        icon: getCategoryIcon(c.name, c.iconUrl),
        count: `${c.services?.length || c._count?.services || 0} Services`,
        services: c.services || [],
      }));
    }
    return FALLBACK_CATEGORIES;
  }, [dbCategories]);

  // Set default selected category once categories load
  useEffect(() => {
    if (displayCategories.length > 0) {
      const exists = displayCategories.some((c) => c.id === selectedCategoryId);
      if (!selectedCategoryId || !exists) {
        setSelectedCategoryId(displayCategories[0].id);
      }
    }
  }, [displayCategories, selectedCategoryId]);

  // 3. Active selected category object
  const activeCategory =
    displayCategories.find((c) => c.id === selectedCategoryId) ||
    displayCategories[0];

  // 4. Fetch services for the selected category
  const { data: dbServices, isLoading: isServicesLoading } = useQuery({
    queryKey: ['services-by-category', selectedCategoryId],
    queryFn: () => servicesService.getServices(selectedCategoryId),
    enabled: !!selectedCategoryId,
  });

  // 5. Determine active services (prefer DB query results, then category relation, then fallback)
  const activeServices = React.useMemo(() => {
    if (dbServices && dbServices.length > 0) {
      return dbServices;
    }
    if (activeCategory?.services && activeCategory.services.length > 0) {
      return activeCategory.services;
    }
    return FALLBACK_CATEGORIES[0].services;
  }, [dbServices, activeCategory]);

  // 6. Filter services based on search query & price type filter
  const filteredServices = React.useMemo(() => {
    return activeServices.filter((s: any) => {
      const matchesSearch = searchQuery
        ? s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesPrice =
        priceTypeFilter === 'ALL'
          ? true
          : priceTypeFilter === 'FIXED'
            ? s.isFixedPrice === true
            : s.isFixedPrice === false;

      return matchesSearch && matchesPrice;
    });
  }, [activeServices, searchQuery, priceTypeFilter]);

  // Category click handler with smooth scrolling to services
  const handleCategoryClick = (catId: string) => {
    setSelectedCategoryId(catId);
    setPriceTypeFilter('ALL');
    // Smooth scroll down to services grid
    if (servicesSectionRef.current) {
      const yOffset = -80;
      const y = servicesSectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Banner */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-6 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Flow A Counselor Routing • 3-Day Free Warranty • 2-Step Pricing</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-zinc-900 dark:text-white">
              Instant Verified Services,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                Guaranteed Satisfaction
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Click any category below to immediately see all available services,
              consult with an active counselor in real-time, and get guaranteed on-site fixes.
            </p>

            {/* Live Search Box */}
            <div className="mt-8 max-w-2xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2.5 shadow-xl shadow-zinc-200/50 dark:shadow-none flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2.5 px-3 w-full">
                <Search className="w-5 h-5 text-emerald-600 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search service name (e.g. Master Chemical Wash, Gas Refill, Water Pump)..."
                  className="w-full text-sm bg-transparent border-none focus:outline-none text-zinc-900 dark:text-white placeholder-zinc-400 py-2"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-2 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <Link
                href={`/chat?serviceId=${encodeURIComponent(searchQuery || selectedCategoryId || 'general-service')}`}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/30 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Consult Counselor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 1. INTERACTIVE CATEGORIES EXPLORER */}
      <section className="py-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                  Explore Popular Categories
                </h2>
                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> Click to View Services
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                Select any category to load all specialized services and pricing
              </p>
            </div>

            <Link
              href="/chat"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 self-start sm:self-auto"
            >
              Direct Counselor Chat <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {displayCategories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`group relative p-4 border rounded-2xl transition-all duration-200 cursor-pointer flex flex-col items-center text-center justify-between min-h-[140px] ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/40 ring-2 ring-emerald-500 shadow-xl shadow-emerald-500/15 scale-[1.03] z-10'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:shadow-md'
                  }`}
                >
                  {/* Active Indicator Top Badge */}
                  {isSelected && (
                    <span className="absolute -top-2.5 right-2 px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-extrabold rounded-full flex items-center gap-0.5 shadow-sm">
                      <Check className="w-2.5 h-2.5" /> Selected
                    </span>
                  )}

                  <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-115 transition-transform duration-200">
                    {cat.icon}
                  </div>

                  <div className="w-full">
                    <h3
                      className={`text-xs font-bold line-clamp-2 leading-tight ${
                        isSelected
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-zinc-900 dark:text-white'
                      }`}
                    >
                      {cat.name}
                    </h3>

                    <span
                      className={`text-[11px] mt-1.5 block font-semibold ${
                        isSelected
                          ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC SERVICES GRID (Rendered Under Selected Category) */}
      <section
        ref={servicesSectionRef}
        id="services-section"
        className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20"
      >
        {/* Category Header Banner & Filter Pills */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-3xl shrink-0 shadow-inner">
                {activeCategory?.icon}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                    {activeCategory?.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {filteredServices.length} Services Available
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 max-w-2xl leading-relaxed">
                  {activeCategory?.description ||
                    'Select any service below to connect directly with our support counselor, receive fair 2-step pricing, and book top-rated technicians.'}
                </p>
              </div>
            </div>

            {/* Filter Toggle Buttons */}
            <div className="flex items-center gap-2 flex-wrap self-start md:self-auto shrink-0">
              <span className="text-xs font-bold text-zinc-400 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              <button
                type="button"
                onClick={() => setPriceTypeFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  priceTypeFilter === 'ALL'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                }`}
              >
                All ({activeServices.length})
              </button>
              <button
                type="button"
                onClick={() => setPriceTypeFilter('FIXED')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  priceTypeFilter === 'FIXED'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                }`}
              >
                Fixed Price
              </button>
              <button
                type="button"
                onClick={() => setPriceTypeFilter('INSPECTION')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  priceTypeFilter === 'INSPECTION'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                }`}
              >
                Inspection Based
              </button>
            </div>
          </div>
        </div>

        {/* Services Cards Grid */}
        {isServicesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              No matching services found
            </h3>
            <p className="text-xs text-zinc-500 mt-1 mb-5">
              Try clearing your search query or switching to another filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setPriceTypeFilter('ALL');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service: any) => (
              <div
                key={service.id}
                className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Badge & Type */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                      <span>{activeCategory?.icon}</span>
                      <span>{activeCategory?.name}</span>
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md shrink-0 ${
                        service.isFixedPrice
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {service.isFixedPrice ? 'Fixed Price' : 'Diagnostic / Inspection'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 transition-colors leading-snug">
                    {service.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mt-2 mb-4">
                    {service.description ||
                      'Complete diagnostic, skilled technician dispatch, verified genuine parts replacement, and full testing.'}
                  </p>

                  {/* Price and Duration Badge */}
                  <div className="flex items-center justify-between py-3 px-4 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 mb-5">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                        Starting Price
                      </span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        ৳ {Number(service.basePrice || 400).toFixed(0)}
                      </span>
                    </div>

                    <div className="h-7 w-px bg-zinc-200 dark:bg-zinc-800" />

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block flex items-center gap-1 justify-end tracking-wider">
                        <Clock className="w-3 h-3 text-zinc-400" /> Time
                      </span>
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {service.durationMin || 45} mins
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                  <Link
                    href={`/chat?serviceId=${service.id}&categoryId=${activeCategory?.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>Consult Counselor</span>
                  </Link>

                  <Link
                    href={`/orders/new?serviceId=${service.id}`}
                    className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Customer Flow A Feature Section */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-emerald-600/10 via-teal-500/5 to-zinc-900/10 border border-emerald-500/20 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full mb-4">
              <Headphones className="w-3.5 h-3.5" />
              <span>Flow A Intelligent Routing Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Need Fast & Reliable Assistance?
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
              Connect instantly with our support counselor who will assess your requirement, assign the highest-rated verified technician near your location, and lock in your 3-day warranty guarantee.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/chat"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Start Live Consultation</span>
              </Link>
              <Link
                href="/orders"
                className="px-6 py-3 bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-900 dark:text-white text-xs sm:text-sm font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 transition-all"
              >
                Track Existing Orders
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PRD Pillars & Guarantee Showcase */}
      <section className="py-16 bg-zinc-100/70 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Built on Transparency & Security
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2">
              Every order is protected by our automated platform guarantees
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                3-Day Free Warranty
              </h3>
              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                If the fix encounters an issue within 3 days, request a free service revision with zero extra cost.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                2-Step Fair Pricing
              </h3>
              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                Providers can only adjust prices up to 2 times, requiring your explicit in-app approval.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Monthly Leveling
              </h3>
              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                Only top-performing agencies earn Platinum and Gold status based on real customer review scores.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Legal Escrow Protection
              </h3>
              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                Full incident dossier and audit logging protecting both customers and providers in any dispute.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
        © 2026 Master Services Platform. All rights reserved.
      </footer>
    </div>
  );
}
