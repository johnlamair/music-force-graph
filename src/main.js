import { createGraph } from './graph.js';

fetch('/data/Simplified_OctavateGraph.json')
    .then(res => res.json())
    .then(data => {
        const graph = createGraph('3d-graph', data);
    });
