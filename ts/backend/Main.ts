import {DMiNer} from "./DMiNer";
import path from "node:path";
import { pipeline, Writable } from "node:stream";
import { barchart } from "@tensorflow/tfjs-vis/dist/render/barchart";
import Papa from "papaparse"; // CSV parser: https://www.papaparse.com
import { text } from "stream/consumers";
import { TransformStreamDefaultController } from "stream/web";
import * as Parser_with_data_loss from 'partial-json-parser';
import { code } from "tar/types";
import jszip from 'jszip';
import { Parse } from 'unzipper'; // Assurez-vous que c'est bien importé comme cela
import { TextDecoder } from 'util';
import unzip from 'unzip-stream';
import csv from 'csv-parser';
import { Readable } from 'stream';








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
                        /*if(pays.length>=0){
                            //console.log(this._datas.length+"\n"+codeBare+"\n"+pays+"\n\n\n")                  
                            this._datas.push(new Produit(codeBare, pays))
                        }*/
                        
                        
                    }
                    
                }
                
            }

        }
        controller.enqueue(this._datas);
        if(this._datas.length>5000){
            this._datas = shuffle(this._datas);
            this._datas = this._datas.slice(0,999);
            //console.log(this._datas)
            controller.terminate();
        }
    }

    
    flush(controller: TransformStreamDefaultController<Array<Produit>>): void | Promise<void> {
        // Any finalization?
    }
}


async function handleZipFile(url: string) {
    try {
        const response = await fetch(url);

        if (!response.body) {
            throw new Error("La réponse ne contient pas de corps (body).");
        }

        const nodeStream = Readable.fromWeb(response.body);

        let itemCount = 0; 
        const maxItem = 10000; 

        nodeStream
            .pipe(unzip.Parse()) // Décompresser le fichier ZIP
            .on('entry', (entry) => {
                const fileName = entry.path;

                if (fileName.endsWith('.csv')) {
                    console.log(`Traitement du fichier CSV: ${fileName}`);

                    entry
                        .pipe(csv())
                        .on('data', (row) => {
                            if (itemCount >= maxItem) {
                                console.log("Limite atteinte. Arrêt du traitement.");
                                entry.destroy(); 
                                return;
                            }

                            const produit = new nudgerTest(row['gtin'], row['gs1_country']);
                            console.log(produit.toString(), "je suis l'item numéro", itemCount);
                            itemCount++;
                        })
                        .on('end', () => {
                            console.log(`Fichier CSV traité : ${fileName}`);
                        });
                } else {
                    entry.autodrain(); // Ignore les fichiers non CSV
                }
            })
            .on('error', (err) => {
                console.error("Erreur lors de l'extraction du ZIP :", err);
            })
            .on('finish', () => {
                console.log("Extraction complète du fichier ZIP.");
            });
    } catch (error) {
        console.error("Erreur lors du traitement du fichier ZIP :", error);
    }
}

const url = 'https://nudger.fr/opendata/gtin-open-data.zip';
handleZipFile(url);

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


class nudgerTest {
    gtin: string;
    gs1_country: string;

    constructor(gtin: string, gs1_country: string) {
        this.gtin = gtin;
        this.gs1_country = gs1_country;
    }

    toString(): string {
        return `GTIN: ${this.gtin}, GS1 Country: ${this.gs1_country}`;
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




function fromWeb(body: ReadableStream<Uint8Array>) {
    throw new Error("Function not implemented.");
}

function toNodeReadable(body: ReadableStream<Uint8Array>) {
    throw new Error("Function not implemented.");
}

