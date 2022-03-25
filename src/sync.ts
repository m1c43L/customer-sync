import { Config } from "./config";
import { Customers } from "./customers";
import { transform } from './data'
import Queue from 'p-queue'

const runUpsertTask = (customers: Customers, config: Config) => (record: Record<string, unknown>) => async () => {
    const primaryKey = record[config.userId]
    if (!Customers.isPossibleId(primaryKey)) {
        throw new Error(`Unsupported identifier type(${typeof primaryKey}) on a record ${JSON.stringify(record)}`)
    }
    // ensure primary key is a string as per api documentaion
    return await customers.upsert(String(primaryKey), record, config.updateOnly)
}

export const sync = async (rows: Record<string, unknown>[], config: Config) => {
    const queue = new Queue({concurrency: config.parallelism})
    return await queue.addAll(
        rows.map(transform(config.mappings))
            .map(runUpsertTask(
                new Customers(config.credential), 
                config
            )
        )
    )
}