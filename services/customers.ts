import fetch, {Response} from 'node-fetch';
import {backoff, Config as RetryConfig} from '../utils/http'


type ApiCredential = {
    apiKey: string,
    siteId: string
}

type Conf = {
    retryConfig?: RetryConfig
}

const API_ROUTE = 'https://track.customer.io/api/v1/customers'


export class Customers {
    readonly credential: Readonly<ApiCredential>
    readonly conf: Readonly<Conf>

    constructor (credential:Readonly<ApiCredential>, conf: Readonly<Conf> = {}) {
        this.credential = credential
        this.conf = conf
    }

    private _basicAuth (): string {
        return `Basic ${this.credential.siteId}:${this.credential.siteId}`
    }

    public async upsert (id: string, attributes: Record<string, unknown>, updateOnly: boolean = false) {
        const task = async (): Promise<Response> => {
            const response = await fetch(`${API_ROUTE}/${id}`, { 
                'body': JSON.stringify({
                    ...attributes,
                    id
                }),
                method: 'PUT', 
                headers: {
                    'Authorization': this._basicAuth(),
                    'content-type': 'application/json'
                }
            })
            // backoff transcient errors
            if (response.status >= 500) { 
                throw new Error(JSON.stringify(response.json()))
            }
            return response
        }

        const response = await backoff(task, this.conf.retryConfig)
        // throw on non-transcient error
        if (response.status > 200) 
            throw new Error(JSON.stringify(response.json()))

        return response.json()
    }

    public async delete (id: string) {
        const task = async (): Promise<Response> => {
            const response = await fetch(`${API_ROUTE}/${id}`, { 
                method: 'DELETE', 
                headers: {
                    'Authorization': this._basicAuth()
                }
            })
            // backoff transcient errors
            if (response.status >= 500) { 
                throw new Error(JSON.stringify(response.json()))
            }
            return response
        }

        const response = await backoff(task, this.conf.retryConfig)
        // throw on non-transcient error
        if (response.status > 200) 
            throw new Error(JSON.stringify(response.json()))

        return response.json()
    }
}