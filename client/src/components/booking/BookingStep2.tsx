/*
 * HASAAD PLATFORM — Booking Step 2
 * Design: Interactive calendar + time slots grid + location/notes form
 * Arabic RTL calendar with custom styling
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, FileText, Ruler, Sun, Sunset, Moon } from "lucide-react";
import { arabicMonths, arabicDays, timeSlots, type TimeSlot } from "@/lib/bookingData";

interface BookingStep2Props {
  selectedDate: Date | null;
  selectedTimeSlot: TimeSlot | null;
  location: string;
  farmSize: string;
  notes: string;
  onDateSelect: (date: Date) => void;
  onTimeSlotSelect: (slot: TimeSlot) => void;
  onLocationChange: (value: string) => void;
  onFarmSizeChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BookingStep2({
  selectedDate,
  selectedTimeSlot,
  location,
  farmSize,
  notes,
  onDateSelect,
  onTimeSlotSelect,
  onLocationChange,
  onFarmSizeChange,
  onNotesChange,
  onNext,
  onBack,
}: BookingStep2Props) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  // Generate calendar days
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarDays: { day: number; currentMonth: boolean; date: Date }[] = [];

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      currentMonth: false,
      date: new Date(viewYear, viewMonth - 1, daysInPrevMonth - i),
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      currentMonth: true,
      date: new Date(viewYear, viewMonth, i),
    });
  }

  // Next month days
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({
      day: i,
      currentMonth: false,
      date: new Date(viewYear, viewMonth + 1, i),
    });
  }

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const isToday = (date: Date) => isSameDay(date, today);
  const isPast = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const t = new Date(today);
    t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const morningSlots = timeSlots.filter(s => s.period === "morning");
  const afternoonSlots = timeSlots.filter(s => s.period === "afternoon");
  const eveningSlots = timeSlots.filter(s => s.period === "evening");

  const canProceed = selectedDate && selectedTimeSlot && location.trim();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-black text-[#263238] mb-1">متى تريد الخدمة؟</h3>
        <p className="text-gray-500 text-sm">اختر التاريخ والوقت المناسب لزيارة المتخصص</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          {/* Calendar Header — RTL: right arrow = prev month, left arrow = next month */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              title="الشهر التالي"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div className="text-center">
              <div className="font-black text-[#263238] text-base">
                {arabicMonths[viewMonth]} {viewYear}
              </div>
            </div>
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              title="الشهر السابق"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {arabicDays.map((day) => (
              <div key={day} className="text-center text-xs font-bold text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((item, idx) => {
              const isSelected = selectedDate && isSameDay(item.date, selectedDate);
              const past = isPast(item.date);
              const todayDay = isToday(item.date);

              return (
                <button
                  key={idx}
                  onClick={() => !past && item.currentMonth && onDateSelect(item.date)}
                  disabled={past || !item.currentMonth}
                  className={`
                    aspect-square flex items-center justify-center text-sm rounded-xl font-medium transition-all duration-200
                    ${!item.currentMonth ? "text-gray-200 cursor-default" : ""}
                    ${item.currentMonth && past ? "text-gray-300 cursor-not-allowed" : ""}
                    ${item.currentMonth && !past && !isSelected && !todayDay
                      ? "hover:bg-green-50 hover:text-[#2E7D32] text-[#263238]"
                      : ""}
                    ${todayDay && !isSelected ? "bg-amber-50 text-[#C9A227] font-black" : ""}
                    ${isSelected ? "bg-[#2E7D32] text-white font-black shadow-md scale-110" : ""}
                  `}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#2E7D32]" />
              <span>محدد</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-100" />
              <span>اليوم</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-100" />
              <span>غير متاح</span>
            </div>
          </div>
        </div>

        {/* Time Slots */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="font-black text-[#263238] mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#4CAF50]" />
            الأوقات المتاحة
            {selectedDate && (
              <span className="text-sm font-medium text-gray-500 mr-auto">
                {selectedDate.getDate()} {arabicMonths[selectedDate.getMonth()]}
              </span>
            )}
          </div>

          {!selectedDate ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <div className="text-4xl mb-3">📅</div>
              <div className="text-sm font-medium">اختر تاريخًا أولاً</div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Morning */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mb-2">
                  <Sun className="w-3.5 h-3.5" />
                  الصباح
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {morningSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => slot.available && onTimeSlotSelect(slot)}
                      disabled={!slot.available}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                        selectedTimeSlot?.id === slot.id
                          ? "bg-[#2E7D32] text-white shadow-md"
                          : slot.available
                          ? "bg-gray-50 text-[#263238] hover:bg-green-50 hover:text-[#2E7D32] border border-gray-100"
                          : "bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Afternoon */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-orange-500 mb-2">
                  <Sunset className="w-3.5 h-3.5" />
                  بعد الظهر
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {afternoonSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => slot.available && onTimeSlotSelect(slot)}
                      disabled={!slot.available}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                        selectedTimeSlot?.id === slot.id
                          ? "bg-[#2E7D32] text-white shadow-md"
                          : slot.available
                          ? "bg-gray-50 text-[#263238] hover:bg-green-50 hover:text-[#2E7D32] border border-gray-100"
                          : "bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Evening */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 mb-2">
                  <Moon className="w-3.5 h-3.5" />
                  المساء
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {eveningSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => slot.available && onTimeSlotSelect(slot)}
                      disabled={!slot.available}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                        selectedTimeSlot?.id === slot.id
                          ? "bg-[#2E7D32] text-white shadow-md"
                          : slot.available
                          ? "bg-gray-50 text-[#263238] hover:bg-green-50 hover:text-[#2E7D32] border border-gray-100"
                          : "bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Location & Details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div className="font-black text-[#263238] flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#4CAF50]" />
          تفاصيل الموقع والمزرعة
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Location */}
          <div>
            <label className="block text-sm font-bold text-[#263238] mb-2">
              موقع المزرعة <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute top-3 right-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                placeholder="مثال: الرياض، حي النخيل، طريق الملك فهد"
                className="w-full pr-9 pl-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                dir="rtl"
              />
            </div>
          </div>

          {/* Farm Size */}
          <div>
            <label className="block text-sm font-bold text-[#263238] mb-2">
              مساحة المزرعة
            </label>
            <div className="relative">
              <Ruler className="absolute top-3 right-3 w-4 h-4 text-gray-400" />
              <select
                value={farmSize}
                onChange={(e) => onFarmSizeChange(e.target.value)}
                className="w-full pr-9 pl-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all bg-gray-50 focus:bg-white appearance-none"
                dir="rtl"
              >
                <option value="">اختر المساحة</option>
                <option value="less-1">أقل من هكتار واحد</option>
                <option value="1-5">١ - ٥ هكتار</option>
                <option value="5-20">٥ - ٢٠ هكتار</option>
                <option value="20-100">٢٠ - ١٠٠ هكتار</option>
                <option value="more-100">أكثر من ١٠٠ هكتار</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-bold text-[#263238] mb-2">
            ملاحظات إضافية
          </label>
          <div className="relative">
            <FileText className="absolute top-3 right-3 w-4 h-4 text-gray-400" />
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="صف المشكلة أو الخدمة المطلوبة بالتفصيل... مثال: لدي مزرعة قمح تعاني من اصفرار الأوراق منذ أسبوعين"
              rows={3}
              className="w-full pr-9 pl-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all bg-gray-50 focus:bg-white resize-none"
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-[#263238] font-semibold text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
          السابق
        </button>
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-[#2E7D32] hover:bg-[#4CAF50] text-white font-bold px-8 py-3 rounded-xl shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
        >
          مراجعة الطلب
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Re-export Clock for use in the component
import { Clock } from "lucide-react";
