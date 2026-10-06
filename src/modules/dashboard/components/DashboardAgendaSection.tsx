import React from 'react';
import { ArrowRight, MoreVertical } from 'lucide-react';

export interface AgendaItem {
  id: string;
  time: string;
  client: string;
  service: string;
  address: string;
  status: 'Agendado' | 'Confirmado' | 'Garantia' | 'Expirado';
}

export interface DashboardAgendaSectionProps {
  currentMonth: string;
  items: AgendaItem[];
  onNavigate: (path: string) => void;
}

export function DashboardAgendaSection({
  currentMonth,
  items,
  onNavigate,
}: DashboardAgendaSectionProps) {
  const formattedMonth = currentMonth.split('-').reverse().join('/');

  return (
    <section id="section-agenda-operacional" className="space-y-4 pt-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Próximos Serviços
          </h2>
          <p className="text-xs font-medium text-slate-450 mt-1">
            Compromissos programados para a competência atual {formattedMonth}.
          </p>
        </div>

        <button
          id="btn-agenda-completa"
          onClick={() => onNavigate('/agenda')}
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 hover:text-[#1B3A2D] transition-colors bg-white px-3.5 py-2 border border-[#E8E6E1] hover:border-slate-350 rounded-xl cursor-pointer"
        >
          <span>Ver Agenda Completa</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>

      {/* AGENDA ITEMS LIST TABLE */}
      <div className="w-full overflow-hidden bg-white border border-[#E8E6E1] rounded-2xl shadow-xxs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 h-[56px] border-b border-sky-100/30">
                <th className="pl-6 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[120px]">
                  Horário
                </th>
                <th className="px-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Cliente
                </th>
                <th className="px-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Serviço
                </th>
                <th className="px-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Endereço Resumido
                </th>
                <th className="px-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[140px] text-center">
                  Status
                </th>
                <th className="pr-6 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[60px] text-center">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold text-xs font-sans">
                    Nenhum serviço agendado no período atual.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onNavigate('/agenda')}
                    className="h-[60px] hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    {/* Time */}
                    <td className="pl-6 py-3 font-mono text-xs font-bold text-slate-450">
                      {item.time}
                    </td>
                    
                    {/* Client */}
                    <td className="px-5 py-3 text-sm font-bold text-slate-800 tracking-tight">
                      {item.client}
                    </td>
                    
                    {/* Service */}
                    <td className="px-5 py-3 text-sm font-semibold text-[#1B3A2D]">
                      {item.service}
                    </td>
                    
                    {/* Short Address */}
                    <td className="px-5 py-3 text-xs font-medium text-slate-500">
                      {item.address}
                    </td>
                    
                    {/* Status Badge */}
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center h-8 px-3.5 rounded-full text-xs font-semibold tracking-wide border transition-all ${
                          item.status === 'Confirmado'
                            ? 'bg-teal-50 text-teal-700 border-teal-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    
                    {/* Quick Action column (⋮) */}
                    <td className="pr-6 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Ver opções"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
