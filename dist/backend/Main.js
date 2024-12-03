"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DMiNer_1 = require("./DMiNer");
const papaparse_1 = __importDefault(require("papaparse")); // CSV parser: https://www.papaparse.com
const util_1 = require("util");
const unzip_stream_1 = __importDefault(require("unzip-stream"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const stream_1 = require("stream");
class DataProduit {
    constructor() {
        this._text_decoder = new util_1.TextDecoder();
        this._datas = new Array;
    }
    start(controller) {
        console.info('Any initialization?');
    }
    transform(chunk, controller) {
        const { data } = papaparse_1.default.parse(this._text_decoder.decode(chunk), {
            header: true,
            dynamicTyping: false,
            skipEmptyLines: true,
        });
        for (const key in data) {
            for (const char in data[key]) {
                if (data[key][char].includes("http://world-en.openfoodfacts.org/product/")) {
                    let v = data[key][char].split("http://world-en.openfoodfacts.org/product/")[1];
                    let codeBare = v.split("/")[0];
                    let paysS = v.split("	");
                    let pays = "";
                    if (codeBare.length < 20) {
                        for (let i = 0; i < paysS.length - 1; i++) {
                            if (paysS[i].toLowerCase() == paysS[i + 1].toLowerCase()
                                && paysS[i] != "unknow"
                                && paysS[i].includes("en:")
                                && paysS[i + 1].includes("en:")) {
                                pays = paysS[i + 2];
                            }
                        }
                        /*if(pays.length>=0){
                            //console.log(this._datas.length+"\n"+codeBare+"\n"+pays+"\n\n\n")
                            this._datas.push(new Produit(codeBare, pays))
                        }*/
                    }
                }
            }
        }
        controller.enqueue(this._datas);
        if (this._datas.length > 5000) {
            this._datas = shuffle(this._datas);
            this._datas = this._datas.slice(0, 999);
            //console.log(this._datas)
            controller.terminate();
        }
    }
    flush(controller) {
        // Any finalization?
    }
}
async function handleZipFile(url) {
    try {
        const response = await fetch(url);
        if (!response.body) {
            throw new Error("La réponse ne contient pas de corps (body).");
        }
        const nodeStream = stream_1.Readable.fromWeb(response.body);
        let itemCount = 0; // Compteur pour les éléments traités
        const maxItem = 10000; // Limite des éléments
        nodeStream
            .pipe(unzip_stream_1.default.Parse()) // Décompresser le fichier ZIP
            .on('entry', (entry) => {
            const fileName = entry.path;
            if (fileName.endsWith('.csv')) {
                console.log(`Traitement du fichier CSV: ${fileName}`);
                entry
                    .pipe((0, csv_parser_1.default)()) // Analyse CSV ligne par ligne
                    .on('data', (row) => {
                    if (itemCount >= maxItem) {
                        console.log("Limite atteinte. Arrêt du traitement.");
                        entry.destroy(); // Arrête le flux pour ce fichier CSV
                        return;
                    }
                    const produit = new nudgerTest(row['gtin'], row['gs1_country']);
                    console.log(produit.toString(), "je suis l'item numéro", itemCount);
                    itemCount++;
                })
                    .on('end', () => {
                    console.log(`Fichier CSV traité : ${fileName}`);
                });
            }
            else {
                entry.autodrain(); // Ignore les fichiers non CSV
            }
        })
            .on('error', (err) => {
            console.error("Erreur lors de l'extraction du ZIP :", err);
        })
            .on('finish', () => {
            console.log("Extraction complète du fichier ZIP.");
        });
    }
    catch (error) {
        console.error("Erreur lors du traitement du fichier ZIP :", error);
    }
}
// Exemple d'utilisation
const url = 'https://nudger.fr/opendata/gtin-open-data.zip';
handleZipFile(url);
(function Main() {
    const produits = new Array;
    console.clear();
    const decompression_stream = new DecompressionStream("gzip");
    fetch("https://static.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz").then(async (response) => {
        console.assert(response.body.constructor.name === 'ReadableStream');
        console.assert(response.body.locked === false);
        const data_stream = response.body.pipeThrough(decompression_stream);
        const transformation = new TransformStream(new DataProduit);
        const data_stream_ = data_stream.pipeThrough(transformation);
        const reader = data_stream_.getReader();
        for await (const produits of Chunks(reader)) {
            //reader.releaseLock();
        }
    });
    DMiNer_1.DMiNer.Get_DMN().then(() => {
    });
})();
const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};
class Produit {
    constructor(n, s) {
        this.code = n;
        this.country = s;
    }
}
class nudgerTest {
    constructor(gtin, gs1_country) {
        this.gtin = gtin;
        this.gs1_country = gs1_country;
    }
    toString() {
        return `GTIN: ${this.gtin}, GS1 Country: ${this.gs1_country}`;
    }
}
function Chunks(stream_reader) {
    return {
        async *[Symbol.asyncIterator]() {
            let result = await stream_reader.read();
            while (!result.done) {
                yield result.value;
                result = await stream_reader.read();
            }
        },
    };
}
function fromWeb(body) {
    throw new Error("Function not implemented.");
}
function toNodeReadable(body) {
    throw new Error("Function not implemented.");
}
//# sourceMappingURL=Main.js.map