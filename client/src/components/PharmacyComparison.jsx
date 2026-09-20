import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  ShoppingBag, 
  TrendingDown, 
  MapPin, 
  Phone, 
  CheckCircle, 
  Store, 
  Info, 
  Sparkles,
  Percent,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export default function PharmacyComparison({
  isOffline,
  user,
  t
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [medicines, setMedicines] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedForOrder, setSelectedMedForOrder] = useState(null);
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  useEffect(() => {
    loadData();
  }, [searchQuery, categoryFilter, isOffline]);

  const loadData = async () => {
    setLoading(true);
    const params = {};
    if (searchQuery) params.query = searchQuery;
    if (categoryFilter !== 'All') params.category = categoryFilter;

    const medList = await api.getMedicines(params, isOffline);
    setMedicines(medList);

    // Fetch pharmacies
    try {
      if (!isOffline) {
        const res = await fetch('/api/pharmacy/nearby');
        if (res.ok) {
          const pData = await res.json();
          setPharmacies(pData.pharmacies);
        }
      } else {
        setPharmacies([
          {
            id: "ph-1",
            name: "Pradhan Mantri Jan Aushadhi Kendra (Rural Branch)",
            distanceKm: 0.8,
            address: "Main Panchayat Market, Rampur",
            phone: "+91 98765 43210",
            openStatus: "Open Now (Offline Record)",
            genericDiscount: "Up to 85% OFF",
            homeDelivery: true
          }
        ]);
      }
    } catch (e) {
      console.warn('Pharmacy nearby error:', e);
    }

    setLoading(false);
  };

  const handlePlaceOrder = async (med) => {
    const orderPayload = {
      pharmacyId: pharmacies[0]?.id || "ph-1",
      medicines: [{ name: med.name, price: med.genericPrice, quantity: 1 }],
      deliveryType: "HOME_DELIVERY",
      deliveryAddress: user?.address || "Rampur Village, Primary Health Road",
      contactPhone: user?.phone || "9876543210",
      patientName: user?.name || "Rameshwar Patel"
    };

    const res = await api.orderMedicine(orderPayload, isOffline);
    setOrderConfirmed(res.order || { orderId: 'PH-LOCAL-101', medicines: [med] });
    setSelectedMedForOrder(null);

    // Trigger celebration confetti for savings!
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (e) {}
  };

  const categories = ['All', 'Fever & Pain Relief', 'Diabetes Management', 'Blood Pressure & Heart', 'Bone & Joint Health'];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="brutal-card p-5 md:p-6 bg-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-brutal-yellow border-3 border-black p-3 shadow-brutal flex items-center justify-center">
            <Pill size={30} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">
              {t.pharmacy.heading}
            </h2>
            <p className="text-xs md:text-sm font-semibold text-gray-700">
              {t.pharmacy.subheading}
            </p>
          </div>
        </div>

        <div className="bg-brutal-mint border-2 border-black p-2 px-3 shadow-brutal-sm flex items-center gap-2">
          <TrendingDown size={20} className="stroke-[3]" />
          <span className="font-mono text-xs font-black">
            Govt. Jan Aushadhi Certified Generics
          </span>
        </div>
      </div>

      {/* Search Bar & Categories */}
      <div className="brutal-card p-4 md:p-5 bg-white space-y-3">
        <div className="relative">
          <Search size={20} className="absolute left-3.5 top-3.5 text-black" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.pharmacy.searchPlaceholder}
            className="brutal-input w-full pl-11 pr-4 py-3 text-sm md:text-base rounded-none font-semibold"
          />
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`border-2 border-black text-xs font-bold px-3 py-1 shadow-brutal-sm transition-all ${
                categoryFilter === cat 
                  ? 'bg-brutal-yellow font-black' 
                  : 'bg-brutal-canvas hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Order Confirmed Banner */}
      {orderConfirmed && (
        <div className="bg-brutal-mint border-4 border-black p-4 shadow-brutal flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle size={28} className="stroke-[3]" />
            <div>
              <h3 className="font-black text-base uppercase">
                Generic Medicine Order Placed Successfully!
              </h3>
              <p className="text-xs font-bold text-gray-800">
                Order ID: {orderConfirmed.orderId} • Local Jan Aushadhi pharmacy notified for home delivery.
              </p>
            </div>
          </div>
          <button
            onClick={() => setOrderConfirmed(null)}
            className="text-xs font-black underline hover:text-black"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Medicine Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {medicines.map((med) => {
          const savingsAmount = Math.round(med.brandPrice - med.genericPrice);
          return (
            <div key={med.id} className="brutal-card p-5 bg-white flex flex-col justify-between">
              
              <div>
                {/* Top Category Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-brutal-cream border border-black font-mono text-[10px] font-bold px-2 py-0.5">
                    {med.category}
                  </span>
                  <span className="text-xs font-bold text-green-700 bg-green-100 border border-black px-2 py-0.5 flex items-center gap-1">
                    <TrendingDown size={12} />
                    Save {med.savingsPercent}% (₹{savingsAmount})
                  </span>
                </div>

                <h3 className="font-black text-lg md:text-xl text-black">
                  {med.name}
                </h3>
                <p className="text-xs font-bold text-gray-600 font-mono">
                  Generic: {med.genericName}
                </p>

                {/* Direct Price Comparison Box */}
                <div className="mt-4 grid grid-cols-2 gap-3 p-3 bg-brutal-canvas border-2 border-black">
                  {/* Generic Price */}
                  <div className="bg-brutal-mint p-2 border-2 border-black text-center shadow-brutal-sm">
                    <span className="text-[10px] font-mono uppercase font-black block">
                      Jan Aushadhi Generic
                    </span>
                    <span className="text-2xl font-black text-black">
                      ₹{med.genericPrice.toFixed(2)}
                    </span>
                    <span className="text-[10px] block font-semibold text-gray-800">
                      {med.packSize}
                    </span>
                  </div>

                  {/* Commercial Brand Price */}
                  <div className="bg-white p-2 border-2 border-black text-center shadow-brutal-sm">
                    <span className="text-[10px] font-mono uppercase font-semibold text-gray-500 block">
                      Brand ({med.brandName.split('/')[0]})
                    </span>
                    <span className="text-xl font-bold text-gray-500 line-through">
                      ₹{med.brandPrice.toFixed(2)}
                    </span>
                    <span className="text-[10px] block font-bold text-red-600">
                      High Markup
                    </span>
                  </div>
                </div>

                {/* Senior Usage Tip */}
                <div className="mt-3 p-2.5 bg-yellow-50 border border-black text-xs flex items-start gap-1.5">
                  <Info size={14} className="shrink-0 text-amber-800 mt-0.5" />
                  <span className="text-gray-800 font-medium">
                    <strong>Senior Advisory:</strong> {med.elderlyNotes}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-gray-600">
                  Govt. Jan Aushadhi
                </span>

                <button
                  onClick={() => handlePlaceOrder(med)}
                  className="brutal-btn brutal-btn-yellow text-xs md:text-sm px-4 py-2"
                >
                  <ShoppingBag size={15} />
                  <span>{t.pharmacy.orderGeneric}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Nearby Pharmacies Section */}
      <div className="brutal-card p-5 md:p-6 bg-white space-y-4">
        <h3 className="font-black text-base md:text-lg uppercase tracking-tight flex items-center gap-2">
          <Store size={20} />
          <span>{t.pharmacy.nearbyPharmacies}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pharmacies.map((ph) => (
            <div key={ph.id} className="border-2 border-black p-3.5 bg-brutal-cream space-y-2 shadow-brutal-sm">
              <div className="flex items-start justify-between">
                <h4 className="font-black text-sm text-black">{ph.name}</h4>
                <span className="bg-white border border-black font-mono text-[10px] font-bold px-1.5 py-0.5">
                  {ph.distanceKm} km
                </span>
              </div>
              <p className="text-xs text-gray-700 font-medium flex items-center gap-1">
                <MapPin size={12} />
                {ph.address}
              </p>
              <p className="text-xs text-green-800 font-bold flex items-center gap-1">
                <Clock size={12} />
                {ph.openStatus}
              </p>
              <div className="pt-2 border-t border-black/20 flex items-center justify-between text-xs font-bold">
                <span className="text-red-700">{ph.genericDiscount}</span>
                <a
                  href={`tel:${ph.phone}`}
                  className="inline-flex items-center gap-1 text-blue-700 underline"
                >
                  <Phone size={12} /> Call
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
