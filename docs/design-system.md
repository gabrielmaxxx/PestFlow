# Sistema de Design do PestFlow (`docs/design-system.md`)

Este documento consolida os padrões visuais, tipográficos e componentes estruturais do **PestFlow**, alinhados com as referências aprovadas pela liderança.

---

## 1. Padrões Existentes Consolidados (Não Necessitam de Alteração)

Os seguintes elementos de interface já foram rigorosamente testados, validados e seguem com exatidão o padrão de referência aprovado, **não necessitando de qualquer modificação**:

### 1.1 Paleta de Cores Institucional
- **Verde Floresta Noturno (`#1B3A2D`):** Cor primária de ênfase máxima (abas ativas, botões primários de alta prioridade, cabeçalhos de destaque).
- **Verde Operacional (`#2D6A4F`):** Variações secundárias e indicadores de conformidade operacional.
- **Neutros Quentes Estruturais (`#F0EDE8`, `#F5F3EF`, `#141410`):** Fundo de contêineres de abas, contrastes suaves e tipografia primária de alta legibilidade.
- **Semântica Positiva/Negativa:** Verde Esmeralda (`text-emerald-600`) para ganhos/tendências positivas e Vermelho Rosa (`text-rose-600`) para quedas/riscos.

### 1.2 Barra de Abas (Pílula Única com Rolagem Horizontal)
- Padrão padronizado em **Estoque (`InventoryTabs`)**, **IA Operacional (`AIPage`)** e **Gestão Financeira (`FinancialPage`)**:
  - Contêiner externo: `<div className="flex overflow-x-auto p-1.5 bg-[#F0EDE8]/60 border border-slate-200/60 rounded-2xl w-fit max-w-full shadow-inner">`
  - Lista de abas: `<TabsList className="h-auto p-0 gap-1 bg-transparent">`
  - Gatilho com estado ativo Radix/Tailwind: `data-[state=active]:bg-[#1B3A2D] data-[state=active]:text-white data-[state=active]:shadow-sm whitespace-nowrap`
- **Comportamento:** Todas as abas permanecem em uma única linha contínua, sem quebras indesejadas, oferecendo rolagem horizontal suave em telas menores.

### 1.3 Balões de Chat da IA Operacional
- Layout de mensagens limpo, focado em agilidade de leitura para o operador:
  - Balões do assistente com fundo neutro suave e tipografia estruturada.
  - Balões do usuário em destaque verde floresta com contraste nítido.
  - Ações rápidas contextuais (prompts sugeridos) em chips compactos.

---

## 2. Padrão Oficial de Cabeçalho de Página (`AppPageHeader`)

O cabeçalho de todas as páginas da plataforma deve ser construído **exclusivamente** através do componente unificado `AppPageHeader` (`src/components/AppPageHeader.tsx`). Ele padroniza a exibição de título, status, ações e KPIs executivos, eliminando quebras desordenadas e inconsistências de layout entre telas.

### 2.1 As 6 Regras Obrigatórias do Cabeçalho

1. **Um Único Componente:** Todas as telas devem usar exclusivamente `<AppPageHeader />`. É terminantemente proibido montar cabeçalhos manualmente com `HeaderMetricGroup`, tags manuais ou breakpoints aninhados ad-hoc.
2. **Duas Linhas Fixas:** O cabeçalho possui uma divisão visual rigorosa em duas linhas:
   - **Linha 1:** Layout `flex flex-wrap items-start justify-between gap-4`. Título/descrição à esquerda (`min-w-0`), ações operacionais à direita (`shrink-0`).
   - **Linha 2 (Apenas se houver métricas):** Grid de colunas iguais (`grid-cols-1 sm:grid-cols-3`, ajustando ao número real de itens) ocupando 100% da largura, com borda superior fina (`border-t border-slate-200/80`) e margem superior consistente (`mt-6 pt-6`). **Métricas nunca devem ficar na mesma linha do título**.
