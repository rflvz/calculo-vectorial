// Clase para cálculos vectoriales
class VectorCalculator {
    constructor() {
        this.epsilon = 1e-6; // Tolerancia para comparaciones numéricas
    }

    /**
     * Calcula el producto escalar de dos vectores
     * @param {number[]} u - Vector u
     * @param {number[]} v - Vector v
     * @returns {number} u⋅v
     */
    dotProduct(u, v) {
        if (u.length !== v.length) {
            throw new Error('Los vectores deben tener la misma dimensión');
        }
        return u.reduce((sum, ui, i) => sum + ui * v[i], 0);
    }

    /**
     * Calcula la norma (magnitud) de un vector
     * @param {number[]} vector - Vector
     * @returns {number} ||vector||
     */
    norm(vector) {
        return Math.sqrt(vector.reduce((sum, component) => sum + component * component, 0));
    }

    /**
     * Calcula la similitud coseno entre dos vectores
     * @param {number[]} u - Vector u
     * @param {number[]} v - Vector v
     * @returns {number} cos(θ) = (u⋅v) / (||u|| * ||v||)
     */
    cosineSimilarity(u, v) {
        const normU = this.norm(u);
        const normV = this.norm(v);
        
        if (normU < this.epsilon || normV < this.epsilon) {
            return 0; // Si alguno de los vectores es cero, retornar 0
        }
        
        return this.dotProduct(u, v) / (normU * normV);
    }

    /**
     * Determina si dos vectores son ortogonales
     * @param {number[]} u - Vector u
     * @param {number[]} v - Vector v
     * @returns {boolean} true si u⋅v ≈ 0
     */
    isOrthogonal(u, v) {
        const dot = this.dotProduct(u, v);
        return Math.abs(dot) < this.epsilon;
    }

    /**
     * Calcula la proyección ortogonal de u sobre v
     * @param {number[]} u - Vector u
     * @param {number[]} v - Vector v
     * @returns {number[]} proy_v(u) = ((u⋅v) / ||v||²) * v
     */
    orthogonalProjection(u, v) {
        const normVSquared = this.norm(v) ** 2;
        
        if (normVSquared < this.epsilon) {
            return new Array(u.length).fill(0); // Si v es cero, la proyección es cero
        }
        
        const scalar = this.dotProduct(u, v) / normVSquared;
        return v.map(component => scalar * component);
    }

    /**
     * Escala un vector por un factor
     * @param {number[]} vector - Vector a escalar
     * @param {number} scale - Factor de escalado
     * @returns {number[]} Vector escalado
     */
    scale(vector, scale) {
        return vector.map(component => component * scale);
    }

    /**
     * Calcula el ángulo entre dos vectores en radianes
     * @param {number[]} u - Vector u
     * @param {number[]} v - Vector v
     * @returns {number} Ángulo en radianes
     */
    angle(u, v) {
        const cosine = this.cosineSimilarity(u, v);
        // Asegurar que el valor esté en el rango [-1, 1] para Math.acos
        const clampedCosine = Math.max(-1, Math.min(1, cosine));
        return Math.acos(clampedCosine);
    }

