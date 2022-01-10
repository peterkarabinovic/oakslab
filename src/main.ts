import { fastify } from "fastify"
import { httpHandlers } from "./http-handlers";

let server = fastify({
    ignoreTrailingSlash: true,
    disableRequestLogging: true,
    logger: { 
        level: "info",
        prettyPrint: {
            translateTime: 'yyyy-mm-dd HH:MM:ss.l',
            ignore: 'pid,hostname,res,reqId,responseTime',
        }
    }
});

server.register(require("fastify-swagger"),{
    swagger: {
        info: {title: 'Startup Progress API'}
    },
    exposeRoute: true,
    routePrefix: '/'
});

server.register( httpHandlers, { prefix: "/api/v1"} )


server.listen(process.env.PORT || "8888", "0.0.0.0")
    .then( () => {
        
    })
    .catch(err => {
        server.log.error(err);
        process.exit(1);
    })
