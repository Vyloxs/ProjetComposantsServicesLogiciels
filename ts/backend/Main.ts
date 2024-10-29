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
import { code } from "tar/types";
import unzipper from 'unzipper';



class DataProduit implements Transformer<Uint8Array, Array<Produit>> {
    private  _text_decoder: TextDecoder = new TextDecoder();
    private _datas: Array<Produit> = new Array<Produit>;
    

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
            for(const char in data[key]){
                if(data[key][char].includes("http://world-en.openfoodfacts.org/product/")){
                    let v = data[key][char].split("http://world-en.openfoodfacts.org/product/")[1]
                    let codeBare = v.split("/")[0];
                    let paysS = v.split("	");
                    let pays = ""
                    if(codeBare.length<20){
                        for(let i = 0; i<paysS.length-1;i++){
                            if(paysS[i].toLowerCase()==paysS[i+1].toLowerCase()
                            && paysS[i]!="unknow"
                            && paysS[i].includes("en:")
                            && paysS[i+1].includes("en:")){
                                pays = paysS[i+2]  
                            }
                        }
                        if(pays.length>0){
                            console.log(this._datas.length+"\n"+codeBare+"\n"+pays+"\n\n\n")                  
                            this._datas.push(new Produit(codeBare, pays))
                        }
                        
                        
                    }
                    
                }
                
            }

        }
        controller.enqueue(this._datas);
        if(this._datas.length>5000){
            this._datas = shuffle(this._datas);
            this._datas = this._datas.slice(0,999);
            console.log(this._datas)
            controller.terminate();
        }
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
    console.assert(response.body.locked === false );
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


const shuffle = (array: Produit[]) => { 
    for (let i = array.length - 1; i > 0; i--) { 
      const j = Math.floor(Math.random() * (i + 1)); 
      [array[i], array[j]] = [array[j], array[i]]; 
    } 
    return array; 
  }; 


class Produit {
    code:number;
    country:string;
    
    constructor(n, s){
        this.code = n;
        this.country = s;

    }

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




