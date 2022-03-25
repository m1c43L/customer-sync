import fetch, {Response} from 'node-fetch';
import {backoffRetry, Config as RetryConfig, HttpError} from '../utils/http'
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

    public static isPossibleId = (primaryKey: unknown): primaryKey is (number | string) => {
        const primaryKeyType = typeof primaryKey
        if ( primaryKeyType !== 'string' && primaryKeyType !== 'number') return false
        
        return true
    }

    private _basicAuth (): string {
        return "Basic " + Buffer.from(`${this.credential.siteId}:${this.credential.apiKey}`).toString('base64')
    }

    /**
     * @returns promise of `{}`
     */
    public async upsert (id: string, attributes: Record<string, unknown>, updateOnly: boolean = false): Promise<{}> {
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
            // for 429 we wan't to check for a `retry-after` header, 
            // we're going to skip it for now
            if (response.status >= 500 /* response.status === 429*/) { 
                throw new HttpError(response.status, await response.text())
            }
            return response
        }

        const response = await backoffRetry(task, this.config.retryConfig)
        if (response.status !== 200) {
            // non-retryable errors propagates
            throw new  HttpError(response.status, await response.text())
        }            

        return  response.json()
    }
}