    /**
     * Reduce vectores de N dimensiones a 3D usando PCA (Principal Component Analysis)
     * Para 2 vectores, usa una aproximación basada en varianza por dimensión
     * @param {number[]} u - Vector u de N dimensiones
     * @param {number[]} v - Vector v de N dimensiones
     * @returns {Object} {u3D: [number, number, number], v3D: [number, number, number], varianceExplained: number}
     */
    reduceTo3DWithPCA(u, v) {
        if (u.length <= 3) {
            // Si ya es 3D o menos, retornar tal cual
            const u3D = [u[0] || 0, u[1] || 0, u[2] || 0];
            const v3D = [v[0] || 0, v[1] || 0, v[2] || 0];
            return { u3D, v3D, varianceExplained: 1.0 };
        }

        const n = u.length;
        
        // Calcular varianza y magnitud por dimensión
        const dimensionStats = [];
        for (let i = 0; i < n; i++) {
            const uVal = u[i] || 0;
            const vVal = v[i] || 0;
            const mean = (uVal + vVal) / 2;
            const variance = Math.pow(uVal - mean, 2) + Math.pow(vVal - mean, 2);
            const magnitude = Math.abs(uVal) + Math.abs(vVal);
            // Score combinado: varianza + magnitud (peso mayor a varianza)
            const score = variance * 2 + magnitude;
            dimensionStats.push({ 
                index: i, 
                variance, 
                magnitude, 
                score,
                uVal,
                vVal
            });
        }
        
        // Ordenar por score descendente (dimensiones más importantes primero)
        dimensionStats.sort((a, b) => b.score - a.score);
        
        // Seleccionar las 3 dimensiones más importantes
        const top3 = dimensionStats.slice(0, 3);
        const indices = top3.map(d => d.index);
        
        // Asegurar que tenemos exactamente 3 índices
        while (indices.length < 3 && indices.length < n) {
            for (let i = 0; i < n && indices.length < 3; i++) {
                if (!indices.includes(i)) {
                    indices.push(i);
                    break;
                }
            }
        }
        
        // Proyectar usando las dimensiones seleccionadas
        const u3D = [
            u[indices[0] || 0] || 0,
            u[indices[1] !== undefined ? indices[1] : (indices[0] || 0)] || 0,
            u[indices[2] !== undefined ? indices[2] : (indices[0] || 0)] || 0
        ];
        const v3D = [
            v[indices[0] || 0] || 0,
            v[indices[1] !== undefined ? indices[1] : (indices[0] || 0)] || 0,
            v[indices[2] !== undefined ? indices[2] : (indices[0] || 0)] || 0
        ];
        
        // Calcular varianza explicada
        const totalVariance = dimensionStats.reduce((sum, d) => sum + d.variance, 0);
        const totalMagnitude = dimensionStats.reduce((sum, d) => sum + d.magnitude, 0);
        const explainedVariance = totalVariance > this.epsilon 
            ? top3.reduce((sum, d) => sum + d.variance, 0) / totalVariance 
            : (totalMagnitude > this.epsilon 
                ? top3.reduce((sum, d) => sum + d.magnitude, 0) / totalMagnitude 
                : 0.5);
        
        return { 
            u3D, 
            v3D, 
            varianceExplained: Math.min(1.0, Math.max(0.0, explainedVariance))
        };
    }
}

// Instancia global del calculador
const calculator = new VectorCalculator();

// Estado de la aplicación
const appState = {
    dimension: 3,
    vectorU: [2, 1, 0.5],
    vectorV: [0, 1.5, 2],
    scale: 1.0,
    currentExample: null // Almacena el ejemplo de embedding cargado actualmente
};

// Referencias a elementos del DOM
const elements = {
    dimensionSelect: null,
    vectorUInputs: null,
    vectorVInputs: null,
    scaleSlider: null,
    scaleValue: null,
    resetBtn: null,
    dotProduct: null,
    normU: null,
    normV: null,
    cosineSimilarity: null,
    cosineInterpretation: null,
    orthogonality: null,
    recommendationContext: null,
    nlpContext: null,
    visualizationInfo: null,
    embeddingExamples: null,
    currentExampleInfo: null,
    currentExampleName: null
};

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:129',message:'DOMContentLoaded fired',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    try {
        initializeElements();
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:135',message:'initializeElements completed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        initializeControls();
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:139',message:'initializeControls completed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        generateVectorInputs();
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:143',message:'generateVectorInputs completed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        updateAll();
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:147',message:'updateAll completed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
    } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/299c829d-32d1-4179-83c2-08c2e1dd354d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:150',message:'DOMContentLoaded ERROR',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        console.error('Error en inicialización:', error);
        throw error;
    }
});

/**
 * Inicializa las referencias a los elementos del DOM
 */
function initializeElements() {
    elements.dimensionSelect = document.getElementById('dimension-select');
    elements.vectorUInputs = document.getElementById('vector-u-inputs');
    elements.vectorVInputs = document.getElementById('vector-v-inputs');
    elements.scaleSlider = document.getElementById('scale-slider');
    elements.scaleValue = document.getElementById('scale-value');
    elements.resetBtn = document.getElementById('reset-btn');
    elements.dotProduct = document.getElementById('dot-product');
    elements.normU = document.getElementById('norm-u');
    elements.normV = document.getElementById('norm-v');
    elements.cosineSimilarity = document.getElementById('cosine-similarity');
    elements.cosineInterpretation = document.getElementById('cosine-interpretation');
    elements.orthogonality = document.getElementById('orthogonality');
    elements.recommendationContext = document.getElementById('recommendation-context');
    elements.nlpContext = document.getElementById('nlp-context');
    elements.visualizationInfo = document.getElementById('visualization-info');
    elements.embeddingExamples = document.getElementById('embedding-examples');
    elements.currentExampleInfo = document.getElementById('current-example-info');
    elements.currentExampleName = document.getElementById('current-example-name');
}

