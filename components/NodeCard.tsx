
import React from 'react';
import { ConceptNode, ConceptStatus } from '../types';
import LockClosedIcon from './icons/LockClosedIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import LightBulbIcon from './icons/LightBulbIcon';
import SparklesIcon from './icons/SparklesIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';


interface NodeCardProps {
  node: ConceptNode;
  status: ConceptStatus;
  onClick: () => void;
  isSelected: boolean;
}

const NodeCard: React.FC<NodeCardProps> = ({ node, status, onClick, isSelected }) => {
  const getStatusClassesAndIcon = () => {
    let borderColor = 'border-slate-700';
    let bgColor = 'bg-slate-800 hover:bg-slate-700';
    let textColor = 'text-slate-300';
    let icon = <LightBulbIcon className="w-5 h-5 text-yellow-400" />;

    switch (status) {
      case ConceptStatus.LOCKED:
        bgColor = 'bg-slate-800 opacity-60 cursor-not-allowed';
        textColor = 'text-slate-500';
        borderColor = 'border-slate-700';
        icon = <LockClosedIcon className="w-5 h-5 text-slate-500" />;
        break;
      case ConceptStatus.UNLOCKED:
        borderColor = 'border-sky-500';
        icon = <LightBulbIcon className="w-5 h-5 text-sky-400" />;
        break;
      case ConceptStatus.CURRENT:
        borderColor = 'border-primary-500 ring-2 ring-primary-500';
        bgColor = 'bg-slate-700 hover:bg-slate-600';
        icon = <SparklesIcon className="w-5 h-5 text-primary-400" />;
        break;
      case ConceptStatus.MASTERED:
        borderColor = 'border-green-500';
        bgColor = 'bg-slate-800 hover:bg-slate-700 opacity-80';
        textColor = 'text-green-400';
        icon = <AcademicCapIcon className="w-5 h-5 text-green-400" />;
        break;
    }
    if (isSelected && status !== ConceptStatus.LOCKED) {
        bgColor = 'bg-primary-700 hover:bg-primary-600';
        borderColor = 'border-primary-400 ring-2 ring-primary-400';
    }


    return { cardClasses: `${bgColor} ${borderColor} ${textColor}`, icon };
  };

  const { cardClasses, icon } = getStatusClassesAndIcon();
  const isDisabled = status === ConceptStatus.LOCKED;

  return (
    <button
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
      className={`p-4 rounded-lg border-2 shadow-lg transition-all duration-200 w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-primary-500 ${cardClasses}`}
      aria-label={`Concept: ${node.title}, Status: ${status}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className={`text-lg font-semibold ${status === ConceptStatus.MASTERED ? 'line-through text-slate-500' : (isSelected && !isDisabled ? 'text-white' : 'text-slate-100')}`}>{node.title}</h3>
        {icon}
      </div>
      <p className={`text-sm mb-1 ${isSelected && !isDisabled ? 'text-slate-200' : (status === ConceptStatus.LOCKED ? 'text-slate-600' : 'text-slate-400')}`}>{node.description}</p>
      <div className="text-xs text-slate-500 mt-2">
        <span className="bg-slate-700 px-2 py-0.5 rounded-full mr-2">{node.category}</span>
        <span>Est. {node.estimatedTime}</span>
      </div>
    </button>
  );
};

export default NodeCard;
