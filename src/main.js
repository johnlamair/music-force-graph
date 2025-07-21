import { createGraph } from './graph.js';

let graph;
let scrollProgress = 0;

// Fetch JSON from public folder and create graph
fetch('/data/Simplified_OctavateGraph-reduced.json')
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
    })
    .then(data => {
        graph = createGraph('3d-graph', data);
        animateCamera();
    })
    .catch(err => {
        console.error('Failed to load graph data:', err);
    });

/**
 * Handles scroll to update scroll progress and animate camera.
 */
window.addEventListener('wheel', (event) => {
    scrollProgress += event.deltaY * 0.0002;
    scrollProgress = Math.max(0, Math.min(1, scrollProgress));
    animateCamera();
    animateTitle();
});

/**
 * Moves the camera through three phases:
 * 1. Slide up from below
 * 2. Zoom in while rotating
 * 3. Zoom back out while rotating back
 */
function animateCamera() {
    if (!graph) return;

    const t = scrollProgress;

    let radius, angle, x, y, z, targetY;

    if (t < 0.2) {
        radius = 2000;
        x = radius;
        z = 0;
        y = 1500 - 1500 * (t / 0.2);
        targetY = y;

    } else if (t < 0.5) {
        const localT = (t - 0.2) / 0.3;
        radius = 2000 - 1500 * localT;
        angle = localT * Math.PI;
        x = radius * Math.cos(angle);
        z = radius * Math.sin(angle);
        y = 200 * Math.sin(localT * Math.PI * 2);
        targetY = 0;

    } else {
        const localT = (t - 0.5) / 0.5;
        radius = 500 + 1500 * localT;
        angle = Math.PI - localT * Math.PI;
        x = radius * Math.cos(angle);
        z = radius * Math.sin(angle);
        y = 200 * Math.sin(localT * Math.PI * 2);
        targetY = 0;
    }

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

/**
 * Moves the big title up and fades it based on scroll progress.
 */
function animateTitle() {
    const title = document.getElementById('big-title');
    if (!title) return;

    if (scrollProgress < 0.2) {
        const t = scrollProgress / 0.2;
        title.style.transform = `translate(-50%, calc(-50% - ${t * 300}px))`;
        title.style.opacity = `${1 - t}`;
    } else {
        title.style.opacity = '0';
    }
}
