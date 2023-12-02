import express, { Request, Response } from 'express'
import { getCountryIds, getFilePath } from './utils/helper'
import { GeoJSON2SVG } from 'geojson2svg'
import * as fs from 'fs'
import { Feature } from 'geojson'
import {
  bBoxAspectRatio,
  calculateSize,
  countryName,
} from './utils/geo-functions'
import cors from 'cors'
import { ServerEvent, ClientEventSchema } from './types'

function getRandomItem<T>(array: T[]) {
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}

const app = express()

const PORT = 8080
app.use(express.json())
app.use(cors({ origin: 'http://localhost:5173' }))

app.get('/', (req: Request, res: Response) => {
  res.send('Api running')
})

app.get('/country', (req: Request, res: Response) => {
  res.json({ countryId: getRandomItem(getCountryIds()) })
})

app.get('/geosvg/:countryId', (req: Request, res: Response) => {
  const WIDTH = 500
  //get a specific post
  const countryId = req.params.countryId
  const filePath = getFilePath(countryId)
  const geoJSON = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  const geoJSONBoundingBox = (geoJSON as Feature)?.bbox
  if (!geoJSONBoundingBox) return
  const height = calculateSize(
    bBoxAspectRatio([
      geoJSONBoundingBox[0],
      geoJSONBoundingBox[1],
      geoJSONBoundingBox[2],
      geoJSONBoundingBox[3],
    ]),
    WIDTH
  )

  if (!geoJSONBoundingBox) return

  const converter = new GeoJSON2SVG({
    viewportSize: { width: WIDTH, height },
    mapExtent: {
      left: geoJSONBoundingBox[0],
      right: geoJSONBoundingBox[2],
      bottom: geoJSONBoundingBox[1],
      top: geoJSONBoundingBox[3],
    },
  })
  const svgStrings = converter.convert(
    JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  )

  res.setHeader('content-type', 'image/svg+xml')
  res.send(
    `<svg width="100%" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg">${svgStrings.join(
      ''
    )}</svg>`
  )
})

// POST /question
// set cookie with unique ID in response
// keep track of unique ID and game data
// returns the first question
// {quizSessionId (unique), "nextQuestion": { type: "country", questionId: "", "svgUrl": "" } }

// POST /answer { "questionId": "xyz", "answer": "abc" } -> { correct: true, "nextQuestion": { type: "country", questionId: "", "svgUrl": "" } }
// if correct false -> delete in-memory database

app.get('/question', (req: Request, res: Response) => {
  try {
  } catch {}
})

export const validateServerEvent = (x: ServerEvent) => x

app.post('/event', (req: Request, res: Response) => {
  const event = ClientEventSchema.parse(req.body)
  const countryId = getRandomItem(getCountryIds())
  switch (event.type) {
    case 'answer':
      // if correct answer
      const correctAnswers = countryName(event.questionId)
      if (correctAnswers.includes(event.answer.toLowerCase()))
        res.json(
          validateServerEvent({
            type: 'question',
            questionId: countryId,
            geoImageUrl: `http://localhost:${PORT}/geosvg/${countryId}`,
          })
        )
      else res.json({ type: 'end_game' })
      break
    case 'start':
      res.json(
        validateServerEvent({
          type: 'question',
          questionId: countryId,
          geoImageUrl: `http://localhost:${PORT}/geosvg/${countryId}`,
        })
      )
      break
  }
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`)
})
