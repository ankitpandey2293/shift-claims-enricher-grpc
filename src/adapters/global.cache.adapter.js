require('dotenv').config()
const { createClient } = require('redis');

/** TODO : This will be shifted to ENV or Configuration Management */
const ConnectionConfig = {
    URI: process.env.REDIS_URI || 'redis://:92bmwmvtwma7hpdb3tjzgbdcntfkmmgz@swift-hemlock-0772066f5b.redisgreen.net:11042/',
    socket: {
        connectTimeout: 5000,
        keepAlive: 20000
    },
    claimsExpiry: 60 * 60
}

class GlobalCache {
    constructor() {
        this.retryAttempts = 0;
        this.client = createClient({ url: ConnectionConfig.URI, socket: ConnectionConfig.socket })
        this.client.on('error', this.errorHandler);
        this.init();
    }
    /** 
     * @desc  Initialize Cache Adapter
    */
    init = async () => {
        await this.client.connect();
    }

    /** 
     * @desc  Close Cache Adapter
    */
    close = async () => {
        await Promise.allSettled([
            this.client.quit(),
            this.client.disconnect()
        ])
    }

    /** 
     * @desc ReConnection Error Handler 
     * */
    errorHandler = async (err) => {
        const me = this;
        this.retryAttempts++;
        if (this.retryAttempts <= 10) {
            await me.init()
        } else {
            throw new Error('Trouble connecting global cache store')
        }
    }

    /**
     * @desc Retrieve a unique claim from Global Cache Store
     * @param {orgID} organizationID
     * @param {uniqueID} uniqueID sent by user while requesting a unique claim
     * @param {orgID} orgID sent by user while requesting a unique claim
     * @param {claim} claim retrieved from secondary storage 
     * */
    setClaim = async (orgID, uniqueID, claim) => {
        const key = `${orgID}:CL:${uniqueID}`
        delete claim['_id']
        const [setNxReply] = await this.client
            .multi()
            .setNX(key, JSON.stringify(claim))
            .setEx(key, ConnectionConfig.claimsExpiry, JSON.stringify(claim))
            .exec();

        return setNxReply
    }

    /** 
     * @desc Delete a specified key from Global Cache 
     * @param {key} key
     * */
    deleteKey = async (key) => {
        await this.client.del(key)
    }
}

module.exports = GlobalCache