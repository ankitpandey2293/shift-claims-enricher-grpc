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

    /** 
     * @desc  SaveClaim
     * @param {claim} query contains orgID along with {uniqueID,claimName,verified} for storage 
     * 
     * */

    saveClaim = (claim, callback) => {
        /**
         * [1] Save claim via data adapter
         * [2] Enrich claim to Global Cache Store
         * [3] Respond with updated Claim data 
         */
        const { request: { orgID, uniqueID, claimName, verified } } = claim
        this.dataAdapter.saveClaim(orgID, uniqueID, claimName, verified).then(async () => {
            await this.globalCache.setClaim(orgID, uniqueID, { orgID, uniqueID, claimName, verified })
            callback(null, {})
        }).catch(() => {
            callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Claim already persisted",
            })
        })
    }
}

module.exports = ClaimsEnricherService