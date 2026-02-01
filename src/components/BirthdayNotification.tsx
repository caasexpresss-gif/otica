
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Gift, X, Phone, Calendar } from 'lucide-react';

export const BirthdayNotification: React.FC = () => {
  const { customers } = useData();
  const [isOpen, setIsOpen] = useState(false);

  // Filter birthdays for today (Day/Month match, ignore Year)
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth(); // 0-indexed

  const birthdays = customers.filter(c => {
    if (!c.birthDate) return false;
    // Handle string "YYYY-MM-DD"
    // We assume the DB returns YYYY-MM-DD string.
    // Splitting is safer than new Date() to avoid timezone offsets shifting the day.
    const parts = c.birthDate.split('-');
    if (parts.length !== 3) return false;
    
    // parts[0] = Year, parts[1] = Month (1-12), parts[2] = Day
    const month = parseInt(parts[1], 10) - 1; // Convert to 0-indexed
    const day = parseInt(parts[2], 10);

    return day === currentDay && month === currentMonth;
  });

  if (birthdays.length === 0) return null;

  return (
    <div className="relative z-50">
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors group"
        title={`${birthdays.length} aniversariante(s) hoje!`}
      >
        <Gift className={`w-6 h-6 ${birthdays.length > 0 ? 'animate-pulse' : ''}`} />
        
        {/* Badge */}
        <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
          {birthdays.length}
        </span>
      </button>

      {/* Popover / Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop to close on click outside */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-red-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white">
                <Gift className="w-5 h-5" />
                <span className="font-bold">Aniversariantes do Dia</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto py-2">
              {birthdays.map(customer => {
                 const age = customer.birthDate 
                    ? today.getFullYear() - parseInt(customer.birthDate.split('-')[0]) 
                    : '?';

                 return (
                  <div key={customer.id} className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-semibold text-gray-800">{customer.name}</p>
                      <div className="flex items-center text-xs text-gray-500 gap-2 mt-0.5">
                        <span className="flex items-center gap-1 bg-red-50 text-red-600 px-1.5 py-0.5 rounded">
                           <Calendar className="w-3 h-3" />
                           {age} anos
                        </span>
                      </div>
                    </div>
                    
                    {customer.phone && (
                      <a 
                        href={`https://wa.me/55${customer.phone.replace(/\D/g, '')}?text=Olá ${customer.name}, parabéns pelo seu aniversário! 🎂`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                        title="Enviar parabéns no WhatsApp"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="bg-gray-50 px-4 py-2 text-center text-xs text-gray-400">
              Total: {birthdays.length} cliente(s)
            </div>
          </div>
        </>
      )}
    </div>
  );
};
