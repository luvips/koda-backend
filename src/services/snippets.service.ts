import { Difficulty } from '../types'
import prisma from '../lib/prisma'
import { fetchSnippetFromGitHub } from './github.service' 
import { Language, Snippet } from '@prisma/client/wasm'

export type SnippetWithLanguage = Snippet & {
  language: Language
}

export async function getRandomSnippet(
  languageSlug: string,
  difficulty?: string
): Promise<SnippetWithLanguage | null> {
  const whereClause: {
    isActive: boolean
    language: { slug: string }
    difficulty?: Difficulty
  } = {
    isActive: true,
    language: { slug: languageSlug },
  }

  if (difficulty) {
    whereClause.difficulty = difficulty as Difficulty
  }

  const snippetsFromDB = await prisma.snippet.findMany({
    where: whereClause,
    include: { language: true },
  })

  if (snippetsFromDB.length > 0) {
    const randomIndex = Math.floor(Math.random() * snippetsFromDB.length)
    return snippetsFromDB[randomIndex]
  }

  if (!process.env.GITHUB_PAT) {
    return null
  }

  const githubSnippet = await fetchSnippetFromGitHub(languageSlug)

  if (!githubSnippet) {
    return null
  }

  try {
    const language = await prisma.language.findUnique({
      where: { slug: languageSlug },
    })

    if (!language) {
      console.warn(`[SnippetsService] No se encontró el Language con slug: ${languageSlug}`)
      return null
    }

    const savedSnippet = await prisma.snippet.create({
      data: {
        languageId: language.id,
        code: githubSnippet.code,
        difficulty: githubSnippet.difficulty,
        source: 'github',
        sourceUrl: githubSnippet.sourceUrl,
        isActive: true,
        tags: [],
        specialCharacters: false,
      },
      include: { language: true },
    })

    return savedSnippet
  } catch (error) {
    console.warn('[SnippetsService] No se pudo guardar el snippet de GitHub en BD:', error)
    return null
  }
}

export async function getSnippetById(id: string): Promise<SnippetWithLanguage | null> {
  return prisma.snippet.findUnique({
    where: { id },
    include: { language: true },
  })
}