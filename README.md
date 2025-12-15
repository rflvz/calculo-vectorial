# Aplicación Interactiva: Producto Escalar, Similitud Coseno y Ortogonalidad

Aplicación web interactiva y parametrizable para el aprendizaje del Producto Escalar, Similitud Coseno y Ortogonalidad en el contexto de la Ingeniería en IA.

## Características

### Parámetros de Entrada
- **Dimensión (N)**: Selección entre 2D y 3D con visualización geométrica correspondiente
- **Edición de Vectores**: Inputs numéricos directos para los componentes de los vectores u y v
- **Factor de Escalado (α)**: Slider interactivo para escalar dinámicamente el vector u

### Cálculos en Tiempo Real
- **Producto Escalar (u⋅v)**: Cálculo instantáneo del producto punto
- **Normas (Magnitudes)**: ||u|| y ||v||
- **Similitud Coseno (cos(θ))**: Con interpretación visual de valores (1, 0, -1)
- **Ortogonalidad (u⊥v)**: Indicador booleano con detección automática

### Visualización Dinámica
- **Visualización 2D (N=2)**: Canvas con ejes, grid, vectores como flechas, ángulo θ, y proyección ortogonal
- **Visualización 3D (N=3)**: Three.js con escena 3D interactiva, vectores 3D, y controles de cámara
- **Slider de Escalado**: Demuestra que cos(θ) es invariante a escala mientras u⋅v y ||u|| cambian
- **Resaltado de Ortogonalidad**: Cuando cos(θ) ≈ 0, se resalta la proyección ortogonal con explicación

### Contexto de IA
- **Sistemas de Recomendación**: Interpretación de cos(θ) para encontrar usuarios con gustos similares
- **Procesamiento de Lenguaje Natural**: Interpretación de cos(θ) para medir similitud semántica entre embeddings

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Diseño moderno y responsive con variables CSS y animaciones
- **JavaScript (ES6+)**: Lógica de cálculo y manipulación del DOM
- **Canvas API**: Visualización 2D
- **Three.js**: Visualización 3D (desde CDN)

## Instalación y Uso

1. Clonar o descargar el repositorio
   ```bash
   git clone https://github.com/tu-usuario/calculo-vectorial.git
   cd calculo-vectorial
   ```

2. Abrir `index.html` en un navegador web moderno
3. No se requiere servidor local, pero se recomienda usar uno para evitar problemas de CORS

### Opción con servidor local (recomendado):

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (http-server)
npx http-server

# Con PHP
php -S localhost:8000
```

Luego abrir `http://localhost:8000` en el navegador.

## Estructura del Proyecto

```
calculo-vectorial/
├── index.html          # Estructura principal de la aplicación
├── styles.css          # Estilos y diseño responsive
├── app.js              # Lógica principal y cálculos vectoriales
├── visualization.js    # Módulo de visualización 2D/3D
└── README.md           # Este archivo
```

## Funcionalidades Principales

### 1. Cálculos Vectoriales
- Producto escalar: `u⋅v = Σ(uᵢ·vᵢ)`
- Norma: `||u|| = √(Σuᵢ²)`
- Similitud coseno: `cos(θ) = (u⋅v)/(||u||·||v||)`
- Proyección ortogonal: `proy_v(u) = ((u⋅v)/(||v||²))·v`

### 2. Visualización Interactiva
- **2D**: Canvas con grid, ejes, vectores, ángulo y proyección
- **3D**: Escena Three.js con rotación, zoom y pan

### 3. Demostraciones Educativas
- **Invariante de Similitud Coseno**: El slider demuestra que cos(θ) no cambia con escalado
- **Ortogonalidad**: Visualización automática de proyección cuando cos(θ) ≈ 0
- **Interpretación de Valores**: Colores y mensajes para valores especiales (1, 0, -1)

## Navegadores Compatibles

- Chrome/Edge (recomendado)
- Firefox
- Safari
- Opera

## Notas Técnicas

- La aplicación funciona completamente en el cliente (sin backend)
- Three.js se carga desde CDN
- OrbitControls es opcional; si no está disponible, se usan controles básicos
- Validación de inputs para prevenir errores
- Manejo de casos especiales (vectores cero, división por cero)

## Subir a GitHub

Si deseas subir este proyecto a GitHub:

1. **Opción A - Script automático (Windows):**
   - Ejecuta `subir-github.bat`
   - Sigue las instrucciones en pantalla

2. **Opción B - Manual:**
   ```bash
   # Crear repositorio en GitHub primero (sin inicializar)
   git remote add origin https://github.com/tu-usuario/tu-repo.git
   git branch -M main
   git push -u origin main
   ```

## Licencia

Este proyecto es de código abierto y está disponible para uso educativo.

## Autor

Desarrollado para el aprendizaje de conceptos de cálculo vectorial en el contexto de Ingeniería en IA.

