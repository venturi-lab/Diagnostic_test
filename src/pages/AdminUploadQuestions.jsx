import { useState } from 'react'
import Papa from 'papaparse'

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
  const [rows, setRows] = useState([])
  const [totalCount, setTotalCount] = useState(null)
  const [error, setError] = useState('')

  const handleFileChange = (event) => {
    setFile(event.target.files?.[0] ?? null)
    setRows([])
    setTotalCount(null)
    setError('')
  }

  const handlePreview = () => {
    if (!file) {
      setError('Choose a CSV file first.')
      return
    }

    setError('')
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(results.errors[0].message)
        }
        setRows(results.data.slice(0, PREVIEW_ROW_LIMIT))
        setTotalCount(results.data.length)
      },
      error: (parseError) => {
        setError(parseError.message)
      },
    })
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-xl font-semibold text-gray-900">Upload question bank</h1>
      <p className="mt-1 text-sm text-gray-600">
        Upload a CSV matching the question bank template. This step only previews
        the parsed data — nothing is written to the database yet.
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

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {totalCount !== null && (
        <p className="mt-4 text-sm text-gray-700">
          Parsed {totalCount} row{totalCount === 1 ? '' : 's'}
          {totalCount > PREVIEW_ROW_LIMIT ? ` — showing first ${PREVIEW_ROW_LIMIT}` : ''}.
        </p>
      )}

      {rows.length > 0 && (
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
              {rows.map((row, index) => (
                <tr key={index} className="border-b border-gray-100 last:border-b-0">
                  {COLUMNS.map((column) => (
                    <td key={column} className="whitespace-nowrap px-3 py-2 text-gray-800">
                      {row[column]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminUploadQuestions
