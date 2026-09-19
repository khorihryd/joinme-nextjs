'use client';

import { useStudioStore, findNodeById, findParentNode, resolveTextVariables } from '@/store/studio-store';

export function useStudio() {
  const store = useStudioStore();

  return {
    nodes: store.nodes,
    selectedNodeId: store.selectedNodeId,
    selectedNode: store.selectedNodeId ? findNodeById(store.nodes, store.selectedNodeId) : null,
    viewportMode: store.viewportMode,
    sidebarTab: store.sidebarTab,
    showSidebar: store.showSidebar,
    activeInspectorTab: store.activeInspectorTab,
    globalStyles: store.globalStyles,
    setNodes: store.setNodes,
    setGlobalStyles: store.setGlobalStyles,
    updateGlobalStyles: store.updateGlobalStyles,
    selectNode: store.selectNode,
    setViewportMode: store.setViewportMode,
    setSidebarTab: store.setSidebarTab,
    setShowSidebar: store.setShowSidebar,
    toggleSidebar: store.toggleSidebar,
    setActiveInspectorTab: store.setActiveInspectorTab,
    updateNode: store.updateNode,
    deleteNode: store.deleteNode,
    duplicateNode: store.duplicateNode,
    moveNode: store.moveNode,
    resetNodes: store.resetNodes,
    findNodeById: (id: string) => findNodeById(store.nodes, id),
    findParentNode: (id: string) => findParentNode(store.nodes, id),
    resolveTextVariables,
  };
}
