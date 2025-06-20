import { createGraph } from './graph.js';

fetch('/data/Simplified_OctavateGraph.json')
    .then(res => res.json())
    .then(data => {
        const graph = createGraph('3d-graph', data);

        // Example: Scroll interaction placeholder
        window.addEventListener('scroll', () => {
            // You can update camera or UI here based on scroll position
            const scrollPos = window.scrollY / (document.body.scrollHeight - window.innerHeight);

            const distance = 100;
            const x = distance * Math.sin(scrollPos * Math.PI * 2);
            const y = distance * Math.cos(scrollPos * Math.PI * 2);
            const z = distance * 0.5;

            graph.cameraPosition(
                { x, y, z },
                { x: 0, y: 0, z: 0 },
                1000
            );
        });
    });
