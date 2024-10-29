"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DMiNer_1 = require("./DMiNer");
const papaparse_1 = __importDefault(require("papaparse")); // CSV parser: https://www.papaparse.com
class DataProduit {
    constructor() {
        this._text_decoder = new TextDecoder();
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
                        if (pays.length > 0) {
                            console.log(this._datas.length + "\n" + codeBare + "\n" + pays + "\n\n\n");
                            this._datas.push(new Produit(codeBare, pays));
                        }
                    }
                }
            }
        }
        controller.enqueue(this._datas);
        if (this._datas.length > 5000) {
            this._datas = shuffle(this._datas);
            this._datas = this._datas.slice(0, 999);
            console.log(this._datas);
            controller.terminate();
        }
    }
    flush(controller) {
        // Any finalization?
    }
}
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
//# sourceMappingURL=Main.js.map