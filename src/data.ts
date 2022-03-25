import * as z from 'zod'
import { Config } from './config'

export type DataItem = z.infer<typeof DataItemShape>
const DataItemShape = z.record(z.unknown())

const DataShape = z.array(DataItemShape)

export const parseDataJsonFile = (data: unknown) => {
    return DataShape.parse(data)
}

export const transform = (config: Config) => (row: Readonly<Record<string, unknown>>) => { 
    // only pick values from `mappings`
    const transformed = config.mappings.reduce((accRow, { from, to}) => {
        if (from in row) 
            accRow[to]= row[from]
        return accRow 
    }, {} as Record<string, unknown>)


    // try to cast fields to expected input value
    if (typeof transformed['created_at'] === 'string') {
         // convert to epoch seconds as per documentation specified
        transformed['created_at'] = Math.round((new Date(transformed['created_at']).valueOf() / 1000))
    }

    // set userId from source
    transformed.id = row[config.userId]
    
    return transformed
}