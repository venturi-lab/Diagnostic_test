import Layout from './components/Layout'
import Home from './pages/Home'
import AdminUploadQuestions from './pages/AdminUploadQuestions'

function App() {
  const isAdminUpload = window.location.pathname === '/admin/upload-questions'

  return <Layout>{isAdminUpload ? <AdminUploadQuestions /> : <Home />}</Layout>
}

export default App
