// Módulo de animaciones visuales para cálculos vectoriales

class CalculationAnimations {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.currentAnimation = null;
        this.animationStep = 0;
        this.animationProgress = 0;
        this.isPlaying = false;
        this.speed = 1.0; // Velocidad de animación
        
        this.setupCanvas();
        this.setupControls();
    }

    setupCanvas() {
        if (!this.container) {
            console.error('Contenedor de animaciones no encontrado');
            return;
        }
        
        // Limpiar contenedor si tiene contenido previo
        this.container.innerHTML = '';
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.canvas.style.cssText = 'width: 100%; max-width: 800px; height: auto; min-height: 400px; border: 2px solid var(--border-color); border-radius: var(--border-radius); background: var(--bg-primary); display: block; margin: 0 auto;';
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('No se pudo obtener contexto 2D del canvas');
            this.container.innerHTML = '<p style="color: var(--text-secondary); padding: 20px;">Error: No se pudo inicializar el canvas de animaciones.</p>';
            return;
        }
        
        this.container.appendChild(this.canvas);
        
        // Ajustar tamaño del canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Dibujar inicialmente con un pequeño delay para asegurar que todo esté listo
        setTimeout(() => {
            if (this.ctx && this.canvas) {
                this.draw();
            }
        }, 200);
    }

    resizeCanvas() {
        if (!this.canvas || !this.container) return;
        const containerWidth = this.container.clientWidth;
        const aspectRatio = 800 / 600;
        const maxWidth = Math.min(800, containerWidth - 40);
        this.canvas.width = maxWidth;
        this.canvas.height = maxWidth / aspectRatio;
    }

    setupControls() {
        if (!this.container) return;
        
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'animation-controls';
        controlsDiv.style.cssText = 'display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap; align-items: center;';
        
        // Botón Play/Pause
        const playBtn = document.createElement('button');
        playBtn.className = 'btn-animation';
        const playIcon = document.createElement('span');
        playIcon.innerHTML = '▶';
        playIcon.style.cssText = 'font-size: 0.9em;';
        const playText = document.createElement('span');
        playText.textContent = 'Reproducir';
        playBtn.appendChild(playIcon);
        playBtn.appendChild(playText);
        playBtn.addEventListener('click', () => {
            this.toggleAnimation();
            playIcon.textContent = this.isPlaying ? '⏸' : '▶';
            playText.textContent = this.isPlaying ? 'Pausar' : 'Reproducir';
        });
        
        // Botón Reiniciar
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn-animation';
        resetBtn.style.cssText = 'background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary)); color: var(--text-primary); border: 1px solid var(--border-color);';
        const resetIcon = document.createElement('span');
        resetIcon.innerHTML = '↻';
        resetIcon.style.cssText = 'font-size: 0.9em;';
        const resetText = document.createElement('span');
        resetText.textContent = 'Reiniciar';
        resetBtn.appendChild(resetIcon);
        resetBtn.appendChild(resetText);
        resetBtn.addEventListener('click', () => this.resetAnimation());
        
        // Selector de animación
        const selectAnim = document.createElement('select');
        selectAnim.className = 'animation-select';
        selectAnim.innerHTML = `
            <option value="norm">Norma (||u||)</option>
            <option value="cosine">Similitud Coseno (cos(θ))</option>
            <option value="orthogonal">Ortogonalidad (u⊥v)</option>
        `;
        selectAnim.addEventListener('change', (e) => {
            this.setAnimation(e.target.value);
        });
        
        // Slider de velocidad
        const speedLabel = document.createElement('label');
        speedLabel.textContent = 'Velocidad:';
        speedLabel.className = 'speed-label';
        
        const speedValue = document.createElement('span');
        speedValue.className = 'speed-value';
        speedValue.textContent = '1.0x';
        speedValue.style.cssText = 'min-width: 50px; text-align: center; font-weight: 600; color: var(--primary-color); font-family: "JetBrains Mono", monospace; padding: 4px 12px; background: rgba(99, 102, 241, 0.1); border-radius: var(--border-radius-sm); border: 1px solid rgba(99, 102, 241, 0.2);';
        
        const speedSlider = document.createElement('input');
        speedSlider.type = 'range';
        speedSlider.min = '0.5';
        speedSlider.max = '3';
        speedSlider.step = '0.1';
        speedSlider.value = '1.0';
        speedSlider.addEventListener('input', (e) => {
            this.speed = parseFloat(e.target.value);
            speedValue.textContent = this.speed.toFixed(1) + 'x';
        });
        
        controlsDiv.appendChild(playBtn);
        controlsDiv.appendChild(resetBtn);
        controlsDiv.appendChild(selectAnim);
        
        // Contenedor para velocidad
        const speedContainer = document.createElement('div');
        speedContainer.style.cssText = 'display: flex; align-items: center; gap: 12px; flex: 1; min-width: 200px;';
        speedContainer.appendChild(speedLabel);
        speedContainer.appendChild(speedSlider);
        speedContainer.appendChild(speedValue);
        controlsDiv.appendChild(speedContainer);
        
        // Guardar referencias para actualización dinámica
        this.playBtn = playBtn;
        this.playIcon = playIcon;
        this.playText = playText;
        
        this.container.appendChild(controlsDiv);
        
        // Guardar referencias
        this.playBtn = playBtn;
        this.selectAnim = selectAnim;
        
        // Inicializar con animación de norma después de un pequeño delay
        setTimeout(() => {
            this.setAnimation('norm');
        }, 200);
    }

    setAnimation(type) {
        this.currentAnimation = type;
        this.resetAnimation();
        this.draw();
    }

    toggleAnimation() {
        this.isPlaying = !this.isPlaying;
        if (this.playIcon && this.playText) {
            this.playIcon.textContent = this.isPlaying ? '⏸' : '▶';
            this.playText.textContent = this.isPlaying ? 'Pausar' : 'Reproducir';
        }
        
        if (this.isPlaying) {
            this.animate();
        } else {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }
    }

    resetAnimation() {
        this.animationProgress = 0;
        this.animationStep = 0;
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.playBtn.textContent = '▶ Reproducir';
        this.draw();
    }

    animate() {
        if (!this.isPlaying) return;
        
        this.animationProgress += 0.02 * this.speed;
        if (this.animationProgress >= 1) {
            this.animationProgress = 1;
            this.isPlaying = false;
            this.playBtn.textContent = '▶ Reproducir';
        }
        
        this.draw();
        
        if (this.isPlaying) {
            this.animationId = requestAnimationFrame(() => this.animate());
        }
    }

    draw() {
        if (!this.ctx || !this.canvas) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = Math.min(width, height) / 6;
        
        // Limpiar canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Fondo
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, width, height);
        
        // Obtener vectores actuales
        if (typeof appState === 'undefined' || !appState.vectorU || !appState.vectorV) {
            // Valores por defecto si appState no está disponible
            const u = [2, 1];
            const v = [0, 1.5];
            
            // Dibujar grid y ejes básicos
            this.drawGrid(centerX, centerY, scale);
            this.drawAxes(centerX, centerY);
            
            // Mostrar mensaje
            this.ctx.fillStyle = '#cbd5e1';
            this.ctx.font = '18px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Cargando animaciones...', centerX, centerY);
            return;
        }
        
        const u = appState.vectorU || [2, 1];
        const v = appState.vectorV || [0, 1.5];
        const scaledU = calculator.scale(u, appState.scale || 1.0);
        
        // Dibujar según el tipo de animación
        switch (this.currentAnimation) {
            case 'norm':
                this.drawNormAnimation(centerX, centerY, scale, scaledU, v);
                break;
            case 'cosine':
                this.drawCosineAnimation(centerX, centerY, scale, scaledU, v);
                break;
            case 'orthogonal':
                this.drawOrthogonalAnimation(centerX, centerY, scale, scaledU, v);
                break;
            default:
                // Si no hay animación seleccionada, mostrar grid y ejes
                this.drawGrid(centerX, centerY, scale);
                this.drawAxes(centerX, centerY);
                break;
        }
    }

    drawNormAnimation(centerX, centerY, scale, u, v) {
        const progress = this.animationProgress;
        const step = Math.floor(progress * 3); // 3 pasos: mostrar vector, mostrar componentes, mostrar norma
        
        // Dibujar grid y ejes
        this.drawGrid(centerX, centerY, scale);
        this.drawAxes(centerX, centerY);
        
        // Paso 1: Mostrar vector u
        if (step >= 0) {
            const alpha = step === 0 ? Math.min(1, progress * 3) : 1;
            this.drawVector(this.ctx, centerX, centerY, scale, u, '#6366f1', 'u', alpha);
        }
        
        // Paso 2: Mostrar componentes (triángulo rectángulo)
        if (step >= 1) {
            const stepProgress = (progress - 1/3) * 3;
            const alpha = Math.min(1, stepProgress);
            
            const uX = centerX + u[0] * scale;
            const uY = centerY - u[1] * scale;
            
            // Línea horizontal (componente x)
            this.ctx.strokeStyle = '#ec4899';
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = alpha * 0.7;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(uX, centerY);
            this.ctx.stroke();
            
            // Línea vertical (componente y)
            this.ctx.beginPath();
            this.ctx.moveTo(uX, centerY);
            this.ctx.lineTo(uX, uY);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // Etiquetas de componentes
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#ec4899';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.fillText(`u₁ = ${u[0].toFixed(2)}`, uX / 2, centerY + 20);
            this.ctx.fillText(`u₂ = ${u[1].toFixed(2)}`, uX + 10, (centerY + uY) / 2);
        }
        
        // Paso 3: Mostrar cálculo de norma
        if (step >= 2) {
            const stepProgress = (progress - 2/3) * 3;
            const alpha = Math.min(1, stepProgress);
            
            const normU = calculator.norm(u);
            const uX = centerX + u[0] * scale;
            const uY = centerY - u[1] * scale;
            
            // Dibujar círculo que muestra la norma
            this.ctx.strokeStyle = '#10b981';
            this.ctx.lineWidth = 3;
            this.ctx.globalAlpha = alpha * 0.5;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, normU * scale, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Fórmula
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#10b981';
            this.ctx.font = 'bold 18px JetBrains Mono';
            const formula = `||u|| = √(u₁² + u₂²) = √(${(u[0]*u[0]).toFixed(2)} + ${(u[1]*u[1]).toFixed(2)}) = ${normU.toFixed(4)}`;
            this.ctx.fillText(formula, 20, 40);
            
            // Línea desde origen hasta el final del vector (mostrando la norma)
            this.ctx.strokeStyle = '#10b981';
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = alpha * 0.8;
            this.ctx.setLineDash([3, 3]);
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(uX, uY);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
        
        this.ctx.globalAlpha = 1;
    }

    drawCosineAnimation(centerX, centerY, scale, u, v) {
        const progress = this.animationProgress;
        const step = Math.floor(progress * 4); // 4 pasos
        
        // Dibujar grid y ejes
        this.drawGrid(centerX, centerY, scale);
        this.drawAxes(centerX, centerY);
        
        // Paso 1: Mostrar ambos vectores
        if (step >= 0) {
            const alpha = step === 0 ? Math.min(1, progress * 4) : 1;
            this.drawVector(this.ctx, centerX, centerY, scale, u, '#6366f1', 'u', alpha);
            this.drawVector(this.ctx, centerX, centerY, scale, v, '#ec4899', 'v', alpha);
        }
        
        // Paso 2: Mostrar ángulo θ
        if (step >= 1) {
            const stepProgress = (progress - 1/4) * 4;
            const alpha = Math.min(1, stepProgress);
            
            const angle = calculator.angle(u, v);
            const angleU = Math.atan2(-u[1], u[0]);
            const angleV = Math.atan2(-v[1], v[0]);
            
            // Arco del ángulo
            this.ctx.strokeStyle = '#10b981';
            this.ctx.lineWidth = 3;
            this.ctx.globalAlpha = alpha;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, 50, angleU, angleV, false);
            this.ctx.stroke();
            
            // Etiqueta del ángulo
            const labelAngle = (angleU + angleV) / 2;
            this.ctx.fillStyle = '#10b981';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillText('θ', centerX + 70 * Math.cos(labelAngle), centerY - 70 * Math.sin(labelAngle));
            
            // Mostrar valor del ángulo
            this.ctx.fillText(`θ = ${(angle * 180 / Math.PI).toFixed(1)}°`, 20, 40);
        }
        
        // Paso 3: Mostrar producto escalar
        if (step >= 2) {
            const stepProgress = (progress - 2/4) * 4;
            const alpha = Math.min(1, stepProgress);
            
            const dotProduct = calculator.dotProduct(u, v);
            
            // Mostrar cálculo
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#f59e0b';
            this.ctx.font = 'bold 16px JetBrains Mono';
            let formula = `u⋅v = `;
            for (let i = 0; i < Math.min(u.length, v.length); i++) {
                if (i > 0) formula += ' + ';
                formula += `${u[i].toFixed(2)} × ${v[i].toFixed(2)}`;
            }
            formula += ` = ${dotProduct.toFixed(4)}`;
            this.ctx.fillText(formula, 20, 70);
        }
        
        // Paso 4: Mostrar similitud coseno completa
        if (step >= 3) {
            const stepProgress = (progress - 3/4) * 4;
            const alpha = Math.min(1, stepProgress);
            
            const dotProduct = calculator.dotProduct(u, v);
            const normU = calculator.norm(u);
            const normV = calculator.norm(v);
            const cosineSim = calculator.cosineSimilarity(u, v);
            
            // Mostrar fórmula completa
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#6366f1';
            this.ctx.font = 'bold 18px JetBrains Mono';
            
            const formula = `cos(θ) = (u⋅v) / (||u|| × ||v||)`;
            this.ctx.fillText(formula, 20, 100);
            
            this.ctx.fillStyle = '#10b981';
            const calculation = `cos(θ) = ${dotProduct.toFixed(4)} / (${normU.toFixed(4)} × ${normV.toFixed(4)}) = ${cosineSim.toFixed(4)}`;
            this.ctx.fillText(calculation, 20, 130);
            
            // Interpretación
            let interpretation = '';
            if (Math.abs(cosineSim - 1) < 0.01) {
                interpretation = 'Vectores paralelos (misma dirección)';
            } else if (Math.abs(cosineSim) < 0.01) {
                interpretation = 'Vectores ortogonales (perpendiculares)';
            } else if (cosineSim > 0.7) {
                interpretation = 'Alta similitud';
            } else if (cosineSim < -0.7) {
                interpretation = 'Baja similitud (opuestos)';
            } else {
                interpretation = 'Similitud moderada';
            }
            
            this.ctx.fillStyle = '#ec4899';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`Interpretación: ${interpretation}`, 20, 160);
        }
        
        this.ctx.globalAlpha = 1;
    }

    drawOrthogonalAnimation(centerX, centerY, scale, u, v) {
        const progress = this.animationProgress;
        const step = Math.floor(progress * 3); // 3 pasos
        
        // Dibujar grid y ejes
        this.drawGrid(centerX, centerY, scale);
        this.drawAxes(centerX, centerY);
        
        // Paso 1: Mostrar ambos vectores
        if (step >= 0) {
            const alpha = step === 0 ? Math.min(1, progress * 3) : 1;
            this.drawVector(this.ctx, centerX, centerY, scale, u, '#6366f1', 'u', alpha);
            this.drawVector(this.ctx, centerX, centerY, scale, v, '#ec4899', 'v', alpha);
        }
        
        // Paso 2: Mostrar producto escalar
        if (step >= 1) {
            const stepProgress = (progress - 1/3) * 3;
            const alpha = Math.min(1, stepProgress);
            
            const dotProduct = calculator.dotProduct(u, v);
            
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#f59e0b';
            this.ctx.font = 'bold 18px JetBrains Mono';
            this.ctx.fillText(`u⋅v = ${dotProduct.toFixed(6)}`, 20, 40);
        }
        
        // Paso 3: Mostrar verificación de ortogonalidad
        if (step >= 2) {
            const stepProgress = (progress - 2/3) * 3;
            const alpha = Math.min(1, stepProgress);
            
            const dotProduct = calculator.dotProduct(u, v);
            const isOrtho = calculator.isOrthogonal(u, v);
            const epsilon = 0.000001;
            
            // Ángulo de 90 grados si son ortogonales
            if (isOrtho) {
                const angleU = Math.atan2(-u[1], u[0]);
                const angleV = Math.atan2(-v[1], v[0]);
                
                // Mostrar ángulo recto
                this.ctx.strokeStyle = '#10b981';
                this.ctx.lineWidth = 3;
                this.ctx.globalAlpha = alpha;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, 50, angleU, angleV, false);
                this.ctx.stroke();
                
                // Indicador de ángulo recto
                const midAngle = (angleU + angleV) / 2;
                const indicatorX = centerX + 30 * Math.cos(midAngle);
                const indicatorY = centerY - 30 * Math.sin(midAngle);
                this.ctx.fillStyle = '#10b981';
                this.ctx.font = 'bold 20px Arial';
                this.ctx.fillText('∟', indicatorX - 5, indicatorY + 5);
            }
            
            // Fórmula y resultado
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = isOrtho ? '#10b981' : '#ec4899';
            this.ctx.font = 'bold 18px JetBrains Mono';
            
            const condition = `u⊥v si y solo si u⋅v = 0`;
            this.ctx.fillText(condition, 20, 70);
            
            const check = `|${dotProduct.toFixed(6)}| < ${epsilon} ?`;
            this.ctx.fillText(check, 20, 100);
            
            const result = `u⊥v: ${isOrtho ? 'Sí ✓' : 'No ✗'}`;
            this.ctx.fillStyle = isOrtho ? '#10b981' : '#ec4899';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillText(result, 20, 130);
            
            // Explicación
            this.ctx.fillStyle = '#cbd5e1';
            this.ctx.font = '14px Arial';
            if (isOrtho) {
                this.ctx.fillText('Los vectores son perpendiculares. Representan aspectos independientes.', 20, 160);
            } else {
                this.ctx.fillText('Los vectores no son ortogonales. Hay cierta correlación entre ellos.', 20, 160);
            }
        }
        
        this.ctx.globalAlpha = 1;
    }

    drawGrid(centerX, centerY, scale) {
        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 0.5;
        
        const step = scale;
        const startX = centerX % step;
        const startY = centerY % step;
        
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

    drawAxes(centerX, centerY) {
        this.ctx.strokeStyle = '#cbd5e1';
        this.ctx.lineWidth = 2;
        
        // Eje X
        this.ctx.beginPath();
        this.ctx.moveTo(0, centerY);
        this.ctx.lineTo(this.canvas.width, centerY);
        this.ctx.stroke();
        
        // Eje Y
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, 0);
        this.ctx.lineTo(centerX, this.canvas.height);
        this.ctx.stroke();
        
        // Etiquetas
        this.ctx.fillStyle = '#cbd5e1';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('X', this.canvas.width - 20, centerY - 10);
        this.ctx.fillText('Y', centerX + 10, 20);
    }

    drawVector(ctx, centerX, centerY, scale, vector, color, label, alpha = 1.0) {
        if (vector.length < 2) return;
        
        const x = centerX + vector[0] * scale;
        const y = centerY - vector[1] * scale;
        
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 3;
        
        // Línea del vector
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Flecha
        const angle = Math.atan2(-vector[1], vector[0]);
        const arrowLength = 15;
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
        ctx.fillStyle = color;
        ctx.font = 'bold 16px Arial';
        ctx.fillText(label, x + 15, y - 10);
    }
}

// Instancia global
let calculationAnimations = null;

// Función para inicializar animaciones
function initializeAnimations() {
    const animationsContainer = document.getElementById('visual-animations-container');
    if (animationsContainer && !calculationAnimations) {
        try {
            console.log('Inicializando animaciones...');
            calculationAnimations = new CalculationAnimations('visual-animations-container');
            console.log('Animaciones inicializadas correctamente');
            
            // Actualizar animaciones cuando cambien los vectores
            if (typeof window.updateAll === 'function') {
                const originalUpdateAll = window.updateAll;
                window.updateAll = function() {
                    originalUpdateAll();
                    if (calculationAnimations && !calculationAnimations.isPlaying) {
                        calculationAnimations.draw();
                    }
                };
            }
        } catch (error) {
            console.error('Error al inicializar animaciones:', error);
            animationsContainer.innerHTML = '<p style="color: var(--text-secondary); padding: 20px;">Error al cargar las animaciones: ' + error.message + '</p>';
        }
    } else if (!animationsContainer) {
        console.error('Contenedor visual-animations-container no encontrado');
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeAnimations, 300);
    });
} else {
    // DOM ya está listo
    setTimeout(initializeAnimations, 300);
}

