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
    elements.stepByStepCalculation = document.getElementById('step-by-step-calculation');
    elements.visualAnimationsContainer = document.getElementById('visual-animations-container');
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

        // Actualizar cálculo paso a paso
        updateStepByStepCalculation(scaledU, appState.vectorV, dotProduct, normU, normV, cosineSim, isOrtho);

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

/**
 * Actualiza la sección de cálculo paso a paso
 */
function updateStepByStepCalculation(u, v, dotProduct, normU, normV, cosineSim, isOrtho) {
    if (!elements.stepByStepCalculation) return;

    const dim = u.length;
    let html = '';

    // 1. Producto Escalar
    html += '<div class="calculation-step">';
    html += '<h3>1. Producto Escalar (u⋅v)</h3>';
    html += '<div class="step-formula">u⋅v = Σ(uᵢ × vᵢ) = u₁×v₁ + u₂×v₂ + ... + uₙ×vₙ</div>';
    
    html += '<div class="step-breakdown">';
    let dotSum = 0;
    for (let i = 0; i < dim; i++) {
        const product = u[i] * v[i];
        dotSum += product;
        const sign = i < dim - 1 ? ' + ' : '';
        html += `<div class="step-breakdown-item">`;
        html += `<span class="step-label">u${i + 1} × v${i + 1}:</span>`;
        html += `<span class="step-value">${u[i].toFixed(4)} × ${v[i].toFixed(4)} = ${product.toFixed(4)}</span>`;
        html += `</div>`;
    }
    html += '</div>';
    
    html += '<div class="step-result">u⋅v = ' + dotProduct.toFixed(6) + '</div>';
    html += '<div class="step-explanation">El producto escalar mide qué tan "alineados" están los vectores. Un valor positivo indica que apuntan en direcciones similares, negativo indica direcciones opuestas, y cero indica ortogonalidad.</div>';
    html += '<button class="btn-visualize" onclick="showVisualization(\'dot-product\')">';
    html += '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>';
    html += '<span>Ver Animación 3D</span>';
    html += '</button>';
    html += '</div>';

    // 2. Norma de u
    html += '<div class="calculation-step">';
    html += '<h3>2. Norma de u (||u||)</h3>';
    html += '<div class="step-formula">||u|| = √(u₁² + u₂² + ... + uₙ²)</div>';
    
    html += '<div class="step-breakdown">';
    let normUSum = 0;
    for (let i = 0; i < dim; i++) {
        const squared = u[i] * u[i];
        normUSum += squared;
        html += `<div class="step-breakdown-item">`;
        html += `<span class="step-label">u${i + 1}²:</span>`;
        html += `<span class="step-value">${u[i].toFixed(4)}² = ${squared.toFixed(4)}</span>`;
        html += `</div>`;
    }
    html += '</div>';
    
    html += '<div class="step-result">||u|| = √(' + normUSum.toFixed(6) + ') = ' + normU.toFixed(6) + '</div>';
    html += '<div class="step-explanation">La norma (o magnitud) de un vector representa su "longitud" en el espacio. Es la distancia desde el origen hasta el punto que representa el vector.</div>';
    html += '<button class="btn-visualize" onclick="showVisualization(\'norm-u\')">';
    html += '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>';
    html += '<span>Ver Animación 3D</span>';
    html += '</button>';
    html += '</div>';

    // 3. Norma de v
    html += '<div class="calculation-step">';
    html += '<h3>3. Norma de v (||v||)</h3>';
    html += '<div class="step-formula">||v|| = √(v₁² + v₂² + ... + vₙ²)</div>';
    
    html += '<div class="step-breakdown">';
    let normVSum = 0;
    for (let i = 0; i < dim; i++) {
        const squared = v[i] * v[i];
        normVSum += squared;
        html += `<div class="step-breakdown-item">`;
        html += `<span class="step-label">v${i + 1}²:</span>`;
        html += `<span class="step-value">${v[i].toFixed(4)}² = ${squared.toFixed(4)}</span>`;
        html += `</div>`;
    }
    html += '</div>';
    
    html += '<div class="step-result">||v|| = √(' + normVSum.toFixed(6) + ') = ' + normV.toFixed(6) + '</div>';
    html += '<div class="step-explanation">Similar a la norma de u, representa la magnitud del vector v.</div>';
    html += '<button class="btn-visualize" onclick="showVisualization(\'norm-v\')">';
    html += '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>';
    html += '<span>Ver Animación 3D</span>';
    html += '</button>';
    html += '</div>';

    // 4. Similitud Coseno
    html += '<div class="calculation-step">';
    html += '<h3>4. Similitud Coseno (cos(θ))</h3>';
    html += '<div class="step-formula">cos(θ) = (u⋅v) / (||u|| × ||v||)</div>';
    
    html += '<div class="step-breakdown">';
    html += `<div class="step-breakdown-item">`;
    html += `<span class="step-label">u⋅v:</span>`;
    html += `<span class="step-value">${dotProduct.toFixed(6)}</span>`;
    html += `</div>`;
    html += `<div class="step-breakdown-item">`;
    html += `<span class="step-label">||u|| × ||v||:</span>`;
    html += `<span class="step-value">${normU.toFixed(6)} × ${normV.toFixed(6)} = ${(normU * normV).toFixed(6)}</span>`;
    html += `</div>`;
    html += '</div>';
    
    html += '<div class="step-result">cos(θ) = ' + dotProduct.toFixed(6) + ' / ' + (normU * normV).toFixed(6) + ' = ' + cosineSim.toFixed(6) + '</div>';
    
    let cosineExplanation = '';
    if (Math.abs(cosineSim - 1) < 0.01) {
        cosineExplanation = 'Los vectores son paralelos (misma dirección). En IA, esto indica que los embeddings representan conceptos idénticos o muy similares.';
    } else if (Math.abs(cosineSim) < 0.01) {
        cosineExplanation = 'Los vectores son ortogonales (perpendiculares). En IA, esto indica que los embeddings representan conceptos independientes o no relacionados.';
    } else if (Math.abs(cosineSim + 1) < 0.01) {
        cosineExplanation = 'Los vectores son opuestos (dirección contraria). En IA, esto puede indicar conceptos antónimos o contradictorios.';
    } else if (cosineSim > 0.7) {
        cosineExplanation = 'Alta similitud. Los vectores apuntan en direcciones muy similares. En embeddings de palabras, esto indica alta similitud semántica.';
    } else if (cosineSim < -0.7) {
        cosineExplanation = 'Baja similitud (negativa). Los vectores apuntan en direcciones opuestas. Puede indicar conceptos antónimos.';
    } else if (Math.abs(cosineSim) < 0.3) {
        cosineExplanation = 'Baja similitud. Los vectores son casi ortogonales, indicando conceptos independientes o poco relacionados.';
    } else {
        cosineExplanation = 'Similitud moderada. Los vectores tienen cierta relación pero no son ni paralelos ni ortogonales.';
    }
    
    html += '<div class="step-explanation">' + cosineExplanation + '</div>';
    html += '<button class="btn-visualize" onclick="showVisualization(\'cosine\')">';
    html += '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>';
    html += '<span>Ver Animación 3D</span>';
    html += '</button>';
    html += '</div>';

    // 5. Ortogonalidad
    html += '<div class="calculation-step">';
    html += '<h3>5. Ortogonalidad (u⊥v)</h3>';
    html += '<div class="step-formula">u⊥v si y solo si u⋅v = 0</div>';
    
    html += '<div class="step-breakdown">';
    html += `<div class="step-breakdown-item">`;
    html += `<span class="step-label">u⋅v:</span>`;
    html += `<span class="step-value">${dotProduct.toFixed(6)}</span>`;
    html += `</div>`;
    html += `<div class="step-breakdown-item">`;
    html += `<span class="step-label">|u⋅v| < ε (ε = 0.000001):</span>`;
    html += `<span class="step-value">${Math.abs(dotProduct).toFixed(6)} ${isOrtho ? '< ' : '≥ '} 0.000001</span>`;
    html += `</div>`;
    html += '</div>';
    
    html += '<div class="step-result">u⊥v: ' + (isOrtho ? 'Sí ✓' : 'No ✗') + '</div>';
    html += '<div class="step-explanation">';
    if (isOrtho) {
        html += 'Los vectores son ortogonales. Esto significa que son independientes y no hay correlación lineal entre ellos. En el contexto de embeddings, esto indica que representan aspectos completamente diferentes de los datos.';
    } else {
        html += 'Los vectores no son ortogonales. Hay cierta correlación lineal entre ellos, lo que indica que comparten alguna relación en el espacio vectorial.';
    }
    html += '</div>';
    html += '<button class="btn-visualize" onclick="showVisualization(\'orthogonal\')">';
    html += '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>';
    html += '<span>Ver Animación 3D</span>';
    html += '</button>';
    html += '</div>';

    elements.stepByStepCalculation.innerHTML = html;
}

