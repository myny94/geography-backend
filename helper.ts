import { Feature } from "geojson"
import * as fs from "fs"

export const getFilePath = (id: string): string => {
  const firstPart = id.slice(0, 3)
  const secondPart = id.slice(3, 6)
  const remainingPart = id.slice(6)

  // Hardcoded data path
  const dataPath =
    "/Users/nayeong/IdeaProjects/whosonfirst-data-country-latest/data"

  const filePath = `${dataPath}/${firstPart}/${secondPart}/${remainingPart}/${id}.geojson`
  return filePath
}

export const readGeoJSONFile = (filePath: string): Feature | null => {
  try {
    const geoJSONData: Feature = JSON.parse(fs.readFileSync(filePath, "utf-8"))

    return geoJSONData
  } catch (error) {
    console.error("Error reading or parsing GeoJSON file:", error)
    return null
  }
}
