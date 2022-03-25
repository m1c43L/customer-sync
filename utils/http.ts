export type Config = {
    maxRetries?: number,
    initalDelay?: number,
    multiplier?: number,
    maxDelay?: number
}

const delay = (millis: number) => new Promise((resolve) => {
    setTimeout(resolve, millis);
})


export const backoff = async<T>(task: () => Promise<T>, config: Config = {}): Promise<T> => {
    const { initalDelay = 100, multiplier = 3, maxDelay = 500} = config
    
    let { maxRetries = 3  } = config
    let currentDelay = initalDelay
    let error: unknown
    while (maxRetries-- > 0) {
        try {
           return await task()
        } catch (_error) {
            error = _error
            await delay(currentDelay)
            currentDelay = Math.min(maxDelay, initalDelay * multiplier)
        }
    }

    throw error
}

export class HttpError extends Error {
    constructor(code: number, body: any) {
        super(`${code}: ${body}`)
    }
}