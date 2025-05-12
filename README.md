# Xcode Translator

Herramienta para traducir automáticamente los strings faltantes en archivos de localización de Xcode (.xcstrings).

## Requisitos

- Node.js (versión 12 o superior)
- Conexión a Internet (opcional, para modo online)
- API key de DeepL (opcional, para usar el servicio DeepL)

## Instalación

1. Clona o descarga este repositorio
2. Instala las dependencias:

```bash
npm install
```

3. (Opcional) Crea un archivo `.env` para configurar API keys:

```
DEEPL_API_KEY=tu_api_key_aquí
```

## Uso

Ejecuta el script con:

```bash
node xcode-translator.js --input=ruta/a/tu/archivo.xcstrings
```

### Opciones disponibles

- `--input`, `-i`: Ruta al archivo de localización (obligatorio)
- `--output`, `-o`: Ruta para guardar el resultado (opcional, por defecto sobreescribe el original)
- `--mock`, `-m`: Usar traducción simulada sin conexión a Internet (opcional, por defecto false)
- `--service`, `-s`: Servicio de traducción a utilizar: 'libre' o 'deepl' (opcional, por defecto 'libre')
- `--languages`, `-l`: Idiomas de destino separados por comas (opcional, por defecto 'es,pt-PT')
- `--verbose`, `-v`: Mostrar información detallada (opcional, por defecto false)
- `--help`: Muestra la ayuda

### Ejemplos

```bash
# Básico - Traducir un archivo al español y portugués usando LibreTranslate
node xcode-translator.js --input=Localizable.xcstrings

# Usar DeepL como servicio de traducción (requiere API key en archivo .env)
node xcode-translator.js --input=Localizable.xcstrings --service=deepl

# Traducir solo al francés y alemán
node xcode-translator.js --input=Localizable.xcstrings --languages=fr,de

# Usar traducción simulada (offline) para pruebas
node xcode-translator.js --input=Localizable.xcstrings --mock

# Mostrar información detallada durante la traducción
node xcode-translator.js --input=Localizable.xcstrings --verbose

# Guardar el resultado en un nuevo archivo
node xcode-translator.js --input=original.xcstrings --output=traducido.xcstrings
```

## Servicios de traducción disponibles

### LibreTranslate (predeterminado)
- API gratuita sin registro
- No requiere API key
- Limitaciones de uso y menor precisión en algunas traducciones
- Respaldo automático a servidores alternativos si el principal falla

