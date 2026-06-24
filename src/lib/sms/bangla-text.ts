const templateTokenPattern = /\{\{[a-z_]+\}\}/g
const latinLetterPattern = /[A-Za-z]/
const banglaCharacterPattern = /[\u0980-\u09FF]/

export function stripLatinLettersOutsideTemplateTokens(value: string) {
  let result = ""
  let lastIndex = 0

  for (const match of value.matchAll(templateTokenPattern)) {
    const index = match.index ?? 0
    result += value.slice(lastIndex, index).replace(/[A-Za-z]+/g, "")
    result += match[0]
    lastIndex = index + match[0].length
  }

  result += value.slice(lastIndex).replace(/[A-Za-z]+/g, "")

  return result
}

export function hasLatinLettersOutsideTemplateTokens(value: string) {
  let lastIndex = 0

  for (const match of value.matchAll(templateTokenPattern)) {
    const index = match.index ?? 0

    if (latinLetterPattern.test(value.slice(lastIndex, index))) {
      return true
    }

    lastIndex = index + match[0].length
  }

  return latinLetterPattern.test(value.slice(lastIndex))
}

export function assertBanglaSmsText(value: string, fieldLabel: string) {
  if (hasLatinLettersOutsideTemplateTokens(value)) {
    throw new Error(`${fieldLabel} must be written in Bangla only.`)
  }

  if (!banglaCharacterPattern.test(value)) {
    throw new Error(`${fieldLabel} must include Bangla text.`)
  }
}

export function hasBanglaText(value: string) {
  return banglaCharacterPattern.test(value)
}
