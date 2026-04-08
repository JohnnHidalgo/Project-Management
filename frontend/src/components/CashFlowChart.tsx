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
  title = 'Flujo de Caja Proyectado vs Ejecutado'
}) => {
  const chartData = useMemo(() => {
    const monthlyData: Record<string, {
      month: string;
      plannedAmount: number;
      executedAmount: number;
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
          plannedAmount: 0,
          executedAmount: 0,
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
          plannedAmount: 0,
          executedAmount: 0,
          plannedPercentage: 0,
          executedPercentage: 0
        };
      }

      // Solo contar gastos pagados o aprobados
      if (exp.status === 'Paid' || exp.status === 'Approved') {
        monthlyData[monthKey].executedAmount += exp.amount;
      }
    });

    // Calcular totales para el cálculo de porcentajes
    const totalPlanned = Object.values(monthlyData).reduce((sum, m) => sum + m.plannedAmount, 0);
    const totalExecuted = Object.values(monthlyData).reduce((sum, m) => sum + m.executedAmount, 0);

    // Convertir a array y calcular porcentajes
    const data = Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(m => ({
        ...m,
        plannedPercentage: totalPlanned > 0 ? (m.plannedAmount / totalPlanned) * 100 : 0,
        executedPercentage: totalExecuted > 0 ? (m.executedAmount / totalExecuted) * 100 : 0
      }));

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
          Presupuesto: ${chartData.reduce((sum, d) => sum + d.plannedAmount, 0).toLocaleString()} | 
          Ejecutado: ${chartData.reduce((sum, d) => sum + d.executedAmount, 0).toLocaleString()}
        </span>
      </div>

      <div style={{ width: '100%', height: 400, marginTop: '1.5rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={{ value: 'Monto ($)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px'
              }}
              formatter={(value: any) => [
                `$${Number(value).toLocaleString('es-ES', { maximumFractionDigits: 0 })}`,
                value
              ]}
              labelStyle={{ color: '#111827', fontWeight: 600 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '1rem' }}
              iconType="square"
            />
            <Bar
              dataKey="plannedAmount"
              fill="#3b82f6"
              name="Planeado"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="executedAmount"
              fill="#10b981"
              name="Ejecutado"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla de detalle */}
      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 600 }}>Detalle Mensual</h4>
        <table className="data-table" style={{ fontSize: '0.85rem' }}>
          <thead>
            <tr>
              <th>Mes</th>
              <th>Planeado</th>
              <th>Ejecutado</th>
              <th>Varianza</th>
              <th>% Avance Planificado</th>
              <th>% Avance Ejecutado</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, idx) => {
              const variance = row.plannedAmount - row.executedAmount;
              const varianceStatus = variance >= 0 ? 'text-success' : 'text-error';
              
              return (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{row.month}</td>
                  <td>${row.plannedAmount.toLocaleString()}</td>
                  <td>${row.executedAmount.toLocaleString()}</td>
                  <td className={varianceStatus}>
                    {variance >= 0 ? '+' : '-'}${Math.abs(variance).toLocaleString()}
                  </td>
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
