// Módulo de visualización 2D y 3D

let visualization2D = null;
let visualization3D = null;
let currentDimension = 2;

// Clase para visualización 2D usando Canvas
class Visualization2D {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.colors = {
            u: '#6366f1',
            v: '#ec4899',
            scaledU: '#818cf8',
            projection: '#f59e0b',
            angle: '#10b981',
            grid: '#334155',
            axes: '#cbd5e1',
            text: '#f1f5f9'
        };
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth - 40, 600);
        this.canvas.width = size;
        this.canvas.height = size;
        this.centerX = size / 2;
        this.centerY = size / 2;
        this.scale = size / 6; // Escala para visualizar los vectores
    }

    update(u, v, scaledU, angle, projection, isOrthogonal) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.drawAxes();
        
        // Dibujar proyección ortogonal si es relevante
        if (isOrthogonal || Math.abs(calculator.cosineSimilarity(scaledU, v)) < 0.3) {
            this.drawProjection(scaledU, v, projection, isOrthogonal);
        }
        
        // Dibujar vector v
        this.drawVector(v, this.colors.v, 'v');
        
        // Dibujar vector u escalado
        this.drawVector(scaledU, this.colors.scaledU, 'αu');
        
        // Dibujar vector u original (más tenue)
        this.drawVector(u, this.colors.u, 'u', 0.3);
        
        // Dibujar ángulo
        this.drawAngle(scaledU, v, angle);
        
        // Dibujar leyenda
        this.drawLegend();
    }

    drawGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 0.5;
        
        const step = this.scale;
        const startX = this.centerX % step;
        const startY = this.centerY % step;
        
        // Líneas verticales
        for (let x = startX; x < this.canvas.width; x += step) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Líneas horizontales
        for (let y = startY; y < this.canvas.height; y += step) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawAxes() {
        this.ctx.strokeStyle = this.colors.axes;
        this.ctx.lineWidth = 2;
        
        // Eje X
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.centerY);
        this.ctx.lineTo(this.canvas.width, this.centerY);
        this.ctx.stroke();
        
        // Eje Y
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, 0);
        this.ctx.lineTo(this.centerX, this.canvas.height);
        this.ctx.stroke();
        
        // Etiquetas de ejes
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '14px Arial';
        this.ctx.fillText('X', this.canvas.width - 20, this.centerY - 10);
        this.ctx.fillText('Y', this.centerX + 10, 20);
    }

    drawVector(vector, color, label, alpha = 1.0) {
        if (vector.length < 2) return;
        
        const x = this.centerX + vector[0] * this.scale;
        const y = this.centerY - vector[1] * this.scale; // Invertir Y para coordenadas de pantalla
        
        // Línea del vector
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = alpha;
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        
        // Flecha
        const angle = Math.atan2(-vector[1], vector[0]);
        const arrowLength = 15;
        const arrowAngle = Math.PI / 6;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(
            x - arrowLength * Math.cos(angle - arrowAngle),
            y - arrowLength * Math.sin(angle - arrowAngle)
        );
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(
            x - arrowLength * Math.cos(angle + arrowAngle),
            y - arrowLength * Math.sin(angle + arrowAngle)
        );
        this.ctx.stroke();
        
        // Etiqueta
        this.ctx.globalAlpha = 1.0;
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText(label, x + 10, y - 10);
    }

    drawAngle(u, v, angle) {
        if (u.length < 2 || v.length < 2) return;
        
        const angleU = Math.atan2(-u[1], u[0]);
        const angleV = Math.atan2(-v[1], v[0]);
        
        // Dibujar arco del ángulo
        this.ctx.strokeStyle = this.colors.angle;
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.6;
        
        const arcRadius = 40;
        this.ctx.beginPath();
        this.ctx.arc(
            this.centerX, 
            this.centerY, 
            arcRadius, 
            angleU, 
            angleV, 
            false
        );
        this.ctx.stroke();
        
        // Etiqueta del ángulo
        this.ctx.globalAlpha = 1.0;
        this.ctx.fillStyle = this.colors.angle;
        this.ctx.font = '12px Arial';
        const labelAngle = (angleU + angleV) / 2;
        const labelX = this.centerX + (arcRadius + 20) * Math.cos(labelAngle);
        const labelY = this.centerY - (arcRadius + 20) * Math.sin(labelAngle);
        this.ctx.fillText('θ', labelX, labelY);
    }

    drawProjection(u, v, projection, isOrthogonal) {
        if (projection.length < 2) return;
        
        const highlight = isOrthogonal;
        const color = highlight ? '#FF6B6B' : this.colors.projection;
        const lineWidth = highlight ? 3 : 2;
        const alpha = highlight ? 0.8 : 0.5;
        
        // Línea punteada desde u hasta la proyección
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.globalAlpha = alpha;
        this.ctx.setLineDash([5, 5]);
        
        const uX = this.centerX + u[0] * this.scale;
        const uY = this.centerY - u[1] * this.scale;
        const projX = this.centerX + projection[0] * this.scale;
        const projY = this.centerY - projection[1] * this.scale;
        
        this.ctx.beginPath();
        this.ctx.moveTo(uX, uY);
        this.ctx.lineTo(projX, projY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Dibujar la proyección como vector
        this.drawVector(projection, color, 'proy_v(u)', alpha);
        
        this.ctx.globalAlpha = 1.0;
    }

    drawLegend() {
        const legendX = 20;
        let legendY = 30;
        const lineHeight = 20;
        
        this.ctx.font = '12px Arial';
        
        const items = [
            { color: this.colors.u, label: 'u (original)' },
            { color: this.colors.scaledU, label: 'αu (escalado)' },
            { color: this.colors.v, label: 'v' },
            { color: this.colors.projection, label: 'proy_v(u)' },
            { color: this.colors.angle, label: 'θ (ángulo)' }
        ];
        
        items.forEach(item => {
            this.ctx.fillStyle = item.color;
            this.ctx.fillRect(legendX, legendY - 10, 15, 3);
            this.ctx.fillStyle = this.colors.text;
            this.ctx.fillText(item.label, legendX + 20, legendY);
            legendY += lineHeight;
        });
    }
}

