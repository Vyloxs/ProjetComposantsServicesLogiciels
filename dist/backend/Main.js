"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DMiNer_1 = require("./DMiNer");
const tfjs_node_1 = require("@tensorflow/tfjs-node");
(function Main() {
    console.clear();
    console.info("Working directory: " + __dirname + "\n");
    console.info("Executable file: " + __filename + "\n");
    console.info("Version of TensorFlow.js (C++ native Node.js): " + tfjs_node_1.version["tfjs-core"] + "\n");
    const decompression_stream = new DecompressionStream("gzip");
    fetch("https://nudger.fr/opendata/gtin-open-data.zip").then(async (response) => {
        // 'response.body' is a 'ReadableStream' object:
        console.assert(response.body.constructor.name === 'ReadableStream');
        console.assert(response.body.locked === false /*&& response.body.state === 'readable'*/);
        //console.log(response.json());
        //const data_stream: ReadableStream<number> = response.body.pipeThrough(decompression_stream);
        //for await (const chunk of Chunks(data_stream.getReader())) {
        //console.assert(data_stream.locked); // 'getReader()' locks the stream...
        // Raw data stream:
        //console.assert(chunk.constructor.name === 'Uint8Array');
        // console.info(`Chunk of size ${chunk.length}... with raw data: ${chunk}`);
        // Data stream as (incomplete) JSON. Result *CANNOT* be parsed as JSON:
        // console.info((new TextDecoder()).decode(chunk));
        /**
         * Caution, loss of data ('import * as Parser_with_data_loss from 'partial-json-parser';'):
        */
        //const incomplete_data: Array<City> = Parser_with_data_loss((new TextDecoder()).decode(chunk));
        //console.assert(incomplete_data.constructor.name === 'Array');
        // Stop, first chunk only for test:
        //break;
        //}
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
//# sourceMappingURL=Main.js.map