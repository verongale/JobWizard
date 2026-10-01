'use server'

import * as cheerio from 'cheerio'
import { prisma } from '@/lib/prisma'
import { KEYWORDS, KEYWORD_CAP, BATCH_SIZE } from '@/lib/keywords'

// ============ SCRAPING DI UN SINGOLO SITO ============

async function scrapeSite(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobWizard/1.0)',
      },
      signal: AbortSignal.timeout(15000), // 15 secondi timeout
    })

    if (!res.ok) {
      return { error: `HTTP ${res.status}`, text: '', html: '' }
    }

    const html = await res.text()
    const $ = cheerio.load(html)

    // Rimuovi script, style, noscript prima di estrarre il testo
    $('script, style, noscript').remove()

    // Estrai il testo visibile
    const text = $('body').text().replace(/\s+/g, ' ').toLowerCase()

    return { text, html, error: null }
  } catch (err) {
    return { error: err.message, text: '', html: '' }
  }
}

// ============ CALCOLO DELLO SCORE ============

function calculateScore(text) {
  if (!text || text.length < 100) {
    return { score: 0, keywordsFound: [] }
  }

  let score = 0
  const keywordsFound = []

  for (const [keyword, weight] of Object.entries(KEYWORDS)) {
    // Conta le occorrenze con un regex "word boundary" per evitare falsi positivi
    // (es. "ai" non deve matchare "mai")
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\b${escaped}\\b`, 'g')
    const matches = text.match(regex)
    const count = matches ? Math.min(matches.length, KEYWORD_CAP) : 0

    if (count > 0) {
      const contribution = count * weight
      score += contribution
      keywordsFound.push({ word: keyword, count, weight, contribution })
    }
  }

  // Ordina le keyword per contributo decrescente
  keywordsFound.sort((a, b) => b.contribution - a.contribution)

  return { score, keywordsFound }
}

// ============ SERVER ACTION PRINCIPALE ============

export async function scanCompanies() {
  try {
    // Prendi le aziende da scansionare (con sito, mai scansionate)
    const companies = await prisma.company.findMany({
      where: {
        website: { not: null },
        lastScannedAt: null,
      },
      take: BATCH_SIZE,
      orderBy: { createdAt: 'asc' },
    })

    if (companies.length === 0) {
      return {
        success: true,
        scanned: 0,
        message: 'Nessuna azienda da scansionare. Tutte già processate.',
      }
    }

    let scanned = 0
    let errors = 0
    let techFound = 0

    for (const company of companies) {
      const { text, error } = await scrapeSite(company.website)

      if (error) {
  errors++
  await prisma.company.update({
    where: { id: company.id },
    data: {
      lastScannedAt: new Date(),
      score: 0,
      scanResult: {
        error,
        source: 'cheerio',
        needsManualReview: true,  
      },
    },
  })
  continue
}

      const { score, keywordsFound } = calculateScore(text)

      await prisma.company.update({
        where: { id: company.id },
        data: {
          score,
          lastScannedAt: new Date(),
          scanResult: {
            source: 'cheerio',
            textLength: text.length,
            keywords: keywordsFound.slice(0, 20), // salva solo le top 20
          },
        },
      })

      scanned++
      if (score >= 30) techFound++
    }

    // Conta quante restano
    const remaining = await prisma.company.count({
      where: {
        website: { not: null },
        lastScannedAt: null,
      },
    })

    return {
      success: true,
      scanned,
      errors,
      techFound,
      remaining,
      batchSize: companies.length,
    }
  } catch (error) {
    return { error: error.message }
  }
}
export async function countToScan() {
  const total = await prisma.company.count({
    where: { website: { not: null } },
  })
  const done = await prisma.company.count({
    where: { website: { not: null }, lastScannedAt: { not: null } },
  })
  return { total, done, remaining: total - done }
}