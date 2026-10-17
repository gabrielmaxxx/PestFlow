import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';

export interface CashFlowChartItem {
  key: string;
  name: string;
  'Prevista (Orçado + Agendado)': number;
  'Realizada (Executada)': number;
}

export interface DashboardCashFlowChartProps {
  data: CashFlowChartItem[];
  ticketMedioFormatted?: string;
}

export function DashboardCashFlowChart({ data, ticketMedioFormatted }: DashboardCashFlowChartProps) {
  return (
    <section id="section-comparativo-receita" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Fluxo de Caixa Previsto vs. Realizado
          </h2>
          <p className="text-xs font-medium text-slate-450 mt-1">
            Análise histórica comparativa de faturamento orçado (aprovado/agendado) vs. receita efetivamente liquidada.
          </p>
        </div>
        {ticketMedioFormatted && (
          <div
            id="ticket-medio-discreto"
            className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 shadow-2xs"
          >
            <span className="font-semibold text-slate-500">Ticket Médio:</span>
            <span className="font-bold text-slate-900">{ticketMedioFormatted}</span>
          </div>
        )}
      </div>

      <Card className="bg-white border border-[#E8E6E1] p-6 sm:p-8 rounded-3xl shadow-xxs">
        <div className="h-[320px] w-full" id="revenue-compare-chart-container">
          {data.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 font-bold uppercase tracking-wider py-12">
              Nenhum dado financeiro para o período.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEBE5" opacity={0.6} />
                <XAxis 
                  dataKey="name" 
                  stroke="#706F65" 
                  fontSize={10} 
                  fontWeight="bold" 
                  tickLine={false} 
                  axisLine={false} 
                  dy={8}
                />
                <YAxis 
                  stroke="#706F65" 
                  fontSize={10} 
                  fontWeight="bold" 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `R$ ${val}`}
                  dx={-8}
                />
                <Tooltip
                  formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #EBEBE5', 
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  labelStyle={{ fontSize: '10px', color: '#706F65', fontWeight: 'black', marginBottom: '4px' }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', fontFamily: 'Inter, sans-serif' }}
                />
                <Bar 
                  dataKey="Prevista (Orçado + Agendado)" 
                  fill="#8FAD88" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={45}
                />
                <Bar 
                  dataKey="Realizada (Executada)" 
                  fill="#1B3A2D" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </section>
  );
}
