import { Difficulty } from '../types'
export interface GitHubSnippetResult {
  code: string
  difficulty: Difficulty
  sourceUrl: string
  languageSlug: string
}

const LANGUAGE_MAP: Record<string, string> = {
  python: 'Python',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  go: 'Go',
  rust: 'Rust',
  ruby: 'Ruby',
  php: 'PHP',
  swift: 'Swift',
  kotlin: 'Kotlin',
  csharp: 'C#',
  scala: 'Scala',
  haskell: 'Haskell',
}

export function calculateDifficulty(code: string): Difficulty {
  if (!code || code.length === 0) return 'EASY'

  const specialCharsRegex = /[{}()[\];:<>=!&|^~%#@\\/*+\-$]/g
  const matches = code.match(specialCharsRegex)
  const specialCount = matches ? matches.length : 0
  const ratio = specialCount / code.length

  if (ratio < 0.05) return 'EASY'
  if (ratio < 0.15) return 'MEDIUM'
  return 'HARD'
}

export async function fetchSnippetFromGitHub(
  languageSlug: string
): Promise<GitHubSnippetResult | null> {
    const githubPat = process.env.GITHUB_PAT
    if (!githubPat) {
    return null
  }

  const languageName = LANGUAGE_MAP[languageSlug.toLowerCase()]
  if (!languageName) {
    console.warn(`[GitHubService] Slug sin mapeo conocido: ${languageSlug}`)
    return null
  }

  try {
    const searchUrl = `https://api.github.com/search/code?q=language:${encodeURIComponent(languageName)}+license:mit+size:<800&per_page=10`

    const searchResponse = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${githubPat}`,
        Accept: 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    
    if (!searchResponse.ok) {
      console.warn(`[GitHubService] Búsqueda fallida: ${searchResponse.status} ${searchResponse.statusText}`)
      return null
    }

    interface GitHubSearchResponse {
        items: Array<{
            raw_url: string
            html_url: string
        }>
    }
    const searchData = await searchResponse.json() as GitHubSearchResponse

    if (!searchData.items || searchData.items.length === 0) {
      console.warn(`[GitHubService] Sin resultados para lenguaje: ${languageName}`)
      return null
    }

    const randomIndex = Math.floor(Math.random() * searchData.items.length)
    const selectedItem = searchData.items[randomIndex]

    if (!selectedItem?.raw_url || !selectedItem?.html_url) {
      console.warn('[GitHubService] Item sin raw_url o html_url')
      return null
    }

    const rawResponse = await fetch(selectedItem.raw_url, {
      headers: {
        Authorization: `Bearer ${githubPat}`,
      },
    })

    if (!rawResponse.ok) {
      console.warn(
        `[GitHubService] No se pudo descargar el archivo raw: ${rawResponse.status}`
      )
      return null
    }

    const rawCode = await rawResponse.text()
    const code = rawCode.trim().replace(/^\n+|\n+$/g, '')

    if (!code) {
      console.warn('[GitHubService] El archivo descargado estaba vacío')
      return null
    }
    const difficulty = calculateDifficulty(code)
    return {
      code,
      difficulty,
      sourceUrl: selectedItem.html_url,
      languageSlug,
    }
  } catch (error) {
    console.warn('[GitHubService] Error inesperado al consultar GitHub API:', error)
    return null
    }
}