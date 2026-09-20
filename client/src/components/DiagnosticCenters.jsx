import React, { useState, useEffect } from 'react';
import { 
  TestTube, 
  Home, 
  Clock, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  CheckCircle2, 
  User, 
  Phone, 
  TrendingDown, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export default function DiagnosticCenters({
  isOffline,
  user,
  t
}) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isBookingModal, setIsBookingModal] = useState(false);
  const [bookedConfirmation, setBookedConfirmation] = useState(null);

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    patientName: user?.name || 'Rameshwar Patel',
    patientAge: user?.age || 68,
    phone: user?.phone || '9876543210',
    address: user?.address || 'House 14, Ward 3, Rampur Village, Dist. Varanasi',
    preferredDate: '2026-09-22',
    preferredTimeSlot: '07:30 AM - 08:30 AM (Morning Fasting)',
    specialSeniorAssistance: true
  });

  useEffect(() => {
    loadTests();
  }, [isOffline]);

  const loadTests = async () => {
    setLoading(true);
    const list = await api.getDiagnosticTests({}, isOffline);
    setTests(list);
    setLoading(false);
  };

  const handleOpenBooking = (test) => {
    setSelectedTest(test);
    setIsBookingModal(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    const payload = {
      testId: selectedTest.id,
      ...bookingForm
    };

    const res = await api.bookDiagnostic(payload, isOffline);
    setBookedConfirmation(res.booking || { bookingId: 'LAB-LOCAL-99', testName: selectedTest.name });
    setIsBookingModal(false);

    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    } catch (e) {}
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="brutal-card p-5 md:p-6 bg-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-brutal-purple border-3 border-black p-3 shadow-brutal flex items-center justify-center">
            <TestTube size={30} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">
              {t.diagnostics.heading}
            </h2>
            <p className="text-xs md:text-sm font-semibold text-gray-700">
              {t.diagnostics.subheading}
            </p>
          </div>
        </div>

        <div className="bg-brutal-mint border-2 border-black p-2 px-3 shadow-brutal-sm flex items-center gap-2">
          <Home size={18} className="stroke-[2.5]" />
          <span className="font-mono text-xs font-black">
            Free Rural Doorstep Sample Pickup
          </span>
        </div>
      </div>

      {/* Booking Confirmed Notification */}
      {bookedConfirmation && (
        <div className="bg-brutal-mint border-4 border-black p-4 shadow-brutal flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={32} className="stroke-[3]" />
            <div>
              <h3 className="font-black text-base md:text-lg uppercase">
                Doorstep Sample Collection Booked!
              </h3>
              <p className="text-xs font-bold text-gray-800">
                Booking ID: {bookedConfirmation.bookingId} • Test: {bookedConfirmation.testName} • Certified health technician will visit your residence on the scheduled morning slot.
              </p>
            </div>
          </div>
          <button
            onClick={() => setBookedConfirmation(null)}
            className="text-xs font-black underline hover:text-black"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tests Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tests.map((test) => {
          const savingsAmount = test.avgMarketPrice - test.rosaDiscountPrice;
          return (
            <div key={test.id} className="brutal-card p-5 bg-white flex flex-col justify-between">
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-brutal-cream border border-black font-mono text-[10px] font-bold px-2 py-0.5">
                    {test.category}
                  </span>
                  <span className="text-xs font-bold text-green-700 bg-green-100 border border-black px-2 py-0.5 flex items-center gap-1">
                    <TrendingDown size={12} />
                    Save {test.savingsPercent}% (₹{savingsAmount})
                  </span>
                </div>

                <h3 className="font-black text-lg md:text-xl text-black">
                  {test.name}
                </h3>

                {/* Tests included */}
                <div className="mt-2.5">
                  <span className="text-[11px] font-black uppercase text-gray-500 block mb-1">
                    Included Parameters:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {test.testsIncluded.map((param, idx) => (
                      <span key={idx} className="bg-gray-100 border border-black text-[11px] font-semibold px-2 py-0.5">
                        {param}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price & Turnaround Box */}
                <div className="mt-4 grid grid-cols-2 gap-3 p-3 bg-brutal-canvas border-2 border-black">
                  <div className="bg-brutal-yellow p-2 border-2 border-black text-center shadow-brutal-sm">
                    <span className="text-[10px] font-mono uppercase font-black block">
                      AI-RoSA Subsidized Fee
                    </span>
                    <span className="text-2xl font-black text-black">
                      ₹{test.rosaDiscountPrice}
                    </span>
                    <span className="text-[10px] block font-bold text-green-800">
                      Zero Home Collection Fee
                    </span>
                  </div>

                  <div className="bg-white p-2 border-2 border-black text-center shadow-brutal-sm">
                    <span className="text-[10px] font-mono uppercase font-semibold text-gray-500 block">
                      Hospital Market Rate
                    </span>
                    <span className="text-xl font-bold text-gray-400 line-through">
                      ₹{test.avgMarketPrice}
                    </span>
                    <span className="text-[10px] block font-bold text-blue-700 flex items-center justify-center gap-1 mt-1">
                      <Clock size={10} /> {test.turnaroundHours} {t.diagnostics.hoursTurnaround}
                    </span>
                  </div>
                </div>

                {/* Fasting and Prep note */}
                <div className="mt-3 p-2.5 bg-brutal-cream border border-black text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-amber-700" />
                  <span className="font-semibold text-gray-800">
                    {test.fastingRequired ? t.diagnostics.fasting : t.diagnostics.noFasting} — {test.prepInstructions}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-gray-700">
                  Accredited NABL Labs
                </span>

                <button
                  onClick={() => handleOpenBooking(test)}
                  className="brutal-btn brutal-btn-purple text-xs md:text-sm px-4 py-2"
                >
                  <Home size={15} />
                  <span>{t.diagnostics.bookCollection}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Booking Form Modal */}
      {isBookingModal && selectedTest && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b-3 border-black pb-3 mb-4">
              <h3 className="font-black text-lg md:text-xl uppercase">
                Doorstep Sample Booking
              </h3>
              <button
                onClick={() => setIsBookingModal(false)}
                className="border-2 border-black p-1 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs font-bold">
              
              <div className="p-3 bg-purple-100 border-2 border-black">
                <span className="font-mono text-[10px] text-gray-700 uppercase block">Selected Package</span>
                <span className="font-black text-sm text-black block">{selectedTest.name}</span>
                <span className="text-xs font-bold text-green-900 mt-1 block">Subsidized Fee: ₹{selectedTest.rosaDiscountPrice} (Free Doorstep Collection)</span>
              </div>

              <div>
                <label className="block mb-1 uppercase font-mono">Patient Name & Age</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={bookingForm.patientName}
                    onChange={(e) => setBookingForm({ ...bookingForm, patientName: e.target.value })}
                    className="brutal-input col-span-2 p-2"
                    required
                  />
                  <input
                    type="number"
                    value={bookingForm.patientAge}
                    onChange={(e) => setBookingForm({ ...bookingForm, patientAge: e.target.value })}
                    className="brutal-input p-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase font-mono">Phone Number</label>
                <input
                  type="text"
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                  className="brutal-input w-full p-2"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 uppercase font-mono">Home Address for Phlebotomist Visit</label>
                <textarea
                  rows={2}
                  value={bookingForm.address}
                  onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                  className="brutal-input w-full p-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 uppercase font-mono">Preferred Date</label>
                  <input
                    type="date"
                    value={bookingForm.preferredDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, preferredDate: e.target.value })}
                    className="brutal-input w-full p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 uppercase font-mono">Preferred Morning Slot</label>
                  <select
                    value={bookingForm.preferredTimeSlot}
                    onChange={(e) => setBookingForm({ ...bookingForm, preferredTimeSlot: e.target.value })}
                    className="brutal-input w-full p-2"
                  >
                    <option value="07:00 AM - 08:00 AM (Fasting)">07:00 AM - 08:00 AM (Fasting)</option>
                    <option value="08:00 AM - 09:00 AM (Fasting)">08:00 AM - 09:00 AM (Fasting)</option>
                    <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-black">
                <input
                  type="checkbox"
                  id="seniorAssistance"
                  checked={bookingForm.specialSeniorAssistance}
                  onChange={(e) => setBookingForm({ ...bookingForm, specialSeniorAssistance: e.target.checked })}
                  className="w-4 h-4 accent-black"
                />
                <label htmlFor="seniorAssistance" className="text-xs font-bold text-gray-800 cursor-pointer">
                  Request senior-friendly gentle phlebotomist (Painless blood drawing needle)
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsBookingModal(false)}
                  className="brutal-btn brutal-btn-white flex-1 py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="brutal-btn brutal-btn-mint flex-1 py-2.5"
                >
                  Confirm Doorstep Booking
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
