"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DMiNer_1 = require("./DMiNer");
const papaparse_1 = __importDefault(require("papaparse")); // CSV parser: https://www.papaparse.com
(function Main() {
    const produits = new Array;
    console.clear();
    //console.info("Working directory: " + __dirname + "\n");
    //console.info("Executable file: " + __filename + "\n");
    //console.info("Version of TensorFlow.js (C++ native Node.js): " + version["tfjs-core"] + "\n");
    const decompression_stream = new DecompressionStream("gzip");
    fetch("https://static.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz").then(async (response) => {
        // 'response.body' is a 'ReadableStream' object:
        //const transformation = new TransformStream(new Compute)
        console.assert(response.body.constructor.name === 'ReadableStream');
        console.assert(response.body.locked === false /*&& response.body.state === 'readable'*/);
        const data_stream = response.body.pipeThrough(decompression_stream);
        for await (const chunk of Chunks(data_stream.getReader())) {
            const { data } = papaparse_1.default.parse((new TextDecoder()).decode(chunk), {
                header: true,
                dynamicTyping: true,
            });
            for (const key in data) {
                //console.log(data[key])
                console.log(data[key].code);
                console.log(data[key].countries);
                //produits.push(new Produit2(data[key].code, data[key].countries));
            }
            //produits.push(newTodo);
            //console.info(produits)
            data_stream.getReader().releaseLock();
        }
    });
    /** CSV */
    // DMiNer.Test_CSV();
    // DMiNer.Papa_parse();
    /** End of CSV */
    DMiNer_1.DMiNer.Get_DMN().then(() => {
        // DMiNer.Test_TensorFlow_js_API();
    }); // Default example...
    // OpenSLR_org_88.Data().then(_ => console.info("'Data' done..."));
    //OpenSLR_org_88.Test();
})();
class Produit2 {
    constructor(code, countries) {
        this.code = code;
        this.countries = countries;
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