/**
 * Inicializa los event listeners de los controles
 */
function initializeControls() {
    // Selector de dimensión
    elements.dimensionSelect.addEventListener('change', (e) => {
        let dimension = parseInt(e.target.value);
        if (dimension < 2 || dimension > 10) {
            dimension = 2;
            e.target.value = '2';
        }
        appState.dimension = dimension;
        appState.currentExample = null; // Limpiar ejemplo al cambiar dimensión
        resetVectorsToDefault();
        generateVectorInputs();
        generateExampleButtons(); // Regenerar botones para la nueva dimensión
        updateAll();
    });

    // Slider de escalado
    elements.scaleSlider.addEventListener('input', (e) => {
        let scale = parseFloat(e.target.value);
        if (isNaN(scale) || scale < 0.1) scale = 0.1;
        if (scale > 3) scale = 3;
        appState.scale = scale;
        elements.scaleSlider.value = scale;
        elements.scaleValue.textContent = scale.toFixed(1);
        updateAll();
    });

    // Botón de reset
    elements.resetBtn.addEventListener('click', () => {
        appState.currentExample = null; // Limpiar ejemplo cargado
        if (elements.currentExampleInfo) {
            elements.currentExampleInfo.style.display = 'none';
        }
        resetVectorsToDefault();
        appState.scale = 1.0;
        elements.scaleSlider.value = 1.0;
        elements.scaleValue.textContent = '1.0';
        generateVectorInputs();
        generateExampleButtons(); // Actualizar estado de botones
        updateAll();
    });
    
    // Generar botones de ejemplos iniciales
    generateExampleButtons();
}

/**
 * Genera los inputs dinámicos para los vectores según la dimensión
 */
function generateVectorInputs() {
    // Limpiar inputs existentes
    elements.vectorUInputs.innerHTML = '';
    elements.vectorVInputs.innerHTML = '';

    // Crear inputs para cada componente
    for (let i = 0; i < appState.dimension; i++) {
        const labelU = document.createElement('label');
        labelU.textContent = `u${i + 1}:`;
        
        const inputU = document.createElement('input');
        inputU.type = 'text';
        inputU.value = appState.vectorU[i] || 0;
        inputU.dataset.index = i;
        inputU.dataset.vector = 'u';
        inputU.placeholder = '0';
        inputU.addEventListener('input', handleVectorInput);
        inputU.addEventListener('blur', handleVectorInput);
        inputU.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.target.blur();
            }
        });
        
        const divU = document.createElement('div');
        divU.className = 'input-group';
        divU.appendChild(labelU);
        divU.appendChild(inputU);
        elements.vectorUInputs.appendChild(divU);

        const labelV = document.createElement('label');
        labelV.textContent = `v${i + 1}:`;
        
        const inputV = document.createElement('input');
        inputV.type = 'text';
        inputV.value = appState.vectorV[i] || 0;
        inputV.dataset.index = i;
        inputV.dataset.vector = 'v';
        inputV.placeholder = '0';
        inputV.addEventListener('input', handleVectorInput);
        inputV.addEventListener('blur', handleVectorInput);
        inputV.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.target.blur();
            }
        });
        
        const divV = document.createElement('div');
        divV.className = 'input-group';
        divV.appendChild(labelV);
        divV.appendChild(inputV);
        elements.vectorVInputs.appendChild(divV);
    }
}

/**
 * Maneja los cambios en los inputs de los vectores
 */
