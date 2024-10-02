import {DMiNer} from "./DMiNer";
import {version} from "@tensorflow/tfjs-node";
import OpenSLR_org_88 from "./OpenSLR_org_88/OpenSLR_org_88";
import path from "node:path";

(function Main() {

    
    console.clear();
    //console.info("Working directory: " + __dirname + "\n");
    //console.info("Executable file: " + __filename + "\n");
    //console.info("Version of TensorFlow.js (C++ native Node.js): " + version["tfjs-core"] + "\n");

    const decompression_stream = new DecompressionStream("gzip");
fetch("https://static.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz").then(async (response) => {
    // 'response.body' is a 'ReadableStream' object:
    console.assert(response.body.constructor.name === 'ReadableStream');
    console.assert(response.body.locked === false /*&& response.body.state === 'readable'*/);
   // console.log(response.body)
   // console.log(response.text())
    const data_stream: ReadableStream<number> = response.body.pipeThrough(decompression_stream);
    //console.log(data_stream.locked);
    
    for await (const chunk of Chunks(data_stream.getReader())) {
        console.log(chunk);
        break;
    }
});





    /** CSV */
    // DMiNer.Test_CSV();
    // DMiNer.Papa_parse();
    /** End of CSV */

    DMiNer.Get_DMN().then(() => {
        // DMiNer.Test_TensorFlow_js_API();
    }); // Default example...

    // OpenSLR_org_88.Data().then(_ => console.info("'Data' done..."));

    //OpenSLR_org_88.Test();
})();


function Chunks(stream_reader: ReadableStreamDefaultReader) {
	return {
    	async* [Symbol.asyncIterator]() {
        	let result = await stream_reader.read();
        	while (!result.done) {
            	yield result.value;
            	result = await stream_reader.read();
        	}
    	},
	};
}




