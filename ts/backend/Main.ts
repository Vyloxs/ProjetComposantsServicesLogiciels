import {DMiNer} from "./DMiNer";
import {version} from "@tensorflow/tfjs-node";
import OpenSLR_org_88 from "./OpenSLR_org_88/OpenSLR_org_88";
import path from "node:path";
import { Writable } from "node:stream";
import { barchart } from "@tensorflow/tfjs-vis/dist/render/barchart";
import Papa from "papaparse"; // CSV parser: https://www.papaparse.com
import { text } from "stream/consumers";
import { TransformStreamDefaultController } from "stream/web";
import * as Parser_with_data_loss from 'partial-json-parser';

class DataProduit implements Transformer<Uint8Array, Array<Produit>> {
    private  _text_decoder: TextDecoder = new TextDecoder();

    start(controller: TransformStreamDefaultController<Array<Produit>>): void | Promise<void> {
        console.info('Any initialization?');
    }
    transform(chunk: Uint8Array, controller: TransformStreamDefaultController<Array<Produit>>): void | Promise<void> {
       

    
        const {data} = Papa.parse(this._text_decoder.decode(chunk),{
            header: true,
            dynamicTyping: false,
            skipEmptyLines: true,

        });

        for(const key in data){
            //console.log(data[key])
            for(const char in data[key]){
                if(data[key][char].includes("http://world-en.openfoodfacts.org/product/")){
                    let v = data[key][char].split("http://world-en.openfoodfacts.org/product/")[1]
                    console.log(v)//.split('/')[0]+"\n")
                }
                //console.log(data[key][char].split+"\n")
            }

        }

        controller.enqueue(data);

        
        
    }

    flush(controller: TransformStreamDefaultController<Array<Produit>>): void | Promise<void> {
        // Any finalization?
    }
}

(function Main() {
    const produits: Array<Produit> = new Array<Produit>;
    console.clear();
   
    const decompression_stream = new DecompressionStream("gzip");
fetch("https://static.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz").then(async (response) => {
    console.assert(response.body.constructor.name === 'ReadableStream');
    console.assert(response.body.locked === false /*&& response.body.state === 'readable'*/);
    const data_stream: ReadableStream<any> = response.body.pipeThrough(decompression_stream);


    const transformation = new TransformStream(new DataProduit)
    const data_stream_:ReadableStream<Array<Produit>> = data_stream.pipeThrough(transformation);
    const reader: ReadableStreamDefaultReader<Array<Produit>> = data_stream_.getReader();
    for await (const produits of Chunks(reader)) {
        //reader.releaseLock();

        

        
    }


    
});






    DMiNer.Get_DMN().then(() => {
        
    }); 

})();



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




