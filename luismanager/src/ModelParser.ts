import * as fs from 'fs';
import * as readline from 'readline';
import * as includes from 'array-includes';

import {ModelParserConfig, Model, Utterance, intent_column} from './BusinessObjects';

export function ParseConfiguration(config: ModelParserConfig) : Promise<Model> {
    const promise = new Promise<Model>((resolve,reject) => {
        const toReturn = new Model();
        const inputsFileStream = 
            fs.createReadStream(config.inFile, {encoding: 'utf-8'})
        const utterancesOutFileStream = 
            fs.createWriteStream(config.outFile, {encoding: 'utf-8'})
        const lineReader = readline.createInterface({input: inputsFileStream});
        
        let counter = 0;

        let headerRow = new Array<string>();

        lineReader.on('line', (line: string) => {
            counter = counter + 1;
            if (counter === 1) {
                headerRow = line.split(',');
                toReturn.entities.push(headerRow[2]);
                toReturn.entities.push(headerRow[3]);
                toReturn.entities.push(headerRow[4]);
            } else {
                const columns = line.split(',');
                if (!includes(toReturn.intents, columns[intent_column])) {
                    toReturn.intents.push(columns[intent_column]);
                }
                toReturn.utterances.push(new Utterance(columns, toReturn.entities, headerRow));
            }
        });
        lineReader.on('close', () => {
            utterancesOutFileStream.write(JSON.stringify(toReturn.utterances));
            resolve(toReturn);
        });
    });
    return promise;
}