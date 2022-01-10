import assert from "assert";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { createStageCommands } from "../src/startup-stages-commands";
import { createStageStorage } from "../src/startup-stages-storage";
import { tap, tapL } from "../src/utils";

describe("Startup Stage Commands", () => {

    let commands = () => createStageCommands({ info: ()=>{}, error: ()=>{}}, createStageStorage() );

    it("create & delete", () => {
        let cmd = commands();

        pipe(
            cmd.getStages("kino"),
            E.chain( () => cmd.deleteStages("kino") ),
            E.mapLeft( e => { throw e})
        );
    });

    it("create, done and invalid done, undone", () => {
        let cmd = commands();


        pipe(
            cmd.getStages("kino"),
            E.chain( () => cmd.markDone("kino", 1, 1) ),
            tapL( () => assert(false, "Should not throw error") ),
            E.chain( () => cmd.markDone("kino2", 2, 1)),
            E.fold(
                er => assert.equal(er.tag, "stage-not-exists"),
                s => assert(false, "Should throw error")
            )
        );
    });

    it("prev not completed & next partly completed", () => {
        let cmd = commands();

        pipe(
            cmd.getStages("kino"),
            E.chain( () => cmd.markDone("kino", 1, 1) ),
            E.chain( () => cmd.markDone("kino", 1, 2) ),
            E.chain( () => cmd.markDone("kino", 2, 1) ),
            E.fold(
                er => assert.equal(er.tag, "prev-not-completed" ),
                s => assert(false, "Should throw error")
            )
        );

        pipe(
            cmd.getStages("kino"),
            E.map( s => s.stages[0].steps.length),
            E.map( len => Array.apply(null, Array(len)) ),
            E.map( arr => arr.map( (_,i) => cmd.markDone("kino", 1, i+1))),
            E.chain( () => cmd.markDone("kino", 2, 1) ),
            tapL( (e) => assert(false, `Should not throw error: ${e.tag}`) ),
            E.chainW( () => cmd.markUndone("kino", 1, 1) ),
            E.fold(
                er => assert.equal(er.tag, "next-partly-completed"),
                s => assert(false, "Should throw error")
            )
        )


        

        // try invalid done
    })

})