### DeepL
- Mejor calidad de traducciones
- Requiere registro y API key
- Tiene un plan gratuito con límite de caracteres
- Para usar DeepL:
  1. Regístrate en [DeepL API](https://www.deepl.com/pro-api)
  2. Obtén una API key gratuita
  3. Agrégala a tu archivo `.env`
  4. Ejecuta el script con `--service=deepl`

### Modo Simulado (--mock)
- No requiere conexión a Internet
- Usa un diccionario predefinido de traducciones comunes
- Útil para desarrollo y pruebas rápidas
- Para textos no encontrados en el diccionario, mantiene el texto original

## Idiomas soportados

Por defecto, el script traduce al español (es) y portugués (pt-PT), pero puedes especificar otros idiomas con la opción `--languages`.

Códigos de idioma compatibles con LibreTranslate:
- es (Español)
- pt (Portugués)
- en (Inglés)
- fr (Francés)
- de (Alemán)
- it (Italiano)
- ru (Ruso)
- zh (Chino)
- ja (Japonés)
- y más...

Códigos de idioma compatibles con DeepL:
- ES (Español)
- PT-PT (Portugués)
- EN (Inglés)
- FR (Francés)
- DE (Alemán)
- IT (Italiano)
- RU (Ruso)
- ZH (Chino)
- JA (Japonés)
- y más...

## Limitaciones y consideraciones

- Las traducciones automáticas pueden no ser perfectas y requerir revisión manual.
- Los servicios gratuitos tienen límites de uso y pueden estar caídos ocasionalmente.
- Se recomienda revisar manualmente las traducciones antes de publicar tu aplicación.
- Para archivos muy grandes, usa la opción `--verbose` para ver el progreso detallado.

## Contribuciones

Las contribuciones son bienvenidas. Si encuentras un problema o tienes una mejora, por favor crea un issue o un pull request en el repositorio.

## Licencia

MIT
# Xcode Translator

Herramienta para traducir automáticamente los strings faltantes en archivos de localización de Xcode (.xcstrings).

## Requisitos

- Node.js (versión 12 o superior)
- Conexión a Internet (opcional, para modo online)
- API key de DeepL (opcional, para usar el servicio DeepL)

## Instalación

1. Clona o descarga este repositorio
2. Instala las dependencias:

```bash
npm install
```

3. (Opcional) Crea un archivo `.env` para configurar API keys:

```
DEEPL_API_KEY=tu_api_key_aquí
```

## Uso

Ejecuta el script con:

```bash
node xcode-translator.js --input=ruta/a/tu/archivo.xcstrings
```

### Opciones disponibles

- `--input`, `-i`: Ruta al archivo de localización (obligatorio)
- `--output`, `-o`: Ruta para guardar el resultado (opcional, por defecto sobreescribe el original)
- `--mock`, `-m`: Usar traducción simulada sin conexión a Internet (opcional, por defecto false)
- `--service`, `-s`: Servicio de traducción a utilizar: 'libre' o 'deepl' (opcional, por defecto 'libre')
- `--languages`, `-l`: Idiomas de destino separados por comas (opcional, por defecto 'es,pt-PT')
- `--verbose`, `-v`: Mostrar información detallada (opcional, por defecto false)
- `--help`: Muestra la ayuda

### Ejemplos

```bash
# Básico - Traducir un archivo al español y portugués usando LibreTranslate
node xcode-translator.js --input=Localizable.xcstrings

# Usar DeepL como servicio de traducción (requiere API key en archivo .env)
node xcode-translator.js --input=Localizable.xcstrings --service=deepl

# Traducir solo# Xcode Translator

Herramienta para traducir automáticamente los strings faltantes en archivos de localización de Xcode (.xcstrings).

## Requisitos

- Node.js (versión 12 o superior)
- Conexión a Internet (opcional, para modo online)

## Instalación

1. Clona o descarga este repositorio
2. Instala las dependencias:

```bash
npm install
```

## Uso

Ejecuta el script con:

```bash
node xcode-translator.js --input=ruta/a/tu/archivo.xcstrings
```

### Opciones disponibles

- `--input`, `-i`: Ruta al archivo de localización (obligatorio)
- `--output`, `-o`: Ruta para guardar el resultado (opcional, por defecto sobreescribe el original)
- `--mock`, `-m`: Usar traducción simulada sin conexión a Internet (opcional, por defecto false)
- `--help`: Muestra la ayuda

### Ejemplos

```bash
# Traducir un archivo y sobreescribirlo usando LibreTranslate (online)
node xcode-translator.js --input=Localizable.xcstrings

# Traducir un archivo y guardar el resultado en otro archivo
node xcode-translator.js --input=Localizable.xcstrings --output=Localizable_traducido.xcstrings

# Usar traducción simulada (offline) para pruebas
node xcode-translator.js --input=Localizable.xcstrings --mock
```

## Modos de traducción

### Modo Online (predeterminado)
Utiliza la API gratuita de LibreTranslate para realizar las traducciones. Si ocurre algún error o el servicio no está disponible, automáticamente usa un modo de traducción simulada como respaldo.

### Modo Simulado (--mock)
Utiliza un diccionario de traducciones predefinidas para palabras comunes. Este modo es útil para:
- Pruebas sin conexión a Internet
- Desarrollo y depuración