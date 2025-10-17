
import { ConceptNode, UserState, ConceptStatus, KnowledgeGraph } from '../types';
import { INITIAL_KNOWLEDGE_GRAPH } from '../constants';

export const knowledgeGraphService = {
  getGraph: (): KnowledgeGraph => {
    // In a real app, this might fetch from a backend or more complex local storage
    return INITIAL_KNOWLEDGE_GRAPH;
  },

  getConceptById: (id: string): ConceptNode | undefined => {
    return INITIAL_KNOWLEDGE_GRAPH.concepts.find(c => c.id === id);
  },

  getConceptStatus: (conceptId: string, userState: UserState): ConceptStatus => {
    if (userState.masteredConceptIds.has(conceptId)) return ConceptStatus.MASTERED;
    if (userState.currentConceptId === conceptId) return ConceptStatus.CURRENT;
    if (userState.unlockedConceptIds.has(conceptId)) return ConceptStatus.UNLOCKED;
    return ConceptStatus.LOCKED;
  },

  unlockInitialConcepts: (userState: UserState, recommendedIds: string[]): UserState => {
    const newUnlocked = new Set(userState.unlockedConceptIds);
    recommendedIds.forEach(id => newUnlocked.add(id));
    // Always unlock the 'intro' concept if not already
    if (!newUnlocked.has('intro')) {
        newUnlocked.add('intro');
    }
    
    let currentConceptId = userState.currentConceptId;
    // If no current concept or current is mastered, set to the first recommended/unlocked non-mastered one
    if (!currentConceptId || userState.masteredConceptIds.has(currentConceptId)) {
      currentConceptId = INITIAL_KNOWLEDGE_GRAPH.concepts.find(c => newUnlocked.has(c.id) && !userState.masteredConceptIds.has(c.id))?.id || null;
    }


    return { ...userState, unlockedConceptIds: newUnlocked, currentConceptId };
  },

  masterConcept: (conceptId: string, userState: UserState): UserState => {
    const newMastered = new Set(userState.masteredConceptIds).add(conceptId);
    const newUnlocked = new Set(userState.unlockedConceptIds);

    // Unlock dependent concepts
    INITIAL_KNOWLEDGE_GRAPH.concepts.forEach(concept => {
      if (concept.prerequisites.length > 0 && concept.prerequisites.every(prereqId => newMastered.has(prereqId))) {
        newUnlocked.add(concept.id);
      }
    });
    
    let nextConceptId = userState.currentConceptId;
    if (userState.currentConceptId === conceptId) { // If mastered current, find next
        // Prefer next unlocked, non-mastered concept in graph order or by category
        const allConcepts = INITIAL_KNOWLEDGE_GRAPH.concepts;
        const currentIndex = allConcepts.findIndex(c => c.id === conceptId);
        nextConceptId = allConcepts.slice(currentIndex + 1).find(c => newUnlocked.has(c.id) && !newMastered.has(c.id))?.id || null;
        if (!nextConceptId) { // If no more concepts after current, try any unlocked, non-mastered
            nextConceptId = allConcepts.find(c => newUnlocked.has(c.id) && !newMastered.has(c.id))?.id || null;
        }
    }


    return {
      ...userState,
      masteredConceptIds: newMastered,
      unlockedConceptIds: newUnlocked,
      currentConceptId: nextConceptId,
    };
  },

  getStats: (userState: UserState): { mastered: number; unlocked: number; locked: number; total: number } => {
    const total = INITIAL_KNOWLEDGE_GRAPH.concepts.length;
    const mastered = userState.masteredConceptIds.size;
    // Unlocked includes mastered, so "in progress" is unlocked but not mastered
    const inProgress = Array.from(userState.unlockedConceptIds).filter(id => !userState.masteredConceptIds.has(id)).length;
    const locked = total - userState.unlockedConceptIds.size; // This counts concepts not yet in unlocked set
    return { mastered, unlocked: inProgress, locked, total };
  }
};
