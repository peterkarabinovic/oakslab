import { Either } from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { produce } from "immer";

import * as T from "./startup-stages-types";
import { StageStorage } from "./startup-stages-storage";
import * as STARTUP_STAGES from "./startup-stages-template.json";
import { tap, tapL } from "./utils";


type MarkDoneErrors =
    | T.StorageError
    | T.PrevStageNotCompletedError
    | T.InvalidStepPathError
    | T.StageNotExistsError

type MarkUndoneErrors =
    | T.StorageError
    | T.NextStagePartlyCompletedError
    | T.InvalidStepPathError
    | T.StageNotExistsError



export function createStageCommands(logger: T.Logger, store: StageStorage) {

    return {

        getStages: (startup_id: string): Either<T.StorageError, T.StageList> => {
            return store.stages_or(startup_id, () => {
                logger.info(`Creation stage list for startup "${startup_id}"`);
                return {
                    startup_id,
                    stages: STARTUP_STAGES.stages.map( (s, i) => ({
                        id: i + 1, // bad practice to have id starts with 0
                        name: s.name,
                        done: false,
                        steps: s.steps.map( (ss, ii) => ({
                            id: ii + 1,
                            done: false,
                            name: ss
                        } as T.Step) )
                    } as T.Stage))
                };
            }); 
        },

        deleteStages: (startupId: string) => store.deleteStages(startupId),

        markDone: (startupId: string, stageId: number, stepId: number): Either< MarkDoneErrors, T.StageList> => {
            let path = () => `setup_id(${startupId}), stage_id(${stageId}), step_id(${stepId})`;
            return pipe(
                store.stages(startupId),
                E.chainW( (s) => {
                    if( s.stages.length < stageId || s.stages[stageId-1].steps.length < stepId )
                        return E.left( { tag: "invalid-step-path", msg: path() } as MarkDoneErrors);
                
                    if( stageId > 1 && !s.stages[stageId - 2].done )
                        return E.left( { tag: "prev-not-completed", msg: path() } as MarkDoneErrors );
                    
                    return E.right( produce( s, draft => {
                        let stage = draft.stages[stageId-1];
                        stage.steps[stepId-1].done = true;
                        if( stage.steps.every(s => s.done) )
                            stage.done = true;
                    }));
                }),
                E.chainW( s => store.updateStage(startupId, s) ),
                tap( s => logger.info(`Step makred as done (${ path() })`) ),
                tapL( e => logger.error(`markDone: ${e.tag}: ${ path() }`) )
            );
        },

        markUndone: (startupId: string, stageId: number, stepId: number): Either< MarkUndoneErrors, T.StageList> => {
            let path = () => `setup_id(${startupId}), stage_id(${stageId}), step_id(${stepId})`;
            return pipe(
                store.stages(startupId),
                E.chainW( (s) => {
                    if( s.stages.length < stageId || s.stages[stageId-1].steps.length < stepId )
                        return E.left( { tag: "invalid-step-path", msg: path() } as MarkUndoneErrors);
                
                    if( stageId < s.stages.length && s.stages[stageId].steps.some( step => step.done) )
                        return E.left( { tag: "next-partly-completed", msg: path() } as MarkUndoneErrors );
                    
                    return E.right( produce( s, draft => {
                        let stage = draft.stages[stageId-1]
                        stage.steps[stepId-1].done = false;
                        stage.done = false;
                    }))
                }),
                E.chainW( s => store.updateStage(startupId, s) ),
                tap( s => logger.info(`Step makred as undone (${ path() })`) ),
                tapL( e => logger.error(`markUnDone: ${e.tag}: ${ path() }`) )
            );
        }
    }
}

