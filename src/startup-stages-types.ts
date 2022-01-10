/***************************************************************
 *
 * Sturtup Progress Stage
 *
 ***************************************************************/
/**
 *  List of startup stage
 */
 export type StageList = {
    startup_id: string,
    stages: Stage[]
}

export type Stage = {
    id: number,
    name: string,
    done: boolean,
    steps: Step[]
}

export type Step = {
    id: number,
    name: string,
    done: boolean
}



/***************************************************************
 * 
 * Sturtup Progress & Validation Errors
 * 
 ****************************************************************/

/**
 *  Critical error in storage
 */
export type StorageError = {
    tag: "storage-error",
    msg: string
}

/**
 *  Stage list don't exists
 */
export type StageNotExistsError = {
    tag: "stage-not-exists",
    msg?: string 
}

/**
 *  Invalid step path
 */
 export type InvalidStepPathError = {
    tag: "invalid-step-path",
    msg: string 
}

/**
 *  Validation error - not completed previous step
 */
export type PrevStageNotCompletedError = {
    tag: "prev-not-completed",
    msg: string
}

/**
 *  Validation error - next stage partly complited
 */
 export type NextStagePartlyCompletedError = {
    tag: "next-partly-completed",
    msg: string
}


export type Errors =
    | StorageError
    | StageNotExistsError
    | InvalidStepPathError
    | PrevStageNotCompletedError
    | NextStagePartlyCompletedError




/**************************************************************
 * 
 *  Infrastructure Types
 * 
 ***************************************************************/
export interface Logger {
    error(msg: string): void
    info(msg: string): void
}