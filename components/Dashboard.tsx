
import React from 'react';
import { UserState } from '../types';
import { knowledgeGraphService } from '../services/knowledgeGraphService';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CheckCircleIcon from './icons/CheckCircleIcon';
import LightBulbIcon from './icons/LightBulbIcon';
import LockClosedIcon from './icons/LockClosedIcon';

interface DashboardProps {
  userState: UserState;
}

const Dashboard: React.FC<DashboardProps> = ({ userState }) => {
  const stats = knowledgeGraphService.getStats(userState);

  const data = [
    { name: 'Mastered', value: stats.mastered, fill: '#10B981' }, // green-500
    { name: 'In Progress', value: stats.unlocked, fill: '#0EA5E9' }, // sky-500
    { name: 'Locked', value: stats.locked, fill: '#64748B' }, // slate-500
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = <T extends { cx: number, cy: number, midAngle: number, innerRadius: number, outerRadius: number, percent: number, index: number, name: string }> (
    { cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: T
  ) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent * 100 < 5) return null; // Don't render label if slice is too small

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px" fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; colorClass: string }> = ({ title, value, icon, colorClass }) => (
    <div className={`p-4 rounded-lg shadow-md flex items-center space-x-3 ${colorClass}`}>
      <div className="p-2 bg-black bg-opacity-20 rounded-full">{icon}</div>
      <div>
        <p className="text-sm text-slate-200">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );


  return (
    <div className="p-4 md:p-6 bg-slate-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-primary-400 mb-6">Your Progress</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Concepts Mastered" value={stats.mastered} icon={<CheckCircleIcon className="w-6 h-6 text-green-300"/>} colorClass="bg-green-600" />
        <StatCard title="Concepts In Progress" value={stats.unlocked} icon={<LightBulbIcon className="w-6 h-6 text-sky-300"/>} colorClass="bg-sky-600" />
        <StatCard title="Concepts Locked" value={stats.locked} icon={<LockClosedIcon className="w-6 h-6 text-slate-300"/>} colorClass="bg-slate-600" />
      </div>

      {stats.total > 0 ? (
        <div className="h-64 md:h-80 w-full"> {/* Increased height */}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius="80%" // Adjust outerRadius for size
                fill="#8884d8"
                dataKey="value"
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid #475569', borderRadius: '0.375rem', color: '#e2e8f0' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend iconSize={12} wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-slate-400 text-center">No progress data yet. Start learning to see your dashboard update!</p>
      )}

      {userState.learningGoals && userState.learningGoals.length > 0 && (
        <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Your Learning Goals</h3>
            <ul className="list-disc list-inside text-slate-400 space-y-1">
                {userState.learningGoals.map((goal, index) => <li key={index}>{goal}</li>)}
            </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
