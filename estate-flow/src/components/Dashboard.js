import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import PropertyModal from './PropertyModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [properties, setProperties] = useState([]);

  const handleLogout = () => {
    navigate('/');
  };

  const handleOpenPropertyModal = () => {
    setIsPropertyModalOpen(true);
  };

  const handleClosePropertyModal = () => {
    setIsPropertyModalOpen(false);
  };

  const handleSaveProperty = (propertyData) => {
    // Add the new property to the properties list
    const newProperty = {
      id: Date.now(),
      ...propertyData,
      createdAt: new Date().toISOString()
    };
    
    setProperties(prev => [...prev, newProperty]);
    console.log('New property added:', newProperty);
    
    // You can add additional logic here like saving to a backend API
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-logo">EstateFlow</h2>
          <p className="sidebar-user">Welcome back, John</p>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-section-title">Main</h3>
            <button 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="nav-icon">📊</span>
              <span>Overview</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'properties' ? 'active' : ''}`}
              onClick={() => setActiveTab('properties')}
            >
              <span className="nav-icon">🏢</span>
              <span>Properties</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'tenants' ? 'active' : ''}`}
              onClick={() => setActiveTab('tenants')}
            >
              <span className="nav-icon">👥</span>
              <span>Tenants</span>
            </button>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">Management</h3>
            <button 
              className={`nav-item ${activeTab === 'maintenance' ? 'active' : ''}`}
              onClick={() => setActiveTab('maintenance')}
            >
              <span className="nav-icon">🔧</span>
              <span>Maintenance</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              <span className="nav-icon">💳</span>
              <span>Payments</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <span className="nav-icon">📈</span>
              <span>Reports</span>
            </button>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">Settings</h3>
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <span className="nav-icon">⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span>Back to Home</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-title">
              <h1>Property Management Dashboard</h1>
              <p>Manage your properties and tenants efficiently</p>
            </div>
            <div className="header-actions">
              <button className="btn btn-secondary">
                <span>📋</span>
                Quick Actions
              </button>
              <button className="btn btn-primary" onClick={handleOpenPropertyModal}>
                <span>➕</span>
                Add Property
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="tab-content">
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon properties">🏢</div>
                  <div className="stat-info">
                    <h3>12</h3>
                    <p>Total Properties</p>
                    <span className="stat-change positive">+2 this month</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon tenants">👥</div>
                  <div className="stat-info">
                    <h3>248</h3>
                    <p>Active Tenants</p>
                    <span className="stat-change positive">+12 this month</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon revenue">💰</div>
                  <div className="stat-info">
                    <h3>$156,780</h3>
                    <p>Monthly Revenue</p>
                    <span className="stat-change positive">+8.5% vs last month</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon occupancy">📊</div>
                  <div className="stat-info">
                    <h3>94.2%</h3>
                    <p>Occupancy Rate</p>
                    <span className="stat-change positive">+2.1% vs last month</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity & Quick Actions */}
              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3>Your Properties</h3>
                    <button className="btn btn-small" onClick={handleOpenPropertyModal}>Add New</button>
                  </div>
                  <div className="card-content">
                    <div className="property-list">
                      {properties.length > 0 ? (
                        properties.map((property) => (
                          <div key={property.id} className="property-item">
                            <div className="property-image-small"></div>
                            <div className="property-details">
                              <h4>{property.name}</h4>
                              <p>{property.numUnits} units • {property.address}</p>
                              <span className="revenue">
                                ${property.units.reduce((total, unit) => total + (parseInt(unit.rent) || 0), 0).toLocaleString()}/mo
                              </span>
                            </div>
                            <div className="property-status">
                              <span className="status-badge success">Active</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-state">
                          <div className="empty-icon">🏢</div>
                          <h4>No properties yet</h4>
                          <p>Click "Add Property" to get started</p>
                          <button className="btn btn-primary" onClick={handleOpenPropertyModal}>
                            <span>➕</span>
                            Add Your First Property
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="card-header">
                    <h3>Recent Activity</h3>
                    <button className="btn btn-small">View All</button>
                  </div>
                  <div className="card-content">
                    <div className="activity-list">
                      <div className="activity-item">
                        <div className="activity-icon maintenance">🔧</div>
                        <div className="activity-details">
                          <p><strong>Maintenance request</strong> - Unit 4B heating issue</p>
                          <span className="activity-time">2 hours ago</span>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon payment">💳</div>
                        <div className="activity-details">
                          <p><strong>Payment received</strong> - Sarah Johnson ($2,100)</p>
                          <span className="activity-time">4 hours ago</span>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon tenant">👤</div>
                        <div className="activity-details">
                          <p><strong>New tenant</strong> - Michael Brown signed lease</p>
                          <span className="activity-time">1 day ago</span>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon property">🏢</div>
                        <div className="activity-details">
                          <p><strong>Property updated</strong> - Oak Street Complex photos</p>
                          <span className="activity-time">2 days ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'overview' && (
            <div className="tab-content">
              <div className="coming-soon">
                <div className="coming-soon-icon">🚧</div>
                <h2>Coming Soon</h2>
                <p>The {activeTab} section is currently under development.</p>
                <p>This will include comprehensive tools for managing your {activeTab}.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Property Modal */}
      <PropertyModal 
        isOpen={isPropertyModalOpen}
        onClose={handleClosePropertyModal}
        onSave={handleSaveProperty}
      />
    </div>
  );
};

export default Dashboard; 