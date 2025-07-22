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

    const t = scrollProgress; // from 0 to 1

    let radius, angle, x, y, z, targetY;

    const camera = graph.camera();
    const controls = graph.controls();

    if (t < 0.2) {
        // Phase 1: Rise up from below
        const localT = t / 0.2;
        radius = 2500;
        x = radius;
        z = 0;
        y = 800 - 600 * localT;
        targetY = y;

    } else if (t < 0.4) {
        // Phase 2: Arc upward with spiraling in
        const localT = (t - 0.2) / 0.2;
        radius = 2500 - 1000 * localT;
        angle = 2 * Math.PI * localT;
        x = radius * Math.cos(angle);
        z = radius * Math.sin(angle);
        y = 200 + 300 * Math.sin(localT * Math.PI);
        targetY = 0;

    } else if (t < 0.7) {
        // Phase 3: Close orbital swoop
        const localT = (t - 0.4) / 0.3;
        radius = 1500 - 800 * localT;
        angle = Math.PI + Math.PI * localT;
        x = radius * Math.cos(angle);
        z = radius * Math.sin(angle);
        y = 250 + 100 * Math.sin(localT * 4 * Math.PI);
        targetY = 0;

    } else if (t < 0.9) {
        // Phase 4: Pull back with twist
        const localT = (t - 0.7) / 0.2;
        radius = 700 + 1000 * localT;
        angle = 2 * Math.PI * (1 - localT);
        x = radius * Math.cos(angle);
        z = radius * Math.sin(angle);
        y = 200 + 200 * Math.cos(localT * 2 * Math.PI);
        targetY = 0;

    } else {
        // Phase 5: Slowly drift into final position
        const localT = (t - 0.9) / 0.1;
        radius = 1700 + 300 * localT;
        angle = 0.5 * Math.PI * localT;
        x = radius * Math.cos(angle);
        z = radius * Math.sin(angle);
        y = 200;
        targetY = 0;
    }

    camera.position.set(x, y, z);
    controls.target.set(0, targetY, 0);
    controls.update();

    // End animation when t = 1
    if (t >= 1) {
        cameraAnimationDone = true;

        // Enable user navigation after animation finishes
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
