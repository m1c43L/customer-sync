import * as z from 'zod'

export type DataItem = z.infer<typeof DataItemShape>
const DataItemShape = z.record(z.unknown())

const DataShape = z.array(DataItemShape)

export const parseDataJsonFile = (data: unknown) => {
    return DataShape.parse(data)
}