'use server'
/**
 * TEST A/B — Confronto tra due metodi di ricerca su Google Places.
 *
 * SCOPO: capire quale metodo trova più aziende tech nella zona di Cuneo.
 *
 * - METODO TEXT: cerca "software house a Cuneo" (query testuale)
 * - METODO RADIUS: geocoding + locationBias (cerchio 50km attorno a Cuneo)
 *
 * RISULTATO DEL TEST (21/09/2026):
 * - TEXT:   117 aziende uniche (concentrate su Cuneo città)
 * - RADIUS: 167 aziende uniche (incluse Trinità, Alba, Fossano, Torino...)
 * - DECISIONE: adottare RADIUS come metodo primario.
 *
 * Questo file è mantenuto come documentazione del processo decisionale.
 * Il codice di produzione è in `src/app/actions/import.js`.
 */
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

// ============ METODO 1: SEARCH TEXT ============

async function searchByText(query, pageToken = null) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const url = 'https://places.googleapis.com/v1/places:searchText'

  const body = {
    textQuery: query,
    languageCode: 'it',
    maxResultCount: 20,
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
  if (!res.ok) throw new Error(`SearchText fallito: ${JSON.stringify(data)}`)
  return data
}

// ============ METODO 2: RADIUS + GEOCODING ============

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

// ============ PAGINAZIONE ============

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

// ============ NORMALIZZAZIONE PER OUTPUT ============

function normalizePlace(place) {
  return {
    id: place.id,
    name: place.displayName?.text || 'Senza nome',
    address: place.formattedAddress || null,
    city: extractCity(place.formattedAddress),
    website: place.websiteUri || null,
    phone: place.nationalPhoneNumber || null,
  }
}

// ============ TEST 1: METODO TEXT ============

export async function testByText(formData) {
  const city = formData.get('city')?.trim()
  const categories = formData.getAll('categories')

  if (!city) return { error: 'Inserisci una città.' }
  if (!categories || categories.length === 0) return { error: 'Seleziona almeno una categoria.' }

  try {
    let allPlaces = []
    const perCategory = {}

    for (const category of categories) {
      const query = `${category} a ${city}`
      const places = await fetchAllPages(searchByText, query)
      perCategory[category] = places.length
      allPlaces.push(...places)
    }

    // Deduplica per id
    const uniqueMap = new Map()
    for (const place of allPlaces) {
      if (!uniqueMap.has(place.id)) uniqueMap.set(place.id, place)
    }
    const uniquePlaces = Array.from(uniqueMap.values())

    return {
      success: true,
      method: 'text',
      city,
      perCategory,
      totalRaw: allPlaces.length,
      totalUnique: uniquePlaces.length,
      places: uniquePlaces.map(normalizePlace),
    }
  } catch (error) {
    return { error: error.message }
  }
}

// ============ TEST 2: METODO RADIUS ============

export async function testByRadius(formData) {
  const city = formData.get('city')?.trim()
  const radiusKm = Math.min(parseInt(formData.get('radius') || '50', 10), 50)
  const categories = formData.getAll('categories')

  if (!city) return { error: 'Inserisci una città.' }
  if (!categories || categories.length === 0) return { error: 'Seleziona almeno una categoria.' }

  try {
    const center = await geocodeCity(city)
    const radiusMeters = radiusKm * 1000

    let allPlaces = []
    const perCategory = {}

    for (const category of categories) {
      const places = await fetchAllPages(searchByRadius, category, [center, radiusMeters])
      perCategory[category] = places.length
      allPlaces.push(...places)
    }

    const uniqueMap = new Map()
    for (const place of allPlaces) {
      if (!uniqueMap.has(place.id)) uniqueMap.set(place.id, place)
    }
    const uniquePlaces = Array.from(uniqueMap.values())

    return {
      success: true,
      method: 'radius',
      city,
      center,
      radiusKm,
      perCategory,
      totalRaw: allPlaces.length,
      totalUnique: uniquePlaces.length,
      places: uniquePlaces.map(normalizePlace),
    }
  } catch (error) {
    return { error: error.message }
  }
}