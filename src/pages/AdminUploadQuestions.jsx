import { useMemo, useState } from 'react'
import Papa from 'papaparse'
import { validateQuestionRow } from '../lib/questionValidation'

const COLUMNS = [
  'id',
  'exam_type',
  'section',
  'subtype',
  'difficulty',
  'tier',
  'question_text',
  'option_a',
  'option_b',
  'option_c',
  'option_d',
  'option_e',
  'correct_answer',
  'explanation',
  'created_at',
]

const PREVIEW_ROW_LIMIT = 10

function AdminUploadQuestions() {
  const [file, setFile] = useState(null)
  const [parsedRows, setParsedRows] = useState([])
  const [parseError, setParseError] = useState('')
  const [commitMessage, setCommitMessage] = useState('')

  const validation = useMemo(() => {
    const errorRows = []
    let validCount = 0

    for (const { rowNumber, data } of parsedRows) {
      const reasons = validateQuestionRow(data)
      if (reasons.length === 0) {
        validCount += 1
      } else {
        errorRows.push({ rowNumber, reasons, data })
      }
    }

    return { validCount, errorRows }
  }, [parsedRows])

  const handleFileChange = (event) => {
    setFile(event.target.files?.[0] ?? null)
    setParsedRows([])
    setParseError('')
    setCommitMessage('')
  }

  const handlePreview = () => {
    if (!file) {
      setParseError('Choose a CSV file first.')
      return
    }

    setParseError('')
    setCommitMessage('')
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setParseError(results.errors[0].message)
        }
        // rowNumber accounts for the header line, so it matches the line
        // number a content provider would see if they opened the file.
        setParsedRows(
          results.data.map((data, index) => ({ rowNumber: index + 2, data })),
        )
      },
      error: (err) => {
        setParseError(err.message)
      },
    })
  }

  const handleDownloadErrors = () => {
    const csv = Papa.unparse(
      validation.errorRows.map(({ rowNumber, reasons, data }) => ({
        row_number: rowNumber,
        errors: reasons.join('; '),
        ...data,
      })),
    )
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'question_bank_errors.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleCommit = () => {
    setCommitMessage(
      `Ready to insert ${validation.validCount} valid row(s) — database insert isn't wired up yet.`,
    )
  }

  const previewRows = parsedRows.slice(0, PREVIEW_ROW_LIMIT)
  const canCommit = parsedRows.length > 0 && validation.errorRows.length === 0

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-xl font-semibold text-gray-900">Upload question bank</h1>
      <p className="mt-1 text-sm text-gray-600">
        Upload a CSV matching the question bank template. This step only previews
        and validates the parsed data — nothing is written to the database yet.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button
          type="button"
          onClick={handlePreview}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          Preview
        </button>
      </div>

      {parseError && <p className="mt-3 text-sm text-red-600">{parseError}</p>}

      {parsedRows.length > 0 && (
        <>
          <p className="mt-4 text-sm text-gray-700">
            Parsed {parsedRows.length} row{parsedRows.length === 1 ? '' : 's'}
            {parsedRows.length > PREVIEW_ROW_LIMIT ? ` — showing first ${PREVIEW_ROW_LIMIT}` : ''}.
          </p>

          <div className="mt-3 overflow-x-auto border border-gray-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {COLUMNS.map((column) => (
                    <th
                      key={column}
                      className="whitespace-nowrap border-b border-gray-200 px-3 py-2 font-medium text-gray-700"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map(({ rowNumber, data }) => (
                  <tr key={rowNumber} className="border-b border-gray-100 last:border-b-0">
                    {COLUMNS.map((column) => (
                      <td key={column} className="whitespace-nowrap px-3 py-2 text-gray-800">
                        {data[column]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <p className="text-sm font-medium text-gray-900">
              {validation.validCount} row{validation.validCount === 1 ? '' : 's'} valid,{' '}
              {validation.errorRows.length} row{validation.errorRows.length === 1 ? '' : 's'} have
              errors
            </p>

            {validation.errorRows.length > 0 && (
              <>
                <div className="mt-3 overflow-x-auto border border-red-200">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="whitespace-nowrap border-b border-red-200 px-3 py-2 font-medium text-gray-700">
                          Row
                        </th>
                        <th className="border-b border-red-200 px-3 py-2 font-medium text-gray-700">
                          Reason(s)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {validation.errorRows.map(({ rowNumber, reasons }) => (
                        <tr key={rowNumber} className="border-b border-red-100 last:border-b-0">
                          <td className="whitespace-nowrap px-3 py-2 text-gray-800">{rowNumber}</td>
                          <td className="px-3 py-2 text-gray-800">{reasons.join('; ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadErrors}
                  className="mt-3 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                >
                  Download error rows
                </button>
              </>
            )}

            <div className="mt-4">
              <button
                type="button"
                disabled={!canCommit}
                onClick={handleCommit}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Commit to database
              </button>
              {!canCommit && (
                <p className="mt-1 text-xs text-gray-500">
                  Fix all rows with errors before committing.
                </p>
              )}
              {commitMessage && <p className="mt-2 text-sm text-gray-700">{commitMessage}</p>}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminUploadQuestions
