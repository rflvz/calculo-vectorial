#!/usr/bin/env python3
"""
Script para extraer embeddings reales de modelos pre-entrenados
y generar un archivo JavaScript con ejemplos reales.

Este script utiliza Gensim para cargar modelos de Word2Vec o FastText
y extraer vectores reales para las palabras de los ejemplos.
"""

import json
import sys
try:
    import gensim
    
    import gensim.downloader as api
    import numpy as np
except ImportError:
    print("ERROR: Necesitas instalar gensim y numpy:")
    print("  pip install gensim numpy")
    sys.exit(1)

# Palabras para las que queremos obtener embeddings reales
# Organizadas por categorías similares a los ejemplos actuales
WORDS_TO_EXTRACT = {
    "2D": [
        {"u": "rey", "v": "reina"},
        {"u": "caliente", "v": "frío"},
        {"u": "día", "v": "noche"}
    ],
    "3D": [
        {"u": "perro", "v": "gato"},
        {"u": "rojo", "v": "azul"},
        {"u": "feliz", "v": "triste"},
        {"u": "manzana", "v": "pera"}
    ],
    "4D": [
        {"u": "coche", "v": "bicicleta"},
        {"u": "naranja", "v": "limón"},
        {"u": "fútbol", "v": "baloncesto"},
        {"u": "guitarra", "v": "piano"}
    ],
    "5D": [
        {"u": "pez", "v": "delfín"},
        {"u": "avión", "v": "helicóptero"},
        {"u": "café", "v": "té"}
    ],
    "6D": [
        {"u": "médico", "v": "enfermero"},
        {"u": "computadora", "v": "tablet"},
        {"u": "verano", "v": "invierno"}
    ],
    "7D": [
        {"u": "natación", "v": "surf"},
        {"u": "violín", "v": "viola"}
    ],
    "8D": [
        {"u": "águila", "v": "halcón"},
        {"u": "martillo", "v": "clavo"},
        {"u": "amor", "v": "paz"}
    ]
}

def load_model():
    """
    Intenta cargar un modelo pre-entrenado.
    Prioridad: modelos en español > Word2Vec inglés > GloVe
    """
    models_to_try = [
        "word2vec-google-news-300",  # Word2Vec inglés (300 dim)
        "glove-wiki-gigaword-300",   # GloVe inglés (300 dim)
        "fasttext-wiki-news-subwords-300"  # FastText inglés (300 dim)
    ]
    
    print("Buscando modelo pre-entrenado...")
    for model_name in models_to_try:
        try:
            print(f"Intentando cargar: {model_name}...")
            model = api.load(model_name)
            print(f"[OK] Modelo cargado: {model_name}")
            print(f"  Dimensiones: {model.vector_size}")
            print(f"  Vocabulario: {len(model.key_to_index)} palabras")
            return model
        except Exception as e:
            print(f"  [ERROR] Error: {e}")
            continue
    
    print("\nERROR: No se pudo cargar ningún modelo.")
    print("Asegúrate de tener conexión a internet para la primera descarga.")
    return None

def get_vector(model, word, target_dim):
    """
    Obtiene el vector de una palabra y lo reduce/expande a target_dim dimensiones.
    """
    word_lower = word.lower()
    
    # Intentar diferentes variaciones de la palabra
    variations = [
        word_lower,
        word_lower.capitalize(),
        word_lower.title()
    ]
    
    vector = None
    for var in variations:
        try:
            if var in model.key_to_index:
                vector = model[var]
                break
        except:
            continue
    
    if vector is None:
        print(f"  [WARN] Palabra '{word}' no encontrada en el modelo")
        return None
    
    # Reducir o expandir a la dimensión objetivo usando PCA simple o padding
    if len(vector) == target_dim:
        return vector.tolist()
    elif len(vector) > target_dim:
        # Reducir usando las primeras N dimensiones (simple truncamiento)
        # En producción, usarías PCA real
        return vector[:target_dim].tolist()
    else:
        # Expandir con ceros (no ideal, pero funcional)
        expanded = np.zeros(target_dim)
        expanded[:len(vector)] = vector
        return expanded.tolist()

