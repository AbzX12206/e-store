import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ConfiguratorPage from './pages/ConfiguratorPage'
import ReviewsPage from './pages/ReviewsPage'
import { useAppStore } from './store/appStore'

function App() {
  const { theme } = useAppStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/customize/:productId" element={<ConfiguratorPage />} />
      <Route path="/reviews" element={<ReviewsPage />} />
    </Routes>
  )
}

export default App
