import * as fs from 'fs'
import * as path from 'path'

const traverseDirectory = (dir: string, filelist: string[] = []): string[] => {
  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const filePath = path.join(dir, file)

    if (fs.statSync(filePath).isDirectory()) {
      filelist = traverseDirectory(filePath, filelist)
    } else {
      filelist.push(filePath)
    }
  })

  return filelist
}

export const getCountryIds = () => {
  // Traverse directory and all its subdirectories using fs
  const files = traverseDirectory(
    '/Users/nayeong/IdeaProjects/whosonfirst-data-country-latest/data'
  )
  const fileNameRegex = /\/\d{2,20}\.geojson$/
  return files
    .filter(file => fileNameRegex.test(file))
    .map(file => {
      const parts = file.split('/')
      return parts[parts.length - 1].replace('.geojson', '')
    })
}

export const getFilePath = (id: string): string => {
  const firstPart = id.slice(0, 3)
  const secondPart = id.slice(3, 6)
  const remainingPart = id.slice(6)

  // Hardcoded data path
  const dataPath =
    '/Users/nayeong/IdeaProjects/whosonfirst-data-country-latest/data'

  const filePath = `${dataPath}/${firstPart}/${secondPart}/${remainingPart}/${id}.geojson`
  return filePath
}
