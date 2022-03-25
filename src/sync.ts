import { Config, MappingItem } from "./config";
import { Customers } from "./customers";
import Queue from 'p-queue'

const transform = (mappings: MappingItem[]) => (row: Record<string, unknown>) => { 
    return mappings.reduce((accRow, { from, to}) => {
        if (from !== to && from in accRow) {
            accRow[to]= accRow[from]
            delete accRow[from]
        }
        return accRow 
    }, { ...row } as Record<string, unknown>)
}

const runUpsertTask = (customers: Customers, config: Config) => (record: Record<string, unknown>) => async () => {
    const primaryKey = record[config.userId]
    if (!Customers.isValidIdentifier(primaryKey)) {
        throw new Error(`Unsupported identifier type(${typeof primaryKey}) on a record ${JSON.stringify(record)}`)
    }
    const result = await customers.upsert(primaryKey, record)
    return {result}
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