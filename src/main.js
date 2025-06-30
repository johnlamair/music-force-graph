import { createGraph } from './graph.js';

let graph;
let scrollProgress = 0;

// Load your graph data and create the graph
fetch('/data/Simplified_OctavateGraph.json')
    .then(res => res.json())
    .then(data => {
        graph = createGraph('3d-graph', data);
        graph.d3Force('center', d3.forceCenter(0, 0, 0));
        animateCamera(); // set initial camera position
    });

window.addEventListener('wheel', (event) => {
    scrollProgress += event.deltaY * 0.0002;

    // Clamp scrollProgress to [0,1]
    scrollProgress = Math.max(0, Math.min(1, scrollProgress));

    console.log(`Scroll progress (t): ${scrollProgress.toFixed(3)}`);
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

    console.log(`--- Animate Camera ---`);
    console.log(`t: ${t.toFixed(3)}, angle: ${angle.toFixed(3)} rad`);
    console.log(`Camera position: x=${x.toFixed(1)}, y=${y.toFixed(1)}, z=${z.toFixed(1)}`);

    const camera = graph.camera();
    const controls = graph.controls();

    camera.position.set(x, y, z);
    console.log(`Camera THREE position:`, camera.position);

    controls.target.set(0, 0, 0);
    console.log(`Controls target:`, controls.target);

    controls.update();
}
