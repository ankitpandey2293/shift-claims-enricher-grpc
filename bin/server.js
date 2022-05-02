require('newrelic');
require('dotenv').config()
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { ClaimsEnricherService } = require('../src/services')

/** To be migrated to ENV / Configuration Management */
const Config = {
    URI: process.env.URI || "127.0.0.1:50051",
    PROTO_PATH: "./src/proto/claims_enricher.proto",
    options: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    }

}
const packageDefinition = protoLoader.loadSync(Config.PROTO_PATH, Config.options);
const claimsEnrichProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();
const claimsEnricherService = new ClaimsEnricherService()


server.addService(claimsEnrichProto.ClaimsEnricherService.service, {
    enrichClaim: claimsEnricherService.enrichClaim,
    saveClaim: claimsEnricherService.saveClaim
});

server.bindAsync(
    Config.URI,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        console.log(` gRPC Server running at ${Config.URI}`);
        server.start();
    }
);