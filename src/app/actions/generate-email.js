'use server'

import { GoogleGenAI } from '@google/genai'
import { PROFILE } from '@/lib/profile'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function generateEmail(companyData) {
  if (!process.env.GEMINI_API_KEY) {
    return { error: 'GEMINI_API_KEY non configurata.' }
  }

  const { name, city, website, score } = companyData

  const prompt = `
Scrivi una bozza di email di candidatura spontanea in italiano.

**Mittente:**
Nome: ${PROFILE.name}
Ruolo: ${PROFILE.role}
Email: ${PROFILE.email}
Telefono: ${PROFILE.phone}
Portfolio: ${PROFILE.portfolio}
LinkedIn: ${PROFILE.linkedin}
Bio: ${PROFILE.bio}

Competenze:
- Frontend: ${PROFILE.skills.frontend.join(', ')}
- Backend: ${PROFILE.skills.backend.join(', ')}
- CMS & Tools: ${PROFILE.skills.cms.join(', ')}
- Altro: ${PROFILE.skills.other.join(', ')}

Esperienze recenti:
${PROFILE.experience.slice(0, 2).map((e) => `- ${e.role} presso ${e.company} (${e.period})`).join('\n')}

**Destinatario:**
Azienda: ${name}
Città: ${city || 'non specificata'}
Sito web: ${website || 'non disponibile'}
Punteggio tech: ${score} (se >= 50 è un'azienda tech, se < 30 potrebbe non esserlo)

**Istruzioni:**
1. Scrivi in italiano naturale, professionale ma non troppo formale.
2. Inizia con un oggetto chiaro e conciso.
3. Nel corpo, menziona il nome dell'azienda e perché la trovi interessante.
4. Collega le competenze del mittente a ciò che l'azienda potrebbe cercare.
5. Concludi con un invito a parlare e i contatti.
6. Firma con nome, email, telefono, portfolio e LinkedIn.
7. Restituisci SOLO il testo dell'email (oggetto + corpo), senza commenti o spiegazioni.
8. Non superare le 200 parole.
`

  try {
    const interaction = await ai.interactions.create({
      model: 'gemini-3.1-flash-lite',
      input: prompt,
    })
    console.log('GEMINI RESPONSE:', JSON.stringify(interaction, null, 2))

    return { email: interaction.output_text }
  } catch (error) {
    console.error('Errore Gemini:', error)
    return { error: `Errore: ${error.message}` }
  }
}