/**
 * Muestra visualización 3D interactiva para un cálculo específico
 */
function showVisualization(calculationType) {
    // Detener animación anterior si existe
    if (window.animationInterval) {
        clearInterval(window.animationInterval);
        window.animationInterval = null;
    }
    
    // Cambiar a dimensión 3D si no está ya
    if (appState.dimension !== 3) {
        appState.dimension = 3;
        if (elements.dimensionSelect) {
            elements.dimensionSelect.value = '3';
        }
        resetVectorsToDefault();
        generateVectorInputs();
        generateExampleButtons();
    }
    
    // Asegurar que los vectores tengan 3 dimensiones
    while (appState.vectorU.length < 3) {
        appState.vectorU.push(0);
    }
    while (appState.vectorV.length < 3) {
        appState.vectorV.push(0);
    }
    appState.vectorU = appState.vectorU.slice(0, 3);
    appState.vectorV = appState.vectorV.slice(0, 3);
    
    // Actualizar visualización
    updateAll();
    
    // Hacer scroll a la visualización
    const visualizationPanel = document.querySelector('.visualization-panel');
    if (visualizationPanel) {
        visualizationPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Iniciar animación según el tipo de cálculo
    setTimeout(() => {
        if (window.visualization3D) {
            highlightCalculation(calculationType);
        }
    }, 500);
}

/**
 * Resalta visualmente un cálculo específico en la visualización 3D con animación
 */
function highlightCalculation(calculationType) {
    if (!window.visualization3D) return;
    const visualization3D = window.visualization3D;
    
    // Limpiar animaciones anteriores
    if (window.animationInterval) {
        clearInterval(window.animationInterval);
        window.animationInterval = null;
    }
    
    if (window.highlightObjects) {
        window.highlightObjects.forEach(obj => {
            if (obj && obj.parent) {
                visualization3D.scene.remove(obj);
            }
        });
    }
    window.highlightObjects = [];
    
    const u = appState.vectorU.slice(0, 3);
    const v = appState.vectorV.slice(0, 3);
    const scaledU = calculator.scale(u, appState.scale);
    
    // Iniciar animación según el tipo de cálculo
    switch (calculationType) {
        case 'dot-product':
            animateDotProduct(u, v, scaledU, visualization3D);
            break;
        case 'norm-u':
            animateNorm(u, scaledU, '#6366f1', 'u', visualization3D);
            break;
        case 'norm-v':
            animateNorm(v, v, '#ec4899', 'v', visualization3D);
            break;
        case 'cosine':
            animateCosineSimilarity(u, v, scaledU, visualization3D);
            break;
        case 'orthogonal':
            animateOrthogonality(u, v, scaledU, visualization3D);
            break;
    }
}

/**
 * Anima el cálculo del producto escalar paso a paso
 */
function animateDotProduct(u, v, scaledU, visualization3D) {
    const dotProduct = calculator.dotProduct(scaledU, v);
    let step = 0;
    const totalSteps = 3;
    
    // Componentes para mostrar
    const components = [];
    for (let i = 0; i < Math.min(scaledU.length, v.length); i++) {
        components.push({
            index: i,
            uVal: scaledU[i] || 0,
            vVal: v[i] || 0,
            product: (scaledU[i] || 0) * (v[i] || 0)
        });
    }
    
    const animate = () => {
        // Limpiar objetos anteriores
        if (window.highlightObjects) {
            window.highlightObjects.forEach(obj => {
                if (obj && obj.parent) {
                    visualization3D.scene.remove(obj);
                }
            });
        }
        window.highlightObjects = [];
        
        if (step === 0) {
            // Paso 1: Mostrar vectores con resaltado
            const uEnd = new THREE.Vector3(scaledU[0] || 0, scaledU[1] || 0, scaledU[2] || 0);
            const vEnd = new THREE.Vector3(v[0] || 0, v[1] || 0, v[2] || 0);
            
            // Esferas pulsantes en los extremos
            const pulse = Math.sin(Date.now() * 0.005) * 0.05 + 0.15;
            const uSphere = new THREE.Mesh(
                new THREE.SphereGeometry(pulse, 16, 16),
                new THREE.MeshPhongMaterial({ color: 0x6366f1, emissive: 0x6366f1, emissiveIntensity: 0.8 })
            );
            uSphere.position.copy(uEnd);
            visualization3D.scene.add(uSphere);
            window.highlightObjects.push(uSphere);
            
            const vSphere = new THREE.Mesh(
                new THREE.SphereGeometry(pulse, 16, 16),
                new THREE.MeshPhongMaterial({ color: 0xec4899, emissive: 0xec4899, emissiveIntensity: 0.8 })
            );
            vSphere.position.copy(vEnd);
            visualization3D.scene.add(vSphere);
            window.highlightObjects.push(vSphere);
            
            showCalculationText('Paso 1: Vectores u y v');
            
            if (Date.now() - (window.animationStartTime || 0) > 2000) {
                step = 1;
                window.animationStartTime = Date.now();
            }
        } else if (step === 1) {
            // Paso 2: Mostrar multiplicación componente por componente
            const currentComponent = components[Math.floor((Date.now() - window.animationStartTime) / 1000) % components.length];
            
            // Resaltar componente actual
            const axis = ['x', 'y', 'z'][currentComponent.index];
            const uPos = new THREE.Vector3();
            const vPos = new THREE.Vector3();
            uPos.setComponent(currentComponent.index, scaledU[currentComponent.index] || 0);
            vPos.setComponent(currentComponent.index, v[currentComponent.index] || 0);
            
            // Líneas desde el origen mostrando los componentes
            const uLine = new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), uPos]),
                new THREE.LineBasicMaterial({ color: 0x6366f1, linewidth: 4 })
            );
            visualization3D.scene.add(uLine);
            window.highlightObjects.push(uLine);
            
            const vLine = new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), vPos]),
                new THREE.LineBasicMaterial({ color: 0xec4899, linewidth: 4 })
            );
            visualization3D.scene.add(vLine);
            window.highlightObjects.push(vLine);
            
            showCalculationText(`u${currentComponent.index + 1} × v${currentComponent.index + 1} = ${currentComponent.uVal.toFixed(2)} × ${currentComponent.vVal.toFixed(2)} = ${currentComponent.product.toFixed(4)}`);
            
            if (Date.now() - window.animationStartTime > components.length * 2000) {
                step = 2;
                window.animationStartTime = Date.now();
            }
        } else if (step === 2) {
            // Paso 3: Mostrar suma y resultado final
            let sum = 0;
            const sumText = components.map((c, i) => {
                sum += c.product;
                return `${c.product.toFixed(4)}`;
            }).join(' + ');
            
            showCalculationText(`u⋅v = ${sumText} = ${dotProduct.toFixed(4)}`);
            
            // Mostrar todos los componentes resaltados
            components.forEach((comp, idx) => {
                const pos = new THREE.Vector3();
                pos.setComponent(comp.index, comp.product);
                const sphere = new THREE.Mesh(
                    new THREE.SphereGeometry(0.1, 16, 16),
                    new THREE.MeshPhongMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.6 })
                );
                sphere.position.copy(pos);
                visualization3D.scene.add(sphere);
                window.highlightObjects.push(sphere);
            });
            
            if (Date.now() - window.animationStartTime > 3000) {
                step = 0;
                window.animationStartTime = Date.now();
            }
        }
        
        visualization3D.render();
        window.animationInterval = setTimeout(animate, 50);
    };
    
    window.animationStartTime = Date.now();
    animate();
}

