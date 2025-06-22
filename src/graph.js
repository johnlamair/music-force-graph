import ForceGraph3D from '3d-force-graph';
import SpriteText from 'three-spritetext';

/**
 * Normalizes label names by trimming and lowercasing.
 * Returns 'unknown' for invalid or unrecognized labels.
 * @param {string} label
 * @return {string}
 */
const normalizeLabel = label => {
    if (!label || typeof label !== 'string') return 'unknown';
    const clean = label.trim().toLowerCase();
    return clean === 'unkown' ? 'unknown' : label;
};

// Manually defined colors for specific labels
const labelColorMap = {
    "Warner Music Group": "#e74c3c",              // Red
    "Sony Music Entertainment": "#3498db",        // Blue
    "Universal Music Group": "#f1c40f",           // Yellow
    "Other Labels": "#bdc3c7"                      // Grey (fallback group)
};

/**
 * Creates and configures a 3d-force-graph instance inside the container with given data.
 * @param {string} containerId The id of the container element.
 * @param {object} data The raw graph data.
 * @returns {object} The ForceGraph3D instance.
 */
export function createGraph(containerId, data) {
    const Graph = ForceGraph3D()(document.getElementById(containerId));

    // Filter and normalize nodes
    const validTypes = new Set(['artist', 'label', 'sublabel']);
    const nodes = data.nodes
        .map(node => {
            const normLabel = normalizeLabel(node.label);
            return {
                ...node,
                label: normLabel,
                color: labelColorMap[node.label] || "#95a5a6" // Gray fallback color
            };
        })
        .filter(node =>
            validTypes.has(node.type) &&
            node.label !== 'unknown'
        );

    // Map for fast lookup
    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

    // Filter and fix links
    const links = data.links
        .filter(link => nodeMap[link.source] && nodeMap[link.target])
        .map(link => ({
            ...link,
            source: nodeMap[link.source],
            target: nodeMap[link.target]
        }));

    // Load data
    Graph.graphData({ nodes, links })

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
    })

    // Custom link distances
    Graph.d3Force('link').distance(link => {
        const { source, target } = link;

        const src = typeof source === 'object' ? source : nodeMap[source];
        const tgt = typeof target === 'object' ? target : nodeMap[target];

        if ((src.name === 'Other Labels' && tgt.type === 'sublabel') ||
            (tgt.name === 'Other Labels' && src.type === 'sublabel')) {
            return 10;
        }

        if ((src.type === 'sublabel' && tgt.type === 'label') ||
            (tgt.type === 'sublabel' && src.type === 'label')) {
            return 25;
        }

        if ((src.type === 'artist' && tgt.type === 'sublabel') ||
            (tgt.type === 'artist' && src.type === 'sublabel')) {
            return 350;
        }

        return 30;
    })

    // Tooltip on hover
    Graph.nodeLabel(node => `${node.type}: ${node.name || node.id}`)

    // Link color matches source node color
    Graph.linkColor(link => link.source.color)

    // Node repulsion strength
    Graph.d3Force('charge').strength(-50)

    // turn off user interaction
    Graph.enableNavigationControls(false)
        .enableNodeDrag(false);

    return Graph;
}
