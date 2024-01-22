import express, { Request, Response } from 'express'
import { getCountryIds, getFilePath } from './utils/helper'
import { GeoJSON2SVG } from 'geojson2svg'
import * as fs from 'fs'
import { Feature } from 'geojson'
import {
  bBoxAspectRatio,
  calculateSize,
  countryName,
  getHint,
} from './utils/geo-functions'
import cors from 'cors'
import { ServerEvent, ClientEventSchema } from './types'
import { v4 } from 'uuid'
import cookieParser from 'cookie-parser'
import { HintProperty } from './types/HintProperty'

function getRandomItem<T>(array: T[]) {
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}

const app = express()

const PORT = 8080
app.use(express.json())
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(cookieParser())

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

app.get('/question', (req: Request, res: Response) => {
  try {
  } catch {}
})

export const validateServerEvent = (x: ServerEvent) => x
const quizSession: Record<
  string,
  { remainingLives: number; givenHints: string[] }
> = {}

app.post('/event', (req: Request, res: Response) => {
  const event = ClientEventSchema.parse(req.body)
  const countryId = getRandomItem(getCountryIds())
  switch (event.type) {
    case 'answer':
      const correctAnswers = countryName(event.questionId)
      const remainingLives =
        quizSession[req.cookies.quizSessionId]?.remainingLives
      if (correctAnswers.includes(event.answer.toLowerCase())) {
        // correct answer
        res.json(
          validateServerEvent({
            type: 'question',
            questionId: countryId,
            geoImageUrl: `http://localhost:${PORT}/geosvg/${countryId}`,
            remainingLives,
          })
        )
      } else {
        // wrong answer
        if (quizSession[req.cookies.quizSessionId].remainingLives === 0) {
          res.json(
            validateServerEvent({
              type: 'end_game',
            })
          )
          break
        }
        quizSession[req.cookies.quizSessionId].remainingLives -= 1
        res.json(
          validateServerEvent({
            type: 'wrong_answer',
            remainingLives:
              quizSession[req.cookies.quizSessionId].remainingLives,
          })
        )
        break
      }
    case 'start':
      const quizSessionId = v4()
      res.cookie('quizSessionId', quizSessionId)
      quizSession[quizSessionId] = { remainingLives: 10, givenHints: [] }
      res.json(
        validateServerEvent({
          type: 'question',
          questionId: countryId,
          geoImageUrl: `http://localhost:${PORT}/geosvg/${countryId}`,
          remainingLives: quizSession[quizSessionId]?.remainingLives,
        })
      )
      break
    case 'ask_hint':
      const givenHints =
        quizSession[req.cookies.quizSessionId]?.givenHints || []

      const hintProperty =
        givenHints.length === 0
          ? HintProperty.population
          : givenHints.length === 1
          ? HintProperty.area
          : HintProperty.continent

      const hint = getHint({ countryId: event.questionId, hintProperty })
      quizSession[req.cookies.quizSessionId].givenHints.push(hintProperty)
      res.json(
        validateServerEvent({
          type: 'give_hint',
          questionId: event.questionId,
          hint,
        })
      )
  }
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`)
})
