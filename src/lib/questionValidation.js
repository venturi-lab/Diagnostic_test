const VALID_EXAM_TYPES = ['GMAT', 'GRE', 'SAT']
const VALID_TIERS = ['snapshot', 'split', 'full_replica', 'all']
const VALID_ANSWER_LETTERS = ['a', 'b', 'c', 'd', 'e']

// Mirrors the check constraints on public.questions so anything that
// passes here is guaranteed to satisfy the database on insert.
export function validateQuestionRow(row) {
  const reasons = []

  const examType = (row.exam_type || '').trim()
  if (!VALID_EXAM_TYPES.includes(examType)) {
    reasons.push(`exam_type must be one of ${VALID_EXAM_TYPES.join(', ')}`)
  }

  if (!(row.section || '').trim()) {
    reasons.push('section is required')
  }

  const difficultyRaw = (row.difficulty ?? '').toString().trim()
  const difficulty = Number(difficultyRaw)
  if (!difficultyRaw || !Number.isInteger(difficulty) || difficulty < 1 || difficulty > 10) {
    reasons.push('difficulty must be an integer between 1 and 10')
  }

  const tier = (row.tier || '').trim()
  if (!VALID_TIERS.includes(tier)) {
    reasons.push(`tier must be one of ${VALID_TIERS.join(', ')}`)
  }

  if (!(row.question_text || '').trim()) {
    reasons.push('question_text is required')
  }

  if (!(row.option_a || '').trim() || !(row.option_b || '').trim()) {
    reasons.push('option_a and option_b are both required')
  }

  const correctAnswer = (row.correct_answer || '').trim()
  if (!VALID_ANSWER_LETTERS.includes(correctAnswer)) {
    reasons.push('correct_answer must be a, b, c, d, or e')
  } else if (!(row[`option_${correctAnswer}`] || '').trim()) {
    reasons.push(`correct_answer '${correctAnswer}' has no matching option filled in`)
  }

  return reasons
}

function emptyToNull(value) {
  const trimmed = (value ?? '').toString().trim()
  return trimmed === '' ? null : trimmed
}

// Only call on rows that have already passed validateQuestionRow.
// id/created_at are omitted so the database defaults apply.
export function buildQuestionPayload(row) {
  return {
    exam_type: row.exam_type.trim(),
    section: row.section.trim(),
    subtype: emptyToNull(row.subtype),
    difficulty: Number(row.difficulty),
    tier: row.tier.trim(),
    question_text: row.question_text.trim(),
    option_a: row.option_a.trim(),
    option_b: row.option_b.trim(),
    option_c: emptyToNull(row.option_c),
    option_d: emptyToNull(row.option_d),
    option_e: emptyToNull(row.option_e),
    correct_answer: row.correct_answer.trim(),
    explanation: emptyToNull(row.explanation),
  }
}
