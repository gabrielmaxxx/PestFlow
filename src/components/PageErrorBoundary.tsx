import React, { Component, ErrorInfo, ReactNode } from 'react';
import { 
  AlertTriangle, 
  RotateCcw, 
  RefreshCw, 
  LayoutDashboard, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Bug, 
  Info, 
  Terminal,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children?: ReactNode;
  pageName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
  timestamp: string;
}

export class PageErrorBoundary extends Component<Props, State> {
  private copyTimeout: any = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
      timestamp: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[PageErrorBoundary] Erro capturado na tela:', error, errorInfo);
    this.setState({ 
      errorInfo,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
  }

  componentWillUnmount() {
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null, 
      showDetails: false, 
      copied: false 
    });
  };

  handleReloadPage = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleGoDashboard = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null, 
      showDetails: false 
    });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  getFriendlyDiagnosis = (errorMessage: string): { title: string; hint: string } => {
    const msg = (errorMessage || '').toLowerCase();

    if (msg.includes('cannot read properties of null') || msg.includes('cannot read properties of undefined') || msg.includes('reading')) {
      return {
        title: 'Dados Incompletos ou Nulos',
        hint: 'O sistema tentou acessar um campo de um cliente, orçamento ou produto que ainda não foi carregado ou está com valores vazios.'
      };
    }

    if (msg.includes('is not a function')) {
      return {
        title: 'Chamada Incompatível',
        hint: 'Uma rotina esperada pelo módulo não foi encontrada ou não está disponível no estado atual da aplicação.'
      };
    }

    if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout') || msg.includes('offline')) {
      return {
        title: 'Comunicação Interrompida',
        hint: 'Houve lentidão ou perda de conexão ao sincronizar com o banco de dados.'
      };
    }

    if (msg.includes('permission') || msg.includes('unauthorized') || msg.includes('denied')) {
      return {
        title: 'Permissão Insuficiente',
        hint: 'O usuário ativo não possui permissão para consultar os registros solicitados por esta tela.'
      };
    }

    return {
      title: 'Instabilidade Operacional',
      hint: 'Ocorreu uma exceção inesperada durante a montagem visual dos elementos desta página.'
    };
  };

  handleCopyDebugInfo = () => {
    const { pageName } = this.props;
    const { error, errorInfo, timestamp } = this.state;
    
    const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : 'N/A';
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A';

    const debugText = [
      '=== DIAGNÓSTICO DE TELA BRANCA - PESTFLOW ===',
      `Módulo/Tela: ${pageName || 'Não especificado'}`,
      `Rota: ${currentPath}`,
      `Horário: ${timestamp || new Date().toISOString()}`,
      `Erro: ${error?.name || 'Error'}: ${error?.message || 'Sem mensagem'}`,
      '',
      '--- RASTREAMENTO TÉCNICO ---',
      error?.stack || 'Sem stack trace disponível',
      '',
      '--- PILHA DE COMPONENTES REACT ---',
      errorInfo?.componentStack || 'Sem component stack disponível',
      '',
      '--- AMBIENTE ---',
      `User Agent: ${userAgent}`,
      '=============================================='
    ].join('\n');

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(debugText);
        this.setState({ copied: true });
        this.copyTimeout = setTimeout(() => this.setState({ copied: false }), 3000);
      }
    } catch (e) {
      console.warn('Não foi possível copiar automaticamente para o clipboard:', e);
    }
  };

  render() {
    if (this.state.hasError) {
      const { pageName } = this.props;
      const { error, errorInfo, showDetails, copied, timestamp } = this.state;
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const resolvedPageName = pageName || (currentPath ? `Rota ${currentPath}` : 'esta tela');
      const diagnosis = this.getFriendlyDiagnosis(error?.message || '');

      return (
        <div className="flex-1 w-full min-h-[calc(100vh-100px)] flex items-center justify-center p-4 sm:p-6 bg-[#FAF9F5] text-slate-800">
          <div className="max-w-2xl w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-6">
            
            {/* Ícone com Alerta */}
            <div className="relative mx-auto size-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center shadow-xs">
              <AlertTriangle className="size-8" />
              <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-xs">
                !
              </div>
            </div>

            {/* Cabeçalho informativo */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  <Bug className="size-3 text-amber-600" />
                  Prevenção de Tela Branca Ativa
                </span>
                {timestamp && (
                  <span className="text-[10px] font-mono text-slate-400">
                    {timestamp}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
                {pageName ? `Não foi possível carregar ${pageName}` : 'Interrupção na renderização desta tela'}
              </h2>
              
              <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                O PestFlow interceptou uma falha visual antes que ela causasse tela branca total. O menu lateral, barra de busca e navegação superior continuam funcionando normalmente.
              </p>
            </div>

            {/* Diagnóstico Amigável */}
            <div className="bg-[#FAF8F5] border border-amber-200/70 rounded-2xl p-4 text-left space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="size-7 rounded-lg bg-amber-100/70 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase text-amber-900 tracking-wide">
                      Diagnóstico: {diagnosis.title}
                    </span>
                    {currentPath && (
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5 ml-auto">
                        <MapPin className="size-2.5 text-slate-400" />
                        {currentPath}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {diagnosis.hint}
                  </p>
                </div>
              </div>

              {error?.message && (
                <div className="pt-2 border-t border-amber-200/50 flex items-center gap-2 text-[11px] font-mono text-rose-700 bg-rose-50/60 p-2.5 rounded-xl border border-rose-200/40 overflow-x-auto">
                  <Terminal className="size-3.5 shrink-0 text-rose-500" />
                  <span className="truncate" title={error.message}>
                    {error.message}
                  </span>
                </div>
              )}
            </div>

            {/* Ações: Recarregar Página, Tentar Novamente, Ir para Dashboard */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Button
                type="button"
                onClick={this.handleReloadPage}
                className="bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-xs font-bold px-5 h-10 rounded-xl cursor-pointer flex items-center gap-2 shadow-xs transition-all hover:scale-[1.02]"
                id="btn-error-reload-page"
              >
                <RotateCcw className="size-3.5" />
                Recarregar Página
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={this.handleRetry}
                className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 h-10 rounded-xl cursor-pointer flex items-center gap-2 transition-all"
                id="btn-error-retry"
              >
                <RefreshCw className="size-3.5" />
                Tentar Novamente
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={this.handleGoDashboard}
                className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 h-10 rounded-xl cursor-pointer flex items-center gap-2 transition-all"
                id="btn-error-dashboard"
              >
                <LayoutDashboard className="size-3.5" />
                Ir para o Dashboard
              </Button>
            </div>

            {/* Depuração Técnica & Cópia */}
            {error && (
              <div className="pt-4 border-t border-slate-100 text-left space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={this.toggleDetails}
                    className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    <span>{showDetails ? 'Ocultar dados técnicos' : 'Ver informações técnicas de depuração'}</span>
                    {showDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                  </button>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={this.handleCopyDebugInfo}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-900 h-8 px-2.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                    id="btn-copy-debug-info"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Diagnóstico Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3 text-slate-400" />
                        <span>Copiar Diagnóstico</span>
                      </>
                    )}
                  </Button>
                </div>

                {showDetails && (
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-[10px] font-mono overflow-x-auto max-h-56 whitespace-pre-wrap leading-relaxed space-y-2 border border-slate-800 shadow-inner">
                    <div>
                      <span className="text-slate-400 block font-bold mb-1">=== EXCEÇÃO ===</span>
                      <p className="font-bold text-rose-400">{error.name}: {error.message}</p>
                    </div>

                    {error.stack && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-slate-400 block font-bold mb-1">=== STACK TRACE ===</span>
                        <p className="text-slate-300">{error.stack}</p>
                      </div>
                    )}

                    {errorInfo?.componentStack && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-slate-400 block font-bold mb-1">=== COMPONENT TREE ===</span>
                        <p className="text-slate-400">{errorInfo.componentStack}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