// Clase para visualización 3D usando Three.js
class Visualization3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.vectorU = null;
        this.vectorV = null;
        this.vectorScaledU = null;
        this.projection = null;
        this.angleArc = null;
        this.axesHelper = null;
        this.gridHelper = null;
        this.setupScene();
    }

    setupScene() {
        // Asegurar que el contenedor tenga tamaño
        if (!this.container.clientWidth || !this.container.clientHeight) {
            const size = 600;
            this.container.style.width = size + 'px';
            this.container.style.height = size + 'px';
        }
        
        // Escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f172a);
        
        // Cámara con mejor posición inicial
        const width = this.container.clientWidth || 600;
        const height = this.container.clientHeight || 600;
        this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        // Posición más cercana para ver mejor los vectores
        this.camera.position.set(4, 4, 4);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);
        
        // Iluminación mejorada
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);
        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight1.position.set(5, 5, 5);
        this.scene.add(directionalLight1);
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight2.position.set(-5, -5, -5);
        this.scene.add(directionalLight2);
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(0, 0, 5);
        this.scene.add(pointLight);
        
        // Ejes más visibles
        this.axesHelper = new THREE.AxesHelper(4);
        this.scene.add(this.axesHelper);
        
        // Grid más visible con colores del tema oscuro
        this.gridHelper = new THREE.GridHelper(8, 8, 0x475569, 0x334155);
        this.scene.add(this.gridHelper);
        
        // Controles de cámara (orbit) - usar OrbitControls si está disponible
        // OrbitControls puede estar disponible como THREE.OrbitControls o como módulo
        if (typeof THREE.OrbitControls !== 'undefined') {
            try {
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.05;
            } catch (e) {
                console.warn('Error al inicializar OrbitControls, usando controles básicos:', e);
                this.controls = null;
                this.setupBasicControls();
            }
        } else {
            // Fallback: controles básicos con mouse
            this.controls = null;
            this.setupBasicControls();
        }
        
        // Animación
        this.animate();
    }

    createArrow(vector, color, label) {
        const direction = new THREE.Vector3(vector[0] || 0, vector[1] || 0, vector[2] || 0);
        const length = direction.length();
        
        if (length < 0.001) return null;
        
        // Usar ArrowHelper de Three.js con mejor visibilidad
        const normalizedDir = direction.clone().normalize();
        const arrowLength = Math.max(length, 0.3);
        
        // Crear ArrowHelper con parámetros más visibles
        const arrowHelper = new THREE.ArrowHelper(
            normalizedDir,
            new THREE.Vector3(0, 0, 0),
            arrowLength,
            color,
            Math.max(arrowLength * 0.3, 0.25), // headLength más grande
            Math.max(arrowLength * 0.2, 0.15)  // headWidth más grande
        );
        
        // Mejorar el material del cono (cabeza de la flecha)
        if (arrowHelper.cone && arrowHelper.cone.material) {
            arrowHelper.cone.material = new THREE.MeshPhongMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.5,
                shininess: 100
            });
        }
        
        // Mejorar el material de la línea (eje de la flecha) - hacer más grueso
        if (arrowHelper.line && arrowHelper.line.material) {
            arrowHelper.line.material = new THREE.LineBasicMaterial({
                color: color,
                linewidth: 5
            });
        }
        
        return arrowHelper;
    }

    createAngleArc(u, v, angle) {
        const group = new THREE.Group();
        const segments = 32;
        const radius = 0.5;
        
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        
        const angleU = Math.atan2(u[1] || 0, u[0] || 0);
        const angleV = Math.atan2(v[1] || 0, v[0] || 0);
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const currentAngle = angleU + (angleV - angleU) * t;
            vertices.push(
                radius * Math.cos(currentAngle),
                radius * Math.sin(currentAngle),
                0
            );
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 });
        const arc = new THREE.Line(geometry, material);
        group.add(arc);
        
        return group;
    }

    update(u, v, scaledU, angle, projection, isOrthogonal) {
        // Limpiar vectores anteriores
        if (this.vectorU) this.scene.remove(this.vectorU);
        if (this.vectorV) this.scene.remove(this.vectorV);
        if (this.vectorScaledU) this.scene.remove(this.vectorScaledU);
        if (this.projection) this.scene.remove(this.projection);
        if (this.angleArc) this.scene.remove(this.angleArc);
        
        // Crear nuevos vectores
        this.vectorU = this.createArrow(u, 0x6366f1, 'u');
        if (this.vectorU) {
            // Hacer el vector u original más transparente
            if (this.vectorU.cone && this.vectorU.cone.material) {
                this.vectorU.cone.material.opacity = 0.3;
                this.vectorU.cone.material.transparent = true;
            }
            if (this.vectorU.line && this.vectorU.line.material) {
                this.vectorU.line.material.opacity = 0.3;
                this.vectorU.line.material.transparent = true;
            }
            this.scene.add(this.vectorU);
        }
        
        this.vectorV = this.createArrow(v, 0xec4899, 'v');
        if (this.vectorV) this.scene.add(this.vectorV);
        
        this.vectorScaledU = this.createArrow(scaledU, 0x818cf8, 'αu');
        if (this.vectorScaledU) this.scene.add(this.vectorScaledU);
        
        // Proyección ortogonal
        if (isOrthogonal || Math.abs(calculator.cosineSimilarity(scaledU, v)) < 0.3) {
            const projColor = isOrthogonal ? 0xf59e0b : 0xfbbf24;
            this.projection = this.createArrow(projection, projColor, 'proy_v(u)');
            if (this.projection) {
                if (this.projection.cone && this.projection.cone.material) {
                    this.projection.cone.material.opacity = 0.7;
                    this.projection.cone.material.transparent = true;
                }
                if (this.projection.line && this.projection.line.material) {
                    this.projection.line.material.opacity = 0.7;
                    this.projection.line.material.transparent = true;
                }
                this.scene.add(this.projection);
            }
        }
        
        // Arco del ángulo (simplificado para 3D)
        if (u.length >= 2 && v.length >= 2) {
            this.angleArc = this.createAngleArc(u, v, angle);
            if (this.angleArc) this.scene.add(this.angleArc);
        }
        
        this.render();
    }

    setupBasicControls() {
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        this.renderer.domElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - previousMousePosition.x;
                const deltaY = e.clientY - previousMousePosition.y;
                
                const spherical = new THREE.Spherical();
                spherical.setFromVector3(this.camera.position);
                spherical.theta -= deltaX * 0.01;
                spherical.phi += deltaY * 0.01;
                spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
                
                this.camera.position.setFromSpherical(spherical);
                this.camera.lookAt(0, 0, 0);
                previousMousePosition = { x: e.clientX, y: e.clientY };
                this.render();
            }
        });
        
        this.renderer.domElement.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        this.renderer.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            const scale = e.deltaY > 0 ? 1.1 : 0.9;
            this.camera.position.multiplyScalar(scale);
            this.render();
        });
    }

    render() {
        if (this.controls) {
            this.controls.update();
        }
        this.renderer.render(this.scene, this.camera);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.render();
    }

    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}

