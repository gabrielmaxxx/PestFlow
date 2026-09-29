import fs from 'fs';
import path from 'path';

export interface EmpresaFinanceiro {
  status: 'em_dia' | 'atrasado';
  dataVencimento?: string;
  dataUltimoPagamento?: string;
  observacoes?: string;
}

export interface EmpresaData {
  empresaId: string;
  nome: string;
  cnpj?: string;
  criadoEm: string;
  ativa: boolean;
  financeiro: EmpresaFinanceiro;
  plano: string;
  updatedAt?: string;
}

export interface UserData {
  uid: string;
  login: string;
  email: string;
  name: string;
  cargo?: string;
  empresaId: string;
  role: string;
  isSuperAdmin?: boolean;
  permissions?: Record<string, Record<string, boolean>>;
  createdAt: string;
  updatedAt: string;
}

export interface EmpresaWithUserCount extends EmpresaData {
  totalUsuarios: number;
}

export interface PlatformDashboardMetrics {
  totalEmpresas: number;
  empresasAtivas: number;
  empresasSuspensas: number;
  empresasEmDia: number;
  empresasAtrasadas: number;
  totalUsuarios: number;
  totalServicos: number;
  totalOrcamentos: number;
  servicosPorMes: Record<string, number>;
  orcamentosPorMes: Record<string, number>;
  distribuicaoPlanos: Record<string, number>;
  geradoEm: string;
}

interface TenantStoreState {
  empresas: Record<string, EmpresaData>;
  usuarios: Record<string, UserData[]>; // keyed by empresaId
  stats: {
    totalServicos: number;
    totalOrcamentos: number;
    servicosPorMes: Record<string, number>;
    orcamentosPorMes: Record<string, number>;
  };
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'tenants.json');

