export type Config = {
    maxRetries?: number,
    initalDelay?: number,
    multiplier?: number,
    maxDelay?: number
}

const delay = (millis: number) => new Promise((resolve) => {
    setTimeout(resolve, millis);
})


export const backoffRetry = async<T>(task: () => Promise<T>, config: Config = {}): Promise<T> => {
    const { initalDelay = 500, multiplier = 2, maxDelay = 1000} = config
    let { maxRetries = 3  } = config
    let currentDelay = initalDelay
    let error: unknown
    while (maxRetries-- > 0) {
        try {
           return await task()
        } catch (_error) {
            error = _error
            await delay(currentDelay)
            currentDelay = Math.min(maxDelay, currentDelay * multiplier)
        }
    }

    throw error
}

export class HttpError extends Error {
    constructor(code: number, body: any) {
        super(`${code}: ${body}`)
    }
}