export const intent_column = 0;
export const utterance_column = 1;

export class ModelParserConfig {
    public inFile: string;
    public outFile: string;
    constructor(modelParserConfig: ModelParserConfig) {
        Object.assign(this, modelParserConfig);
    }
}

export class Model {
    public intents = new Array<string>();
    public entities = new Array<string>();
    public utterances = new Array<Utterance>();    
}

export class EntityLabel {
    public entityName: string;
    public startCharIndex: number;
    public endCharIndex: number;
    constructor(entityLabel: EntityLabel) {
        Object.assign(this, entityLabel);
    }
}

export class Utterance {
    public text: string;
    public intentName: string;
    public entityLabels = new Array<EntityLabel>();
    
    constructor(columns:Array<string>, entityNames:Array<string>, headerRow: Array<string>) {
        this.intentName = columns[intent_column];
        this.text = columns[utterance_column];
        // For each column heading that may be an entity, search for the element in this column in the utterance.
        entityNames.forEach((entityName) => {
            const entityText = columns[headerRow.indexOf(entityName)];
            if (entityText !== '') {
                this.entityLabels.push(new EntityLabel({
                    entityName: entityName,
                    startCharIndex: this.text.indexOf(entityText),
                    endCharIndex: this.text.indexOf(entityText) + entityText.length - 1
                }));
            }
        });
    }
}
