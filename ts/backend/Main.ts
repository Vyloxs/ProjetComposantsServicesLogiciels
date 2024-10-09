import {DMiNer} from "./DMiNer";
import {version} from "@tensorflow/tfjs-node";
import OpenSLR_org_88 from "./OpenSLR_org_88/OpenSLR_org_88";
import path from "node:path";
import { Writable } from "node:stream";
import { barchart } from "@tensorflow/tfjs-vis/dist/render/barchart";
import Papa from "papaparse"; // CSV parser: https://www.papaparse.com


(function Main() {
    const produits: Array<Produit> = new Array<Produit>;
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
    const data_stream: ReadableStream<Array<number>> = response.body.pipeThrough(decompression_stream);
    

    for await (const chunk of Chunks(data_stream.getReader())) {
        const { data } = Papa.parse((new TextDecoder()).decode(chunk), {
            header: true,
            dynamicTyping: true,
        })

       
        for(const key in data){
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

    DMiNer.Get_DMN().then(() => {
        
        // DMiNer.Test_TensorFlow_js_API();
    }); // Default example...

    // OpenSLR_org_88.Data().then(_ => console.info("'Data' done..."));

    //OpenSLR_org_88.Test();
})();

class Produit2 {
    code:number
    countries:string

    constructor(code, countries){
        this.code = code;
        this.countries = countries;
    }



}


interface Produit {
    "code":number,
    "countries":string



}





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