function getDefaultState(): TenantStoreState {
  const agora = new Date().toISOString();
  const hoje = agora.split('T')[0];
  const mesAtual = agora.substring(0, 7);

  return {
    empresas: {
      pestflow_matriz: {
        empresaId: 'pestflow_matriz',
        nome: 'PestFlow Matriz e Gestão Operacional',
        cnpj: '12.345.678/0001-90',
        criadoEm: '2026-01-10T08:00:00.000Z',
        ativa: true,
        financeiro: {
          status: 'em_dia',
          dataVencimento: '2026-12-31',
          dataUltimoPagamento: hoje,
          observacoes: 'Conta Matriz do Ecossistema PestFlow'
        },
        plano: 'enterprise',
        updatedAt: agora
      },
      agropragas_sul: {
        empresaId: 'agropragas_sul',
        nome: 'AgroPragas Controle Ambiental Ltda',
        cnpj: '98.765.432/0001-11',
        criadoEm: '2026-02-01T10:00:00.000Z',
        ativa: true,
        financeiro: {
          status: 'em_dia',
          dataVencimento: '2026-10-15',
          dataUltimoPagamento: hoje,
          observacoes: 'Contrato corporativo anual'
        },
        plano: 'pro',
        updatedAt: agora
      },
      biopragas_sp: {
        empresaId: 'biopragas_sp',
        nome: 'BioPragas Soluções Fitossanitárias',
        cnpj: '45.678.901/0001-22',
        criadoEm: '2026-02-15T14:30:00.000Z',
        ativa: true,
        financeiro: {
          status: 'em_dia',
          dataVencimento: '2026-10-20',
          dataUltimoPagamento: hoje,
          observacoes: 'Licença Standard ativa'
        },
        plano: 'standard',
        updatedAt: agora
      },
      ecopragas_mg: {
        empresaId: 'ecopragas_mg',
        nome: 'EcoPragas Manejo Integrado',
        cnpj: '33.221.100/0001-44',
        criadoEm: '2026-03-01T09:15:00.000Z',
        ativa: true,
        financeiro: {
          status: 'atrasado',
          dataVencimento: '2026-09-05',
          dataUltimoPagamento: '2026-08-05',
          observacoes: 'Boleto de renovação em aberto'
        },
        plano: 'standard',
        updatedAt: agora
      },
      vetorzero_df: {
        empresaId: 'vetorzero_df',
        nome: 'VetorZero Desinsetizadora',
        cnpj: '55.443.322/0001-88',
        criadoEm: '2026-03-10T16:45:00.000Z',
        ativa: false,
        financeiro: {
          status: 'atrasado',
          dataVencimento: '2026-08-10',
          dataUltimoPagamento: '2026-07-10',
          observacoes: 'Acesso suspenso temporariamente por inadimplência'
        },
        plano: 'starter',
        updatedAt: agora
      }
    },
    usuarios: {
      pestflow_matriz: [
        {
          uid: 'master_superadmin_uid',
          login: 'master',
          email: 'master@pestflow_matriz.pestflow.internal',
          name: 'Gabriel - Super Admin Master',
          cargo: 'Gestor Master Super-Admin',
          empresaId: 'pestflow_matriz',
          role: 'master',
          isSuperAdmin: true,
          permissions: {
            agenda: { view: true, edit: true, delete: true },
            orcamentos: { view: true, edit: true, delete: true },
            estoque: { view: true, edit: true, delete: true },
            financeiro: { view: true, edit: true, delete: true },
            contratos: { view: true, edit: true, delete: true },
            pops: { view: true, edit: true, delete: true },
            ia: { view: true, edit: true, delete: true }
          },
          createdAt: '2026-01-10T08:00:00.000Z',
          updatedAt: agora
        }
      ],
      agropragas_sul: [
        {
          uid: 'usr_agro_admin',
          login: 'carlos.mendes',
          email: 'carlos.mendes@agropragas_sul.pestflow.internal',
          name: 'Carlos Mendes',
          cargo: 'Diretor Operacional',
          empresaId: 'agropragas_sul',
          role: 'admin',
          isSuperAdmin: false,
          permissions: {
            agenda: { view: true, edit: true, delete: true },
            orcamentos: { view: true, edit: true, delete: true },
            estoque: { view: true, edit: true, delete: true },
            financeiro: { view: true, edit: true, delete: false }
          },
          createdAt: '2026-02-01T10:00:00.000Z',
          updatedAt: agora
        },
        {
          uid: 'usr_agro_tec1',
          login: 'rodrigo.lima',
          email: 'rodrigo.lima@agropragas_sul.pestflow.internal',
          name: 'Rodrigo Lima',
          cargo: 'Técnico Aplicador Sênior',
          empresaId: 'agropragas_sul',
          role: 'technician',
          isSuperAdmin: false,
          permissions: {
            agenda: { view: true, edit: true, delete: false },
            estoque: { view: true, edit: false, delete: false },
            pops: { view: true, edit: false, delete: false }
          },
          createdAt: '2026-02-05T11:00:00.000Z',
          updatedAt: agora
        }
      ],
      biopragas_sp: [
        {
          uid: 'usr_bio_admin',
          login: 'marcos.souza',
          email: 'marcos.souza@biopragas_sp.pestflow.internal',
          name: 'Marcos Souza',
          cargo: 'Gestor Geral',
          empresaId: 'biopragas_sp',
          role: 'admin',
          isSuperAdmin: false,
          permissions: {
            agenda: { view: true, edit: true, delete: true },
            orcamentos: { view: true, edit: true, delete: true }
          },
          createdAt: '2026-02-15T14:30:00.000Z',
          updatedAt: agora
        }
      ],
      ecopragas_mg: [
        {
          uid: 'usr_eco_admin',
          login: 'eduardo.silva',
          email: 'eduardo.silva@ecopragas_mg.pestflow.internal',
          name: 'Eduardo Silva',
          cargo: 'Responsável Técnico',
          empresaId: 'ecopragas_mg',
          role: 'admin',
          isSuperAdmin: false,
          permissions: {
            agenda: { view: true, edit: true, delete: true }
          },
          createdAt: '2026-03-01T09:15:00.000Z',
          updatedAt: agora
        }
      ],
      vetorzero_df: [
        {
          uid: 'usr_vetor_admin',
          login: 'juliana.santos',
          email: 'juliana.santos@vetorzero_df.pestflow.internal',
          name: 'Juliana Santos',
          cargo: 'Administradora',
          empresaId: 'vetorzero_df',
          role: 'admin',
          isSuperAdmin: false,
          permissions: {},
          createdAt: '2026-03-10T16:45:00.000Z',
          updatedAt: agora
        }
      ]
    },
    stats: {
      totalServicos: 142,
      totalOrcamentos: 89,
      servicosPorMes: {
        '2026-07': 38,
        '2026-08': 49,
        [mesAtual]: 55
      },
      orcamentosPorMes: {
        '2026-07': 22,
        '2026-08': 31,
        [mesAtual]: 36
      }
    }
  };
}