def extract_embeddings(model):
    """
    Extrae embeddings reales para todas las palabras definidas.
    """
    results = {}
    
    for dim_key, word_pairs in WORDS_TO_EXTRACT.items():
        dim = int(dim_key.replace("D", ""))
        results[dim_key] = []
        
        print(f"\nProcesando {dim_key} ({dim} dimensiones)...")
        
        for idx, pair in enumerate(word_pairs):
            word_u = pair["u"]
            word_v = pair["v"]
            
            vector_u = get_vector(model, word_u, dim)
            vector_v = get_vector(model, word_v, dim)
            
            if vector_u is None or vector_v is None:
                print(f"  [SKIP] Saltando par: {word_u} - {word_v}")
                continue
            
            # Calcular similitud coseno para la descripción
            vec_u_np = np.array(vector_u)
            vec_v_np = np.array(vector_v)
            dot_product = np.dot(vec_u_np, vec_v_np)
            norm_u = np.linalg.norm(vec_u_np)
            norm_v = np.linalg.norm(vec_v_np)
            
            if norm_u > 0 and norm_v > 0:
                cosine_sim = dot_product / (norm_u * norm_v)
                if cosine_sim > 0.7:
                    desc = "Palabras muy similares (alta similitud)"
                elif cosine_sim > 0.3:
                    desc = "Palabras relacionadas (similitud moderada)"
                elif cosine_sim > -0.3:
                    desc = "Palabras diferentes (baja similitud)"
                else:
                    desc = "Palabras opuestas (similitud negativa)"
            else:
                desc = "Embeddings reales del modelo"
            
            # Generar nombre descriptivo
            name = f"{word_u.capitalize()} y {word_v.capitalize()}"
            
            example = {
                "name": name,
                "description": desc,
                "u": {
                    "label": word_u,
                    "vector": [round(x, 6) for x in vector_u]  # Redondear a 6 decimales
                },
                "v": {
                    "label": word_v,
                    "vector": [round(x, 6) for x in vector_v]
                }
            }
            
            results[dim_key].append(example)
            print(f"  [OK] {name}")
    
    return results

def generate_js_file(embeddings_data, output_file="embeddings-examples-real.js"):
    """
    Genera un archivo JavaScript con los embeddings extraídos.
    """
    js_content = """// Ejemplos de embeddings REALES extraídos de modelos pre-entrenados
// Estos vectores provienen de modelos como Word2Vec, GloVe o FastText
// Organizados por dimensión (2D-8D)
// 
// NOTA: Los vectores de alta dimensión (300D) se han reducido a dimensiones menores
// para facilitar la visualización. En producción, se recomienda usar las dimensiones completas.

const embeddingExamples = """
    
    js_content += json.dumps(embeddings_data, indent=4, ensure_ascii=False)
    js_content += ";\n"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"\n[OK] Archivo generado: {output_file}")

def main():
    print("=" * 60)
    print("Extractor de Embeddings Reales")
    print("=" * 60)
    
    # Cargar modelo
    model = load_model()
    if model is None:
        return
    
    # Extraer embeddings
    print("\n" + "=" * 60)
    print("Extrayendo embeddings...")
    print("=" * 60)
    embeddings_data = extract_embeddings(model)
    
    # Generar archivo JavaScript
    print("\n" + "=" * 60)
    print("Generando archivo JavaScript...")
    print("=" * 60)
    generate_js_file(embeddings_data)
    
    # Estadísticas
    total_examples = sum(len(examples) for examples in embeddings_data.values())
    print(f"\n[OK] Proceso completado:")
    print(f"  - Total de ejemplos extraidos: {total_examples}")
    print(f"  - Distribución por dimensión:")
    for dim, examples in embeddings_data.items():
        print(f"    {dim}: {len(examples)} ejemplos")
    
    print("\n" + "=" * 60)
    print("INSTRUCCIONES:")
    print("=" * 60)
    print("1. Revisa el archivo 'embeddings-examples-real.js' generado")
    print("2. Si estás satisfecho, puedes reemplazar 'embeddings-examples.js'")
    print("3. O mantén ambos archivos y cambia la referencia en index.html")
    print("=" * 60)

if __name__ == "__main__":
    main()

