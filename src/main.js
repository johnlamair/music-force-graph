import { createGraph } from './graph.js';

let graph;
let scrollProgress = 0;

/**
 * Loads the graph data from JSON and creates the 3D force-directed graph.
 * Sets the initial camera position after graph is created.
 */
fetch('/data/Simplified_OctavateGraph.json')
    .then(res => res.json())
    .then(data => {
        graph = createGraph('3d-graph', data);
        graph.d3Force('center', d3.forceCenter(0, 0, 0));
        animateCamera();
    });

/**
 * Handles the wheel scroll event to update scroll progress,
 * which controls camera movement around the graph.
 *
 * @param {!WheelEvent} event The wheel scroll event.
 */
window.addEventListener('wheel', (event) => {
    scrollProgress += event.deltaY * 0.0002;

    // Clamp scrollProgress between 0 and 1
    scrollProgress = Math.max(0, Math.min(1, scrollProgress));

    console.log(`Scroll progress (t): ${scrollProgress.toFixed(3)}`);

    animateCamera();
});

/**
 * Animates the camera position based on the current scroll progress.
 * Moves the camera along a circular path around the graph center,
 * and slightly up/down to create a dynamic view.
 */
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
