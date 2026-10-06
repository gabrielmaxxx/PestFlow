import React from 'react';
import { Sparkles, RotateCcw, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CollapsibleSection } from '@/components/ui/collapsible-section';

export interface AIInsightItem {
  id: string;
  title: string;
  message: string;
  recommendation?: string;
  btnLabel: string;
  path: string;
  isAiGenerated?: boolean;
}

export interface DashboardAIInsightsSectionProps {
  insights: AIInsightItem[];
  healthScore: number;
  healthColorText: string;
  healthBgClass: string;
  healthBorderClass: string;
  avgMarginValue: number;
  minMarginTarget: number;
  lowStockCount: number;
  qualityScore: number;
  serviceCountValue: number;
  serviceTarget: number;
  clientsCount: number;
  isLoading: boolean;
  onRefreshAI: () => void;
  onNavigate: (path: string) => void;
}

export function DashboardAIInsightsSection({
  insights,
  healthScore,
  healthColorText,
  healthBgClass,
  healthBorderClass,
  avgMarginValue,
  minMarginTarget,
  lowStockCount,
  qualityScore,
  serviceCountValue,
  serviceTarget,
  clientsCount,
  isLoading,
  onRefreshAI,
  onNavigate,
}: DashboardAIInsightsSectionProps) {
  const healthStatusLabel =
    healthScore >= 80 ? 'Excelente' : healthScore >= 60 ? 'Regular' : 'Crítico';

  return (
    <div id="section-ia-operacional" className="pt-1">
      <CollapsibleSection
        id="collapsible-ia-operacional"
        defaultOpen={false}
        variant="card"
        icon={<Sparkles className="size-5 text-[#2D6A4F]" />}
        title="IA Operacional & Saúde da Empresa"
        description="Análises estratégicas, alertas regulatórios e diagnóstico do negócio."
        badge={
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {insights.length} {insights.length === 1 ? 'insight disponível' : 'insights disponíveis'}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black border ${healthBorderClass} ${healthBgClass} ${healthColorText}`}
            >
              Saúde: {healthScore}/100 • {healthStatusLabel}
            </span>
          </div>
        }
        headerActions={
          <button
            type="button"
            onClick={onRefreshAI}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-3xs cursor-pointer disabled:opacity-50"
          >
            <RotateCcw
              className={`size-3.5 ${isLoading ? 'animate-spin text-[#1B3A2D]' : ''}`}
            />
            <span>{isLoading ? 'Atualizando IA...' : 'Atualizar Insights'}</span>
          </button>
        }
        contentClassName="pt-4"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* INSIGHTS CARDS LIST (COL-SPAN-2) */}
          <div className="lg:col-span-2 space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="p-5 bg-white border border-[#E8E6E1] rounded-2xl hover:border-slate-350 transition-all shadow-xxs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="p-2.5 bg-emerald-50 text-[#1B3A2D] rounded-xl shrink-0 mt-0.5">
                    <Sparkles className="size-4" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                        {insight.title}
                      </span>
                      {insight.isAiGenerated && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-[#1B3A2D] text-[9px] font-bold">
                          IA Ativa
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-700 leading-snug">
                      {insight.message}
                    </p>
                    {insight.recommendation && (
                      <p className="text-[11px] text-slate-500 font-medium pt-0.5">
                        <strong className="text-slate-700">Recomendação:</strong> {insight.recommendation}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate(insight.path)}
                  className="shrink-0 flex items-center gap-1 self-start sm:self-auto px-3.5 py-2 hover:bg-[#1B3A2D] hover:text-white bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <span>{insight.btnLabel}</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* CARD DE SAÚDE DA EMPRESA */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white border border-[#E8E6E1] rounded-2xl shadow-xxs flex flex-col justify-between h-full space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-[#6B6B5F] uppercase tracking-wider leading-none">
                  Saúde Operacional
                </h3>
                <p className="text-[11px] font-medium text-slate-400 mt-2">
                  Métricas agregadas integradas do negócio.
                </p>
              </div>

              {/* Main Gauge / Score bubble */}
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <div
                  className={`size-24 rounded-full border-4 ${healthBorderClass} flex flex-col items-center justify-center ${healthBgClass} shadow-xxs`}
                >
                  <span className={`text-3xl font-black ${healthColorText}`}>
                    {healthScore}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">/100</span>
                </div>
                <div className="text-center pt-1">
                  <span
                    className={`text-[10px] font-black px-3.5 py-1.5 rounded-full border ${healthBorderClass} uppercase tracking-widest ${healthColorText}`}
                  >
                    {healthStatusLabel}
                  </span>
                </div>
              </div>

              {/* Indicadores complementares do score */}
              <div className="space-y-3.5 pt-2 border-t border-slate-100">
                {/* Financeiro */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Financeiro (Margem)</span>
                  <span
                    className={
                      avgMarginValue >= minMarginTarget
                        ? 'text-emerald-700 font-extrabold'
                        : 'text-amber-600 font-extrabold'
                    }
                  >
                    {avgMarginValue >= minMarginTarget ? 'Excelente' : 'Abaixo da meta'}
                  </span>
                </div>

                {/* Estoque */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Estoque (Ruptura)</span>
                  <span
                    className={
                      lowStockCount === 0
                        ? 'text-emerald-700 font-extrabold'
                        : 'text-red-650 font-extrabold'
                    }
                  >
                    {lowStockCount === 0 ? 'Conforme' : `${lowStockCount} críticos`}
                  </span>
                </div>

                {/* Qualidade */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Qualidade (Retornos)</span>
                  <span
                    className={
                      qualityScore >= 80
                        ? 'text-emerald-700 font-extrabold'
                        : 'text-amber-600 font-extrabold'
                    }
                  >
                    {qualityScore}% conformidade
                  </span>
                </div>

                {/* Sincronização agenda */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Serviços Executados</span>
                  <span
                    className={
                      serviceCountValue >= serviceTarget
                        ? 'text-emerald-700 font-extrabold'
                        : serviceCountValue >= serviceTarget * 0.4
                        ? 'text-amber-655 font-extrabold'
                        : 'text-slate-500'
                    }
                  >
                    {serviceCountValue} / {serviceTarget}
                  </span>
                </div>

                {/* Clientes */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Carteira Clientes</span>
                  <span className="text-[#1B3A2D] font-extrabold">{clientsCount} ativos</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