function handleVectorInput(e) {
    const index = parseInt(e.target.dataset.index);
    const vector = e.target.dataset.vector;
    let inputValue = e.target.value.trim();
    
    // Permitir escribir libremente, validar solo al perder el foco o presionar Enter
    if (e.type === 'blur' || e.key === 'Enter') {
        let value = parseFloat(inputValue);
        
        // Si está vacío o no es un número válido, usar 0
        if (inputValue === '' || isNaN(value) || !isFinite(value)) {
            value = 0;
            e.target.value = '0';
        } else {
            // Limitar el rango para evitar valores extremos que causen problemas de visualización
            if (value > 100) {
                value = 100;
                e.target.value = '100';
            } else if (value < -100) {
                value = -100;
                e.target.value = '-100';
            } else {
                // Mantener el formato del usuario si es válido
                e.target.value = inputValue;
            }
        }

        if (vector === 'u') {
            appState.vectorU[index] = value;
        } else {
            appState.vectorV[index] = value;
        }

        updateAll();
    } else {
        // Durante la escritura, permitir cualquier texto pero no actualizar cálculos
        // Esto permite escribir números negativos, decimales, etc. sin restricciones
    }
}

/**
 * Restablece los vectores a valores por defecto
 */
function resetVectorsToDefault() {
    const dim = appState.dimension;
    if (dim === 2) {
        appState.vectorU = [1, 0];
        appState.vectorV = [0, 1];
    } else if (dim === 3) {
        // Valores predefinidos para 3D que se visualizan bien y no son paralelos
        appState.vectorU = [2, 1, 0.5];
        appState.vectorV = [0, 1.5, 2];
    } else {
        // Para dimensiones mayores, generar valores que no sean paralelos
        appState.vectorU = [];
        appState.vectorV = [];
        for (let i = 0; i < dim; i++) {
            appState.vectorU.push(Math.sin(i) * 2 + 1);
            appState.vectorV.push(Math.cos(i) * 2 + 1);
        }
    }
}

/**
 * Actualiza todos los cálculos y visualizaciones
 */
function updateAll() {
    try {
        // Validar dimensión
        if (appState.dimension < 2 || appState.dimension > 10) {
            console.error('Dimensión inválida:', appState.dimension);
            appState.dimension = 2;
            elements.dimensionSelect.value = '2';
        }

        // Asegurar que los vectores tengan la dimensión correcta
        while (appState.vectorU.length < appState.dimension) {
            appState.vectorU.push(0);
        }
        while (appState.vectorV.length < appState.dimension) {
            appState.vectorV.push(0);
        }
        appState.vectorU = appState.vectorU.slice(0, appState.dimension);
        appState.vectorV = appState.vectorV.slice(0, appState.dimension);

        // Validar que los vectores sean arrays válidos
        if (!Array.isArray(appState.vectorU) || !Array.isArray(appState.vectorV)) {
            throw new Error('Los vectores deben ser arrays válidos');
        }

        // Validar que todos los componentes sean números
        appState.vectorU = appState.vectorU.map(v => isNaN(v) ? 0 : v);
        appState.vectorV = appState.vectorV.map(v => isNaN(v) ? 0 : v);

        // Vector escalado
        const scaledU = calculator.scale(appState.vectorU, appState.scale);

        // Calcular resultados con manejo de errores
        let dotProduct, normU, normV, cosineSim, isOrtho, projection, angle;
        
        try {
            dotProduct = calculator.dotProduct(scaledU, appState.vectorV);
            normU = calculator.norm(scaledU);
            normV = calculator.norm(appState.vectorV);
            cosineSim = calculator.cosineSimilarity(scaledU, appState.vectorV);
            isOrtho = calculator.isOrthogonal(scaledU, appState.vectorV);
            projection = calculator.orthogonalProjection(scaledU, appState.vectorV);
            angle = calculator.angle(scaledU, appState.vectorV);
        } catch (error) {
            console.error('Error en cálculos:', error);
            // Valores por defecto en caso de error
            dotProduct = 0;
            normU = 0;
            normV = 0;
            cosineSim = 0;
            isOrtho = false;
            projection = new Array(appState.dimension).fill(0);
            angle = 0;
        }

        // Validar resultados antes de mostrar
        if (!isFinite(dotProduct)) dotProduct = 0;
        if (!isFinite(normU)) normU = 0;
        if (!isFinite(normV)) normV = 0;
        if (!isFinite(cosineSim) || cosineSim < -1 || cosineSim > 1) {
            cosineSim = 0;
        }
        if (!isFinite(angle)) angle = 0;

        // Actualizar resultados numéricos
        updateNumericResults(dotProduct, normU, normV, cosineSim, isOrtho);

        // Actualizar visualización
        if (typeof updateVisualization === 'function') {
            try {
                updateVisualization(scaledU, appState.vectorV, angle, projection, isOrtho);
            } catch (error) {
                console.error('Error en visualización:', error);
            }
        }

        // Actualizar contexto de IA
        updateAIContext(cosineSim);

        // Actualizar información de visualización
        updateVisualizationInfo(angle, cosineSim, isOrtho);

    } catch (error) {
        console.error('Error en updateAll:', error);
        // Mostrar mensaje de error al usuario
        if (elements.visualizationInfo) {
            elements.visualizationInfo.innerHTML = 
                '<span style="color: red;">Error: ' + error.message + '</span>';
        }
    }
}

