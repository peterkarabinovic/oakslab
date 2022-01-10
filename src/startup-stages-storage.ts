import * as T from "./startup-stages-types";
import { Either } from "fp-ts/Either";
import * as E from "fp-ts/Either";



export type StageStorage = ReturnType<typeof createStageStorage>;

export function createStageStorage() {

    let memStore: Record<string, T.StageList> = {};

    return {

        stages: (startupId: string): Either<T.StorageError | T.StageNotExistsError, T.StageList> => {
            return (startupId in memStore) ? 
                E.right(memStore[startupId]) : 
                E.left( { tag: "stage-not-exists", msg: `startupId(${startupId})`} );
        },
        
        stages_or: (startupId: string, defaultStage: () => T.StageList): Either<T.StorageError, T.StageList> => { 
            if ( !(startupId in memStore))
                memStore[startupId] = defaultStage();
            return E.right(memStore[startupId]);
        },

        updateStage: (startupId: string, stages: T.StageList): Either<T.StorageError, T.StageList> => {
            memStore[startupId] = stages;
            return E.right( stages );
        }, 

        deleteStages: (startupId: string): Either<T.StorageError, void> => {
            delete memStore[startupId];
            return E.right( undefined );
        }
    }
}