import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Users,
  Calendar,
  Package,
  AlertTriangle,
  Clock,
  RefreshCw,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { useSystemStore, selectMargemMesAnterior, selectContratosParaReajuste } from '@/store/systemStore';
import { useAuth } from '@/auth/hooks/useAuth';
import { analyticsService } from './services/analyticsService';
import { HeaderMetric, HeaderMetricGroup } from '@/components/HeaderMetric';
import { formatBRL, formatPercent } from '@/utils/format';
import {
  DashboardAlertsSection,
  DashboardCashFlowChart,
  DashboardAgendaSection,
  DashboardAIInsightsSection,
  DisponibilidadeTecnicos,
  AlertItem,
  AgendaItem,
} from './components';

export function DashboardPage() {
  const { empresaId } = useAuth();
  const systemState = useSystemStore();
  const { financial, inventory, quotes, pops, agenda, clients, contracts, settings } = systemState;
  const navigate = useNavigate();

  const [aiInsightsList, setAiInsightsList] = useState<any[]>([]);
  const [aiInsightsLoading, setAiInsightsLoading] = useState<boolean>(false);

  // DATA EXTRACTION AND COMPUTATIONS (REAL VALUES REGULATORY PARSED)
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  // Filter movements for current month that are RECEITAS and paid
  const currentMonthMovements = useMemo(() => {
    return (financial?.movements || []).filter(m => 
      m.date && m.date.startsWith(currentMonth)
    );
  }, [financial?.movements, currentMonth]);

  const revenueValue = useMemo(() => {
    return currentMonthMovements
      .filter(m => m.category === 'RECEITAS' && m.isPaid === true)
      .reduce((sum, m) => sum + Math.abs(m.value), 0);
  }, [currentMonthMovements]);

  // Filter quotes approved or executed in current month
  const currentMonthQuotes = useMemo(() => {
    return (quotes?.list || []).filter(q => 
      q.createdAt && q.createdAt.startsWith(currentMonth) && 
      (q.status === 'aprovado' || q.status === 'executado')
    );
  }, [quotes?.list, currentMonth]);
  
  const serviceCountValue = currentMonthQuotes.length;

  // Average Ticket Value
  const avgTicketValue = serviceCountValue > 0 ? (revenueValue / serviceCountValue) : 0;

  // Average Margin Margem Média (from non-draft active quotes of current month)
  const activeMonthQuotes = useMemo(() => {
    return (quotes?.list || []).filter(q => 
      q.createdAt && q.createdAt.startsWith(currentMonth) && 
      q.status !== 'rascunho' && 
      q.status !== 'recusado'
    );
  }, [quotes?.list, currentMonth]);

  const avgMarginValue = useMemo(() => {
    return activeMonthQuotes.length > 0
      ? activeMonthQuotes.reduce((sum, q) => sum + (q.pricing?.marginPercent || 0), 0) / activeMonthQuotes.length
      : 0;
  }, [activeMonthQuotes]);

  // Target and threshold references
  const minMarginTarget = settings?.operationalGoals?.minimumMarginPercent || 35;
  const serviceTarget = (settings as any)?.monthlyServiceTarget || settings?.operationalGoals?.targetServicesPerMonth || 120;

  // Empty data state if there are absolutely no quotes and no movements
  const noDataTotal = (quotes?.list || []).length === 0 && (financial?.movements || []).length === 0;

  // Stock and Contract calculations for Alertas section
  const lowStockProducts = useMemo(() => {
    return (inventory?.products || []).filter(p => p.quantity <= (p.minQuantity || 0));
  }, [inventory?.products]);

  const expiringContractsCount = useMemo(() => {
    return (contracts || []).filter(c => {
      if (!c.endDate) return false;
      const diffTime = new Date(c.endDate).getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 15;
    }).length;
  }, [contracts]);

  const reajusteContrats = useMemo(() => selectContratosParaReajuste(systemState), [systemState]);

  // REVENUE FORECAST VS REALIZED CHART DATA
  const revenueChartData = useMemo(() => {
    const list = quotes?.list || [];
    const map = new Map<string, { prevista: number; realizada: number }>();

    list.forEach(q => {
      if (!q.createdAt) return;
      const mes = q.createdAt.slice(0, 7); // YYYY-MM
      if (!/^\d{4}-\d{2}/.test(mes)) return;

      const val = q.pricing?.finalPrice || 0;
      if (!map.has(mes)) {
        map.set(mes, { prevista: 0, realizada: 0 });
      }

      const vals = map.get(mes)!;
      if (q.status === 'aprovado' || q.status === 'executado') {
        vals.prevista += val;
      }
      if (q.status === 'executado') {
        vals.realizada += val;
      }
    });

    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    return Array.from(map.entries())
      .map(([mes, vals]) => {
        const [year, month] = mes.split('-');
        const monthIdx = parseInt(month, 10) - 1;
        const label = `${mesesNomes[monthIdx] || month}/${year.slice(2)}`;
        return {
          key: mes,
          name: label,
          'Prevista (Orçado + Agendado)': Number(vals.prevista.toFixed(2)),
          'Realizada (Executada)': Number(vals.realizada.toFixed(2))
        };
      })
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6); // last 6 months
  }, [quotes?.list]);

  // ALERTS COMPILED (MAX 5 ALERTS)
  const alertsList = useMemo(() => {
    const list: AlertItem[] = [];

    // Alerta 🔴 Estoque crítico
    if (lowStockProducts.length > 0) {
      const pName = lowStockProducts[0].name;
      list.push({
        id: 'alert-stock-crit',
        variant: 'danger',
        colorIconClass: 'text-red-600 bg-red-100',
        bgColorClass: 'bg-red-50/20',
        borderColorClass: 'border-red-100',
        title: 'Estoque crítico',
        description: `${pName}${lowStockProducts.length > 1 ? ` e outros ${lowStockProducts.length - 1} itens` : ''} abaixo do mínimo.`,
        btnLabel: 'Abrir Estoque',
        path: '/inventory',
        icon: AlertTriangle,
      });
    }

    // Alerta 🟠 Contratos vencendo
    if (expiringContractsCount > 0) {
      list.push({
        id: 'alert-contracts-exp',
        variant: 'warning',
        colorIconClass: 'text-amber-600 bg-amber-100/80',
        bgColorClass: 'bg-amber-50/20',
        borderColorClass: 'border-amber-100/70',
        title: 'Contrato vencendo',
        description: `${expiringContractsCount} ${expiringContractsCount === 1 ? 'contrato vence' : 'contratos vencem'} em 15 dias.`,
        btnLabel: 'Abrir Clientes',
        path: '/clientes',
        icon: Clock,
      });
    }

    // Alerta 🟡 POP sem revisão há mais de 11 meses
    const unreviewedPops = (pops?.procedures || []).filter(p => {
      if (!p.createdAt) return false;
      const mesesSemRevisao = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
      return mesesSemRevisao > 11;
    });

    if (unreviewedPops.length > 0) {
      const pNames = unreviewedPops.map(p => p.name).slice(0, 2).join(', ');
      const displaySuffix = unreviewedPops.length > 2 ? ` e outros ${unreviewedPops.length - 2}` : '';
      list.push({
        id: 'alert-pops-unrevised',
        variant: 'warning',
        colorIconClass: 'text-yellow-600 bg-yellow-100/80',
        bgColorClass: 'bg-yellow-50/20',
        borderColorClass: 'border-yellow-100/60',
        title: 'POP desatualizado',
        description: `POP ${pNames}${displaySuffix} sem revisão há mais de 11 meses.`,
        btnLabel: 'Abrir POP',
        path: '/pops',
        icon: RefreshCw,
      });
    }

    // Alerta 🔵 Retornos acima da meta
    const returnRateThreshold = settings?.maxReturnRatePercent ?? 8;
    const monthlyRetornos = (quotes?.list || []).filter(q => q.createdAt?.startsWith(currentMonth) && (q.status === 'retorno' || q.isRetorno === true));
    const qtdRetornos = monthlyRetornos.length;

    const monthlyExecutados = (quotes?.list || []).filter(q => q.createdAt?.startsWith(currentMonth) && q.status === 'executado');
    const qtdExecutados = monthlyExecutados.length;

    const returnRate = qtdExecutados > 0 ? (qtdRetornos / qtdExecutados) * 100 : 0;

    if (returnRate > returnRateThreshold) {
      list.push({
        id: 'alert-returns-rate',
        variant: 'info',
        colorIconClass: 'text-blue-600 bg-blue-100',
        bgColorClass: 'bg-blue-50/20',
        borderColorClass: 'border-blue-100',
        title: 'Retornos acima da meta',
        description: `Taxa de retorno atingiu ${returnRate.toFixed(1)}% (Limite: ${returnRateThreshold}%).`,
        btnLabel: 'Abrir Agenda',
        path: '/agenda',
        icon: TrendingUp,
      });
    }

    // Alerta 🟡 Contratos para reajuste
    if (reajusteContrats.length > 0) {
      const potencialReajuste = reajusteContrats.reduce((s, r) => s + (r.suggestedValue - r.currentValue), 0);
      list.push({
        id: 'alert-contracts-reajuste',
        variant: 'warning',
        colorIconClass: 'text-amber-600 bg-amber-100/80',
        bgColorClass: 'bg-amber-50/20',
        borderColorClass: 'border-amber-100/70',
        title: 'Contratos para reajuste',
        description: `${reajusteContrats.length} contrato(s) elegíveis para reajuste anual (IPCA). Valor potencial: +R$ ${potencialReajuste.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mês`,
        btnLabel: 'Abrir Clientes',
        path: '/clientes',
        icon: FileText,
      });
    }

    return list;
  }, [lowStockProducts, expiringContractsCount, pops?.procedures, quotes?.list, currentMonth, settings?.maxReturnRatePercent, reajusteContrats]);

  const displayAlertsList = useMemo(() => alertsList.slice(0, 5), [alertsList]);

  // AGENDA OPERACIONAL DYNAMIC ITEMS (MAX 10)
  const agendaList = useMemo(() => {
    const list: AgendaItem[] = [];

    const monthAgenda = (agenda || []).filter(e => e.date?.startsWith(currentMonth));

    if (monthAgenda.length > 0) {
      const sortedAgenda = [...monthAgenda].sort((a, b) => {
        const dCompare = (a.date || '').localeCompare(b.date || '');
        if (dCompare !== 0) return dCompare;
        return (a.time || '').localeCompare(b.time || '');
      });

      sortedAgenda.forEach((e) => {
        const quote = (quotes?.list || []).find(q => q.id === e.quoteId);
        const rawAddress = quote?.client?.address || 'Volta Redonda';
        const shortAddress = rawAddress.split(',')[0] || rawAddress;

        list.push({
          id: e.id,
          time: e.time || '08:00',
          client: e.clientName || 'Cliente Particular',
          service: e.title || 'Dedetização Geral',
          address: shortAddress,
          status: e.status === 'confirmado' ? 'Confirmado' : 'Agendado',
        });
      });
    }
    return list;
  }, [agenda, quotes?.list, currentMonth]);

  const finalAgendaList = useMemo(() => agendaList.slice(0, 10), [agendaList]);

  // IA OPERATING HEALTH SCORE (SAÚDE OPERACIONAL)
  const financeScore = avgMarginValue >= minMarginTarget ? 100 : Math.max(50, Math.round(100 - (minMarginTarget - avgMarginValue) * 4));
  const stockScore = lowStockProducts.length === 0 ? 100 : Math.max(50, 100 - lowStockProducts.length * 10);
  
  // Quality Score based on completed vs return rates in quotes
  const totalCompletedQuotes = (quotes?.list || []).filter(q => q.status === 'executado').length;
  const totalRetornoQuotes = (quotes?.list || []).filter(q => q.status === 'retorno' || q.isRetorno === true).length;
  const qualityRate = totalCompletedQuotes > 0 ? Math.max(0, 1 - (totalRetornoQuotes / totalCompletedQuotes)) : 1;
  const qualityScore = Math.round(qualityRate * 100);

  // Schedule agenda sync score
  const pendingAgendaCount = (agenda || []).filter(e => e.status === 'pendente').length;
  const timerScore = (agenda || []).length > 0 ? Math.max(50, 100 - pendingAgendaCount * 10) : 100;

  // Client retention score
  const customerScore = (clients || []).length > 0 ? 100 : 50;

  // Capacity utilized ratio score
  const capacityRatio = serviceTarget > 0 ? (serviceCountValue / serviceTarget) : 0;
  const capacityScore = Math.min(100, Math.round(capacityRatio * 100));

  // Average all 6 elements together in health score
  const healthScore = Math.round((financeScore + stockScore + qualityScore + timerScore + customerScore + capacityScore) / 6) || 87;

  let healthColorText = 'text-green-600';
  let healthBgClass = 'bg-emerald-50';
  let healthBorderClass = 'border-emerald-100';

  if (healthScore >= 80) {
    healthColorText = 'text-emerald-700';
    healthBgClass = 'bg-emerald-50/40';
    healthBorderClass = 'border-emerald-250';
  } else if (healthScore >= 60) {
    healthColorText = 'text-amber-600';
    healthBgClass = 'bg-amber-50/40';
    healthBorderClass = 'border-amber-250';
  } else {
    healthColorText = 'text-red-600';
    healthBgClass = 'bg-red-50/40';
    healthBorderClass = 'border-red-250';
  }

  // AI INSIGHTS MSG
  const marginAnterior = selectMargemMesAnterior({ quotes } as any);
  const marginDiff = avgMarginValue - marginAnterior;

  let marginInsightMessage = 'Sem dados de faturamento para avaliar oscilação de margem.';
  if (marginAnterior > 0) {
    if (marginDiff < 0) {
      marginInsightMessage = `Margem operacional caiu ${Math.abs(marginDiff).toFixed(2)}% nos últimos 30 dias com base no histórico.`;
    } else if (marginDiff > 0) {
      marginInsightMessage = `Margem operacional subiu ${marginDiff.toFixed(2)}% nos últimos 30 dias em comparação ao mês anterior.`;
    } else {
      marginInsightMessage = `Margem operacional estável em relação ao mês anterior (mantida em ${avgMarginValue.toFixed(2)}%).`;
    }
  } else if (avgMarginValue > 0) {
    marginInsightMessage = `Margem operacional atual consolidada em ${avgMarginValue.toFixed(2)}% para os primeiros serviços executados.`;
  }

  // Contract analysis dynamics
  const expiredOrExpiringContracts = (contracts || []).filter(c => {
    if (!c.endDate) return false;
    const diffTime = new Date(c.endDate).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return c.status === 'vencido' || (diffDays > 0 && diffDays <= 30);
  });
  const potentialRenewalCount = expiredOrExpiringContracts.length;

  const returnRateThreshold = settings?.maxReturnRatePercent ?? 8;
  const currentMonthRetornos = (quotes?.list || []).filter(q => q.createdAt?.startsWith(currentMonth) && (q.status === 'retorno' || q.isRetorno === true));
  const qtdRetornosVal = currentMonthRetornos.length;
  const currentMonthExecutados = (quotes?.list || []).filter(q => q.createdAt?.startsWith(currentMonth) && q.status === 'executado');
  const qtdExecutadosVal = currentMonthExecutados.length;
  const returnRateVal = qtdExecutadosVal > 0 ? (qtdRetornosVal / qtdExecutadosVal) * 100 : 0;

  const fallbackAiInsights = [
    {
      id: 'ai-ins-1',
      title: 'Margem Financeira',
      message: marginInsightMessage,
      recommendation: avgMarginValue < minMarginTarget ? 'Revisar estrutura de custos diretos e renegociar compras.' : 'Margens saudáveis mantidas.',
      btnLabel: 'Abrir Financeiro',
      path: '/financial',
    },
    {
      id: 'ai-ins-2',
      title: 'Risco de Ruptura de Estoque',
      message: lowStockProducts.length > 0 
        ? `${lowStockProducts.length} ${lowStockProducts.length === 1 ? 'produto apresenta' : 'produtos apresentam'} risco crítico de ruptura no estoque.`
        : 'Todos os insumos operacionais encontram-se em níveis adequados de segurança.',
      recommendation: lowStockProducts.length > 0 ? 'Emitir ordem de compra urgente para os itens abaixo do estoque mínimo.' : 'Manter compras programadas.',
      btnLabel: 'Abrir Estoque',
      path: '/inventory',
    },
    {
      id: 'ai-ins-3',
      title: 'Oportunidade de Renovação',
      message: potentialRenewalCount > 0
        ? `${potentialRenewalCount} ${potentialRenewalCount === 1 ? 'cliente possui' : 'clientes possuem'} contrato expirando ou vencido ideal para renovação.`
        : 'Sem contratos expirados ou em vias de renovação nos próximos 30 dias.',
      recommendation: potentialRenewalCount > 0 ? 'Contatar clientes em janela de renovação e oferecer proposta de reajuste.' : 'Acompanhar calendário contratual.',
      btnLabel: 'Abrir Clientes',
      path: '/clientes',
    },
    {
      id: 'ai-ins-4',
      title: 'Taxa de Retorno Operacional',
      message: returnRateVal > returnRateThreshold
        ? `Atenção: A taxa de retornos de assistência (${returnRateVal.toFixed(1)}%) supera o limite ideal definido de ${returnRateThreshold}%.`
        : 'Índice de retornos gerais controlado e em conformidade técnica.',
      recommendation: returnRateVal > returnRateThreshold ? 'Auditar a qualidade de aplicação dos químicos nas OSs com assistência técnica.' : 'Padrão operacional de qualidade mantido.',
      btnLabel: 'Abrir Relatório',
      path: '/agenda',
    }
  ];

  const fetchAI = async () => {
    setAiInsightsLoading(true);
    try {
      const result = await analyticsService.fetchAIInsights(
        empresaId || 'tenant_default',
        {
          totalRevenue: revenueValue,
          avgMargin: avgMarginValue,
          quotesCount: quotes?.list?.length || 0,
          approvedQuotesCount: serviceCountValue,
          lowStockCount: lowStockProducts.length,
          criticalStockNames: lowStockProducts.map(p => p.name).slice(0, 5),
          expiringContractsCount,
          servicesCount: quotes?.list?.filter(q => q.status === 'executado').length || 0,
        },
        quotes?.list || [],
        []
      );
      if (result && result.length > 0) {
        setAiInsightsList(result);
      }
    } catch (err) {
      console.warn('Dashboard AI insights fetch fallback:', err);
    } finally {
      setAiInsightsLoading(false);
    }
  };

  useEffect(() => {
    fetchAI();
  }, [empresaId, revenueValue, avgMarginValue, serviceCountValue, lowStockProducts.length, expiringContractsCount]);

  const displayInsights = aiInsightsList.length > 0
    ? aiInsightsList.map((ins, idx) => ({
        id: ins.id || `ai-real-${idx}`,
        title: ins.title || 'Insight Estratégico',
        message: ins.pattern || ins.message,
        recommendation: ins.recommendation,
        btnLabel: ins.metric?.includes('Margem') || ins.metric?.includes('Receita') ? 'Abrir Financeiro' : ins.metric?.includes('Estoque') ? 'Abrir Estoque' : 'Ver Detalhes',
        path: ins.metric?.includes('Margem') || ins.metric?.includes('Receita') ? '/financial' : ins.metric?.includes('Estoque') ? '/inventory' : '/analytics',
        isAiGenerated: true,
      }))
    : fallbackAiInsights;

  if (noDataTotal) {
    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-3 duration-300 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* HEADER / TOPO */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-slate-100">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight" id="screen-title">
              Dashboard
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-2">
              Acompanhe indicadores, alertas e operação em tempo real.
            </p>
          </div>

          {/* QUICK BUTTONS */}
          <div className="flex flex-wrap items-center gap-3" id="quick-action-buttons">
            <button
              id="btn-quick-orçamento"
              onClick={() => navigate('/calculator')}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-[#1B3A2D] text-white hover:bg-[#1B3A2D]/90 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-97 animate-pulse"
            >
              <FileText className="size-4 opacity-90" />
              <span>Novo Orçamento</span>
            </button>
            
            <button
              id="btn-quick-cliente"
              onClick={() => navigate('/clientes')}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-white text-slate-700 hover:text-[#1B3A2D] border border-slate-200 hover:border-slate-350 hover:bg-slate-50/40 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-97"
            >
              <Users className="size-4 text-slate-400" />
              <span>Novo Cliente</span>
            </button>
            
            <button
              id="btn-quick-servico"
              onClick={() => navigate('/agenda')}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-white text-slate-700 hover:text-[#1B3A2D] border border-slate-200 hover:border-slate-350 hover:bg-slate-50/40 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-97"
            >
              <Calendar className="size-4 text-slate-400" />
              <span>Novo Serviço</span>
            </button>
            
            <button
              id="btn-quick-estoque"
              onClick={() => navigate('/inventory')}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-white text-slate-700 hover:text-[#1B3A2D] border border-slate-200 hover:border-slate-350 hover:bg-slate-50/40 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-97"
            >
              <Package className="size-4 text-slate-400" />
              <span>Entrada Estoque</span>
            </button>
          </div>
        </header>

        {/* POLISHED EMPTY STATE */}
        <div id="dashboard-empty-state-card" className="flex flex-col items-center justify-center p-12 bg-white border border-[#E8E6E1] rounded-3xl text-center space-y-4 py-24 shadow-xxs">
          <div className="p-4 bg-slate-50 text-slate-400 rounded-full">
            <Activity className="size-12 animate-pulse" />
          </div>
          <h3 className="text-xl font-black text-[#141410] uppercase tracking-wider">
            Sem dados suficientes para calcular
          </h3>
          <p className="text-xs text-slate-500 max-w-md font-bold leading-relaxed">
            Sua conta ainda não possui histórico de orçamentos, ordens de serviço ou registros financeiros gravados nesta empresa. Comece gerando novos orçamentos ou inserindo saldos operacionais.
          </p>
          <div className="flex gap-3 pt-3">
            <button
              onClick={() => navigate('/calculator')}
              className="px-6 py-2.5 bg-[#1B3A2D] text-white hover:bg-[#1B3A2D]/90 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-97"
            >
              Iniciar Fluxo de Orçamento
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-3 duration-300 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* HEADER / TOPO COM KPIs EXECUTIVOS VIA HeaderMetric */}
      <header className="flex flex-col gap-6 pb-6 border-b border-slate-200/80">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight" id="screen-title">
                Dashboard
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Acompanhe indicadores, alertas e operação em tempo real.
              </p>
            </div>

            {/* 4 KPIs EXECUTIVOS NO CABEÇALHO */}
            <HeaderMetricGroup
              id="header-metrics-dashboard"
              className="pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-8"
            >
              <HeaderMetric
                id="metric-receita-mes"
                label="Receita do Mês"
                value={formatBRL(revenueValue)}
                delta={{ value: 'Líquido arrecadado', direction: 'up' }}
              />
              <HeaderMetric
                id="metric-margem-media"
                label="Margem Média"
                value={formatPercent(avgMarginValue)}
                delta={{
                  value: `Meta: ${minMarginTarget.toFixed(1)}%`,
                  direction: avgMarginValue >= minMarginTarget ? 'up' : 'down',
                }}
              />
              <HeaderMetric
                id="metric-servicos-realizados"
                label="Serviços Realizados"
                value={String(serviceCountValue)}
                delta={{
                  value: `Meta: ${serviceTarget}`,
                  direction: serviceCountValue >= serviceTarget ? 'up' : 'neutral',
                }}
              />
              <HeaderMetric
                id="metric-ticket-medio"
                label="Ticket Médio"
                value={formatBRL(avgTicketValue)}
                delta={{ value: 'Média por OS', direction: 'neutral' }}
              />
            </HeaderMetricGroup>
          </div>

          {/* QUICK BUTTONS */}
          <div className="flex flex-wrap items-center gap-2.5 self-start xl:self-auto shrink-0" id="quick-action-buttons">
            <button
              id="btn-quick-orçamento"
              onClick={() => navigate('/calculator')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1B3A2D] text-white hover:bg-[#1B3A2D]/90 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-97"
            >
              <FileText className="size-4 opacity-90" />
              <span>Novo Orçamento</span>
            </button>
            
            <button
              id="btn-quick-cliente"
              onClick={() => navigate('/clientes')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 hover:text-[#1B3A2D] border border-slate-200 hover:border-slate-350 hover:bg-slate-50/40 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-97"
            >
              <Users className="size-4 text-slate-400" />
              <span>Novo Cliente</span>
            </button>
            
            <button
              id="btn-quick-servico"
              onClick={() => navigate('/agenda')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 hover:text-[#1B3A2D] border border-slate-200 hover:border-slate-350 hover:bg-slate-50/40 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-97"
            >
              <Calendar className="size-4 text-slate-400" />
              <span>Novo Serviço</span>
            </button>
            
            <button
              id="btn-quick-estoque"
              onClick={() => navigate('/inventory')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 hover:text-[#1B3A2D] border border-slate-200 hover:border-slate-350 hover:bg-slate-50/40 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-97"
            >
              <Package className="size-4 text-slate-400" />
              <span>Entrada Estoque</span>
            </button>
          </div>
        </div>
      </header>

      {/* SEÇÃO 1: ALERTAS OPERACIONAIS (SEMPRE VISÍVEL) */}
      <DashboardAlertsSection alerts={displayAlertsList} onNavigate={navigate} />

      {/* SEÇÃO 2: GRÁFICO DE FLUXO DE CAIXA PREVISTO VS REALIZADO (SEMPRE VISÍVEL) */}
      <DashboardCashFlowChart data={revenueChartData} />

      {/* SEÇÃO 3: AGENDA OPERACIONAL (SEMPRE VISÍVEL) */}
      <DashboardAgendaSection
        currentMonth={currentMonth}
        items={finalAgendaList}
        onNavigate={navigate}
      />

      {/* DISPONIBILIDADE E CARGA DE TRABALHO DE TÉCNICOS */}
      <DisponibilidadeTecnicos />

      {/* SEÇÃO 4: IA OPERACIONAL & SAÚDE DA EMPRESA (EM COLLAPSIBLE-SECTION FECHADA POR PADRÃO) */}
      <DashboardAIInsightsSection
        insights={displayInsights}
        healthScore={healthScore}
        healthColorText={healthColorText}
        healthBgClass={healthBgClass}
        healthBorderClass={healthBorderClass}
        avgMarginValue={avgMarginValue}
        minMarginTarget={minMarginTarget}
        lowStockCount={lowStockProducts.length}
        qualityScore={qualityScore}
        serviceCountValue={serviceCountValue}
        serviceTarget={serviceTarget}
        clientsCount={(clients || []).length}
        isLoading={aiInsightsLoading}
        onRefreshAI={fetchAI}
        onNavigate={navigate}
      />

    </div>
  );
}
