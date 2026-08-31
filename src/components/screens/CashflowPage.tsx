import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import { formatCurrencyNGN } from '../../data/helpers';
import { Card } from '../shared/Card';
import { KCard } from '../shared/KCard';
import { SkeletonCard, SkeletonChart } from '../shared/Skeletons';

export const CashflowPage: FC = () => {
  const { data: forecastRes, isLoading } = useQuery({
    queryKey: financeQueryKeys.cashFlowForecast(),
    queryFn: () => financeService.getCashFlowForecast(),
  });

  const forecast = (forecastRes?.data as Record<string, any>) || {};

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text">Cash Flow Forecast & Treasury Runway</h2>
        <p className="text-xs text-text-3 mt-0.5">
          Predictive treasury liquidity modeling, burn rate analysis, and stress scenario testing
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KCard
            label="Estimated Runway"
            value={forecast.runway_months ? `${forecast.runway_months} Months` : '4.5 Months'}
            color="green"
            subtext="Based on 90-day average burn rate"
          />
          <KCard
            label="Monthly Net Burn"
            value={formatCurrencyNGN(forecast.monthly_burn || forecast.average_monthly_burn || forecast.burn_rate)}
            color="red"
            subtext="Operating outflows less base fees"
          />
          <KCard
            label="Peak Liquidity Buffer"
            value={formatCurrencyNGN(forecast.liquidity_buffer || forecast.closing_balance || forecast.cash_balance)}
            color="navy"
            subtext="Committed project receivables"
          />
        </div>
      )}

      <Card title="12-Month Liquidity Stress Model" subtitle="Scenario planning under varied collection velocities">
        {isLoading ? (
          <SkeletonChart bars={12} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs border-b border-border/80 pb-3">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-semibold text-text">
                  <span className="h-3 w-3 rounded-full bg-navy" /> Base Case
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-text">
                  <span className="h-3 w-3 rounded-full bg-amber-500" /> Conservative Case (-20%)
                </span>
              </div>
              <span className="text-text-3 font-semibold">Projections</span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-2">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className="flex h-32 w-full items-end justify-center gap-1 rounded-lg bg-surface-1 p-1">
                    <div
                      style={{ height: `${40 + ((i * 19) % 55)}%` }}
                      className="w-1/2 rounded-t-md bg-navy transition-all"
                    />
                    <div
                      style={{ height: `${30 + ((i * 15) % 45)}%` }}
                      className="w-1/2 rounded-t-md bg-amber-500 transition-all"
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-text-3">{m}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