3. **Máximo de 3 Métricas:** Cada página pode exibir no máximo 3 métricas de alto impacto (`metrics`). Quaisquer itens excedentes são ignorados silenciosamente em produção e geram `console.warn` em ambiente de desenvolvimento.
4. **1 Primária + 1 Secundária Visíveis (Resto em "Mais Ações"):** No máximo 2 ações ficam diretamente expostas na Linha 1 (`primaryAction` e `secondaryAction`). Ações adicionais devem ser fornecidas em `moreActions` e são agrupadas automaticamente no menu suspenso `"Mais ações"`. Se não houver ações adicionais, o menu é omitido.
5. **Sem Etiqueta Decorativa, Descrição de Uma Linha:** Não utilize pílulas ou etiquetas decorativas no cabeçalho. Apenas badges de estado operacional real (ex.: `"Online"`, `"Offline"`) são permitidos através de `statusSlot`. A descrição da página deve ter no máximo uma linha (truncada com reticências `...` e atributo `title` nativo).
6. **Delta Só com Dado Real:** O campo `delta` (indicador percentual/direcional) deve ser preenchido exclusivamente quando houver cálculo histórico real verificado. Se o dado for ausente ou fictício, omita a propriedade `delta`, exibindo apenas o rótulo e o valor da métrica.

---

### 2.2 Interface do Componente (`AppPageHeaderProps`)

```typescript
export interface PageHeaderAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => void;
}

export interface PageHeaderMetric {
  label: string;                                                      // Rótulo superior em uppercase (ex: "Receita do Mês")
  value: string;                                                      // Valor numérico em destaque (ex: "R$ 145.320,00")
  delta?: {
    value: string;                                                    // Variação real (ex: "+8,2% vs. mês ant.")
    direction: 'up' | 'down' | 'neutral';                             // Direção da tendência
  };
}

export interface AppPageHeaderProps {
  title: string;                                                      // Título principal da página
  description?: string;                                               // Descrição curta de uma linha (truncada)
  primaryAction?: PageHeaderAction;                                   // Ação primária destacada (Verde Floresta)
  secondaryAction?: PageHeaderAction;                                 // Ação secundária (Contorno)
  moreActions?: PageHeaderAction[];                                   // Ações adicionais agrupadas no menu "Mais ações"
  metrics?: PageHeaderMetric[];                                       // Lista de 1 a 3 métricas (Linha 2)
  statusSlot?: React.ReactNode;                                       // Badge de status operacional (ex: Online)
  className?: string;
  id?: string;
}
```

---

### 2.3 Exemplo Oficial de Implementação

```tsx
import { AppPageHeader } from "@/components/AppPageHeader";
import { Plus, Download, FileSpreadsheet } from "lucide-react";

export function ExemploPagina() {
  return (
    <AppPageHeader
      title="Gestão Financeira"
      description="Acompanhamento consolidado de DRE, fluxo de caixa e ponto de equilíbrio operacional."
      primaryAction={{
        label: "Nova Transação",
        icon: Plus,
        onClick: () => console.log("Nova Transação"),
      }}
      secondaryAction={{
        label: "Exportar Relatório",
        icon: Download,
        onClick: () => console.log("Exportar"),
      }}
      moreActions={[
        {
          label: "Importar Extrato Bancário",
          icon: FileSpreadsheet,
          onClick: () => console.log("Importar"),
        },
      ]}
      metrics={[
        {
          label: "Receita do Mês",
          value: "R$ 145.320,00",
          delta: { value: "+8,2% vs. mês ant.", direction: "up" },
        },
        {
          label: "Margem Operacional",
          value: "26,4%",
          delta: { value: "+1,8%", direction: "up" },
        },
        {
          label: "Ponto de Equilíbrio",
          value: "R$ 58.400,00",
          delta: { value: "-4,1%", direction: "down" },
        },
      ]}
    />
  );
}
```

---

## 3. Diretrizes de Governança

1. **Nenhuma tela deve montar cabeçalho manualmente:** A partir desta padronização, telas que precisarem de ajustes de cabeçalho devem migrar para o componente `<AppPageHeader />`.
2. **Respeito aos limites:** A Linha 1 comporta no máximo 2 botões visíveis; a Linha 2 comporta no máximo 3 métricas. Não force métricas ou botões extras no layout.
3. **Consistência Tipográfica:** Cores, tamanhos e espaçamentos são centralizados no componente para garantir conformidade em toda a aplicação.
