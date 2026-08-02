import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import MobileActionBar from '../components/MobileActionBar'
import LocalBusinessSchema from '../components/LocalBusinessSchema'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <LocalBusinessSchema />
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileActionBar />
    </div>
  )
}
