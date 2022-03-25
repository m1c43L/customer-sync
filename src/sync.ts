import { Config } from "./config";
import { Customers } from "./customers";
import { transform } from './data'
import Queue from 'p-queue'

const noop = () => {}

const runUpsertTask = (customers: Customers, config: Config, onFinishedRows: (count: number) => void = noop) => (record: Record<string, unknown>) => async () => {
    const id = record.id
    if (!Customers.isPossibleId(id)) {
        throw new Error(`Unsupported identifier type(${typeof id}) on a record ${JSON.stringify(record)}`)
    }
    // ensure primary key is a string as per api documentaion have specified
    const result = await customers.upsert(String(id), record, config.updateOnly)
    onFinishedRows(1)
    return result
}

export const sync = async (rows: Record<string, unknown>[], config: Config, onFinishedRows: (count: number) => void = noop) => {
    const queue = new Queue({concurrency: config.parallelism})
    return await queue.addAll(
        rows.map(transform(config))
            .map(runUpsertTask(
                new Customers(config.credential), 
                config,
                onFinishedRows
            )
        )
    )
}