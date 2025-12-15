// Ejemplos de embeddings REALES extraídos de modelos pre-entrenados
// Estos vectores provienen de modelos como Word2Vec, GloVe o FastText
// Organizados por dimensión (2D-8D)
// 
// NOTA: Los vectores de alta dimensión (300D) se han reducido a dimensiones menores
// para facilitar la visualización. En producción, se recomienda usar las dimensiones completas.

const embeddingExamples = {
    "2D": [
        {
            "name": "Rey y Reina",
            "description": "Palabras muy similares (alta similitud)",
            "u": {
                "label": "rey",
                "vector": [
                    -0.237305,
                    0.125977
                ]
            },
            "v": {
                "label": "reina",
                "vector": [
                    -0.140625,
                    0.009277
                ]
            }
        },
        {
            "name": "Día y Noche",
            "description": "Palabras relacionadas (similitud moderada)",
            "u": {
                "label": "día",
                "vector": [
                    -0.099121,
                    -0.034424
                ]
            },
            "v": {
                "label": "noche",
                "vector": [
                    -0.049316,
                    0.044922
                ]
            }
        }
    ],
    "3D": [
        {
            "name": "Perro y Gato",
            "description": "Palabras diferentes (baja similitud)",
            "u": {
                "label": "perro",
                "vector": [
                    -0.138672,
                    -0.116699,
                    0.073242
                ]
            },
            "v": {
                "label": "gato",
                "vector": [
                    0.0354,
                    0.014709,
                    0.056641
                ]
            }
        },
        {
            "name": "Rojo y Azul",
            "description": "Palabras muy similares (alta similitud)",
            "u": {
                "label": "rojo",
                "vector": [
                    -0.129883,
                    -0.181641,
                    0.316406
                ]
            },
            "v": {
                "label": "azul",
                "vector": [
                    -0.07666,
                    -0.071777,
                    0.149414
                ]
            }
        },
        {
            "name": "Feliz y Triste",
            "description": "Palabras muy similares (alta similitud)",
            "u": {
                "label": "feliz",
                "vector": [
                    -0.048584,
                    -0.060059,
                    0.19043
                ]
            },
            "v": {
                "label": "triste",
                "vector": [
                    0.022827,
                    0.037354,
                    0.111816
                ]
            }
        },
        {
            "name": "Manzana y Pera",
            "description": "Palabras relacionadas (similitud moderada)",
            "u": {
                "label": "manzana",
                "vector": [
                    0.028442,
                    -0.07666,
                    0.039307
                ]
            },
            "v": {
                "label": "pera",
                "vector": [
                    -0.026001,
                    -0.015625,
                    0.146484
                ]
            }
        }
    ],
    "4D": [
        {
            "name": "Coche y Bicicleta",
            "description": "Palabras diferentes (baja similitud)",
            "u": {
                "label": "coche",
                "vector": [
                    -0.05835,
                    -0.061279,
                    0.025879,
                    0.105469
                ]
            },
            "v": {
                "label": "bicicleta",
                "vector": [
                    -0.029663,
                    -0.099609,
                    0.002914,
                    -0.04248
                ]
            }
        },
        {
            "name": "Naranja y Limón",
            "description": "Palabras muy similares (alta similitud)",
            "u": {
                "label": "naranja",
                "vector": [
                    -0.03833,
                    -0.078125,
                    0.095703,
                    0.092773
                ]
            },
            "v": {
                "label": "limón",
                "vector": [
                    0.11084,
                    -0.192383,
                    0.285156,
                    0.091309
                ]
            }
        },
        {
            "name": "Fútbol y Baloncesto",
            "description": "Palabras diferentes (baja similitud)",
            "u": {
                "label": "fútbol",
                "vector": [
                    -0.028198,
                    -0.094727,
                    0.404297,
                    0.326172
                ]
            },
            "v": {
                "label": "baloncesto",
                "vector": [
                    -0.017822,
                    -0.036865,
                    0.115723,
                    -0.121582
                ]
            }
        },
        {
            "name": "Guitarra y Piano",
            "description": "Palabras diferentes (baja similitud)",
            "u": {
                "label": "guitarra",
                "vector": [
                    -0.028198,
                    -0.008911,
                    -0.046143,
                    0.071777
                ]
            },
            "v": {
                "label": "piano",
                "vector": [
                    0.15918,
                    -0.175781,
                    -0.104492,
                    -0.066406
                ]
            }
        }
    ],
    "5D": [
        {
            "name": "Pez y Delfín",
            "description": "Palabras diferentes (baja similitud)",
            "u": {
                "label": "pez",
                "vector": [
                    -0.139648,
                    0.032959,
                    0.039795,
                    0.316406,
                    -0.044189
                ]
            },
            "v": {
                "label": "delfín",
                "vector": [
                    -0.12207,
                    -0.04126,
                    0.246094,
                    -0.040771,
                    0.07373
                ]
            }
        },
        {
            "name": "Café y Té",
            "description": "Palabras muy similares (alta similitud)",
            "u": {
                "label": "café",
                "vector": [
                    -0.087402,
                    -0.164062,
                    -0.089355,
                    0.349609,
                    0.041992
                ]
            },
            "v": {
                "label": "té",
                "vector": [
                    -0.087402,
                    -0.013062,
                    -0.000534,
                    0.145508,
                    0.011169
                ]
            }
        }
    ],
    "6D": [
        {
            "name": "Verano y Invierno",
            "description": "Palabras diferentes (baja similitud)",
            "u": {
                "label": "verano",
                "vector": [
                    -0.037354,
                    0.048828,
                    0.086426,
                    0.116211,
                    -0.032227,
                    0.033203
                ]
            },
            "v": {
                "label": "invierno",
                "vector": [
                    -0.014587,
                    -0.059326,
                    0.037109,
                    -0.021729,
                    0.139648,
                    -0.030762
                ]
            }
        }
    ],
    "7D": [],
    "8D": [
        {
            "name": "Martillo y Clavo",
            "description": "Palabras opuestas (similitud negativa)",
            "u": {
                "label": "martillo",
                "vector": [
                    0.069824,
                    0.120605,
                    -0.063477,
                    -0.071289,
                    -0.006927,
                    -0.045654,
                    0.061035,
                    0.15625
                ]
            },
            "v": {
                "label": "clavo",
                "vector": [
                    -0.084473,
                    -0.019043,
                    0.167969,
                    0.129883,
                    -0.002914,
                    -0.076172,
                    -0.192383,
                    -0.107422
                ]
            }
        },
        {
            "name": "Amor y Paz",
            "description": "Palabras muy similares (alta similitud)",
            "u": {
                "label": "amor",
                "vector": [
                    0.003113,
                    -0.174805,
                    0.072266,
                    0.283203,
                    -0.012512,
                    -0.017212,
                    0.072266,
                    -0.004425
                ]
            },
            "v": {
                "label": "paz",
                "vector": [
                    0.013855,
                    -0.018799,
                    0.138672,
                    0.238281,
                    0.083008,
                    0.032471,
                    0.049805,
                    -0.063965
                ]
            }
        }
    ]
};
