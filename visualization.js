// Módulo de visualización 2D y 3D

let visualization2D = null;
let visualization3D = null;
let visualizationMulti = null;
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
        this.vectors = []; // Almacenar información de vectores para hover
        this.tooltip = document.getElementById('vector-tooltip');
        this.setupHoverDetection();
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

    update(u, v, scaledU, angle, projection, isOrthogonal, wordLabels = null) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.vectors = []; // Resetear vectores para hover
        
        this.drawGrid();
        this.drawAxes();
        
        // Obtener etiquetas de palabras si hay un ejemplo cargado
        const uLabel = wordLabels?.u || 'u';
        const vLabel = wordLabels?.v || 'v';
        const scaledULabel = wordLabels?.u ? `α${wordLabels.u}` : 'αu';
        
        // Dibujar proyección ortogonal si es relevante
        if (isOrthogonal || Math.abs(calculator.cosineSimilarity(scaledU, v)) < 0.3) {
            this.drawProjection(scaledU, v, projection, isOrthogonal);
        }
        
        // Dibujar vector v
        this.drawVector(v, this.colors.v, vLabel, 1.0, 'v');
        
        // Dibujar vector u escalado
        this.drawVector(scaledU, this.colors.scaledU, scaledULabel, 1.0, 'αu');
        
        // Dibujar vector u original (más tenue)
        this.drawVector(u, this.colors.u, uLabel, 0.3, 'u');
        
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

    drawVector(vector, color, label, alpha = 1.0, vectorName = '') {
        if (vector.length < 2) return;
        
        const x = this.centerX + vector[0] * this.scale;
        const y = this.centerY - vector[1] * this.scale; // Invertir Y para coordenadas de pantalla
        
        // Guardar información del vector para hover
        if (vectorName) {
            const length = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
            this.vectors.push({
                name: vectorName,
                label: label,
                color: color,
                startX: this.centerX,
                startY: this.centerY,
                endX: x,
                endY: y,
                length: length * this.scale
            });
        }
        
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
        this.drawVector(projection, color, 'proy_v(u)', alpha, 'proy_v(u)');
        
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

    setupHoverDetection() {
        if (!this.canvas || !this.tooltip) return;

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Buscar el vector más cercano al cursor
            let closestVector = null;
            let minDistance = Infinity;
            const hoverThreshold = 20; // Píxeles de tolerancia

            for (const vector of this.vectors) {
                // Calcular distancia desde el punto del mouse hasta la línea del vector
                const dx = vector.endX - vector.startX;
                const dy = vector.endY - vector.startY;
                const length2 = dx * dx + dy * dy;

                if (length2 === 0) continue;

                const t = Math.max(0, Math.min(1, 
                    ((mouseX - vector.startX) * dx + (mouseY - vector.startY) * dy) / length2
                ));

                const projX = vector.startX + t * dx;
                const projY = vector.startY + t * dy;
                const distX = mouseX - projX;
                const distY = mouseY - projY;
                const distance = Math.sqrt(distX * distX + distY * distY);

                if (distance < hoverThreshold && distance < minDistance) {
                    minDistance = distance;
                    closestVector = vector;
                }
            }

            if (closestVector) {
                this.showTooltip(e.clientX, e.clientY, closestVector.label);
                this.canvas.style.cursor = 'pointer';
            } else {
                this.hideTooltip();
                this.canvas.style.cursor = 'default';
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.hideTooltip();
            this.canvas.style.cursor = 'default';
        });
    }

    showTooltip(x, y, text) {
        if (!this.tooltip) return;
        this.tooltip.textContent = text;
        this.tooltip.style.left = x + 'px';
        this.tooltip.style.top = y + 'px';
        this.tooltip.classList.add('show');
    }

    hideTooltip() {
        if (!this.tooltip) return;
        this.tooltip.classList.remove('show');
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
        
        // Tooltip para 3D
        this.tooltip = document.getElementById('vector-tooltip');
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.vectorLabels = new Map(); // Mapa de objetos a etiquetas
        
        // Setup hover detection para 3D
        this.setupHoverDetection3D();
        
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
        
        // Limpiar mapa de etiquetas
        this.vectorLabels.clear();
        
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
            // Agregar al mapa de etiquetas
            if (this.vectorU.cone) this.vectorLabels.set(this.vectorU.cone, 'u');
            if (this.vectorU.line) this.vectorLabels.set(this.vectorU.line, 'u');
        }
        
        this.vectorV = this.createArrow(v, 0xec4899, 'v');
        if (this.vectorV) {
            this.scene.add(this.vectorV);
            if (this.vectorV.cone) this.vectorLabels.set(this.vectorV.cone, 'v');
            if (this.vectorV.line) this.vectorLabels.set(this.vectorV.line, 'v');
        }
        
        this.vectorScaledU = this.createArrow(scaledU, 0x818cf8, 'αu');
        if (this.vectorScaledU) {
            this.scene.add(this.vectorScaledU);
            if (this.vectorScaledU.cone) this.vectorLabels.set(this.vectorScaledU.cone, 'αu');
            if (this.vectorScaledU.line) this.vectorLabels.set(this.vectorScaledU.line, 'αu');
        }
        
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
                if (this.projection.cone) this.vectorLabels.set(this.projection.cone, 'proy_v(u)');
                if (this.projection.line) this.vectorLabels.set(this.projection.line, 'proy_v(u)');
            }
        }
        
        // Arco del ángulo (simplificado para 3D)
        if (u.length >= 2 && v.length >= 2) {
            this.angleArc = this.createAngleArc(u, v, angle);
            if (this.angleArc) this.scene.add(this.angleArc);
        }
        
        this.render();
    }

    setupHoverDetection3D() {
        if (!this.renderer || !this.tooltip) return;

        const onMouseMove = (event) => {
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.camera);
            
            // Obtener todos los objetos interactuables (conos y líneas de flechas)
            const interactables = [];
            if (this.vectorU) {
                if (this.vectorU.cone) interactables.push(this.vectorU.cone);
                if (this.vectorU.line) interactables.push(this.vectorU.line);
            }
            if (this.vectorV) {
                if (this.vectorV.cone) interactables.push(this.vectorV.cone);
                if (this.vectorV.line) interactables.push(this.vectorV.line);
            }
            if (this.vectorScaledU) {
                if (this.vectorScaledU.cone) interactables.push(this.vectorScaledU.cone);
                if (this.vectorScaledU.line) interactables.push(this.vectorScaledU.line);
            }
            if (this.projection) {
                if (this.projection.cone) interactables.push(this.projection.cone);
                if (this.projection.line) interactables.push(this.projection.line);
            }

            const intersects = this.raycaster.intersectObjects(interactables);

            if (intersects.length > 0) {
                const intersected = intersects[0].object;
                const label = this.vectorLabels.get(intersected);
                if (label) {
                    this.showTooltip3D(event.clientX, event.clientY, label);
                    this.renderer.domElement.style.cursor = 'pointer';
                }
            } else {
                this.hideTooltip3D();
                this.renderer.domElement.style.cursor = 'default';
            }
        };

        this.renderer.domElement.addEventListener('mousemove', onMouseMove);
        this.renderer.domElement.addEventListener('mouseleave', () => {
            this.hideTooltip3D();
            this.renderer.domElement.style.cursor = 'default';
        });
    }

    showTooltip3D(x, y, text) {
        if (!this.tooltip) return;
        this.tooltip.textContent = text;
        this.tooltip.style.left = x + 'px';
        this.tooltip.style.top = y + 'px';
        this.tooltip.classList.add('show');
    }

    hideTooltip3D() {
        if (!this.tooltip) return;
        this.tooltip.classList.remove('show');
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

// Clase para visualización de múltiples dimensiones (N > 3)
class VisualizationMulti {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvases = [];
        this.visualizations = [];
        this.tooltip = document.getElementById('vector-tooltip');
    }

    update(u, v, scaledU, dimension) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:694',message:'VisualizationMulti.update ENTRY',data:{hasContainer:!!this.container,dimension:dimension,uLength:u?.length,vLength:v?.length,scaledULength:scaledU?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        
        if (!this.container) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:700',message:'Container missing',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            console.error('Contenedor canvas-multi no encontrado');
            return;
        }
        
        // Validar vectores
        if (!u || !v || !scaledU) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:707',message:'Invalid vectors',data:{u:!!u,v:!!v,scaledU:!!scaledU},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            console.error('Vectores no válidos:', { u, v, scaledU });
            return;
        }
        
        // Limpiar contenedor
        this.container.innerHTML = '';
        this.canvases = [];
        this.visualizations = [];

        // Crear título
        const title = document.createElement('h3');
        title.textContent = `Visualización Multi-dimensional (${dimension}D)`;
        title.style.cssText = 'color: var(--text-primary); margin-bottom: 15px; text-align: center;';
        this.container.appendChild(title);

        // Crear descripción explicativa
        const desc = document.createElement('div');
        desc.style.cssText = 'background: rgba(99, 102, 241, 0.1); border-left: 4px solid var(--primary-color); padding: 15px; margin-bottom: 20px; border-radius: var(--border-radius);';
        desc.innerHTML = `
            <p style="color: var(--text-primary); margin-bottom: 8px; font-weight: 600;">¿Cómo visualizar ${dimension} dimensiones?</p>
            <p style="color: var(--text-secondary); font-size: 0.9em; line-height: 1.6;">
                Como no podemos visualizar directamente más de 3 dimensiones, mostramos <strong>proyecciones 2D</strong> 
                de diferentes pares de dimensiones. Cada vista muestra cómo se ven los vectores cuando los proyectamos 
                en un plano formado por dos dimensiones específicas. Esto permite entender la relación entre los vectores 
                en diferentes "cortes" del espacio ${dimension}-dimensional.
            </p>
        `;
        this.container.appendChild(desc);

        // Generar todas las combinaciones de pares de dimensiones
        const pairs = [];
        for (let i = 0; i < dimension; i++) {
            for (let j = i + 1; j < dimension; j++) {
                pairs.push([i, j]);
            }
        }

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:732',message:'Pairs generated',data:{dimension:dimension,pairsCount:pairs.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        // Mostrar todas las proyecciones con scroll si hay muchas
        // Para dimensiones pequeñas (4-5D) mostrar todas, para mayores mostrar las más importantes
        const totalPairs = pairs.length;
        let selectedPairs;
        if (totalPairs <= 10) {
            // Mostrar todas si hay 10 o menos
            selectedPairs = pairs;
        } else {
            // Para más dimensiones, mostrar las primeras 6 y las últimas 4 (incluyendo la última dimensión)
            selectedPairs = [
                ...pairs.slice(0, 6),
                ...pairs.filter(([d1, d2]) => d2 === dimension - 1).slice(0, 4)
            ];
        }
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:752',message:'Selected pairs calculated',data:{totalPairs:totalPairs,selectedPairsCount:selectedPairs.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        // Crear grid de visualizaciones con scroll si hay muchas
        const grid = document.createElement('div');
        grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; padding: 10px;';
        
        // Si hay muchas vistas, agregar scroll
        if (totalPairs > 6) {
            grid.style.maxHeight = '600px';
            grid.style.overflowY = 'auto';
            grid.style.scrollbarWidth = 'thin';
        }

        selectedPairs.forEach(([dim1, dim2], index) => {
            const viewContainer = document.createElement('div');
            viewContainer.style.cssText = 'background: var(--bg-secondary); border-radius: var(--border-radius); padding: 15px; border: 1px solid var(--border-color);';
            
            const viewTitle = document.createElement('div');
            // #region agent log
            try {
                const uVal1 = (u[dim1] || 0).toFixed(2);
                const uVal2 = (u[dim2] || 0).toFixed(2);
                const vVal1 = (v[dim1] || 0).toFixed(2);
                const vVal2 = (v[dim2] || 0).toFixed(2);
                fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:770',message:'Before innerHTML template',data:{dim1:dim1,dim2:dim2,uVal1:uVal1,uVal2:uVal2,vVal1:vVal1,vVal2:vVal2},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                viewTitle.innerHTML = `
                    <div style="color: var(--text-primary); font-weight: 600; margin-bottom: 5px; font-size: 0.95em;">
                        Proyección: D${dim1 + 1} vs D${dim2 + 1}
                    </div>
                    <div style="color: var(--text-muted); font-size: 0.8em; font-style: italic;">
                        u = [${uVal1}, ${uVal2}], 
                        v = [${vVal1}, ${vVal2}]
                    </div>
                `;
                fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:781',message:'After innerHTML template',data:{success:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            } catch (error) {
                fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:782',message:'innerHTML template ERROR',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                throw error;
            }
            // #endregion
            viewContainer.appendChild(viewTitle);

            const canvas = document.createElement('canvas');
            canvas.width = 280;
            canvas.height = 280;
            canvas.style.cssText = 'width: 100%; max-width: 280px; height: auto; border: 1px solid var(--border-color); border-radius: var(--border-radius-sm);';
            viewContainer.appendChild(canvas);

            grid.appendChild(viewContainer);
            this.canvases.push({ canvas: canvas, dim1: dim1, dim2: dim2, container: viewContainer });
        });

        this.container.appendChild(grid);

        // Dibujar en cada canvas
        this.canvases.forEach(({ canvas, dim1, dim2 }) => {
            try {
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    console.error('No se pudo obtener contexto 2D del canvas');
                    return;
                }
                this.drawProjection2D(ctx, canvas.width, canvas.height, u, v, scaledU, dim1, dim2);
            } catch (error) {
                console.error('Error al dibujar proyección 2D:', error);
            }
        });
        
        // Verificar que se crearon canvas
        if (this.canvases.length === 0) {
            const errorMsg = document.createElement('div');
            errorMsg.style.cssText = 'padding: 20px; text-align: center; color: var(--text-primary);';
            errorMsg.textContent = 'No se pudieron crear las visualizaciones. Verifica la consola para más detalles.';
            this.container.appendChild(errorMsg);
        }

        // Información sobre proyecciones
        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = 'margin-top: 20px; padding: 12px; background: var(--bg-tertiary); border-radius: var(--border-radius); text-align: center;';
        
        try {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:854',message:'Before infoDiv innerHTML',data:{totalPairs:totalPairs,selectedPairsLength:selectedPairs.length,dimension:dimension},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            
            if (totalPairs > selectedPairs.length) {
                const combText = `C(${dimension},2) = ${totalPairs}`;
                infoDiv.innerHTML = `
                    <p style="color: var(--text-secondary); font-size: 0.85em; margin: 0;">
                        Mostrando ${selectedPairs.length} de ${totalPairs} posibles proyecciones 2D. 
                        <span style="color: var(--text-muted); font-style: italic;">
                            (Total de combinaciones: ${combText})
                        </span>
                    </p>
                `;
            } else {
                const combText = `C(${dimension},2) = ${totalPairs}`;
                infoDiv.innerHTML = `
                    <p style="color: var(--text-secondary); font-size: 0.85em; margin: 0;">
                        Mostrando todas las ${totalPairs} proyecciones 2D posibles.
                        <span style="color: var(--text-muted); font-style: italic;">
                            (Combinaciones: ${combText})
                        </span>
                    </p>
                `;
            }
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:840',message:'After infoDiv innerHTML',data:{success:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
        } catch (error) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:842',message:'infoDiv innerHTML ERROR',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            throw error;
        }
        this.container.appendChild(infoDiv);
        
        // Agregar información sobre el método
        const methodInfo = document.createElement('div');
        methodInfo.style.cssText = 'margin-top: 15px; padding: 10px; background: rgba(16, 185, 129, 0.1); border-left: 3px solid var(--accent-color); border-radius: var(--border-radius-sm);';
        methodInfo.innerHTML = `
            <p style="color: var(--text-secondary); font-size: 0.85em; margin: 0; line-height: 1.5;">
                <strong style="color: var(--accent-color);">Método:</strong> Cada vista muestra la proyección ortogonal 
                de los vectores en el plano definido por dos ejes dimensionales. Los valores de las otras dimensiones 
                se "ignoran" en cada proyección, permitiendo ver la relación 2D entre los vectores en ese plano específico.
            </p>
        `;
        this.container.appendChild(methodInfo);
    }

    drawProjection2D(ctx, width, height, u, v, scaledU, dim1, dim2) {
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = Math.min(width, height) / 6;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);
        
        // Fondo
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);
        
        // Grid
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.5;
        const step = scale;
        for (let x = centerX % step; x < width; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = centerY % step; y < height; y += step) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Ejes
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();
        
        // Etiquetas de ejes
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px Arial';
        ctx.fillText(`D${dim1 + 1}`, width - 20, centerY - 10);
        ctx.fillText(`D${dim2 + 1}`, centerX + 10, 15);
        
        // Proyección 2D de los vectores
        const u2D = [u[dim1] || 0, u[dim2] || 0];
        const v2D = [v[dim1] || 0, v[dim2] || 0];
        const scaledU2D = [scaledU[dim1] || 0, scaledU[dim2] || 0];
        
        // Dibujar vector v
        this.drawVector2D(ctx, centerX, centerY, scale, v2D, '#ec4899', 'v');
        
        // Dibujar vector u escalado
        this.drawVector2D(ctx, centerX, centerY, scale, scaledU2D, '#818cf8', 'αu');
        
        // Dibujar vector u original (más tenue)
        this.drawVector2D(ctx, centerX, centerY, scale, u2D, '#6366f1', 'u', 0.3);
    }

    drawVector2D(ctx, centerX, centerY, scale, vector, color, label, alpha = 1.0) {
        const x = centerX + vector[0] * scale;
        const y = centerY - vector[1] * scale;
        
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 2;
        
        // Línea del vector
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Flecha
        const angle = Math.atan2(-vector[1], vector[0]);
        const arrowLength = 10;
        const arrowAngle = Math.PI / 6;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
            x - arrowLength * Math.cos(angle - arrowAngle),
            y - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.moveTo(x, y);
        ctx.lineTo(
            x - arrowLength * Math.cos(angle + arrowAngle),
            y - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.stroke();
        
        // Etiqueta
        ctx.globalAlpha = 1.0;
        ctx.font = 'bold 11px Arial';
        ctx.fillText(label, x + 8, y - 8);
    }
}

// Función global para actualizar la visualización
function updateVisualization(scaledU, v, angle, projection, isOrthogonal) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:921',message:'updateVisualization ENTRY',data:{hasAppState:!!appState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    const dimension = appState.dimension;
    const u = appState.vectorU; // Vector original sin escalar
    
    // Obtener etiquetas de palabras si hay un ejemplo cargado
    let wordLabels = null;
    if (appState.currentExample) {
        wordLabels = {
            u: appState.currentExample.u.label,
            v: appState.currentExample.v.label
        };
    }
    
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:927',message:'Dimension extracted',data:{dimension:dimension,uLength:u?.length,vLength:v?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
    
    // Ocultar/mostrar visualizaciones según la dimensión
    const canvas2D = document.getElementById('canvas-2d');
    const canvas3D = document.getElementById('canvas-3d');
    const canvasMulti = document.getElementById('canvas-multi');
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:933',message:'Canvas elements found',data:{has2D:!!canvas2D,has3D:!!canvas3D,hasMulti:!!canvasMulti,dimension},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    if (dimension === 2) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:936',message:'Branch: dimension === 2',data:{dimension:dimension},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        if (canvas2D) canvas2D.style.display = 'block';
        if (canvas3D) canvas3D.style.display = 'none';
        if (canvasMulti) canvasMulti.style.display = 'none';
        
        if (!visualization2D && canvas2D) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:943',message:'Creating Visualization2D',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            visualization2D = new Visualization2D('canvas-2d');
        }
        if (visualization2D) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:947',message:'Calling visualization2D.update',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            try {
                visualization2D.update(u, v, scaledU, angle, projection, isOrthogonal, wordLabels);
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:950',message:'visualization2D.update SUCCESS',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
            } catch (error) {
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:953',message:'visualization2D.update ERROR',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                throw error;
            }
        }
    } else if (dimension === 3) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:957',message:'Branch: dimension === 3',data:{dimension:dimension},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        if (canvas2D) canvas2D.style.display = 'none';
        if (canvas3D) canvas3D.style.display = 'block';
        if (canvasMulti) canvasMulti.style.display = 'none';
        
        if (!visualization3D && canvas3D) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:964',message:'Creating Visualization3D',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
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
            
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:977',message:'Calling visualization3D.update',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            try {
                visualization3D.update(u3, v3, scaledU3, angle, proj3, isOrthogonal, wordLabels);
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:980',message:'visualization3D.update SUCCESS',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
            } catch (error) {
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:983',message:'visualization3D.update ERROR',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                throw error;
            }
            
            // Ajustar tamaño del contenedor 3D después de actualizar
            const container = document.getElementById('canvas-3d');
            if (container && visualization3D.renderer) {
                const size = Math.min(container.parentElement.clientWidth - 40, 600);
                container.style.width = size + 'px';
                container.style.height = size + 'px';
                visualization3D.resize(size, size);
            }
        }
    } else {
        // Para dimensiones mayores a 3, reducir a 3D mostrando solo las primeras 3 dimensiones
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:1109',message:'Branch: dimension > 3, reducing to 3D',data:{dimension:dimension},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        if (canvas2D) canvas2D.style.display = 'none';
        if (canvas3D) canvas3D.style.display = 'block';
        if (canvasMulti) canvasMulti.style.display = 'none';
        
        if (!visualization3D && canvas3D) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:1117',message:'Creating Visualization3D for reduced dimensions',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
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
            // Reducir a 3 dimensiones usando PCA
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:1133',message:'Starting PCA reduction',data:{originalDimension:dimension,uLength:u.length,vLength:v.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            
            let u3, v3, scaledU3, proj3, varianceExplained;
            try {
                // Reducir u y v usando PCA
                const reduced = calculator.reduceTo3DWithPCA(u, v);
                u3 = reduced.u3D;
                v3 = reduced.v3D;
                varianceExplained = reduced.varianceExplained;
                
                // Reducir scaledU
                const scaledReduced = calculator.reduceTo3DWithPCA(scaledU, v);
                scaledU3 = scaledReduced.u3D;
                
                // Reducir proyección si existe
                if (projection && projection.length > 0) {
                    const projReduced = calculator.reduceTo3DWithPCA(projection, v);
                    proj3 = projReduced.u3D;
                } else {
                    proj3 = [0, 0, 0];
                }
                
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:1152',message:'PCA reduction completed',data:{u3,v3,scaledU3,varianceExplained},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
            } catch (error) {
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:1156',message:'PCA reduction ERROR, using fallback',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                // Fallback: usar primeras 3 dimensiones
                u3 = [u[0] || 0, u[1] || 0, u[2] || 0];
                v3 = [v[0] || 0, v[1] || 0, v[2] || 0];
                scaledU3 = [scaledU[0] || 0, scaledU[1] || 0, scaledU[2] || 0];
                proj3 = projection ? [projection[0] || 0, projection[1] || 0, projection[2] || 0] : [0, 0, 0];
                varianceExplained = 0.5;
            }
            
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:1167',message:'Calling visualization3D.update with PCA reduced dimensions',data:{u3,v3,scaledU3},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            
            try {
                visualization3D.update(u3, v3, scaledU3, angle, proj3, isOrthogonal, wordLabels);
                
                // Guardar varianceExplained para mostrarlo en la información
                if (!window.pcaVarianceExplained) {
                    window.pcaVarianceExplained = {};
                }
                window.pcaVarianceExplained = varianceExplained;
                
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:1177',message:'visualization3D.update SUCCESS (PCA reduced)',data:{varianceExplained},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
            } catch (error) {
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visualization.js:1181',message:'visualization3D.update ERROR (PCA reduced)',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                throw error;
            }
            
            // Ajustar tamaño del contenedor 3D después de actualizar
            const container = document.getElementById('canvas-3d');
            if (container && visualization3D.renderer) {
                const size = Math.min(container.parentElement.clientWidth - 40, 600);
                container.style.width = size + 'px';
                container.style.height = size + 'px';
                visualization3D.resize(size, size);
            }
            
            // Mostrar advertencia sobre la reducción dimensional en visualizationInfo
            // Esto se agregará en updateVisualizationInfo si es necesario
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