/**
 * Anima el cálculo de la norma de un vector
 */
function animateNorm(vector, actualVector, color, label, visualization3D) {
    const norm = calculator.norm(actualVector);
    const end = new THREE.Vector3(actualVector[0] || 0, actualVector[1] || 0, actualVector[2] || 0);
    let step = 0;
    
    // Calcular componentes al cuadrado
    const squaredComponents = [];
    let sum = 0;
    for (let i = 0; i < actualVector.length; i++) {
        const val = actualVector[i] || 0;
        const squared = val * val;
        sum += squared;
        squaredComponents.push({ index: i, value: val, squared: squared, sum: sum });
    }
    
    const animate = () => {
        if (window.highlightObjects) {
            window.highlightObjects.forEach(obj => {
                if (obj && obj.parent) {
                    visualization3D.scene.remove(obj);
                }
            });
        }
        window.highlightObjects = [];
        
        if (step === 0) {
            // Paso 1: Mostrar vector y sus componentes
            const time = (Date.now() - (window.animationStartTime || 0)) / 1000;
            const currentIdx = Math.floor(time) % squaredComponents.length;
            const current = squaredComponents[currentIdx];
            
            // Mostrar componente actual
            const compPos = new THREE.Vector3();
            compPos.setComponent(current.index, current.value);
            const compLine = new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), compPos]),
                new THREE.LineBasicMaterial({ color: parseInt(color.replace('#', '0x')), linewidth: 5 })
            );
            visualization3D.scene.add(compLine);
            window.highlightObjects.push(compLine);
            
            // Esfera pulsante en el componente
            const pulse = Math.sin(time * 5) * 0.05 + 0.12;
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(pulse, 16, 16),
                new THREE.MeshPhongMaterial({ color: parseInt(color.replace('#', '0x')), emissive: parseInt(color.replace('#', '0x')), emissiveIntensity: 0.8 })
            );
            sphere.position.copy(compPos);
            visualization3D.scene.add(sphere);
            window.highlightObjects.push(sphere);
            
            showCalculationText(`${label}${current.index + 1}² = ${current.value.toFixed(2)}² = ${current.squared.toFixed(4)}`);
            
            if (time > squaredComponents.length * 1.5) {
                step = 1;
                window.animationStartTime = Date.now();
            }
        } else if (step === 1) {
            // Paso 2: Mostrar suma de cuadrados
            const sumText = squaredComponents.map(c => c.squared.toFixed(4)).join(' + ');
            showCalculationText(`||${label}||² = ${sumText} = ${sum.toFixed(4)}`);
            
            // Mostrar todos los componentes
            squaredComponents.forEach(comp => {
                const pos = new THREE.Vector3();
                pos.setComponent(comp.index, comp.value);
                const sphere = new THREE.Mesh(
                    new THREE.SphereGeometry(0.08, 16, 16),
                    new THREE.MeshPhongMaterial({ color: parseInt(color.replace('#', '0x')), emissive: parseInt(color.replace('#', '0x')), emissiveIntensity: 0.5 })
                );
                sphere.position.copy(pos);
                visualization3D.scene.add(sphere);
                window.highlightObjects.push(sphere);
            });
            
            if (Date.now() - window.animationStartTime > 2000) {
                step = 2;
                window.animationStartTime = Date.now();
            }
        } else {
            // Paso 3: Mostrar raíz cuadrada y resultado final
            const progress = Math.min((Date.now() - window.animationStartTime) / 2000, 1);
            const animatedNorm = progress * norm;
            
            // Línea animada desde origen hasta el extremo
            const animatedEnd = end.clone().normalize().multiplyScalar(animatedNorm);
            const normLine = new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), animatedEnd]),
                new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 4 })
            );
            visualization3D.scene.add(normLine);
            window.highlightObjects.push(normLine);
            
            // Esfera en el extremo animado
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.15, 16, 16),
                new THREE.MeshPhongMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.8 })
            );
            sphere.position.copy(animatedEnd);
            visualization3D.scene.add(sphere);
            window.highlightObjects.push(sphere);
            
            showCalculationText(`||${label}|| = √${sum.toFixed(4)} = ${norm.toFixed(4)}`);
            
            if (progress >= 1) {
                step = 0;
                window.animationStartTime = Date.now();
            }
        }
        
        visualization3D.render();
        window.animationInterval = setTimeout(animate, 50);
    };
    
    window.animationStartTime = Date.now();
    animate();
}

