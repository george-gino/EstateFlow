import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import PropertyModal from './PropertyModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [properties, setProperties] = useState([]);

  // Calculate dynamic stats from actual properties
  const totalProperties = properties.length;
  const totalUnits = properties.reduce((sum, property) => sum + property.numUnits, 0);
  const occupiedUnits = properties.reduce((sum, property) => 
    sum + property.units.filter(unit => unit.tenant !== null).length, 0
  );
  const totalRevenue = properties.reduce((sum, property) => 
    sum + property.units.reduce((unitSum, unit) => unitSum + (parseInt(unit.rent) || 0), 0), 0
  );
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits * 100).toFixed(1) : 0;

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

  const handleDeleteProperty = (propertyId, propertyName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${propertyName}"?\n\nThis action cannot be undone and will remove all associated units and tenant information.`
    );
    
    if (confirmed) {
      setProperties(prev => prev.filter(property => property.id !== propertyId));
      console.log('Property deleted:', propertyId);
      
      // You can add additional logic here like calling a backend API to delete
    }
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-logo">EstateFlow</h2>
          <p className="sidebar-user">Property Manager</p>
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
                    <h3>{totalProperties}</h3>
                    <p>Total Properties</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon tenants">👥</div>
                  <div className="stat-info">
                    <h3>{totalUnits}</h3>
                    <p>Total Units</p>
                    {occupiedUnits > 0 && <span className="stat-change positive">{occupiedUnits} occupied</span>}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon revenue">💰</div>
                  <div className="stat-info">
                    <h3>${totalRevenue.toLocaleString()}</h3>
                    <p>Monthly Revenue</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon occupancy">📊</div>
                  <div className="stat-info">
                    <h3>{occupancyRate}%</h3>
                    <p>Occupancy Rate</p>
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
                            <div className="property-actions">
                              <div className="property-status">
                                <span className="status-badge success">Active</span>
                              </div>
                              <button 
                                className="btn-delete" 
                                onClick={() => handleDeleteProperty(property.id, property.name)}
                                title="Delete Property"
                              >
                                🗑️
                              </button>
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
                    <h3>Property Insights</h3>
                    <button className="btn btn-small">View Details</button>
                  </div>
                  <div className="card-content">
                    {properties.length > 0 ? (
                      <div className="insights-list">
                        <div className="insight-item">
                          <div className="insight-icon">📊</div>
                          <div className="insight-details">
                            <p><strong>Portfolio Overview</strong></p>
                            <span className="insight-description">{totalProperties} properties with {totalUnits} total units</span>
                          </div>
                        </div>
                        
                        {occupancyRate > 0 && (
                          <div className="insight-item">
                            <div className="insight-icon">🏠</div>
                            <div className="insight-details">
                              <p><strong>Occupancy Status</strong></p>
                              <span className="insight-description">{occupiedUnits} of {totalUnits} units occupied ({occupancyRate}%)</span>
                            </div>
                          </div>
                        )}
                        
                        {totalRevenue > 0 && (
                          <div className="insight-item">
                            <div className="insight-icon">💰</div>
                            <div className="insight-details">
                              <p><strong>Revenue Stream</strong></p>
                              <span className="insight-description">${totalRevenue.toLocaleString()} monthly income potential</span>
                            </div>
                          </div>
                        )}
                        
                        {properties.length > 0 && (
                          <div className="insight-item">
                            <div className="insight-icon">📈</div>
                            <div className="insight-details">
                              <p><strong>Portfolio Growth</strong></p>
                              <span className="insight-description">Recently added: {properties[properties.length - 1]?.name || 'No properties yet'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="empty-insights">
                        <div className="empty-icon">📊</div>
                        <h4>No insights yet</h4>
                        <p>Add your first property to see portfolio insights and analytics</p>
                      </div>
                    )}
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