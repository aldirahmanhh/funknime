import { Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Header from './components/Header'
import './App.css'
import Ongoing from './components/Ongoing'
import Completed from './components/Completed'
import DonghuaOngoing from './components/DonghuaOngoing'
import DonghuaCompleted from './components/DonghuaCompleted'
import DonghuaDetail from './components/DonghuaDetail'
import DonghuaGenres from './components/DonghuaGenres'
import DonghuaGenreFilter from './components/DonghuaGenreFilter'
import DonghuaAZList from './components/DonghuaAZList'
import DracinLatest from './components/DracinLatest'
import DracinList from './components/DracinList'
import DracinDetail from './components/DracinDetail'
import UnifiedSearch from './components/UnifiedSearch'
import AnimeDetail from './components/AnimeDetail'
import Watch from './components/Watch'
import Genres from './components/Genres'
import AZList from './components/AZList'
import Schedule from './components/Schedule'
import WatchHistory from './components/WatchHistory'
import ThemeSelector from './components/ThemeSelector'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <a href="#main-content" className="skip-link">Lewati ke konten</a>
      <div className="app">
        <div className="floating-shapes" aria-hidden="true">
          <div className="floating-shape floating-shape--1"></div>
          <div className="floating-shape floating-shape--2"></div>
          <div className="floating-shape floating-shape--3"></div>
        </div>
        <Header />
        <ThemeSelector />
        <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ongoing" element={<Ongoing />} />
          <Route path="/completed" element={<Completed />} />
          <Route path="/donghua-ongoing" element={<DonghuaOngoing />} />
          <Route path="/donghua-completed" element={<DonghuaCompleted />} />
          <Route path="/donghua-genres" element={<DonghuaGenres />} />
          <Route path="/donghua-genre/:slug" element={<DonghuaGenreFilter />} />
          <Route path="/donghua-az" element={<DonghuaAZList />} />
          <Route path="/donghua/:slug" element={<DonghuaDetail />} />
          <Route path="/dracin-latest" element={<DracinLatest />} />
          <Route path="/dracin-list" element={<DracinList />} />
          <Route path="/dracin/:slug" element={<DracinDetail />} />
          <Route path="/genres" element={<Genres />} />
          <Route path="/az-list" element={<AZList />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/history" element={<WatchHistory />} />
          <Route path="/search" element={<UnifiedSearch />} />
          <Route path="/anime/:animeId" element={<AnimeDetail />} />
          <Route path="/anime/:provider/:animeId" element={<AnimeDetail />} />
          <Route path="/watch/:episodeId" element={<Watch />} />
        </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App