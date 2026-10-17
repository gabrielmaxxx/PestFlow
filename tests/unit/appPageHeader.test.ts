import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AppPageHeader } from '../../src/components/AppPageHeader';

describe('AppPageHeader Component Verification (Design System Standard)', () => {
  test('renderiza com 4 métricas e confirma que só 3 aparecem (limite máximo de 3)', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const element = React.createElement(AppPageHeader, {
      title: 'Painel de Teste',
      description: 'Descrição do painel',
      metrics: [
        { label: 'Primeira Métrica', value: '1111' },
        { label: 'Segunda Métrica', value: '2222' },
        { label: 'Terceira Métrica', value: '3333' },
        { label: 'Quarta Métrica', value: '9999' },
      ],
    });

    const rendered = renderToString(element);

    // Linha 2 de métricas deve existir
    expect(rendered).toContain('data-slot="page-header-line-2"');

    // As três primeiras métricas devem ser renderizadas
    expect(rendered).toContain('Primeira Métrica');
    expect(rendered).toContain('1111');
    expect(rendered).toContain('Segunda Métrica');
    expect(rendered).toContain('2222');
    expect(rendered).toContain('Terceira Métrica');
    expect(rendered).toContain('3333');

    // A quarta métrica deve ser ignorada
    expect(rendered).not.toContain('Quarta Métrica');
    expect(rendered).not.toContain('9999');

    // Confirma que console.warn foi chamado em desenvolvimento
    expect(consoleWarnSpy).toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });

  test('renderiza sem metrics e confirma que a linha 2 não existe', () => {
    const element = React.createElement(AppPageHeader, {
      title: 'Clientes',
      description: 'Listagem geral de clientes cadastrados',
    });

    const rendered = renderToString(element);

    // Linha 1 de título existe
    expect(rendered).toContain('data-slot="page-header-line-1"');
    expect(rendered).toContain('Clientes');
    expect(rendered).toContain('Listagem geral de clientes cadastrados');

    // Linha 2 de métricas NÃO deve existir no DOM
    expect(rendered).not.toContain('data-slot="page-header-line-2"');
  });

  test('renderiza statusSlot, ações primária, secundária e dropdown de mais ações', () => {
    const element = React.createElement(AppPageHeader, {
      title: 'Estoque Central',
      description: 'Gestão de insumos químicos e armazém',
      statusSlot: React.createElement('span', { className: 'badge-online' }, 'Online'),
      primaryAction: { label: 'Novo Item' },
      secondaryAction: { label: 'Exportar' },
      moreActions: [
        { label: 'Importar Planilha' },
        { label: 'Histórico de Auditoria' },
      ],
    });

    const rendered = renderToString(element);

    expect(rendered).toContain('data-slot="page-header-title"');
    expect(rendered).toContain('Estoque Central');
    expect(rendered).toContain('data-slot="page-header-status"');
    expect(rendered).toContain('Online');
    expect(rendered).toContain('Novo Item');
    expect(rendered).toContain('Exportar');
    expect(rendered).toContain('Mais ações');
    expect(rendered).not.toContain('data-slot="page-header-line-2"');
  });
});
