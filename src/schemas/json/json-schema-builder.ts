/***********************************************************
 * 
 * Json schema builder
 * 
 **********************************************************/
 
const TJS = require("typescript-json-schema");
const path = require("path");
const fs = require("fs");

let tsFile = path.join(__dirname, "..", "..", "startup-stages-types.ts")
let jsonDir = __dirname;//path.join(__dirname, "json")

createJsonSchema("StageList", "stage-list.json")
createJsonSchema("StorageError", "storage-error.json")
createJsonSchema("StageNotExistsError", "stage-not-exists-error.json")
createJsonSchema("InvalidStepPathError", "invalid-step-error.json")
createJsonSchema("PrevStageNotCompletedError", "prev-not-completed-error.json")
createJsonSchema("NextStagePartlyCompletedError", "next-partly-completed-error.json")


function createJsonSchema(typeName: string, schemaFile: string) {
    
    const jsonFile = path.resolve(jsonDir, schemaFile);
    if( fs.existsSync(jsonFile) ) {
        fs.unlinkSync(jsonFile);
    }
    console.log(jsonFile)
    const program = TJS.getProgramFromFiles( [tsFile], {strictNullChecks: true, ignoreErrors: true} );
    const schema = TJS.generateSchema(program, typeName, {required: true});
    fs.writeFileSync( jsonFile,  JSON.stringify(schema, null, 2) );
}    

  
