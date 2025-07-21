import ForceGraph3D from '3d-force-graph';
import SpriteText from 'three-spritetext';

// Define colors for known labels
const labelColorMap = {
    "warner music group": "#e74c3c",       // Red
    "sony music entertainment": "#3498db", // Blue
    "universal music group": "#f1c40f",    // Yellow
    "other labels": "#bdc3c7"               // Grey
};

/**
 * Create and configure 3D force graph instance.
 * @param {string} containerId - ID of container element.
 * @param {object} data - Graph data.
 * @returns {object} ForceGraph3D instance.
 */
export function createGraph(containerId, data) {
    const validTypes = new Set(['artist', 'label', 'sublabel']);

    const nodes = data.nodes
        .map(node => {
            const normLabel = node.label;
            return {
                ...node,
                label: normLabel,
                color: labelColorMap[node.label] || "#95a5a6"
            };
        })
        .filter(node => validTypes.has(node.type));

    // Map node IDs to nodes for quick reference
    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

    // Filter links to only include those with valid source and target nodes
    const links = data.links
        .filter(link => nodeMap[link.source] && nodeMap[link.target])
        .map(link => ({
            ...link,
            source: nodeMap[link.source],
            target: nodeMap[link.target]
        }));

    const Graph = ForceGraph3D()(document.getElementById(containerId));

    // Custom node rendering with SpriteText
    Graph.nodeThreeObject(node => {
        const sprite = new SpriteText(node.name || node.id);
        sprite.material.depthWrite = false;
        sprite.color = node.color;

        switch (node.type) {
            case 'label':
                sprite.textHeight = 60;
                break;
            case 'sublabel':
                sprite.textHeight = 30;
                break;
            default:
                sprite.textHeight = 10;
        }
        return sprite;
    });

    // Customize link distances
    Graph.d3Force('link').distance(link => {
        const src = typeof link.source === 'object' ? link.source : nodeMap[link.source];
        const tgt = typeof link.target === 'object' ? link.target : nodeMap[link.target];

        if ((src.name === 'Other Labels' && tgt.type === 'sublabel') ||
            (tgt.name === 'Other Labels' && src.type === 'sublabel')) {
            return 10;
        } else if ((src.type === 'sublabel' && tgt.type === 'label') ||
            (tgt.type === 'sublabel' && src.type === 'label')) {
            return 25;
        } else if ((src.type === 'artist' && tgt.type === 'sublabel') ||
            (tgt.type === 'artist' && src.type === 'sublabel')) {
            return 350;
        }
        return 30;
    });

    // Tooltip on hover
    Graph.nodeLabel(node => `${node.type}: ${node.name || node.id}`);

    // Link color same as source node color
    Graph.linkColor(link => link.source.color);

    // Node repulsion strength
    Graph.d3Force('charge').strength(-50);

    // Disable user interaction
    Graph.enableNavigationControls(false)
        .enableNodeDrag(false)
        .showNavInfo(false);

    // Set data to graph
    Graph.graphData({ nodes, links });

    return Graph;
}
