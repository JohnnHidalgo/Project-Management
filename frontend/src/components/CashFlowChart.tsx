import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { BudgetLine, Expense } from '../types';

interface CashFlowChartProps {
  budgetLines: BudgetLine[] | undefined;
  expenses: Expense[];
  title?: string;
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({
  budgetLines = [],
  expenses = [],
  title = 'Flujo de Caja - Avance Acumulado Planificado vs Ejecutado'
}) => {
  const chartData = useMemo(() => {
    const monthlyData: Record<string, {
      month: string;
      monthKey: string;
      plannedAmount: number;
      executedAmount: number;
      plannedCumulative: number;
      executedCumulative: number;
      plannedPercentage: number;
      executedPercentage: number;
    }> = {};

    // Agrupar presupuesto planificado por mes
    (budgetLines || []).forEach(bl => {
      if (!bl.executionDate) return;

      // Parsear la fecha (asumiendo formato YYYY-MM-DD o similar)
      const date = new Date(bl.executionDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleString('es-ES', { month: 'short', year: '2-digit' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthLabel,
          monthKey,
          plannedAmount: 0,
          executedAmount: 0,
          plannedCumulative: 0,
          executedCumulative: 0,
          plannedPercentage: 0,
          executedPercentage: 0
        };
      }

      monthlyData[monthKey].plannedAmount += bl.plannedAmount;
    });

    // Agrupar gastos reales por mes
    expenses.forEach(exp => {
      if (!exp.date) return;

      const date = new Date(exp.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleString('es-ES', { month: 'short', year: '2-digit' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthLabel,
          monthKey,
          plannedAmount: 0,
          executedAmount: 0,
          plannedCumulative: 0,
          executedCumulative: 0,
          plannedPercentage: 0,
          executedPercentage: 0
        };
      }

      // Solo contar gastos pagados o aprobados
      if (exp.status === 'Paid' || exp.status === 'Approved') {
        monthlyData[monthKey].executedAmount += exp.amount;
      }
    });

    // Calcular totales
    const totalPlanned = Object.values(monthlyData).reduce((sum, m) => sum + m.plannedAmount, 0);
    const totalExecuted = Object.values(monthlyData).reduce((sum, m) => sum + m.executedAmount, 0);

    // Convertir a array, ordenar cronológicamente y calcular acumulados
    const data = Object.values(monthlyData)
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    let plannedCumulative = 0;
    let executedCumulative = 0;

    data.forEach(m => {
      plannedCumulative += m.plannedAmount;
      executedCumulative += m.executedAmount;

      m.plannedCumulative = plannedCumulative;
      m.executedCumulative = executedCumulative;
      m.plannedPercentage = totalPlanned > 0 ? (plannedCumulative / totalPlanned) * 100 : 0;
      m.executedPercentage = totalExecuted > 0 ? (executedCumulative / totalExecuted) * 100 : 0;
    });

    // Si no hay datos, retornar array vacío
    if (data.length === 0) {
      return [];
    }

    return data;
  }, [budgetLines, expenses]);

  if (chartData.length === 0) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <p className="text-muted">No hay datos disponibles para mostrar el flujo de caja.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div className="section-header">
        <h3>{title}</h3>
        <span className="badge badge-secondary">
          Total Planeado: ${chartData.reduce((sum, d) => sum + d.plannedAmount, 0).toLocaleString()} |
          Total Ejecutado: ${chartData.reduce((sum, d) => sum + d.executedAmount, 0).toLocaleString()}
        </span>
      </div>

      <div style={{ width: '100%', height: 400, marginTop: '1.5rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={{ value: 'Porcentaje Acumulado (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px'
              }}
              formatter={(value: any, name: any) => [
                `${Number(value).toFixed(1)}%`,
                name === 'plannedPercentage' ? 'Planeado Acumulado' : 'Ejecutado Acumulado'
              ]}
              labelStyle={{ color: '#111827', fontWeight: 600 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '1rem' }}
            />
            <Line
              type="monotone"
              dataKey="plannedPercentage"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Planeado Acumulado"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="executedPercentage"
              stroke="#10b981"
              strokeWidth={3}
              name="Ejecutado Acumulado"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla de detalle */}
      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 600 }}>Detalle Mensual - Avance Acumulado</h4>
        <table className="data-table" style={{ fontSize: '0.85rem' }}>
          <thead>
            <tr>
              <th>Mes</th>
              <th>Planeado Mensual</th>
              <th>Ejecutado Mensual</th>
              <th>Acumulado Planeado</th>
              <th>Acumulado Ejecutado</th>
              <th>% Avance Planeado</th>
              <th>% Avance Ejecutado</th>
              <th>Varianza %</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, idx) => {
              const variance = row.plannedPercentage - row.executedPercentage;
              const varianceStatus = variance >= 0 ? 'text-success' : 'text-error';

              return (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{row.month}</td>
                  <td>${row.plannedAmount.toLocaleString()}</td>
                  <td>${row.executedAmount.toLocaleString()}</td>
                  <td>${row.plannedCumulative.toLocaleString()}</td>
                  <td>${row.executedCumulative.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="progress-bar-container" style={{ flex: 1, margin: 0, height: '6px' }}>
                        <div
                          className="progress-bar bg-accent"
                          style={{ width: `${Math.min(row.plannedPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, minWidth: '35px' }}>
                        {row.plannedPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="progress-bar-container" style={{ flex: 1, margin: 0, height: '6px' }}>
                        <div
                          className="progress-bar bg-success"
                          style={{ width: `${Math.min(row.executedPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, minWidth: '35px' }}>
                        {row.executedPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className={varianceStatus}>
                    {variance >= 0 ? '+' : ''}{variance.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashFlowChart;
