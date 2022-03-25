import fetch, {Response} from 'node-fetch';
import {backoff, Config as RetryConfig, HttpError} from '../utils/http'
import { Credential } from './config'

type Conf = {
    retryConfig?: RetryConfig
}

const API_ROUTE = 'https://track.customer.io/api/v1/customers'

export class Customers {
    readonly credential: Readonly<Credential>
    readonly config: Readonly<Conf>

    constructor (credential:Readonly<Credential>, conf: Readonly<Conf> = {}) {
        this.credential = credential
        this.config = conf
    }

    public static isValidIdentifier = (primaryKey: unknown): primaryKey is (number | string) => {
        const primaryKeyType = typeof primaryKey
        if ( primaryKeyType !== 'string' && primaryKeyType !== 'number') return false
        
        return true
    }

    private _basicAuth (): string {
        return "Basic " + Buffer.from(`${this.credential.siteId}:${this.credential.apiKey}`).toString('base64')
    }

    public async upsert (id: string | number, attributes: Record<string, unknown>, updateOnly: boolean = false) {
        const task = async (): Promise<Response> => {
            const response = await fetch(`${API_ROUTE}/${id}`, { 
                body: JSON.stringify({
                    ...attributes,
                    id,
                    _update: updateOnly
                }),
                method: 'PUT', 
                headers: {
                    'Authorization': this._basicAuth(),
                    'content-type': 'application/json'
                }
            })
            // backoff transcient errors
            // for 429 we wan't to check for  a `retry-after` header, 
            // but it's not required according to docs
            if (response.status >= 500 /* response.status === 429*/) { 
                throw new HttpError(response.status, await response.text())
            }
            return response
        }

        const response = await backoff(task, this.config.retryConfig)
        if (response.status !== 200) {
            throw new  HttpError(response.status, await response.text())
        }            

        return  response.json()
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

        const response = await backoff(task, this.config.retryConfig)
        // throw on non-transcient error
        if (response.status > 200) 
            throw new Error(JSON.stringify(response.json()))

        return response.json()
    }
}