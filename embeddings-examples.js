// Ejemplos de embeddings de palabras para práctica y aprendizaje
// Organizados por dimensión (2D-8D)

const embeddingExamples = {
    "2D": [
        {
            name: "Rey y Reina",
            description: "Palabras relacionadas semánticamente (alta similitud)",
            u: { label: "rey", vector: [1.0, 0.5] },
            v: { label: "reina", vector: [0.8, 0.6] }
        },
        {
            name: "Caliente y Frío",
            description: "Antónimos opuestos (similitud negativa)",
            u: { label: "caliente", vector: [1.0, 0.0] },
            v: { label: "frío", vector: [-1.0, 0.0] }
        },
        {
            name: "Día y Noche",
            description: "Conceptos opuestos pero relacionados",
            u: { label: "día", vector: [0.9, 0.3] },
            v: { label: "noche", vector: [-0.7, 0.4] }
        }
    ],
    "3D": [
        {
            name: "Animales Domésticos",
            description: "Perro y Gato - animales similares",
            u: { label: "perro", vector: [0.8, 0.6, 0.4] },
            v: { label: "gato", vector: [0.7, 0.5, 0.5] }
        },
        {
            name: "Colores Primarios",
            description: "Rojo y Azul - colores diferentes",
            u: { label: "rojo", vector: [1.0, 0.0, 0.0] },
            v: { label: "azul", vector: [0.0, 0.0, 1.0] }
        },
        {
            name: "Emociones Opuestas",
            description: "Feliz y Triste - emociones contrarias",
            u: { label: "feliz", vector: [0.8, 0.6, 0.7] },
            v: { label: "triste", vector: [-0.6, -0.5, -0.4] }
        },
        {
            name: "Frutas Similares",
            description: "Manzana y Pera - frutas relacionadas",
            u: { label: "manzana", vector: [0.7, 0.5, 0.6] },
            v: { label: "pera", vector: [0.6, 0.4, 0.5] }
        }
    ],
    "4D": [
        {
            name: "Transporte Terrestre",
            description: "Coche y Bicicleta - medios de transporte",
            u: { label: "coche", vector: [0.8, 0.3, 0.2, 0.1] },
            v: { label: "bicicleta", vector: [0.2, 0.7, 0.6, 0.4] }
        },
        {
            name: "Frutas Cítricas",
            description: "Naranja y Limón - frutas similares",
            u: { label: "naranja", vector: [0.6, 0.7, 0.5, 0.4] },
            v: { label: "limón", vector: [0.5, 0.6, 0.4, 0.3] }
        },
        {
            name: "Deportes de Equipo",
            description: "Fútbol y Baloncesto - deportes diferentes",
            u: { label: "fútbol", vector: [0.8, 0.2, 0.3, 0.1] },
            v: { label: "baloncesto", vector: [0.2, 0.8, 0.1, 0.3] }
        },
        {
            name: "Instrumentos Musicales",
            description: "Guitarra y Piano - instrumentos diferentes",
            u: { label: "guitarra", vector: [0.7, 0.3, 0.5, 0.2] },
            v: { label: "piano", vector: [0.3, 0.7, 0.2, 0.6] }
        }
    ],
    "5D": [
        {
            name: "Animales Acuáticos",
            description: "Pez y Delfín - animales marinos similares",
            u: { label: "pez", vector: [0.5, 0.4, 0.6, 0.3, 0.2] },
            v: { label: "delfín", vector: [0.6, 0.5, 0.7, 0.4, 0.3] }
        },
        {
            name: "Vehículos Aéreos",
            description: "Avión y Helicóptero - transporte aéreo",
            u: { label: "avión", vector: [0.8, 0.2, 0.1, 0.3, 0.4] },
            v: { label: "helicóptero", vector: [0.3, 0.7, 0.5, 0.2, 0.1] }
        },
        {
            name: "Bebidas Calientes",
            description: "Café y Té - bebidas similares",
            u: { label: "café", vector: [0.7, 0.5, 0.4, 0.3, 0.6] },
            v: { label: "té", vector: [0.6, 0.4, 0.3, 0.2, 0.5] }
        },
        {
            name: "Ortogonalidad",
            description: "Vectores casi ortogonales (coseno ≈ 0)",
            u: { label: "palabra1", vector: [1.0, 0.0, 0.0, 0.0, 0.0] },
            v: { label: "palabra2", vector: [0.0, 1.0, 0.0, 0.0, 0.0] }
        }
    ],
    "6D": [
        {
            name: "Profesiones Relacionadas",
            description: "Médico y Enfermero - profesiones similares",
            u: { label: "médico", vector: [0.8, 0.6, 0.5, 0.4, 0.3, 0.2] },
            v: { label: "enfermero", vector: [0.7, 0.5, 0.4, 0.3, 0.2, 0.1] }
        },
        {
            name: "Tecnología",
            description: "Computadora y Tablet - dispositivos relacionados",
            u: { label: "computadora", vector: [0.7, 0.5, 0.6, 0.4, 0.3, 0.2] },
            v: { label: "tablet", vector: [0.6, 0.4, 0.5, 0.3, 0.2, 0.1] }
        },
        {
            name: "Estaciones del Año",
            description: "Verano e Invierno - estaciones opuestas",
            u: { label: "verano", vector: [0.8, 0.6, 0.4, 0.2, 0.1, 0.0] },
            v: { label: "invierno", vector: [-0.6, -0.4, -0.2, 0.1, 0.2, 0.3] }
        }
    ],
    "7D": [
        {
            name: "Deportes Acuáticos",
            description: "Natación y Surf - deportes acuáticos",
            u: { label: "natación", vector: [0.6, 0.5, 0.7, 0.4, 0.3, 0.2, 0.1] },
            v: { label: "surf", vector: [0.5, 0.4, 0.6, 0.3, 0.2, 0.1, 0.0] }
        },
        {
            name: "Instrumentos de Cuerda",
            description: "Violín y Viola - instrumentos similares",
            u: { label: "violín", vector: [0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1] },
            v: { label: "viola", vector: [0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0] }
        },
        {
            name: "Alta Similitud",
            description: "Vectores muy similares (coseno alto)",
            u: { label: "palabra1", vector: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3] },
            v: { label: "palabra2", vector: [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2] }
        }
    ],
    "8D": [
        {
            name: "Aves Voladoras",
            description: "Águila y Halcón - aves rapaces similares",
            u: { label: "águila", vector: [0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0] },
            v: { label: "halcón", vector: [0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0, 0.0] }
        },
        {
            name: "Herramientas de Construcción",
            description: "Martillo y Clavo - herramientas relacionadas",
            u: { label: "martillo", vector: [0.8, 0.3, 0.2, 0.1, 0.4, 0.5, 0.6, 0.7] },
            v: { label: "clavo", vector: [0.3, 0.8, 0.1, 0.2, 0.5, 0.4, 0.3, 0.2] }
        },
        {
            name: "Conceptos Abstractos",
            description: "Amor y Paz - conceptos relacionados",
            u: { label: "amor", vector: [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1] },
            v: { label: "paz", vector: [0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0] }
        },
        {
            name: "Ortogonalidad Completa",
            description: "Vectores completamente ortogonales",
            u: { label: "vector1", vector: [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0] },
            v: { label: "vector2", vector: [0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0] }
        }
    ]
};

