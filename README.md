# shift-claims-enricher-grpc

gRPC server to enrich claims from secondary storage to cache.
This service will be behind http2 load balancer either on nginx or envoy

[1] Retrieve claim from DB on gRPC request
[2] Enrich claim to Global Cache Store with key `orgID:CL:uniqueID` : {claimInformation}
[3] Respond with updated Claim data or grpc.INVAID_DATA error

## Setup ENV
URI={GRPC_SERVER_URI} default 127.0.0.1:50051

REDIS_URI={REDIS_HOST_URI} default 'redis://:92bmwmvtwma7hpdb3tjzgbdcntfkmmgz@swift-hemlock-0772066f5b.redisgreen.net:11042/'

DATA_API_KEY={DATA_API_KEY} default '8wv2geCjMXCAKAmL9vUSoaiXDOVZ2t2mz5EZHRhUPVxnUH9jo1gyRtR4yFAQV2DD'

## Starting the application
npm i
npm run start

Expected Output :
```
> shift-claims-enricher-grpc@1.0.0 start
> node --trace-deprecation ./bin/server
> gRPC Server running at 127.0.0.1:50051
```

## Debugging the application
npm run debug