/**
 * Anima el cálculo de la similitud coseno
 */
function animateCosineSimilarity(u, v, scaledU, visualization3D) {
    const angle = calculator.angle(scaledU, v);
    const cosineSim = calculator.cosineSimilarity(scaledU, v);
    const dotProduct = calculator.dotProduct(scaledU, v);
    const normU = calculator.norm(scaledU);
    const normV = calculator.norm(v);
    let step = 0;
    
    const animate = () => {
        if (window.highlightObjects) {
            window.highlightObjects.forEach(obj => {
                if (obj && obj.parent) {
                    visualization3D.scene.remove(obj);
                }
            });
        }
        window.highlightObjects = [];
        
        if (step === 0) {
            // Paso 1: Mostrar ángulo entre vectores
            const time = (Date.now() - (window.animationStartTime || 0)) / 1000;
            const progress = Math.min(time / 2, 1);
            
            const angleU = Math.atan2(scaledU[1] || 0, scaledU[0] || 0);
            const angleV = Math.atan2(v[1] || 0, v[0] || 0);
            const currentAngle = angleU + (angleV - angleU) * progress;
            
            // Arco animado
            const segments = 32;
            const radius = 0.8;
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            
            for (let i = 0; i <= segments * progress; i++) {
                const t = i / segments;
                const current = angleU + (angleV - angleU) * t;
                vertices.push(
                    radius * Math.cos(current),
                    radius * Math.sin(current),
                    0
                );
            }
            
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            const material = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 4 });
            const arc = new THREE.Line(geometry, material);
            visualization3D.scene.add(arc);
            window.highlightObjects.push(arc);
            
            const currentAngleDeg = (currentAngle * 180 / Math.PI).toFixed(1);
            showCalculationText(`Ángulo θ = ${currentAngleDeg}°`);
            
            if (progress >= 1) {
                step = 1;
                window.animationStartTime = Date.now();
            }
        } else if (step === 1) {
            // Paso 2: Mostrar producto escalar y normas
            showCalculationText(`u⋅v = ${dotProduct.toFixed(4)}, ||u|| = ${normU.toFixed(4)}, ||v|| = ${normV.toFixed(4)}`);
            
            // Resaltar vectores
            const uEnd = new THREE.Vector3(scaledU[0] || 0, scaledU[1] || 0, scaledU[2] || 0);
            const vEnd = new THREE.Vector3(v[0] || 0, v[1] || 0, v[2] || 0);
            
            const pulse = Math.sin(Date.now() * 0.005) * 0.05 + 0.12;
            const uSphere = new THREE.Mesh(
                new THREE.SphereGeometry(pulse, 16, 16),
                new THREE.MeshPhongMaterial({ color: 0x6366f1, emissive: 0x6366f1, emissiveIntensity: 0.8 })
            );
            uSphere.position.copy(uEnd);
            visualization3D.scene.add(uSphere);
            window.highlightObjects.push(uSphere);
            
            const vSphere = new THREE.Mesh(
                new THREE.SphereGeometry(pulse, 16, 16),
                new THREE.MeshPhongMaterial({ color: 0xec4899, emissive: 0xec4899, emissiveIntensity: 0.8 })
            );
            vSphere.position.copy(vEnd);
            visualization3D.scene.add(vSphere);
            window.highlightObjects.push(vSphere);
            
            if (Date.now() - window.animationStartTime > 2000) {
                step = 2;
                window.animationStartTime = Date.now();
            }
        } else {
            // Paso 3: Mostrar fórmula completa y resultado
            const angleU = Math.atan2(scaledU[1] || 0, scaledU[0] || 0);
            const angleV = Math.atan2(v[1] || 0, v[0] || 0);
            
            // Arco completo del ángulo
            const segments = 64;
            const radius = 0.8;
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            
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
            const material = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 4 });
            const arc = new THREE.Line(geometry, material);
            visualization3D.scene.add(arc);
            window.highlightObjects.push(arc);
            
            showCalculationText(`cos(θ) = ${dotProduct.toFixed(4)} / (${normU.toFixed(4)} × ${normV.toFixed(4)}) = ${cosineSim.toFixed(4)}`);
            
            if (Date.now() - window.animationStartTime > 3000) {
                step = 0;
                window.animationStartTime = Date.now();
            }
        }
        
        visualization3D.render();
        window.animationInterval = setTimeout(animate, 50);
    };
    
    window.animationStartTime = Date.now();
    animate();
}