class TenantStore {
  private state: TenantStoreState;

  constructor() {
    this.state = this.load();
  }

  private load(): TenantStoreState {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.empresas && typeof parsed.empresas === 'object') {
          return parsed;
        }
      }
    } catch (e: any) {
      console.warn('[TenantStore] Aviso ao carregar persistência:', e?.message || e);
    }
    const def = getDefaultState();
    this.persist(def);
    return def;
  }

  private persist(stateToSave: TenantStoreState = this.state) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(stateToSave, null, 2), 'utf-8');
    } catch (e: any) {
      console.warn('[TenantStore] Aviso ao salvar persistência:', e?.message || e);
    }
  }

  public listEmpresas(): EmpresaWithUserCount[] {
    const list: EmpresaWithUserCount[] = [];
    for (const key of Object.keys(this.state.empresas)) {
      const emp = this.state.empresas[key];
      const users = this.state.usuarios[key] || [];
      list.push({
        ...emp,
        totalUsuarios: users.length
      });
    }
    // Sort with active first, then recent
    return list.sort((a, b) => {
      if (a.empresaId === 'pestflow_matriz') return -1;
      if (b.empresaId === 'pestflow_matriz') return 1;
      return (b.criadoEm || '').localeCompare(a.criadoEm || '');
    });
  }

  public getEmpresa(empresaId: string): { empresa: EmpresaData; usuarios: UserData[]; totalUsuarios: number } | null {
    const cleanId = empresaId.trim().toLowerCase();
    const emp = this.state.empresas[cleanId];
    if (!emp) return null;
    const usuarios = this.state.usuarios[cleanId] || [];
    return {
      empresa: emp,
      usuarios,
      totalUsuarios: usuarios.length
    };
  }

  public createEmpresa(payload: {
    empresaId: string;
    nome: string;
    cnpj?: string;
    plano?: string;
    financeiro?: Partial<EmpresaFinanceiro>;
  }): EmpresaData {
    const cleanId = payload.empresaId.trim().toLowerCase();
    const agora = new Date().toISOString();
    const hoje = agora.split('T')[0];
    const vencimentoPadrao = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const nova: EmpresaData = {
      empresaId: cleanId,
      nome: payload.nome.trim(),
      cnpj: payload.cnpj?.trim() || '',
      criadoEm: agora,
      ativa: true,
      financeiro: {
        status: payload.financeiro?.status === 'atrasado' ? 'atrasado' : 'em_dia',
        dataVencimento: payload.financeiro?.dataVencimento || vencimentoPadrao,
        dataUltimoPagamento: payload.financeiro?.dataUltimoPagamento || hoje,
        observacoes: payload.financeiro?.observacoes || ''
      },
      plano: payload.plano || 'standard',
      updatedAt: agora
    };

    this.state.empresas[cleanId] = nova;
    if (!this.state.usuarios[cleanId]) {
      this.state.usuarios[cleanId] = [];
    }
    this.persist();
    return nova;
  }

  public updateEmpresa(
    empresaId: string,
    payload: { nome?: string; cnpj?: string; plano?: string }
  ): EmpresaData | null {
    const cleanId = empresaId.trim().toLowerCase();
    const emp = this.state.empresas[cleanId];
    if (!emp) return null;

    if (payload.nome) emp.nome = payload.nome.trim();
    if (payload.cnpj !== undefined) emp.cnpj = payload.cnpj.trim();
    if (payload.plano) emp.plano = payload.plano;
    emp.updatedAt = new Date().toISOString();

    this.persist();
    return emp;
  }

  public updateFinanceiro(
    empresaId: string,
    payload: Partial<EmpresaFinanceiro>
  ): EmpresaFinanceiro | null {
    const cleanId = empresaId.trim().toLowerCase();
    const emp = this.state.empresas[cleanId];
    if (!emp) return null;

    emp.financeiro = {
      ...emp.financeiro,
      ...payload
    };
    emp.updatedAt = new Date().toISOString();
    this.persist();
    return emp.financeiro;
  }

  public toggleAtiva(empresaId: string, ativa: boolean): boolean | null {
    const cleanId = empresaId.trim().toLowerCase();
    const emp = this.state.empresas[cleanId];
    if (!emp) return null;

    emp.ativa = ativa;
    emp.updatedAt = new Date().toISOString();
    this.persist();
    return emp.ativa;
  }

  public isEmpresaSuspensa(empresaId: string): boolean {
    const cleanId = empresaId.trim().toLowerCase();
    const emp = this.state.empresas[cleanId];
    if (!emp) return false;
    return emp.ativa === false;
  }

  public listUsuarios(empresaId: string): UserData[] {
    const cleanId = empresaId.trim().toLowerCase();
    return this.state.usuarios[cleanId] || [];
  }

  public createUsuario(empresaId: string, user: UserData): UserData {
    const cleanId = empresaId.trim().toLowerCase();
    if (!this.state.usuarios[cleanId]) {
      this.state.usuarios[cleanId] = [];
    }
    const idx = this.state.usuarios[cleanId].findIndex((u) => u.uid === user.uid || u.login === user.login);
    if (idx >= 0) {
      this.state.usuarios[cleanId][idx] = { ...this.state.usuarios[cleanId][idx], ...user };
    } else {
      this.state.usuarios[cleanId].push(user);
    }
    this.persist();
    return user;
  }

  public updateUsuarioPermissoes(
    empresaId: string,
    uid: string,
    permissions: Record<string, Record<string, boolean>>
  ): boolean {
    const cleanId = empresaId.trim().toLowerCase();
    const list = this.state.usuarios[cleanId];
    if (!list) return false;
    const user = list.find((u) => u.uid === uid);
    if (!user) return false;
    user.permissions = permissions;
    user.updatedAt = new Date().toISOString();
    this.persist();
    return true;
  }

  public hasPermission(empresaId: string, uid: string, modulo: string, acao: string): boolean {
    const cleanId = empresaId.trim().toLowerCase();
    const list = this.state.usuarios[cleanId];
    if (!list) return false;
    const user = list.find((u) => u.uid === uid);
    if (!user) return false;
    if (user.role === 'master' || user.isSuperAdmin) return true;
    return user.permissions?.[modulo]?.[acao] === true;
  }

  public getDashboardMetrics(): PlatformDashboardMetrics {
    const empresasList = Object.values(this.state.empresas);
    const totalEmpresas = empresasList.length;
    const empresasAtivas = empresasList.filter((e) => e.ativa !== false).length;
    const empresasSuspensas = empresasList.filter((e) => e.ativa === false).length;
    const empresasEmDia = empresasList.filter((e) => e.financeiro?.status === 'em_dia' || !e.financeiro?.status).length;
    const empresasAtrasadas = empresasList.filter((e) => e.financeiro?.status === 'atrasado').length;

    let totalUsuarios = 0;
    for (const key of Object.keys(this.state.usuarios)) {
      totalUsuarios += this.state.usuarios[key].length;
    }

    const distribuicaoPlanos: Record<string, number> = {};
    for (const emp of empresasList) {
      const p = emp.plano || 'standard';
      distribuicaoPlanos[p] = (distribuicaoPlanos[p] || 0) + 1;
    }

    return {
      totalEmpresas,
      empresasAtivas,
      empresasSuspensas,
      empresasEmDia,
      empresasAtrasadas,
      totalUsuarios,
      totalServicos: this.state.stats.totalServicos,
      totalOrcamentos: this.state.stats.totalOrcamentos,
      servicosPorMes: this.state.stats.servicosPorMes,
      orcamentosPorMes: this.state.stats.orcamentosPorMes,
      distribuicaoPlanos,
      geradoEm: new Date().toISOString()
    };
  }
}

export const tenantStore = new TenantStore();
