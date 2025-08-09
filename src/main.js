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

let cameraAnimationDone = false; // Global flag

function animateCamera() {
    if (!graph || cameraAnimationDone) return;

    // Cap t so animation finishes by scrollProgress = 0.25
    const rawT = scrollProgress;
    const t = Math.min(rawT / 0.25, 1);

    const camera = graph.camera();
    const controls = graph.controls();

    // Phase 1: Rise up and reveal scene
    const radius = 2500;
    const angle = 0; // Fixed starting direction
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    const y = -800 + 1000 * t;
    const targetY = y * 0.2;

    camera.position.set(x, y, z);
    controls.target.set(0, targetY, 0);
    controls.update();

    // Once Phase 1 completes, enable navigation
    if (t >= 1) {
        cameraAnimationDone = true;
        graph.enableNavigationControls(true);
        graph.enableNodeDrag(true);
    }

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
