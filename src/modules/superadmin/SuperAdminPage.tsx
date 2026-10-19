import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  superAdminService,
  DashboardMetrics,
  EmpresaWithUserCount,
} from '@/services/superadmin/superAdminService';
import { useAuth } from '@/auth/hooks/useAuth';
import { AppPageHeader } from '@/components/AppPageHeader';
import {
  SuperAdminTabs,
  SuperAdminDashboardTab,
  SuperAdminEmpresasTab,
  CreateEmpresaDialog,
  CreateTenantFormData,
  FinancialStatusDialog,
  FinancialStatusFormData,
  EditEmpresaDialog,
  EditEmpresaFormData,
  MasterLoginDialog,
  MasterLoginFormData,
} from './components';

export function SuperAdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'empresas'>('dashboard');

  // Data states
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [empresas, setEmpresas] = useState<EmpresaWithUserCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativas' | 'suspensas'>('all');
  const [finFilter, setFinFilter] = useState<'all' | 'em_dia' | 'atrasado'>('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFinModalOpen, setIsFinModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<EmpresaWithUserCount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Data
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [dashData, empresasData] = await Promise.all([
        superAdminService.getDashboard(),
        superAdminService.listEmpresas(),
      ]);
      setMetrics(dashData);
      setEmpresas(empresasData);
    } catch (err: any) {
      console.error('Erro ao carregar dados super-admin:', err);
      toast.error(err.message || 'Erro ao carregar dados do painel super-admin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered companies
  const filteredEmpresas = useMemo(() => {
    return empresas.filter((emp) => {
      const matchesSearch =
        emp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empresaId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.cnpj && emp.cnpj.includes(searchTerm));

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'ativas'
          ? emp.ativa !== false
          : emp.ativa === false;

      const matchesFin =
        finFilter === 'all'
          ? true
          : finFilter === 'em_dia'
          ? emp.financeiro?.status === 'em_dia' || !emp.financeiro?.status
          : emp.financeiro?.status === 'atrasado';

      return matchesSearch && matchesStatus && matchesFin;
    });
  }, [empresas, searchTerm, statusFilter, finFilter]);

  // Calculated Header Metrics
  const activeCount = useMemo(() => {
    if (metrics?.empresasAtivas !== undefined) return metrics.empresasAtivas;
    return empresas.filter((e) => e.ativa !== false).length;
  }, [metrics, empresas]);

  const suspendedCount = useMemo(() => {
    if (metrics?.empresasSuspensas !== undefined) return metrics.empresasSuspensas;
    return empresas.filter((e) => e.ativa === false).length;
  }, [metrics, empresas]);

  const pendingCount = useMemo(() => {
    if (metrics?.empresasAtrasadas !== undefined) return metrics.empresasAtrasadas;
    return empresas.filter((e) => e.financeiro?.status === 'atrasado').length;
  }, [metrics, empresas]);

  // Toggle company active
  const handleToggleAtiva = async (emp: EmpresaWithUserCount) => {
    const newStatus = !emp.ativa;
    try {
      await superAdminService.toggleAtiva(emp.empresaId, newStatus);
      toast.success(
        newStatus
          ? `Empresa '${emp.nome}' reativada com sucesso.`
          : `Empresa '${emp.nome}' suspensa com sucesso.`
      );
      setEmpresas((prev) =>
        prev.map((e) => (e.empresaId === emp.empresaId ? { ...e, ativa: newStatus } : e))
      );
      loadData(true);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao alterar ativação da empresa.');
    }
  };

  // Open Financial Modal
  const handleOpenFinModal = (emp: EmpresaWithUserCount) => {
    setSelectedEmpresa(emp);
    setIsFinModalOpen(true);
  };

  // Save Financial Status
  const handleSaveFin = async (formData: FinancialStatusFormData) => {
    if (!selectedEmpresa) return;
    setIsSubmitting(true);
    try {
      await superAdminService.updateFinanceiro(selectedEmpresa.empresaId, formData);
      toast.success('Status financeiro atualizado com sucesso.');
      setIsFinModalOpen(false);
      loadData(true);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar dados financeiros.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (emp: EmpresaWithUserCount) => {
    setSelectedEmpresa(emp);
    setIsEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (formData: EditEmpresaFormData) => {
    if (!selectedEmpresa) return;
    setIsSubmitting(true);
    try {
      await superAdminService.updateEmpresa(selectedEmpresa.empresaId, formData);
      toast.success('Dados cadastrais atualizados com sucesso.');
      setIsEditModalOpen(false);
      loadData(true);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar dados da empresa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Master User Modal
  const handleOpenMasterModal = (emp: EmpresaWithUserCount) => {
    setSelectedEmpresa(emp);
    setIsMasterModalOpen(true);
  };

  // Save additional Master User
  const handleSaveMasterUser = async (formData: MasterLoginFormData) => {
    if (!selectedEmpresa) return;
    setIsSubmitting(true);
    try {
      await superAdminService.createInitialMasterUser({
        empresaId: selectedEmpresa.empresaId,
        login: formData.login,
        name: formData.name,
        senhaTemporaria: formData.senhaTemporaria,
      });
      toast.success(`Conta Master criada com sucesso para ${selectedEmpresa.nome}.`);
      setIsMasterModalOpen(false);
      loadData(true);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar conta master.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Create Company & Initial Master
  const handleSubmitCreateTenant = async (formData: CreateTenantFormData) => {
    setIsSubmitting(true);
    try {
      // 1. Create Empresa Tenant
      await superAdminService.createEmpresa({
        empresaId: formData.empresaId,
        nome: formData.nome,
        cnpj: formData.cnpj,
        plano: formData.plano,
        financeiro: {
          status: formData.finStatus,
        },
      });

      // 2. Create Initial Master User
      await superAdminService.createInitialMasterUser({
        empresaId: formData.empresaId,
        login: formData.masterLogin,
        name: formData.masterNome,
        senhaTemporaria: formData.masterSenha,
      });

      toast.success(`Empresa '${formData.nome}' e Conta Master cadastradas com sucesso!`);
      setIsCreateModalOpen(false);
      loadData(true);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao provisionar nova empresa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Banner / Super Admin Brand Header with AppPageHeader */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <AppPageHeader
            title="PestFlow Super-Admin"
            description={`Gestão Global Multi-Tenant • Operador: ${user?.name || 'Gabriel'}`}
            statusSlot={
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Plataforma Central
              </span>
            }
            primaryAction={{
              label: 'Nova Empresa',
              icon: PlusCircle,
              onClick: () => setIsCreateModalOpen(true),
            }}
            secondaryAction={{
              label: 'Atualizar',
              icon: RefreshCw,
              onClick: () => loadData(true),
            }}
            metrics={[
              {
                label: 'Empresas Ativas',
                value: String(activeCount),
              },
              {
                label: 'Empresas Suspensas',
                value: String(suspendedCount),
                delta:
                  suspendedCount > 0
                    ? { value: `${suspendedCount} bloqueada(s)`, direction: 'down' }
                    : undefined,
              },
              {
                label: 'Pendências Financeiras',
                value: String(pendingCount),
                delta:
                  pendingCount > 0
                    ? { value: `${pendingCount} em atraso`, direction: 'down' }
                    : undefined,
              },
            ]}
            className="dark [&_[data-slot=page-header-actions]_button:first-child]:bg-slate-800 [&_[data-slot=page-header-actions]_button:first-child]:text-slate-200 [&_[data-slot=page-header-actions]_button:first-child]:border-slate-700 [&_[data-slot=page-header-actions]_button:first-child]:hover:bg-slate-700 [&_[data-slot=page-header-actions]_button:last-child]:bg-amber-600 [&_[data-slot=page-header-actions]_button:last-child]:hover:bg-amber-500 [&_[data-slot=page-header-actions]_button:last-child]:text-white [&_[data-slot=page-header-actions]_button:last-child]:border-transparent"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="size-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
            <p className="text-sm font-bold text-slate-400">Carregando dados da plataforma...</p>
          </div>
        ) : (
          <SuperAdminTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            empresasCount={empresas.length}
            dashboardContent={<SuperAdminDashboardTab metrics={metrics} />}
            empresasContent={
              <SuperAdminEmpresasTab
                empresas={filteredEmpresas}
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                finFilter={finFilter}
                onFinFilterChange={setFinFilter}
                onToggleAtiva={handleToggleAtiva}
                onOpenFinModal={handleOpenFinModal}
                onOpenEditModal={handleOpenEditModal}
                onOpenMasterModal={handleOpenMasterModal}
              />
            }
          />
        )}
      </main>

      {/* Modals converted to official Dialogs */}
      <CreateEmpresaDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleSubmitCreateTenant}
        isSubmitting={isSubmitting}
      />

      <FinancialStatusDialog
        open={isFinModalOpen}
        onOpenChange={setIsFinModalOpen}
        empresa={selectedEmpresa}
        onSubmit={handleSaveFin}
        isSubmitting={isSubmitting}
      />

      <EditEmpresaDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        empresa={selectedEmpresa}
        onSubmit={handleSaveEdit}
        isSubmitting={isSubmitting}
      />

      <MasterLoginDialog
        open={isMasterModalOpen}
        onOpenChange={setIsMasterModalOpen}
        empresa={selectedEmpresa}
        onSubmit={handleSaveMasterUser}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default SuperAdminPage;
