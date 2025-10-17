
import React from 'react';
import { KnowledgeGraph, ConceptNode, UserState, ConceptStatus } from '../types';
import { knowledgeGraphService } from '../services/knowledgeGraphService';
import NodeCard from './NodeCard';

interface KnowledgeGraphViewProps {
  userState: UserState;
  onSelectConcept: (conceptId: string) => void;
}

const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({ userState, onSelectConcept }) => {
  const graph = knowledgeGraphService.getGraph();

  // Group concepts by category for better organization
  const conceptsByCategory: { [category: string]: ConceptNode[] } = {};
  graph.concepts.forEach(concept => {
    if (!conceptsByCategory[concept.category]) {
      conceptsByCategory[concept.category] = [];
    }
    conceptsByCategory[concept.category].push(concept);
  });

  return (
    <div className="p-4 md:p-6 bg-slate-800 rounded-lg shadow-xl h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-primary-400 mb-6">Your Learning Roadmap</h2>
      {Object.entries(conceptsByCategory).map(([category, concepts]) => (
        <div key={category} className="mb-8">
          <h3 className="text-xl font-semibold text-slate-300 mb-4 border-b-2 border-slate-700 pb-2">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {concepts.map(node => {
              const status = knowledgeGraphService.getConceptStatus(node.id, userState);
              return (
                <NodeCard
                  key={node.id}
                  node={node}
                  status={status}
                  onClick={() => onSelectConcept(node.id)}
                  isSelected={userState.currentConceptId === node.id}
                />
              );
            })}
          </div>
        </div>
      ))}
       {graph.concepts.length === 0 && (
        <p className="text-slate-400">No concepts available in the graph yet.</p>
      )}
    </div>
  );
};

export default KnowledgeGraphView;
