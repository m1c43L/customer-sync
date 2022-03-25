import * as z from 'zod'
import { MappingItem } from './config'

export type DataItem = z.infer<typeof DataItemShape>
const DataItemShape = z.record(z.unknown())

const DataShape = z.array(DataItemShape)

export const parseDataJsonFile = (data: unknown) => {
    return DataShape.parse(data)
}

export const transform = (mappings: MappingItem[]) => (row: Readonly<Record<string, unknown>>) => { 
    const transformed = mappings.reduce((accRow, { from, to}) => {
        if (from !== to && from in accRow) {
            accRow[to]= accRow[from]
            delete accRow[from]
        }
        return accRow 
        // `{ ...row}` creates a new object to avoid upward mutation
    }, { ...row } as Record<string, unknown>)


    // try to cast fixed fields
    if (typeof transformed['created_at'] === 'string') {
         // convert to epoch seconds as per documentation specified
        transformed['created_at'] = (new Date(transformed['created_at']).valueOf() / 1000)
    }

    return transformed
}