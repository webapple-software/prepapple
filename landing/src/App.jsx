import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Category from './pages/Category';
import Instructions from './pages/Instructions';
import TestAttempt from './pages/TestAttempt';
import ContactUs from './pages/ContactUs';
import FAQs from './pages/FAQs';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import About from './pages/About';
import MySubscription from './pages/MySubscription';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:categoryId" element={<Category />} />
            <Route path="/category/:categoryId/:subcategoryId" element={<Category />} />
            <Route path="/test/:id/instructions" element={<Instructions />} />
            <Route path="/test/:id/attempt" element={<TestAttempt />} />
            <Route path="/about" element={<About />} />
            <Route path="/my-subscription" element={<MySubscription />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* Other routes will go here later */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