/**
 * Actualiza los resultados numéricos en el DOM
 */
function updateNumericResults(dotProduct, normU, normV, cosineSim, isOrtho) {
    elements.dotProduct.textContent = dotProduct.toFixed(4);
    elements.normU.textContent = normU.toFixed(4);
    elements.normV.textContent = normV.toFixed(4);
    elements.cosineSimilarity.textContent = cosineSim.toFixed(4);

    // Interpretación del coseno
    let interpretation = '';
    let interpretationClass = '';
    if (Math.abs(cosineSim - 1) < 0.01) {
        interpretation = '✓ Paralelos (misma dirección)';
        interpretationClass = 'interpretation-parallel';
    } else if (Math.abs(cosineSim) < 0.01) {
        interpretation = '✓ Ortogonales (independientes)';
        interpretationClass = 'interpretation-orthogonal';
    } else if (Math.abs(cosineSim + 1) < 0.01) {
        interpretation = '✓ Opuestos (dirección contraria)';
        interpretationClass = 'interpretation-opposite';
    } else if (cosineSim > 0.7) {
        interpretation = 'Muy similares';
        interpretationClass = 'interpretation-similar';
    } else if (cosineSim < -0.7) {
        interpretation = 'Muy diferentes';
        interpretationClass = 'interpretation-different';
    } else if (Math.abs(cosineSim) < 0.3) {
        interpretation = 'Poco relacionados';
        interpretationClass = 'interpretation-weak';
    } else {
        interpretation = 'Moderadamente relacionados';
        interpretationClass = 'interpretation-moderate';
    }
    
    elements.cosineInterpretation.textContent = interpretation;
    elements.cosineInterpretation.className = `interpretation ${interpretationClass}`;

    // Ortogonalidad
    elements.orthogonality.textContent = isOrtho ? 'Sí ✓' : 'No ✗';
    elements.orthogonality.className = isOrtho ? 'result-value orthogonal-yes' : 'result-value orthogonal-no';
}

/**
 * Actualiza el contexto de IA según el valor de similitud coseno
 */
