import React from 'react';
import { describe, test, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../../src/providers/AppProvider';
import { PageErrorBoundary } from '../../src/components/PageErrorBoundary';

// Import all pages
import { DashboardPage } from '../../src/modules/dashboard/DashboardPage';
import { CalculatorPage } from '../../src/modules/calculator/CalculatorPage';
import { FinancialPage } from '../../src/modules/financial/FinancialPage';
import { POPsPage } from '../../src/modules/pops/POPsPage';
import { InventoryPage } from '../../src/modules/inventory/InventoryPage';
import { ServicoConfirmacaoPage } from '../../src/modules/confirmacoes/ServicoConfirmacaoPage';
import { AgendaPage } from '../../src/modules/agenda/AgendaPage';
import { ClientesPage } from '../../src/modules/clientes/ClientesPage';
import { FuncionariosPage } from '../../src/modules/funcionarios/FuncionariosPage';
import { AIPage } from '../../src/modules/ai/AIPage';
import { SettingsPage } from '../../src/modules/settings/SettingsPage';
import { SuperAdminPage } from '../../src/modules/superadmin/SuperAdminPage';

describe('Pages Smoke Test - Ensure no page causes a White Screen / Render Crash', () => {
  const renderWithProviders = (Component: React.ComponentType) => {
    return renderToString(
      React.createElement(
        AppProvider,
        null,
        React.createElement(
          MemoryRouter,
          null,
          React.createElement(Component)
        )
      )
    );
  };

  test('DashboardPage renders without crashing', () => {
    expect(() => renderWithProviders(DashboardPage)).not.toThrow();
  });

  test('CalculatorPage renders without crashing', () => {
    expect(() => renderWithProviders(CalculatorPage)).not.toThrow();
  });

  test('FinancialPage renders without crashing', () => {
    expect(() => renderWithProviders(FinancialPage)).not.toThrow();
  });

  test('POPsPage renders without crashing', () => {
    expect(() => renderWithProviders(POPsPage)).not.toThrow();
  });

  test('InventoryPage renders without crashing', () => {
    expect(() => renderWithProviders(InventoryPage)).not.toThrow();
  });

  test('ServicoConfirmacaoPage renders without crashing', () => {
    expect(() => renderWithProviders(ServicoConfirmacaoPage)).not.toThrow();
  });

  test('AgendaPage renders without crashing', () => {
    expect(() => renderWithProviders(AgendaPage)).not.toThrow();
  });

  test('ClientesPage renders without crashing', () => {
    expect(() => renderWithProviders(ClientesPage)).not.toThrow();
  });

  test('FuncionariosPage renders without crashing', () => {
    expect(() => renderWithProviders(FuncionariosPage)).not.toThrow();
  });

  test('AIPage renders without crashing', () => {
    expect(() => renderWithProviders(AIPage)).not.toThrow();
  });

  test('SettingsPage renders without crashing', () => {
    expect(() => renderWithProviders(SettingsPage)).not.toThrow();
  });

  test('SuperAdminPage renders without crashing', () => {
    expect(() => renderWithProviders(SuperAdminPage)).not.toThrow();
  });

  test('PageErrorBoundary renders children normally when no error occurs', () => {
    const rendered = renderToString(
      React.createElement(
        PageErrorBoundary,
        { pageName: 'Teste Seguro' },
        React.createElement('div', { id: 'safe-content' }, 'Conteúdo OK')
      )
    );

    expect(rendered).toContain('Conteúdo OK');
    expect(rendered).not.toContain('Instabilidade Temporária');
  });

  test('PageErrorBoundary getDerivedStateFromError transitions to error state', () => {
    const error = new Error('Falha no módulo');
    const newState = PageErrorBoundary.getDerivedStateFromError(error);
    expect(newState.hasError).toBe(true);
    expect(newState.error).toBe(error);
  });

  test('PageErrorBoundary renders friendly debugging and Recarregar Página button on error', () => {
    class FailingComponent extends React.Component {
      render(): React.ReactNode {
        throw new Error('TypeError: Cannot read properties of null (reading \'client\')');
      }
    }

    // In a subclass or rendered boundary:
    const boundary = new PageErrorBoundary({ pageName: 'Tela de Teste' });
    boundary.state = {
      hasError: true,
      error: new Error('TypeError: Cannot read properties of null (reading \'client\')'),
      errorInfo: { componentStack: 'at ServicoConfirmacaoPage' },
      showDetails: true,
      copied: false,
      timestamp: '12:00:00'
    };

    const rendered = renderToString(boundary.render() as React.ReactElement);
    expect(rendered).toContain('Recarregar Página');
    expect(rendered).toContain('Prevenção de Tela Branca Ativa');
    expect(rendered).toContain('Dados Incompletos ou Nulos');
    expect(rendered).toContain('Copiar Diagnóstico');
    expect(rendered).toContain('Tentar Novamente');
  });

  test('AgendarServicoModal does not throw when quote is null or modal closed', async () => {
    const { AgendarServicoModal } = await import('../../src/modules/confirmacoes/AgendarServicoModal');
    expect(() => {
      renderToString(
        React.createElement(AgendarServicoModal, {
          quote: null,
          isOpen: false,
          onClose: () => {},
          onConfirm: () => {}
        })
      );
    }).not.toThrow();
  });

  test('ConfirmacaoServicoModal does not throw when quote is null', async () => {
    const { ConfirmacaoServicoModal } = await import('../../src/modules/confirmacoes/ConfirmacaoServicoModal');
    expect(() => {
      renderToString(
        React.createElement(ConfirmacaoServicoModal, {
          quote: null as any,
          onConfirm: () => {},
          onClose: () => {}
        })
      );
    }).not.toThrow();
  });

  test('MarcarRetornoModal does not throw when quote is null', async () => {
    const { MarcarRetornoModal } = await import('../../src/modules/confirmacoes/MarcarRetornoModal');
    expect(() => {
      renderToString(
        React.createElement(MarcarRetornoModal, {
          quote: null as any,
          onConfirm: () => {},
          onClose: () => {}
        })
      );
    }).not.toThrow();
  });
});
