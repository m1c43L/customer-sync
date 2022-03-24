import fs from 'fs'

export const loadJsonSync = (relativePath: string) => {
   return JSON.parse(fs.readFileSync(relativePath).toString()) 
}