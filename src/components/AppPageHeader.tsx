import React from 'react';
import { ChevronDown } from 'lucide-react';
import { HeaderMetric } from '@/components/HeaderMetric';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface PageHeaderAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => void;
}

export interface PageHeaderMetric {
  label: string;
  value: string;
  delta?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
}

export interface AppPageHeaderProps {
  title: string;
  description?: string;
  primaryAction?: PageHeaderAction;
  secondaryAction?: PageHeaderAction;
  moreActions?: PageHeaderAction[];
  metrics?: PageHeaderMetric[];
  statusSlot?: React.ReactNode;
  className?: string;
  id?: string;
}

function renderActionIcon(icon?: React.ComponentType<{ className?: string }> | React.ReactNode) {
  if (!icon) return null;
  if (React.isValidElement(icon)) return icon;
  const IconComponent = icon as React.ComponentType<{ className?: string }>;
  return <IconComponent className="size-4" />;
}

export function AppPageHeader({
  title,
  description,
  primaryAction,
  secondaryAction,
  moreActions,
  metrics,
  statusSlot,
  className,
  id,
}: AppPageHeaderProps) {
  // Validação e corte de métricas excedentes (máximo 3)
  if (metrics && metrics.length > 3) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[AppPageHeader] O cabeçalho suporta no máximo 3 métricas (${metrics.length} fornecidas). Apenas as 3 primeiras serão exibidas.`
      );
    }
  }

  const visibleMetrics = metrics ? metrics.slice(0, 3) : [];
  const hasMetrics = visibleMetrics.length > 0;
  const hasActions = Boolean(
    primaryAction || secondaryAction || (moreActions && moreActions.length > 0)
  );

  const gridColsClass =
    visibleMetrics.length === 1
      ? 'grid-cols-1'
      : visibleMetrics.length === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-1 sm:grid-cols-3';

  return (
    <header
      id={id}
      data-slot="app-page-header"
      className={cn('w-full flex flex-col', className)}
    >
      {/* LINHA 1: Título / Descrição à esquerda, Ações à direita */}
      <div
        data-slot="page-header-line-1"
        className="flex flex-wrap items-start justify-between gap-4 w-full"
      >
        {/* Título e Descrição (min-w-0 para respeitar truncamento e responsividade) */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1
              data-slot="page-header-title"
              className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight"
            >
              {title}
            </h1>
            {statusSlot && (
              <div data-slot="page-header-status" className="shrink-0">
                {statusSlot}
              </div>
            )}
          </div>

          {description && (
            <p
              data-slot="page-header-description"
              title={description}
              className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 truncate max-w-full block"
            >
              {description}
            </p>
          )}
        </div>

        {/* Ações (shrink-0): Secundária + Primária + Dropdown "Mais ações" */}
        {hasActions && (
          <div
            data-slot="page-header-actions"
            className="flex items-center gap-2.5 shrink-0 flex-wrap"
          >
            {secondaryAction && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={secondaryAction.onClick}
                className="gap-2 font-semibold"
              >
                {renderActionIcon(secondaryAction.icon)}
                <span>{secondaryAction.label}</span>
              </Button>
            )}

            {primaryAction && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={primaryAction.onClick}
                className="gap-2 font-semibold"
              >
                {renderActionIcon(primaryAction.icon)}
                <span>{primaryAction.label}</span>
              </Button>
            )}

            {moreActions && moreActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5 font-semibold"
                    >
                      <span>Mais ações</span>
                      <ChevronDown className="size-3.5 opacity-70" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-48">
                  {moreActions.map((action, idx) => (
                    <DropdownMenuItem
                      key={idx}
                      onClick={action.onClick}
                      className="cursor-pointer gap-2"
                    >
                      {renderActionIcon(action.icon)}
                      <span>{action.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      {/* LINHA 2: Métricas Executivas (Apenas se houver métricas, sempre em linha própria na largura toda) */}
      {hasMetrics && (
        <div
          data-slot="page-header-line-2"
          className={cn(
            'mt-6 pt-6 border-t border-slate-200/80 dark:border-slate-800 w-full grid gap-6',
            gridColsClass
          )}
        >
          {visibleMetrics.map((m, idx) => (
            <HeaderMetric
              key={idx}
              label={m.label}
              value={m.value}
              delta={m.delta}
            />
          ))}
        </div>
      )}
    </header>
  );
}

export default AppPageHeader;
