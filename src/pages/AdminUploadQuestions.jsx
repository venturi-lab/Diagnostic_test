import { useMemo, useState } from 'react'
import Papa from 'papaparse'
import { supabase } from '../lib/supabaseClient'
import { validateQuestionRow, buildQuestionPayload } from '../lib/questionValidation'

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

  // idle -> confirming -> importing -> done
  const [commitState, setCommitState] = useState('idle')
  const [importProgress, setImportProgress] = useState(0)
  const [importResults, setImportResults] = useState(null)

  const validation = useMemo(() => {
    const errorRows = []
    const validRows = []

    for (const row of parsedRows) {
      const reasons = validateQuestionRow(row.data)
      if (reasons.length === 0) {
        validRows.push(row)
      } else {
        errorRows.push({ ...row, reasons })
      }
    }

    return { validRows, errorRows }
  }, [parsedRows])

  const resetCommitState = () => {
    setCommitState('idle')
    setImportProgress(0)
    setImportResults(null)
  }

  const handleFileChange = (event) => {
    setFile(event.target.files?.[0] ?? null)
    setParsedRows([])
    setParseError('')
    resetCommitState()
  }

  const handlePreview = () => {
    if (!file) {
      setParseError('Choose a CSV file first.')
      return
    }

    setParseError('')
    resetCommitState()
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

  const handleConfirmImport = async () => {
    setCommitState('importing')
    setImportProgress(0)

    const succeeded = []
    const failed = []

    for (const { rowNumber, data } of validation.validRows) {
      const { error } = await supabase.from('questions').insert(buildQuestionPayload(data))
      if (error) {
        failed.push({ rowNumber, error: error.message })
      } else {
        succeeded.push(rowNumber)
      }
      setImportProgress((prev) => prev + 1)
    }

    setImportResults({ succeeded, failed })
    setCommitState('done')
  }

  const previewRows = parsedRows.slice(0, PREVIEW_ROW_LIMIT)
  const canCommit = parsedRows.length > 0 && validation.errorRows.length === 0

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-xl font-semibold text-gray-900">Upload question bank</h1>
      <p className="mt-1 text-sm text-gray-600">
        Upload a CSV matching the question bank template. Rows are validated before
        anything is written to the database.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={commitState === 'importing'}
        />
        <button
          type="button"
          onClick={handlePreview}
          disabled={commitState === 'importing'}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
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
              {validation.validRows.length} row{validation.validRows.length === 1 ? '' : 's'} valid,{' '}
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
              {commitState === 'idle' && (
                <>
                  <button
                    type="button"
                    disabled={!canCommit}
                    onClick={() => setCommitState('confirming')}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    Commit to database
                  </button>
                  {!canCommit && (
                    <p className="mt-1 text-xs text-gray-500">
                      Fix all rows with errors before committing.
                    </p>
                  )}
                </>
              )}

              {commitState === 'confirming' && (
                <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-900">
                    Ready to import {validation.validRows.length} question
                    {validation.validRows.length === 1 ? '' : 's'} — proceed?
                  </p>
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={handleConfirmImport}
                      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
                    >
                      Confirm import
                    </button>
                    <button
                      type="button"
                      onClick={resetCommitState}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {commitState === 'importing' && (
                <p className="text-sm text-gray-700">
                  Importing… ({importProgress}/{validation.validRows.length})
                </p>
              )}

              {commitState === 'done' && importResults && (
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Imported {importResults.succeeded.length} of {validation.validRows.length}{' '}
                    question{validation.validRows.length === 1 ? '' : 's'}.
                  </p>

                  {importResults.failed.length > 0 && (
                    <div className="mt-3 overflow-x-auto border border-red-200">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-red-50">
                          <tr>
                            <th className="whitespace-nowrap border-b border-red-200 px-3 py-2 font-medium text-gray-700">
                              Row
                            </th>
                            <th className="border-b border-red-200 px-3 py-2 font-medium text-gray-700">
                              Error
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {importResults.failed.map(({ rowNumber, error }) => (
                            <tr key={rowNumber} className="border-b border-red-100 last:border-b-0">
                              <td className="whitespace-nowrap px-3 py-2 text-gray-800">
                                {rowNumber}
                              </td>
                              <td className="px-3 py-2 text-gray-800">{error}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {importResults.succeeded.length > 0 && (
                    <p className="mt-2 text-xs text-gray-500">
                      Successful rows: {importResults.succeeded.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminUploadQuestions
