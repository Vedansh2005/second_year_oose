import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ImageCrypt from "./pages/ImageCrypt";
import ImageDecrypt from "./pages/ImageDecrypt";
import About from "./pages/About";
import "./App.css";
import "font-awesome/css/font-awesome.min.css";
// import Login from './components/Login';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeMobileMenu = () => {
    document.getElementById("burger").checked = false;
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      <div className={`modal fade ${isModalOpen ? 'show' : ''}`} 
           id="loginModal" 
           tabIndex="-1" 
           role="dialog" 
           aria-labelledby="loginModalTitle" 
           aria-hidden={!isModalOpen}
           style={{ display: isModalOpen ? 'block' : 'none' }}>
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="loginModalTitle">
                Welcome to Stegano
              </h5>
              <button
                type="button"
                className="close"
                onClick={toggleModal}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <p>Stegano is a powerful tool for hiding and extracting secret messages from images using steganography techniques.</p>
              <div className="feature-list">
                <div className="feature-item">
                  <i className="fa fa-lock"></i>
                  <span>Secure message hiding</span>
                </div>
                <div className="feature-item">
                  <i className="fa fa-image"></i>
                  <span>Support for various image formats</span>
                </div>
                <div className="feature-item">
                  <i className="fa fa-shield"></i>
                  <span>Advanced encryption</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={toggleModal}
              >
                Close
              </button>
              <button type="button" className="btn btn-primary">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
      <Router>
        <nav className="navbar">
          <Link to="/" className="BrandName">
            <i className="fa fa-shield"></i> Stegano
          </Link>
          <input id="burger" type="checkbox" />
          <label htmlFor="burger">
            <span></span>
            <span></span>
            <span></span>
          </label>
          <div className="nav">
            <ul>
              <li>
                <Link to="/" className="MenuItem" onClick={closeMobileMenu}>
                  <i className="fa fa-lock"></i> Encode
                </Link>
              </li>
              <li>
                <Link to="/decode" className="MenuItem" onClick={closeMobileMenu}>
                  <i className="fa fa-unlock"></i> Decode
                </Link>
              </li>
              <li>
                <Link to="/about" className="MenuItem" onClick={closeMobileMenu}>
                  <i className="fa fa-info-circle"></i> About
                </Link>
              </li>
              <li>
                <button
                  className="btn"
                  onClick={toggleModal}
                >
                  <i className="fa fa-rocket"></i> Get Started
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<ImageCrypt />} />
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/decode" element={<ImageDecrypt />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
