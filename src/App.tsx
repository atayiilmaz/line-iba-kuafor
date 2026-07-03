import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/sections/Hero'
import { About } from './components/sections/About'
import { Services } from './components/sections/Services'
import { Works } from './components/sections/Works'
import { Trust } from './components/sections/Trust'
import { Reviews } from './components/sections/Reviews'
import { Contact } from './components/sections/Contact'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Works />
        <Trust />
        <Reviews />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
