import { createGraph } from './graph.js';

let graph;
let scrollProgress = 0;

// Load your graph data and create the graph
fetch('/data/Simplified_OctavateGraph.json')
    .then(res => res.json())
    .then(data => {
        graph = createGraph('3d-graph', data);

        // Optional: make sure center force is well configured
        graph.d3Force('center', d3.forceCenter(0, 0, 0));

        animateCamera(); // set initial camera position
    });

window.addEventListener('wheel', (event) => {
    scrollProgress += event.deltaY * 0.0002;

    console.log(`t: ${scrollProgress.toFixed(3)}`);

    animateCamera();
});

function animateCamera() {
    if (!graph) return;

    const t = scrollProgress;
    const radius = 2000;
    const angle = t * 2 * Math.PI;

    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    const y = 500 * Math.sin(t * Math.PI);

    const camera = graph.camera();
    const controls = graph.controls();

    camera.position.set(x, y, z);
    controls.target.set(0, 0, 0);
    controls.update();
}
