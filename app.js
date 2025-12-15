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
}

// Instancia global del calculador
const calculator = new VectorCalculator();

// Estado de la aplicación
const appState = {
    dimension: 3,
    vectorU: [2, 1, 0.5],
    vectorV: [0, 1.5, 2],
    scale: 1.0
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
    visualizationInfo: null
};

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    initializeControls();
    generateVectorInputs();
    updateAll();
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
}

/**
 * Inicializa los event listeners de los controles
 */
function initializeControls() {
    // Selector de dimensión
    elements.dimensionSelect.addEventListener('change', (e) => {
        let dimension = parseInt(e.target.value);
        if (dimension !== 2 && dimension !== 3) {
            dimension = 2;
            e.target.value = '2';
        }
        appState.dimension = dimension;
        resetVectorsToDefault();
        generateVectorInputs();
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
        resetVectorsToDefault();
        appState.scale = 1.0;
        elements.scaleSlider.value = 1.0;
        elements.scaleValue.textContent = '1.0';
        generateVectorInputs();
        updateAll();
    });
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
    if (appState.dimension === 2) {
        appState.vectorU = [1, 0];
        appState.vectorV = [0, 1];
    } else {
        // Valores predefinidos para 3D que se visualizan bien y no son paralelos
        appState.vectorU = [2, 1, 0.5];
        appState.vectorV = [0, 1.5, 2];
    }
}

/**
 * Actualiza todos los cálculos y visualizaciones
 */
function updateAll() {
    try {
        // Validar dimensión
        if (appState.dimension !== 2 && appState.dimension !== 3) {
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
    
    elements.visualizationInfo.innerHTML = info;
}

