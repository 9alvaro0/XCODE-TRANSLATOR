const fs = require("fs").promises;
const axios = require("axios");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

// Configurar argumentos de línea de comandos
const argv = yargs(hideBin(process.argv))
    .option("input", {
        alias: "i",
        describe: "Ruta al archivo de localización",
        type: "string",
        demandOption: true,
    })
    .option("output", {
        alias: "o",
        describe: "Ruta para guardar el resultado (por defecto sobreescribe el original)",
        type: "string",
    })
    .option("languages", {
        alias: "l",
        describe: "Idiomas a traducir, separados por comas (por defecto: en,pt-PT)",
        type: "string",
        default: "en,pt-PT",
    })
    .option("source-lang", {
        alias: "s",
        describe: "Idioma de origen para las traducciones (por defecto: es)",
        type: "string",
        default: "es",
    })
    .option("batch-size", {
        alias: "b",
        describe: "Número de traducciones a procesar en paralelo",
        type: "number",
        default: 10,
    })
    .option("all", {
        alias: "a",
        describe: "Traducir todas las cadenas aunque ya tengan valor",
        type: "boolean",
        default: true,
    })
    .help().argv;

/**
 * Traduce un texto usando la API
 */
async function translateText(text, sourceLang, targetLang) {
    // Conservar formatos especiales (variables)
    const placeholders = [];
    let modifiedText = text;

    // Identificar y reemplazar placeholders como %@, %lld, etc.
    const placeholderRegex = /(%[@lld]\d*|\+%[@lld])/g;
    let match;
    let index = 0;

    while ((match = placeholderRegex.exec(text)) !== null) {
        const placeholder = match[0];
        const token = `__PH${index}__`;
        modifiedText = modifiedText.replace(placeholder, token);
        placeholders.push({ token, value: placeholder });
        index++;
    }

    try {
        // Usar MyMemory API (no requiere API key)
        const url = `https://api.mymemory.translated.net/get`;
        const params = {
            q: modifiedText,
            langpair: `${sourceLang}|${targetLang.split("-")[0]}`, // Usar solo 'pt' en lugar de 'pt-PT'
        };

        const response = await axios.get(url, { params, timeout: 8000 });

        if (response.data && response.data.responseData && response.data.responseData.translatedText) {
            let translatedText = response.data.responseData.translatedText;

            // Restaurar los placeholders
            placeholders.forEach((ph) => {
                translatedText = translatedText.replace(ph.token, ph.value);
            });

            return translatedText;
        }
        throw new Error("No se recibió una respuesta válida");
    } catch (error) {
        console.error(`Error al traducir '${text}' de ${sourceLang} a ${targetLang}: ${error.message}`);
        // En caso de error, devolver el texto original pero mantener los placeholders
        return text;
    }
}

/**
 * Procesa un lote de traducciones en paralelo
 */
async function processBatch(batch) {
    return Promise.all(
        batch.map(async (item) => {
            const { key, originalText, sourceLang, targetLang, stringData } = item;
            try {
                // Si el texto original es un placeholder o está vacío, mantenerlo igual
                if (!originalText || originalText === "-" || /^(\+?%[@lld]|\d+)$/.test(originalText)) {
                    stringData.localizations[targetLang].stringUnit.value = originalText;
                    return { success: true, key, targetLang, translatedText: originalText, skipped: true };
                }

                const translatedText = await translateText(originalText, sourceLang, targetLang);
                if (translatedText) {
                    stringData.localizations[targetLang].stringUnit.value = translatedText;
                    return { success: true, key, targetLang, translatedText };
                }
            } catch (error) {
                console.error(`Error procesando [${key}]: ${error.message}`);
            }
            return { success: false, key, targetLang };
        })
    );
}

/**
 * Procesa un archivo de localización y traduce los strings
 */