function updateAIContext(cosineSim) {
    // Contexto de Sistemas de Recomendación
    let recText = '';
    if (cosineSim > 0.8) {
        recText = `<p><strong>Similitud muy alta (${cosineSim.toFixed(3)})</strong>: Los usuarios tienen gustos muy similares. 
                   En un sistema de recomendación, estos usuarios recibirían recomendaciones muy similares basadas en sus 
                   preferencias históricas. Ejemplo: Si dos usuarios han calificado películas de manera muy similar, 
                   el sistema recomendaría las películas que uno ha visto pero el otro no.</p>`;
    } else if (cosineSim > 0.5) {
        recText = `<p><strong>Similitud moderada (${cosineSim.toFixed(3)})</strong>: Los usuarios comparten algunos gustos. 
                   Las recomendaciones serían parcialmente relevantes. Ejemplo: Usuarios que comparten interés en un género 
                   específico pero tienen preferencias diferentes en otros.</p>`;
    } else if (cosineSim > -0.3 && cosineSim < 0.3) {
        recText = `<p><strong>Similitud baja/independiente (${cosineSim.toFixed(3)})</strong>: Los usuarios tienen gustos 
                   independientes o diferentes. En sistemas de recomendación, esto indica que los perfiles de usuario 
                   capturan "aspectos distintos de los datos". Las recomendaciones basadas en este usuario no serían 
                   muy relevantes para el otro.</p>`;
    } else {
        recText = `<p><strong>Similitud negativa (${cosineSim.toFixed(3)})</strong>: Los usuarios tienen gustos opuestos. 
                   En algunos casos, esto puede ser útil para recomendar contenido que un usuario evita pero el otro disfruta, 
                   o para sistemas de diversificación de recomendaciones.</p>`;
    }
    elements.recommendationContext.innerHTML = recText;

    // Contexto de NLP
    let nlpText = '';
    if (cosineSim > 0.8) {
        nlpText = `<p><strong>Similitud semántica muy alta (${cosineSim.toFixed(3)})</strong>: Los embeddings de palabras o 
                   documentos tienen significados muy similares. Ejemplo: "perro" y "can" tendrían una similitud coseno alta. 
                   En búsqueda de documentos, estos textos aparecerían como muy relevantes para la misma consulta.</p>`;
    } else if (cosineSim > 0.5) {
        nlpText = `<p><strong>Similitud semántica moderada (${cosineSim.toFixed(3)})</strong>: Los textos comparten algunos 
                   conceptos o temas relacionados. Ejemplo: "máquina" y "robot" tienen relación pero no son sinónimos. 
                   En sistemas de recuperación de información, estos documentos serían parcialmente relevantes.</p>`;
    } else if (cosineSim > -0.3 && cosineSim < 0.3) {
        nlpText = `<p><strong>Similitud semántica baja/independiente (${cosineSim.toFixed(3)})</strong>: Los embeddings representan 
                   conceptos independientes o no relacionados. Ejemplo: "perro" y "matemáticas" tienen poca relación semántica. 
                   En modelos de lenguaje, esto indica que los embeddings capturan "aspectos distintos del espacio semántico".</p>`;
    } else {
        nlpText = `<p><strong>Similitud semántica negativa (${cosineSim.toFixed(3)})</strong>: Los embeddings representan 
                   conceptos opuestos o antónimos. Ejemplo: "caliente" y "frío" podrían tener similitud negativa. 
                   Esto es útil en análisis de sentimiento y detección de contradicciones.</p>`;
    }
    elements.nlpContext.innerHTML = nlpText;
}

/**
 * Actualiza la información de visualización
 */
function updateVisualizationInfo(angle, cosineSim, isOrtho) {
    if (!elements.visualizationInfo) return;
    
    const angleDeg = (angle * 180 / Math.PI).toFixed(1);
    let info = `Ángulo θ: ${angleDeg}° (${angle.toFixed(3)} rad) | cos(θ) = ${cosineSim.toFixed(4)}`;
    
    // Advertencias especiales
    const normU = calculator.norm(calculator.scale(appState.vectorU, appState.scale));
    const normV = calculator.norm(appState.vectorV);
    
    if (normU < calculator.epsilon) {
        info += '<br><span style="color: orange;">⚠ Advertencia: El vector u es muy pequeño (casi cero).</span>';
    }
    if (normV < calculator.epsilon) {
        info += '<br><span style="color: orange;">⚠ Advertencia: El vector v es muy pequeño (casi cero).</span>';
    }
    
    if (isOrtho) {
        info += '<br><strong style="color: #50C878;">✓ Los vectores son ortogonales. Representan aspectos independientes de los datos.</strong>';
    }
    
    if (Math.abs(cosineSim) < 0.1 && !isOrtho) {
        info += '<br>Observa la proyección ortogonal resaltada: cuando los vectores son casi ortogonales, hay poca correlación lineal entre ellos.';
    }
    
    // Información sobre el escalado
    if (Math.abs(appState.scale - 1.0) > 0.01) {
        info += `<br><em>Nota: El vector u está escalado por α = ${appState.scale.toFixed(2)}. 
                 Observa que cos(θ) permanece constante mientras que u⋅v y ||u|| cambian.</em>`;
    }
    
    // Advertencia sobre reducción dimensional si N > 3
    if (appState.dimension > 3) {
        const varianceExplained = window.pcaVarianceExplained || 0.5;
        const variancePercent = (varianceExplained * 100).toFixed(1);
        info += `<br><div style="background: rgba(245, 158, 11, 0.2); border-left: 3px solid #f59e0b; padding: 10px; margin-top: 10px; border-radius: 4px;">
            <p style="color: #f59e0b; font-size: 0.9em; margin: 0; font-weight: 600;">
                ⚠ Visualización reducida a 3D usando PCA
            </p>
            <p style="color: var(--text-secondary); font-size: 0.85em; margin: 5px 0 0 0; line-height: 1.5;">
                El vector tiene ${appState.dimension} dimensiones. La visualización usa <strong>PCA (Principal Component Analysis)</strong> 
                para reducir a 3 dimensiones, mostrando los 3 componentes principales que capturan la mayor varianza 
                (${variancePercent}% de la varianza explicada). Los cálculos numéricos (producto escalar, norma, similitud coseno) 
                usan todas las ${appState.dimension} dimensiones originales.
            </p>
        </div>`;
    }
    
    elements.visualizationInfo.innerHTML = info;
}

