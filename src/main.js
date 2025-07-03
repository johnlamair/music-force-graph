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
        animateCamera();
    });

/**
 * Handles the wheel scroll event to update scroll progress,
 * which controls camera movement around the graph.
 */
window.addEventListener('wheel', (event) => {
    scrollProgress += event.deltaY * 0.0002;

    // Clamp between 0 and 1
    scrollProgress = Math.max(0, Math.min(1, scrollProgress));

    animateCamera();
});

/**
 * Animates the camera position based on the current scroll progress.
 * Moves the camera through three phases:
 * 1. Raise up from below
 * 2. Zoom in while rotating
 * 3. Zoom back out rotating opposite
 */
function animateCamera() {
    if (!graph) return;

    const t = scrollProgress;

    let radius, angle, x, y, z;

    if (t < 0.2) {
        radius = 2000;
        angle = 0;
        x = radius;
        z = 0;
        y = -1000 + 1000 * (t / 0.2);

    } else if (t < 0.5) {
        const localT = (t - 0.2) / 0.3;
        radius = 2000 - 1500 * localT;
        angle = localT * Math.PI;
        x = radius * Math.cos(angle);
        z = radius * Math.sin(angle);
        y = 200 * Math.sin(localT * Math.PI * 2);

    } else {
        const localT = (t - 0.5) / 0.5;
        radius = 500 + 1500 * localT;
        angle = Math.PI - localT * Math.PI;
        x = radius * Math.cos(angle);
        z = radius * Math.sin(angle);
        y = 200 * Math.sin(localT * Math.PI * 2);
    }

    // Ensure camera is locked to the calculated position
    const camera = graph.camera();
    const controls = graph.controls();

    camera.position.set(x, y, z);
    controls.target.set(0, 0, 0);
    controls.update();
}