// Función global para actualizar la visualización
function updateVisualization(scaledU, v, angle, projection, isOrthogonal) {
    const dimension = appState.dimension;
    const u = appState.vectorU; // Vector original sin escalar
    
    // Ocultar/mostrar visualizaciones según la dimensión
    const canvas2D = document.getElementById('canvas-2d');
    const canvas3D = document.getElementById('canvas-3d');
    
    if (dimension === 2) {
        if (canvas2D) canvas2D.style.display = 'block';
        if (canvas3D) canvas3D.style.display = 'none';
        
        if (!visualization2D && canvas2D) {
            visualization2D = new Visualization2D('canvas-2d');
        }
        if (visualization2D) {
            visualization2D.update(u, v, scaledU, angle, projection, isOrthogonal);
        }
    } else {
        if (canvas2D) canvas2D.style.display = 'none';
        if (canvas3D) canvas3D.style.display = 'block';
        
        if (!visualization3D && canvas3D) {
            // Asegurar que el contenedor tenga tamaño antes de inicializar
            const container = document.getElementById('canvas-3d');
            if (container) {
                const size = Math.min(container.parentElement.clientWidth - 40, 600);
                container.style.width = size + 'px';
                container.style.height = size + 'px';
            }
            visualization3D = new Visualization3D('canvas-3d');
        }
        
        if (visualization3D) {
            // Asegurar que los vectores tengan 3 componentes
            const u3 = [u[0] || 0, u[1] || 0, u[2] || 0];
            const v3 = [v[0] || 0, v[1] || 0, v[2] || 0];
            const scaledU3 = [scaledU[0] || 0, scaledU[1] || 0, scaledU[2] || 0];
            const proj3 = projection ? [projection[0] || 0, projection[1] || 0, projection[2] || 0] : [0, 0, 0];
            
            visualization3D.update(u3, v3, scaledU3, angle, proj3, isOrthogonal);
            
            // Ajustar tamaño del contenedor 3D después de actualizar
            const container = document.getElementById('canvas-3d');
            if (container && visualization3D.renderer) {
                const size = Math.min(container.parentElement.clientWidth - 40, 600);
                container.style.width = size + 'px';
                container.style.height = size + 'px';
                visualization3D.resize(size, size);
            }
        }
    }
    
    currentDimension = dimension;
}

// Manejar redimensionamiento de ventana
window.addEventListener('resize', () => {
    if (visualization2D) {
        visualization2D.setupCanvas();
        // Redibujar si hay datos
        if (appState.vectorU && appState.vectorV) {
            const scaledU = calculator.scale(appState.vectorU, appState.scale);
            const angle = calculator.angle(scaledU, appState.vectorV);
            const projection = calculator.orthogonalProjection(scaledU, appState.vectorV);
            const isOrtho = calculator.isOrthogonal(scaledU, appState.vectorV);
            visualization2D.update(appState.vectorU, appState.vectorV, scaledU, angle, projection, isOrtho);
        }
    }
    
    if (visualization3D && currentDimension === 3) {
        const container = document.getElementById('canvas-3d');
        if (container) {
            const size = Math.min(container.parentElement.clientWidth - 40, 600);
            visualization3D.resize(size, size);
        }
    }
});

