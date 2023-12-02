import { GeoJSONData, GeoJSONSchema } from '../types'
import { getFilePath } from './helper'
import * as fs from 'fs'

export const bBoxAspectRatio = (
  rawbbox: [number, number, number, number]
): [number, number] => {
  const bbox = rawbbox.map(coord => Math.ceil(coord * 10000))

  const _width = Math.abs(bbox[0] - bbox[2])
  const _height = Math.abs(bbox[1] - bbox[3])
  return calculateAspectRatio(_width, _height)
}

export const calculateSize = (aspectRatio: [number, number], size: number) => {
  return Math.ceil((aspectRatio[1] * size) / aspectRatio[0])
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
const highestFirst = (a: number, b: number) => (a < b ? [b, a] : [a, b])
const formatAspectRatio = (
  w: number,
  h: number,
  divisor: number
): [number, number] => [w / divisor, h / divisor]

const calculateAspectRatio = (
  width: number,
  height: number
): [number, number] => {
  const [x, y] = highestFirst(width, height)
  const divisor = gcd(x, y)
  return formatAspectRatio(width, height, divisor)
}

export const extractCountryNames = (
  properties: GeoJSONData['properties']
): string[] => {
  const defaultEnglishName = properties['name:eng_x_preferred']
  const variantEnglishNames = properties['name:eng_x_variant'] ?? []
  return [...defaultEnglishName, ...variantEnglishNames].map(name =>
    name.toLowerCase()
  )
}

export const countryName = (countryId: string): string[] => {
  const filePath = getFilePath(countryId)
  const geoJSONFile = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  const parsedGeoJsonResult = GeoJSONSchema.parse(geoJSONFile)
  const countryNames = extractCountryNames(parsedGeoJsonResult.properties)
  return countryNames
}
