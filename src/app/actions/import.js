'use server'

import { prisma } from '@/lib/prisma'

// ============ CONFIGURAZIONE VARIANTI ============

const QUERY_VARIANTS = {
  'software house': [
    'software house',
    'azienda informatica',
    'informatica',
    'sviluppo software',
    'consulenza informatica',
  ],
  'agenzie di comunicazione': [
    'agenzia di comunicazione',
    'web agency',
    'agenzia marketing',
    'agenzia digitale',
  ],
}

// ============ UTILS ============

async function geocodeCity(city) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}&language=it`

  const res = await fetch(url)
  const data = await res.json()

  if (!res.ok || data.status !== 'OK' || !data.results?.[0]) {
    throw new Error(`Geocoding fallito per "${city}": ${data.status || res.status}`)
  }

  const { lat, lng } = data.results[0].geometry.location
  return { lat, lng }
}

function extractCity(formattedAddress) {
  if (!formattedAddress) return null
  const parts = formattedAddress.split(',').map(p => p.trim())
  const cityPart = parts.find(p => /^\d{5}\s/.test(p))
  if (!cityPart) return null
  return cityPart.replace(/^\d{5}\s+/, '').replace(/\s+[A-Z]{2}$/, '') || null
}

// ============ RICERCA ============

async function searchByRadius(query, center, radiusMeters, pageToken = null) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const url = 'https://places.googleapis.com/v1/places:searchText'

  const body = {
    textQuery: query,
    languageCode: 'it',
    maxResultCount: 20,
    locationBias: {
      circle: {
        center: { latitude: center.lat, longitude: center.lng },
        radius: radiusMeters,
      },
    },
    ...(pageToken && { pageToken }),
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,nextPageToken',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(`SearchRadius fallito: ${JSON.stringify(data)}`)
  return data
}

async function fetchAllPages(searchFn, query, extraArgs = []) {
  let allPlaces = []
  let pageToken = null
  let pageCount = 0

  do {
    const data = await searchFn(query, ...extraArgs, pageToken)
    if (data.places) allPlaces.push(...data.places)
    pageToken = data.nextPageToken
    pageCount++
  } while (pageToken && pageCount < 3)

  return allPlaces
}

// ============ SERVER ACTION ============

export async function importCompanies(formData) {
  const city = formData.get('city')?.trim()
  const radiusKm = Math.min(parseInt(formData.get('radius') || '50', 10), 50)
  const categories = formData.getAll('categories')

  if (!city) return { error: 'Inserisci una città.' }
  if (!categories || categories.length === 0) return { error: 'Seleziona almeno una categoria.' }

  try {
    // 1. Geocoding
    const center = await geocodeCity(city)
    const radiusMeters = radiusKm * 1000

    // 2. Per ogni categoria, per ogni variante, cerca
    let allPlaces = []
    const perCategory = {}

    for (const category of categories) {
      const variants = QUERY_VARIANTS[category] || [category]
      let categoryPlaces = []

      for (const variant of variants) {
        const places = await fetchAllPages(searchByRadius, variant, [center, radiusMeters])
        categoryPlaces.push(...places)
      }

      perCategory[category] = categoryPlaces.length
      allPlaces.push(...categoryPlaces)
    }

    // 3. Deduplica per placeId
    const uniqueMap = new Map()
    for (const place of allPlaces) {
      if (!uniqueMap.has(place.id)) uniqueMap.set(place.id, place)
    }
    const uniquePlaces = Array.from(uniqueMap.values())

    // 4. Salva nel DB
    let imported = 0
    let skipped = 0

    for (const place of uniquePlaces) {
      const existing = await prisma.company.findUnique({
        where: { placeId: place.id },
      })

      if (existing) {
        skipped++
        continue
      }

      await prisma.company.create({
        data: {
          placeId: place.id,
          name: place.displayName?.text || 'Senza nome',
          address: place.formattedAddress || null,
          city: extractCity(place.formattedAddress),
          website: place.websiteUri || null,
          phone: place.nationalPhoneNumber || null,
          status: 'DA_CONTATTARE',
          score: 0,
          scanResult: { source: 'radius-multi' },
        },
      })
      imported++
    }

    return {
      success: true,
      imported,
      skipped,
      totalUnique: uniquePlaces.length,
      perCategory,
    }
  } catch (error) {
    return { error: error.message }
  }
}