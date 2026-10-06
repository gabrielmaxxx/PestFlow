import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export interface AlertItem {
  id: string;
  variant: 'danger' | 'warning' | 'info';
  colorIconClass: string;
  bgColorClass: string;
  borderColorClass: string;
  title: string;
  description: string;
  btnLabel: string;
  path: string;
  icon: React.ComponentType<any>;
}

export interface DashboardAlertsSectionProps {
  alerts: AlertItem[];
  onNavigate: (path: string) => void;
}

export function DashboardAlertsSection({ alerts, onNavigate }: DashboardAlertsSectionProps) {
  return (
    <section id="section-alertas-operacionais" className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">
          Alertas Prioritários
        </h2>
        <p className="text-xs font-medium text-slate-450 mt-1">
          Situações que exigem atenção imediata.
        </p>
      </div>

      {alerts.length === 0 ? (
        <Card className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xs text-center flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="size-8 text-emerald-500 mb-2.5" />
          <span className="font-extrabold text-[#141410] text-sm">
            Nenhum alerta prioritário encontrado.
          </span>
          <p className="text-xs text-[#6B6B5F] mt-1">
            A operação está dentro dos parâmetros.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-full">
          {alerts.map((alert) => {
            const IconComp = alert.icon;
            return (
              <div
                key={alert.id}
                className={`h-[90px] min-h-[90px] flex items-center justify-between p-4 bg-white border border-[#E8E6E1] rounded-2xl shadow-xxs hover:border-slate-300 transition-all ${alert.bgColorClass}`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-xl shrink-0 ${alert.colorIconClass}`}>
                    <IconComp className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-extrabold text-slate-900 tracking-tight leading-none">
                      {alert.title}
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500 mt-1 truncate">
                      {alert.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate(alert.path)}
                  className="ml-2 shrink-0 px-3 py-1.5 bg-slate-100 hover:bg-[#1B3A2D] hover:text-white text-slate-700 transition-all text-[11px] font-black uppercase tracking-wider rounded-lg cursor-pointer"
                >
                  {alert.btnLabel || 'Abrir'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
