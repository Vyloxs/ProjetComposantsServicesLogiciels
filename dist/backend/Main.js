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
            //console.log(data[key])
            for (const char in data[key]) {
                if (data[key][char].includes("http://world-en.openfoodfacts.org/product/")) {
                    let v = data[key][char].split("http://world-en.openfoodfacts.org/product/")[1];
                    console.log(v); //.split('/')[0]+"\n")
                }
                //console.log(data[key][char].split+"\n")
            }
        }
        controller.enqueue(data);
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
        console.assert(response.body.locked === false /*&& response.body.state === 'readable'*/);
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