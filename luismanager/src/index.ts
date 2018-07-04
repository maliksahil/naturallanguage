import * as request from "request";
import { config } from './config';

import * as path from 'path';
import { ModelParserConfig, Model, Utterance } from './BusinessObjects';
import { ParseConfiguration } from './ModelParser';

ParseConfiguration({
    inFile: path.join(__dirname, '/Data/stocks.csv'),
    outFile: path.join(__dirname, '/Data/utterances.json')
}).then(model => {
    // create the application
    createApp('stocks').then( appId => {
        console.log('Created app with appId:' + appId);
        // add intents
        const intentPromises = Array<Promise<string>>();
        model.intents.forEach(intent => {
            intentPromises.push(addIntent(appId, intent));
        });
        Promise.all(intentPromises).then(results => {
            console.log('Added intents with results: ' + JSON.stringify(results));
            // add entities
            const entityPromises = Array<Promise<string>>();
            model.entities.forEach(entity => {
                entityPromises.push(addEntity(appId, entity));
            });
            Promise.all(entityPromises).then(results => {
                console.log('Added entities with results: ' + JSON.stringify(results));
                addUtterance(appId, model.utterances).then(result => {
                    console.log('Added utterances with results ' + JSON.stringify(results));
                });
            });
        });        
    });
});

function addUtterance(appId: string, utterances: Array<Utterance>): Promise<string> {
    const promise = new Promise<string>((resolve, reject) => {
        const requestOptions = getRequestOptions();
        requestOptions.body = JSON.stringify(utterances);
        const uri = 
            config.luis.apiEndPoint + 
                `/${appId}/versions/${config.luis.versionId}/examples`;
        request.post(
            uri, 
            requestOptions,
            (err, response, body) => {
                resolve(body);
            }
        );
    });
    return promise;
}

function addEntity(appId: string, entityName: string): Promise<string> {
    const promise = new Promise<string>((resolve, reject) => {
        const requestOptions = getRequestOptions();
        requestOptions.body = JSON.stringify({
            'name': entityName
        });
        const uri = 
            config.luis.apiEndPoint + 
                `/${appId}/versions/${config.luis.versionId}/entities`;
        request.post(
            uri, 
            requestOptions,
            (err, response, body) => {
                resolve(body);
            }
        );
    });
    return promise;
}

function addIntent(appId: string, intentName: string): Promise<string> {
    const promise = new Promise<string>((resolve, reject) => {
        const requestOptions = getRequestOptions();
        requestOptions.body = JSON.stringify({
            'name': intentName
        });
        const uri = config.luis.apiEndPoint + '/' + appId + '/versions/0.1/intents';
        request.post(
            uri, 
            requestOptions,
            (err, response, body) => {
                resolve(body);
            }
        );
    });
    return promise;
}

function createApp(appName: string): Promise<string> {
    const promise = new Promise<string>((resolve, reject) => {
        const requestOptions = getRequestOptions();
        requestOptions.body = JSON.stringify({
            'name': appName, 
            'culture': config.luis.culture
        });
        request.post(
            config.luis.apiEndPoint,
            requestOptions,
            (err, response, body) => {
                body = body.replace(/"/g,'');
                resolve(body);
            }
        )
    });
    return promise;
}

function getRequestOptions(): request.CoreOptions {
    const requestOptions: request.CoreOptions = {
        headers: {
            'Ocp-Apim-Subscription-Key': config.luis.subscriptionKey,
            'Content-Type': 'application/json'
        }
    };
    return requestOptions;    
}