async function processLocalizationFile(filePath, outputPath = null) {
    try {
        // Leer el archivo
        const fileContent = await fs.readFile(filePath, "utf-8");
        const data = JSON.parse(fileContent);

        const fileSourceLang = data.sourceLanguage || "en";
        const strings = data.strings || {};

        // Obtener idiomas para traducción
        const targetLanguages = argv.languages.split(",").map((lang) => lang.trim());
        const sourceLang = argv.sourceLang;

        console.log(`Idioma del archivo: ${fileSourceLang}`);
        console.log(`Idioma origen para traducción: ${sourceLang}`);
        console.log(`Idiomas destino: ${targetLanguages.join(", ")}`);
        console.log(`Total de strings en el archivo: ${Object.keys(strings).length}`);

        // Preparar las tareas de traducción
        const translationTasks = [];

        // Recorrer cada string
        for (const [key, stringData] of Object.entries(strings)) {
            if (!key) continue;

            // Si no tiene localizations, inicializarlo
            if (!stringData.localizations) {
                stringData.localizations = {};
            }

            // Obtener texto en el idioma de origen para la traducción (español)
            let originalText = "";

            // Primero buscar en el idioma de origen especificado (español)
            if (stringData.localizations?.[sourceLang]?.stringUnit?.value !== undefined) {
                originalText = stringData.localizations[sourceLang].stringUnit.value;
            }
            // Si no hay en español, usar el idioma base del archivo (suele ser inglés)
            else if (stringData.localizations?.[fileSourceLang]?.stringUnit?.value !== undefined) {
                originalText = stringData.localizations[fileSourceLang].stringUnit.value;
            }
            // Como último recurso, usar la clave
            else {
                originalText = key;
            }

            // Saltar si originalText está vacío o es solo un placeholder
            if (!originalText || originalText === "-" || /^(\+?%[@lld]|\d+)$/.test(originalText)) {
                continue;
            }

            // Para cada idioma destino
            for (const targetLang of targetLanguages) {
                // Saltar si el idioma destino es igual al origen
                if (targetLang === sourceLang) continue;

                // Si el idioma destino no existe
                if (!stringData.localizations[targetLang]) {
                    stringData.localizations[targetLang] = {
                        stringUnit: {
                            state: "translated",
                            value: "",
                        },
                    };
                }

                // Si ya tiene valor y no estamos forzando la traducción, saltar
                if (!argv.all && stringData.localizations[targetLang]?.stringUnit?.value) {
                    continue;
                }

                // Agregar a lista de tareas
                translationTasks.push({
                    key,
                    originalText,
                    sourceLang,
                    targetLang,
                    stringData,
                });
            }
        }

        console.log(`\nTotal a traducir: ${translationTasks.length} elementos`);
        console.log(`Procesando en lotes de ${argv.batchSize}\n`);

        // Crear una barra de progreso
        let completedTasks = 0;
        let skippedTasks = 0;
        const totalTasks = translationTasks.length;

        const updateProgress = () => {
            const percentage = Math.round((completedTasks / totalTasks) * 100);
            const bar = "#".repeat(Math.floor(percentage / 2)) + "-".repeat(50 - Math.floor(percentage / 2));
            process.stdout.write(
                `\rProgreso: [${bar}] ${percentage}% (${completedTasks}/${totalTasks}) | Saltados: ${skippedTasks}`
            );
        };

        // Mostrar progreso inicial
        if (totalTasks > 0) {
            updateProgress();
        } else {
            console.log("No hay elementos que requieran traducción.");
            return 0;
        }

        // Procesar en lotes
        const batchSize = argv.batchSize;
        for (let i = 0; i < translationTasks.length; i += batchSize) {
            const batch = translationTasks.slice(i, i + batchSize);
            const results = await processBatch(batch);

            // Actualizar contadores
            completedTasks += batch.length;
            const skipped = results.filter((r) => r.success && r.skipped).length;
            skippedTasks += skipped;

            // Actualizar progreso
            updateProgress();
        }

        // Salto de línea final para la barra de progreso
        console.log();

        // Guardar el archivo actualizado
        const outputFile = outputPath || filePath;
        await fs.writeFile(outputFile, JSON.stringify(data, null, 2), "utf-8");

        console.log(
            `\nProceso completado. Se han procesado ${totalTasks} traducciones (${skippedTasks} se mantuvieron iguales por ser formatos especiales).`
        );
        return totalTasks;
    } catch (error) {
        console.error(`Error al procesar el archivo: ${error.message}`);
        return 0;
    }
}

/**
 * Función principal
 */
async function main() {
    try {
        await fs.access(argv.input);
    } catch (error) {
        console.error(`Error: El archivo ${argv.input} no existe`);
        process.exit(1);
    }

    console.log("==========================================================");
    console.log("                XCODE TRANSLATOR COMPLETO                 ");
    console.log("==========================================================");
    console.log(`Archivo de entrada: ${argv.input}`);
    console.log(`Archivo de salida: ${argv.output || argv.input} (${argv.output ? "nuevo archivo" : "sobreescribir"})`);
    console.log(`Traduciendo todas las cadenas: ${argv.all ? "Sí" : "No"}`);

    // Iniciar el procesamiento
    const startTime = Date.now();
    await processLocalizationFile(argv.input, argv.output);
    const endTime = Date.now();

    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`\n¡Proceso finalizado en ${duration} segundos!`);
}

// Ejecutar la función principal
main().catch((error) => {
    console.error("Error en la ejecución:", error.message);
    process.exit(1);
});
