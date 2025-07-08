import { createGraph } from './graph.js';

let graph;
let scrollProgress = 0;

// Load graph data and initialize
fetch('/data/Simplified_OctavateGraph.json')
    .then(res => res.json())
    .then(data => {
        graph = createGraph('3d-graph', data);
        animateCamera();
    });

// Update scroll progress and animate on wheel scroll
window.addEventListener('wheel', (event) => {
    scrollProgress += event.deltaY * 0.0002;
    scrollProgress = Math.max(0, Math.min(1, scrollProgress)); // clamp between 0 and 1
    animateCamera();
});

function animateCamera() {
    if (!graph) return;

    const t = scrollProgress;
    let radius, angle, x, y, z;
    let targetY;

    if (t < 0.2) {
        // PHASE 1: Slide down from above, keeping the camera looking downward
        radius = 2000;
        x = radius;
        z = 0;
        y = 1500 - 1500 * (t / 0.2); // y moves from 1500 -> 0
        targetY = y;

    } else if (t < 0.5) {
        // PHASE 2: Zoom in while rotating
        const localT = (t - 0.2) / 0.3;
        radius = 2000 - 1500 * localT; // radius from 2000 -> 500
        angle = localT * Math.PI;      // rotate 0 -> PI
        x = radius * Math.cos(angle);
        z = radius * Math.sin(angle);
        y = 200 * Math.sin(localT * Math.PI * 2);
        targetY = 0;

    } else {
        // PHASE 3: Zoom back out while rotating in the opposite direction
        const localT = (t - 0.5) / 0.5;
        radius = 500 + 1500 * localT;      // radius 500 -> 2000
        angle = Math.PI - localT * Math.PI; // rotate PI -> 0
        x = radius * Math.cos(angle);
        z = radius * Math.sin(angle);
        y = 200 * Math.sin(localT * Math.PI * 2);
        targetY = 0;
    }

    // Update camera position and where it's looking
    const camera = graph.camera();
    const controls = graph.controls();

    camera.position.set(x, y, z);
    controls.target.set(0, targetY, 0);
    controls.update();


    // Animate the title
    const title = document.getElementById('big-title');
    if (title) {
        // Move up and fade out from t=0 to t=0.2
        const phaseProgress = Math.min(t / 0.2, 1);
        title.style.transform = `translate(-50%, calc(-50% - ${phaseProgress * 300}px))`;
        title.style.opacity = `${1 - phaseProgress * 2}`;
    }
}