/**
 * Anima el cálculo de ortogonalidad
 */
function animateOrthogonality(u, v, scaledU, visualization3D) {
    const dotProduct = calculator.dotProduct(scaledU, v);
    const isOrtho = calculator.isOrthogonal(scaledU, v);
    let step = 0;
    
    const animate = () => {
        if (window.highlightObjects) {
            window.highlightObjects.forEach(obj => {
                if (obj && obj.parent) {
                    visualization3D.scene.remove(obj);
                }
            });
        }
        window.highlightObjects = [];
        
        if (step === 0) {
            // Paso 1: Mostrar producto escalar
            const time = (Date.now() - (window.animationStartTime || 0)) / 1000;
            const progress = Math.min(time / 2, 1);
            
            // Mostrar cálculo del producto escalar animado
            const animatedDot = dotProduct * progress;
            showCalculationText(`u⋅v = ${animatedDot.toFixed(6)}`);
            
            // Resaltar vectores
            const uEnd = new THREE.Vector3(scaledU[0] || 0, scaledU[1] || 0, scaledU[2] || 0);
            const vEnd = new THREE.Vector3(v[0] || 0, v[1] || 0, v[2] || 0);
            
            const pulse = Math.sin(time * 5) * 0.05 + 0.12;
            const uSphere = new THREE.Mesh(
                new THREE.SphereGeometry(pulse, 16, 16),
                new THREE.MeshPhongMaterial({ color: 0x6366f1, emissive: 0x6366f1, emissiveIntensity: 0.8 })
            );
            uSphere.position.copy(uEnd);
            visualization3D.scene.add(uSphere);
            window.highlightObjects.push(uSphere);
            
            const vSphere = new THREE.Mesh(
                new THREE.SphereGeometry(pulse, 16, 16),
                new THREE.MeshPhongMaterial({ color: 0xec4899, emissive: 0xec4899, emissiveIntensity: 0.8 })
            );
            vSphere.position.copy(vEnd);
            visualization3D.scene.add(vSphere);
            window.highlightObjects.push(vSphere);
            
            if (progress >= 1) {
                step = 1;
                window.animationStartTime = Date.now();
            }
        } else {
            // Paso 2: Mostrar verificación de ortogonalidad
            const epsilon = 0.000001;
            const angleU = Math.atan2(scaledU[1] || 0, scaledU[0] || 0);
            const angleV = Math.atan2(v[1] || 0, v[0] || 0);
            
            if (isOrtho) {
                // Mostrar indicador de ángulo recto animado
                const time = (Date.now() - window.animationStartTime) / 1000;
                const progress = Math.min(time / 1.5, 1);
                const midAngle = angleU + (angleV - angleU) * 0.5;
                const radius = 0.6 * progress;
                
                // Indicador de ángulo recto
                const indicatorGeometry = new THREE.BufferGeometry();
                const indicatorVertices = [
                    radius * Math.cos(angleU), radius * Math.sin(angleU), 0,
                    radius * Math.cos(midAngle), radius * Math.sin(midAngle), 0,
                    radius * Math.cos(angleV), radius * Math.sin(angleV), 0
                ];
                indicatorGeometry.setAttribute('position', new THREE.Float32BufferAttribute(indicatorVertices, 3));
                const indicatorMaterial = new THREE.LineBasicMaterial({ 
                    color: 0x10b981, 
                    linewidth: 4 
                });
                const indicator = new THREE.LineLoop(indicatorGeometry, indicatorMaterial);
                visualization3D.scene.add(indicator);
                window.highlightObjects.push(indicator);
                
                // Arco de 90 grados
                const arcGeometry = new THREE.BufferGeometry();
                const arcVertices = [];
                for (let i = 0; i <= 16; i++) {
                    const t = i / 16;
                    const currentAngle = angleU + (angleV - angleU) * t;
                    arcVertices.push(
                        radius * Math.cos(currentAngle),
                        radius * Math.sin(currentAngle),
                        0
                    );
                }
                arcGeometry.setAttribute('position', new THREE.Float32BufferAttribute(arcVertices, 3));
                const arcMaterial = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 3 });
                const arc = new THREE.Line(arcGeometry, arcMaterial);
                visualization3D.scene.add(arc);
                window.highlightObjects.push(arc);
            }
            
            showCalculationText(`|u⋅v| = ${Math.abs(dotProduct).toFixed(6)} ${isOrtho ? '<' : '≥'} ${epsilon} → u⊥v: ${isOrtho ? 'Sí' : 'No'}`);
            
            if (Date.now() - window.animationStartTime > 3000) {
                step = 0;
                window.animationStartTime = Date.now();
            }
        }
        
        visualization3D.render();
        window.animationInterval = setTimeout(animate, 50);
    };
    
    window.animationStartTime = Date.now();
    animate();
}

/**
 * Muestra texto con el cálculo en la escena 3D
 */
function showCalculationText(text) {
    if (!window.visualization3D) return;
    const visualization3D = window.visualization3D;
    
    // Limpiar texto anterior
    if (window.calculationText) {
        visualization3D.scene.remove(window.calculationText);
    }
    
    // Crear canvas para el texto
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    
    context.fillStyle = 'rgba(15, 23, 42, 0.9)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = '#10b981';
    context.font = 'bold 32px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(2, 0.5, 1);
    sprite.position.set(0, 2, 0);
    
    visualization3D.scene.add(sprite);
    window.calculationText = sprite;
}

