require('dotenv').config()
const axios = require('axios');
const config = {
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'api-key': process.env.DATA_API_KEY || '8wv2geCjMXCAKAmL9vUSoaiXDOVZ2t2mz5EZHRhUPVxnUH9jo1gyRtR4yFAQV2DD'
    },
    dataSource: 'shift',
    collection: 'claimsmaster'
}

const OperationMap = {
    findOne: (orgID, uniqueID) => {
        return {
            method: 'post',
            url: 'https://data.mongodb-api.com/app/data-aqora/endpoint/data/beta/action/findOne',
            headers: config.headers,
            data: JSON.stringify({
                collection: config.collection,
                database: `org${orgID}_claims`,
                dataSource: config.dataSource,
                projection: {
                    uniqueID: 1,
                    claimName: 1,
                    verified: 1,
                },
                filter: {
                    uniqueID
                }
            })
        }
    }
}

class DataAdapter {
    constructor() {
        this.config = config
    }

    async getClaim(orgID, uniqueID) {
        const { data } = await axios(OperationMap.findOne(orgID, parseInt(uniqueID)))
        if (data && !data.document) throw new Error('Claim Not Found')
        return data.document
    }
}

module.exports = DataAdapter