/**
 * Carga un ejemplo de embedding predefinido
 * @param {Object} example - Objeto con name, description, u, v
 */
function loadEmbeddingExample(example) {
    if (!example || !example.u || !example.v) {
        console.error('Ejemplo de embedding inválido:', example);
        return;
    }
    
    // Verificar que embeddingExamples esté definido
    if (typeof embeddingExamples === 'undefined') {
        console.error('embeddingExamples no está definido. Asegúrate de que embeddings-examples.js esté cargado.');
        return;
    }
    
    // Actualizar dimensión si es necesario
    const requiredDimension = example.u.vector.length;
    if (appState.dimension !== requiredDimension) {
        appState.dimension = requiredDimension;
        if (elements.dimensionSelect) {
            elements.dimensionSelect.value = requiredDimension.toString();
        }
    }
    
    // Cargar vectores del ejemplo
    appState.vectorU = [...example.u.vector];
    appState.vectorV = [...example.v.vector];
    appState.currentExample = example;
    
    // Actualizar UI
    generateVectorInputs();
    generateExampleButtons(); // Actualizar estado de botones
    updateAll();
    
    // Mostrar información del ejemplo cargado
    if (elements.currentExampleInfo && elements.currentExampleName) {
        elements.currentExampleName.innerHTML = `<strong>Ejemplo cargado:</strong> ${example.name} - ${example.description}`;
        elements.currentExampleInfo.style.display = 'block';
    }
}

/**
 * Genera los botones de ejemplos de embeddings según la dimensión actual
 */
function generateExampleButtons() {
    if (!elements.embeddingExamples) {
        return;
    }
    
    // Verificar que embeddingExamples esté definido
    if (typeof embeddingExamples === 'undefined') {
        // Si no está definido, mostrar mensaje
        elements.embeddingExamples.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9em; font-style: italic; padding: 10px;">Cargando ejemplos...</p>';
        return;
    }
    
    // Limpiar contenedor
    elements.embeddingExamples.innerHTML = '';
    
    // Obtener ejemplos para la dimensión actual
    const dimensionKey = `${appState.dimension}D`;
    const examples = embeddingExamples[dimensionKey] || [];
    
    if (examples.length === 0) {
        const noExamplesMsg = document.createElement('p');
        noExamplesMsg.textContent = 'No hay ejemplos disponibles para esta dimensión.';
        noExamplesMsg.style.cssText = 'color: var(--text-muted); font-size: 0.9em; font-style: italic; padding: 10px;';
        elements.embeddingExamples.appendChild(noExamplesMsg);
        return;
    }
    
    // Crear botones para cada ejemplo
    examples.forEach((example, index) => {
        const button = document.createElement('button');
        button.className = 'example-btn';
        button.type = 'button';
        button.dataset.exampleIndex = index;
        
        // Marcar como activo si es el ejemplo actual
        if (appState.currentExample && appState.currentExample.name === example.name) {
            button.classList.add('active');
        }
        
        // Contenido del botón
        const nameSpan = document.createElement('span');
        nameSpan.className = 'example-btn-name';
        nameSpan.textContent = example.name;
        
        const descSpan = document.createElement('span');
        descSpan.className = 'example-btn-description';
        descSpan.textContent = example.description;
        
        button.appendChild(nameSpan);
        button.appendChild(descSpan);
        
        // Event listener
        button.addEventListener('click', () => {
            loadEmbeddingExample(example);
        });
        
        elements.embeddingExamples.appendChild(button);
    });
}

