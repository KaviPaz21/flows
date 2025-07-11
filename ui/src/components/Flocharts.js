import React, { useEffect, useRef } from 'react';
import * as go from 'gojs';

const GoFlowChart = ({ treeData }) => {
  const diagramRef = useRef();

  useEffect(() => {
    if (!treeData || !treeData.nodes || !treeData.links) return;

    const $ = go.GraphObject.make;

    const diagram = $(go.Diagram, diagramRef.current, {
      'undoManager.isEnabled': true,
      'animationManager.isEnabled': true,
      layout: getLayout(treeData.type),
    });

    const shapeMap = {
      // ERD
      entity: 'Rectangle',
      attribute: 'Ellipse',
      relationship: 'Diamond',
      // UML
      class: 'Rectangle',
      // Use Case
      actor: 'Rectangle',
      usecase: 'Ellipse',
      // Flowchart
      start: 'Circle',
      end: 'Circle',
      process: 'Rectangle',
      decision: 'Diamond',
    };

    diagram.nodeTemplate = $(
      go.Node,
      'Auto',
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      $(
        go.Shape,
        {
          fill: '#fff',
          stroke: '#333',
          strokeWidth: 1.5,
          portId: '',
          fromLinkable: true,
          toLinkable: true,
          cursor: 'pointer',
        },
        new go.Binding('figure', 'type', (t) => shapeMap[t?.toLowerCase()] || 'Rectangle')
      ),
      $(
        go.TextBlock,
        {
          margin: 8,
          font: '12px monospace',
          wrap: go.TextBlock.WrapFit,
        },
        new go.Binding('text', 'label')
      )
    );

    diagram.linkTemplate = $(
      go.Link,
      { routing: go.Link.AvoidsNodes, curve: go.Link.JumpOver, corner: 5 },
      $(go.Shape),
      $(go.Shape, { toArrow: 'Standard' }),
      $(
        go.TextBlock,
        {
          segmentOffset: new go.Point(0, -10),
          font: '10px sans-serif',
          stroke: '#333',
        },
        new go.Binding('text', 'text')
      )
    );

    const nodesWithLabels = treeData.nodes.map((node) => ({
      ...node,
      label: node.label || generateLabel(node),
    }));

    const linksWithText = treeData.links.map((link) => ({
      ...link,
      text: link.cardinality || link.text || '',
    }));

    diagram.model = new go.GraphLinksModel(nodesWithLabels, linksWithText);

    return () => {
      diagram.div = null;
    };
  }, [treeData]);

  const generateLabel = (node) => {
    if (node.type === 'class' && node.attributes) {
      return `${node.key}\n` + node.attributes.join('\n');
    }
    if (node.attributes?.length) {
      return `${node.key}\n` + node.attributes.join(', ');
    }
    return node.key || node.id || 'Unnamed';
  };

  const getLayout = (type) => {
    const $ = go.GraphObject.make;
    switch ((type || '').toLowerCase()) {
      case 'tree':
        return $(go.TreeLayout, { angle: 90, layerSpacing: 30 });
      case 'uml':
      case 'uml class':
        return $(go.LayeredDigraphLayout);
      case 'flowchart':
        return $(go.LayeredDigraphLayout, { direction: 90 });
      case 'erd':
        return $(go.ForceDirectedLayout);
      case 'use case':
        return $(go.CircularLayout);
      default:
        return $(go.ForceDirectedLayout); // default for graphs
    }
  };

  return (
    <div
      ref={diagramRef}
      style={{
        width: '100%',
        height: '700px',
        border: '1px solid #ccc',
        borderRadius: '8px',
      }}
    />
  );
};

export default GoFlowChart;
