import * as F from 'fastify'
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import * as STAGES_SCHEMA from "./schemas/json/stage-list.json";
import * as STORAGE_ERROR from "./schemas/json/storage-error.json";
import * as STAGE_NOT_EXISTS_ERROR from "./schemas/json/stage-not-exists-error.json";
import * as INVALID_STEP_ERROR from "./schemas/json/invalid-step-error.json";
import * as NEXT_PARTLY_COMPLETED_ERROR from "./schemas/json/next-partly-completed-error.json";
import * as PREV_NOT_COMPLETED_ERROR from "./schemas/json/prev-not-completed-error.json";

import { createStageStorage } from "./startup-stages-storage";
import { createStageCommands } from "./startup-stages-commands";
import * as T from "./startup-stages-types";

export function httpHandlers(fastify: F.FastifyInstance, _: any, done: (err?: Error) => void) {

    let commands = createStageCommands(fastify.log, createStageStorage() );


    fastify.route({
        method: "GET",
        url: "/stages/:startup_id",
        schema: {
            tags: ["Startup Stages"],
            description: "Get Startup Stages",
            params: { startup_id: { type: "string"} },
            response: { 
                200: STAGES_SCHEMA,
                503: STORAGE_ERROR
            }
        },
        handler: (req: any, res: any) => {
            let { startup_id } = req.params;
            return pipe(
                commands.getStages( startup_id ),
                E.fold(
                    er => handleErrors(er, res),
                    stages => res.status(200).send(stages)
                )
            )
        }
    } as any);

    fastify.route({
        method: "POST",
        url: "/stages/:startup_id",
        schema: {
            tags: ["Startup Stages"],
            description: "Reset Startup Stages",
            params: { startup_id: { type: "string"} },
            response: { 
                200: STAGES_SCHEMA,
                503: STORAGE_ERROR
            }
        },
        handler: (req: any, res: any) => {
            let { startup_id } = req.params;
            return pipe(
                commands.deleteStages( startup_id ),
                E.chain( () => commands.getStages( startup_id ) ),
                E.fold(
                    er => handleErrors(er, res),
                    stages => res.status(200).send(stages)
                )
            )
        }
    } as any);


    fastify.route({
        method: "PUT",
        url: "/stages/:startup_id/stage/:stage_id/:step_id/done",
        schema: {
            tags: ["Startup Stages"],
            description: "Mark step as done",
            params: {
                startup_id: { type: "string" },
                stage_id: { type: "number" },
                step_id: { type: "number" } 
            },
            response: { 
                200: STAGES_SCHEMA,
                503: STORAGE_ERROR,
                404: { oneOf: [STAGE_NOT_EXISTS_ERROR, INVALID_STEP_ERROR] },
                400: PREV_NOT_COMPLETED_ERROR
            }
        },
        handler: (req: any, res: any) => {
            let { startup_id, stage_id, step_id } = req.params;
            return pipe(
                commands.markDone(startup_id, stage_id, step_id),
                E.fold(
                    er => handleErrors(er, res),
                    stages => res.status(200).send(stages)
                )
            )
        }
    } as any);

    fastify.route({
        method: "PUT",
        url: "/stages/:startup_id/stage/:stage_id/:step_id/undone",
        schema: {
            tags: ["Startup Stages"],
            description: "Mark step as undone",
            params: {
                startup_id: { type: "string" },
                stage_id: { type: "number" },
                step_id: { type: "number" } 
            },
            response: { 
                200: STAGES_SCHEMA,
                503: STORAGE_ERROR,
                404: { oneOf: [STAGE_NOT_EXISTS_ERROR, INVALID_STEP_ERROR] },
                400: NEXT_PARTLY_COMPLETED_ERROR
            }
        },
        handler: (req: any, res: any) => {
            let { startup_id, stage_id, step_id } = req.params;
            return pipe(
                commands.markUndone(startup_id, stage_id, step_id),
                E.fold(
                    er => handleErrors(er, res),
                    stages => res.status(200).send(stages)
                )
            )
        }
    } as any);

    done();
}


function handleErrors( er: T.Errors, reply: F.FastifyReply) {
    switch(er.tag) {
        case "storage-error": return reply.status(503).send(er);
        case "stage-not-exists": return reply.status(404).send(er);
        case "invalid-step-path": return reply.status(404).send(er);
        case "next-partly-completed": return reply.status(400).send(er);
        case "prev-not-completed": return reply.status(400).send(er);
    }
}
