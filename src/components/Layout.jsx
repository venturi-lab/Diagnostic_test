function Layout({ children }) {
  return (
    <div className="flex min-h-svh flex-col bg-white">
      <header className="border-b border-gray-200 px-4 py-3">
        <span className="text-lg font-semibold text-gray-900">
          Diagnostic Test
        </span>
      </header>
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  )
}

export default Layout
