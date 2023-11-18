import express, { Request, Response } from "express"
import { getFilePath, readGeoJSONFile } from "./helper"
import { GeoJSON2SVG } from "geojson2svg"
import * as fs from "fs"

const app = express()
const port = 8080
app.use(express.json())
app.get("/", (req: Request, res: Response) => {
  res.send("Api running")
})

app.get("/geosvg/:countryId", (req: Request, res: Response) => {
  //get a specific post
  const countryId = req.params.countryId
  const filePath = getFilePath(countryId)
  const converter = new GeoJSON2SVG()
  const svgStrings = converter.convert(
    JSON.parse(fs.readFileSync(filePath, "utf-8"))
  )

  res.setHeader("content-type", "image/svg+xml")
  res.send(`<svg xmlns="http://www.w3.org/2000/svg">${svgStrings.join("")}</svg>`)
})

app.get("/name/:countryId", (req: Request, res: Response) => {
  const countryId = req.params.countryId
  const filePath = getFilePath(countryId)
  const geoJSONData = readGeoJSONFile(filePath)

  if (geoJSONData) {
    const nameProperty =
      geoJSONData.properties && geoJSONData.properties["name:eng_x_preferred"]
    console.log("name", nameProperty)

    if (nameProperty) {
      res.send(`Name property: ${nameProperty}`)
    } else {
      res.status(500).send("GeoJSON file does not have the specified property.")
    }
  } else {
    res.status(500).send("Error reading GeoJSON file or parsing GeoJSON data.")
  }
})

app.listen(port, () => {
  console.log(`Listening on port ${port}...`)
})
