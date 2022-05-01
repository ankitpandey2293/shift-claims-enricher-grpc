const grpc = require("@grpc/grpc-js");
const { GlobalCache, DataAdapter } = require('../adapters')

class ClaimsEnricherService {
    constructor() {
        this.globalCache = new GlobalCache();
        this.dataAdapter = new DataAdapter();
    }

    /** 
     * @desc  EnrichClaim
     * @param {query} query contains orgID & uniqueID for retrieval 
     * from DB and enriching Global Cache Store
     * */

    enrichClaim = (query, callback) => {
        /**
         * [1] Retrieve claim from DB
         * [2] Enrich claim to Global Cache Store
         * [3] Respond with updated Claim data 
         */
        const { request: { orgID, uniqueID } } = query
        this.dataAdapter.getClaim(orgID, uniqueID).then(async claim => {
            await this.globalCache.setClaim(orgID, uniqueID, claim)
            callback(null, claim)
        }).catch(() => {
            callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Claim not found",
            })
        })
    }
}

module.exports = ClaimsEnricherService