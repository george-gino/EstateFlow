import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('Properties')
        .select('*');

      if (error) {
        console.log(error.message);
      } else {
        console.log(data);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('Properties').select('*');
        if (error) {
          console.log('Failed to connect to the database:', error.message);
        } else {
          console.log('Database connected');
        }
      } catch (err) {
        console.log('Failed to connect to the database:', err.message);
      }
    };

    console.log('Attempting to connect to the database...');
    checkConnection();
  }, []);

  return (
    <div className="homepage">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="nav">
            <div className="logo">
              <h2>EstateFlow</h2>
            </div>
            <nav className="nav-links">
              <a href="#pricing">Pricing</a>
              <a href="#contact">Contact</a>
              <button className="btn btn-primary" onClick={handleGetStarted}>Get Started</button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Streamline Your Property Management</h1>
              <p className="hero-subtitle">
                Connect with tenants, manage properties, and grow your business with our comprehensive property management platform.
              </p>
              <div className="hero-buttons">
                <button className="btn btn-primary btn-large" onClick={handleGetStarted}>Start Free Trial</button>
                <button className="btn btn-secondary btn-large">Schedule Demo</button>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">10K+</span>
                  <span className="stat-label">Properties Managed</span>
                </div>
                <div className="stat">
                  <span className="stat-number">50K+</span>
                  <span className="stat-label">Happy Tenants</span>
                </div>
                <div className="stat">
                  <span className="stat-number">98%</span>
                  <span className="stat-label">Satisfaction Rate</span>
                </div>
              </div>
            </div>
            <div className="hero-image">
              <div className="dashboard-preview">
                <div className="dashboard-header">
                  <div className="dashboard-tabs">
                    <span className="tab active">Properties</span>
                    <span className="tab">Tenants</span>
                    <span className="tab">Maintenance</span>
                  </div>
                </div>
                <div className="dashboard-content">
                  <div className="property-card">
                    <div className="property-image"></div>
                    <div className="property-info">
                      <h4>Sunset Apartments</h4>
                      <p>24 units • $45,000/mo</p>
                      <div className="property-status">
                        <span className="status occupied">95% Occupied</span>
                      </div>
                    </div>
                  </div>
                  <div className="property-card">
                    <div className="property-image"></div>
                    <div className="property-info">
                      <h4>Downtown Plaza</h4>
                      <p>18 units • $38,500/mo</p>
                      <div className="property-status">
                        <span className="status occupied">89% Occupied</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2>Everything You Need to Manage Properties</h2>
            <p>Powerful tools designed specifically for property managers</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon tenant-icon"></div>
              </div>
              <h3>Tenant Management</h3>
              <p>Streamline communication, track lease agreements, and manage tenant relationships all in one place.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon maintenance-icon"></div>
              </div>
              <h3>Maintenance Tracking</h3>
              <p>Handle maintenance requests efficiently with automated workflows and real-time updates.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon payments-icon"></div>
              </div>
              <h3>Payment Processing</h3>
              <p>Collect rent online, track payments, and send automated reminders to reduce late payments.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon analytics-icon"></div>
              </div>
              <h3>Analytics & Reports</h3>
              <p>Get insights into your portfolio performance with detailed analytics and customizable reports.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Property Management?</h2>
            <p>Join thousands of property managers who trust EstateFlow to grow their business.</p>
            <button className="btn btn-primary btn-large" onClick={handleGetStarted}>Start Your Free Trial</button>
            <p className="cta-note">No credit card required • 14-day free trial</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>EstateFlow</h3>
              <p>Simplifying property management for modern landlords and property managers.</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#integrations">Integrations</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#careers">Careers</a>
                <a href="#contact">Contact</a>
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <a href="#help">Help Center</a>
                <a href="#docs">Documentation</a>
                <a href="#status">Status</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 EstateFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* TestSupabase Component */}
      <TestSupabase />
    </div>
  );
};

const TestSupabase = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('Properties')
        .select('*');

      if (error) {
        setError(error.message);
      } else {
        setData(data);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Supabase Data</h1>
      {error && <p>Error: {error}</p>}
      <ul>
        {data.map((item) => (
          <li key={item.id}>{JSON.stringify(item)}</li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage; 