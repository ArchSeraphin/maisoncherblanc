import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Services from './pages/Services.jsx';
import Blog from './pages/Blog.jsx';
import BlogPost from './pages/BlogPost.jsx';
import Contact from './pages/Contact.jsx';
import Legal from './pages/Legal.jsx';
import NotFound from './pages/NotFound.jsx';
import Login from './pages/admin/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import ArticlesEditor from './pages/admin/ArticlesEditor.jsx';

// Schéma LocalBusiness global
const LOCAL_BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FoodEstablishment',
  name: 'Maison Cherblanc',
  description: 'Traiteur artisanal, boucherie et charcuterie à Roanne. Spécialiste des mariages, cocktails dinatoires et événements en Loire et Rhône-Alpes.',
  url: 'https://maisoncherblanc.fr',
  telephone: '+33000000000',
  email: 'contact@maisoncherblanc.fr',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Roanne',
    addressRegion: 'Rhône-Alpes',
    addressCountry: 'FR',
    postalCode: '42300',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 46.035,
    longitude: 4.069,
  },
  areaServed: ['Roanne', 'Loire', 'Rhône-Alpes'],
  priceRange: '€€',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '18:00',
    },
  ],
  image: 'https://maisoncherblanc.fr/img/buffet-cocktail-traiteur-roanne-maison-cherblanc.jpg',
  logo: 'https://maisoncherblanc.fr/logo/logo-marron.png',
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}

function AdminLayout({ children }) {
  return <>{children}</>;
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          {/* Schema.org global */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_SCHEMA) }}
          />
          <Routes>
            {/* Public */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/a-propos" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
            <Route path="/actualites" element={<PublicLayout><Blog /></PublicLayout>} />
            <Route path="/actualites/:slug" element={<PublicLayout><BlogPost /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/mentions-legales" element={<PublicLayout><Legal /></PublicLayout>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminLayout><Login /></AdminLayout>} />
            <Route path="/admin/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
            <Route path="/admin/articles" element={<AdminLayout><ArticlesEditor /></AdminLayout>} />
            <Route path="/admin/articles/:id" element={<AdminLayout><ArticlesEditor /></AdminLayout>} />

            {/* 404 */}
            <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}
