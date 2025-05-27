import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import PropertyModal from './PropertyModal';
import CSVUpload from './CSVUpload';
import Chatbot from './Chatbot';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isCSVUploadOpen, setIsCSVUploadOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [editingProperty, setEditingProperty] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [expandedProperties, setExpandedProperties] = useState(new Set());
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Load dark mode preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('estateflow-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldUseDark);
    document.documentElement.setAttribute('data-theme', shouldUseDark ? 'dark' : 'light');
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    const themeValue = newTheme ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', themeValue);
    localStorage.setItem('estateflow-theme', themeValue);
  };

  // Calculate dynamic stats from actual properties
  const totalProperties = properties.length;
  const totalUnits = properties.reduce((sum, property) => sum + property.numUnits, 0);
  const occupiedUnits = properties.reduce((sum, property) => 
    sum + property.units.filter(unit => unit.tenant !== null).length, 0
  );
  const totalRevenue = properties.reduce((sum, property) => 
    sum + property.units.reduce((unitSum, unit) => unitSum + (parseFloat(unit.rent) || 0), 0), 0
  );
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits * 100).toFixed(1) : 0;

  const handleLogout = () => {
    navigate('/');
  };

  const handleOpenPropertyModal = () => {
    setEditingProperty(null);
    setIsPropertyModalOpen(true);
  };

  const handleClosePropertyModal = () => {
    setIsPropertyModalOpen(false);
    setEditingProperty(null);
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setIsPropertyModalOpen(true);
  };

  const handleSaveProperty = (propertyData) => {
    if (editingProperty) {
      // Update existing property
      const updatedProperty = {
        ...editingProperty,
        ...propertyData,
        id: editingProperty.id, // Keep the original ID
        createdAt: editingProperty.createdAt, // Keep original creation date
        updatedAt: new Date().toISOString() // Add update timestamp
      };
      
      setProperties(prev => prev.map(property => 
        property.id === editingProperty.id ? updatedProperty : property
      ));
      console.log('Property updated:', updatedProperty);
    } else {
      // Add new property
      const newProperty = {
        id: Date.now(),
        ...propertyData,
        createdAt: new Date().toISOString()
      };
      
      setProperties(prev => [...prev, newProperty]);
      console.log('New property added:', newProperty);
    }
    
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

  const handleOpenCSVUpload = () => {
    setIsCSVUploadOpen(true);
  };

  const handleCloseCSVUpload = () => {
    setIsCSVUploadOpen(false);
  };

  const handleCSVDataParsed = (parsedProperties) => {
    // Add the parsed properties to existing properties
    setProperties(prev => [...prev, ...parsedProperties]);
    console.log('CSV data imported:', parsedProperties);
    
    // Calculate import statistics
    const totalUnitsImported = parsedProperties.reduce((sum, prop) => sum + prop.units.length, 0);
    const totalTenantsImported = parsedProperties.reduce((sum, prop) => 
      sum + prop.units.filter(unit => unit.tenant && unit.tenant.name).length, 0
    );
    
    // Show detailed success message
    let message = `Successfully imported ${parsedProperties.length} properties with ${totalUnitsImported} units!`;
    if (totalTenantsImported > 0) {
      message += `\n${totalTenantsImported} tenants were also imported and can be viewed in the Tenants tab.`;
    }
    
    alert(message);
  };

  const togglePropertyExpansion = (propertyId) => {
    const newExpanded = new Set(expandedProperties);
    if (newExpanded.has(propertyId)) {
      newExpanded.delete(propertyId);
      // Clear selected unit if property is being collapsed
      if (selectedUnit && selectedUnit.propertyId === propertyId) {
        setSelectedUnit(null);
      }
    } else {
      newExpanded.add(propertyId);
    }
    setExpandedProperties(newExpanded);
  };

  const handleUnitClick = (unit, property) => {
    setSelectedUnit({
      ...unit,
      propertyId: property.id,
      propertyName: property.name,
      propertyAddress: property.address
    });
  };

  const closeUnitDetails = () => {
    setSelectedUnit(null);
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
            <h3 className="nav-section-title">AI Assistant</h3>
            <button 
              className={`nav-item ${isChatbotOpen ? 'active' : ''}`}
              onClick={() => setIsChatbotOpen(!isChatbotOpen)}
            >
              <span className="nav-icon">🤖</span>
              <span>Chatbot</span>
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
              <button className="btn btn-secondary" onClick={handleOpenCSVUpload}>
                <span>📁</span>
                Import CSV
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
                                ${property.units.reduce((total, unit) => total + (parseFloat(unit.rent) || 0), 0).toLocaleString()}/mo
                              </span>
                            </div>
                            <div className="property-actions">
                              <div className="property-status">
                                <span className="status-badge success">Active</span>
                              </div>
                              <div className="property-buttons">
                                <button 
                                  className="btn-edit" 
                                  onClick={() => handleEditProperty(property)}
                                  title="Edit Property"
                                >
                                  ✏️
                                </button>
                                <button 
                                  className="btn-delete" 
                                  onClick={() => handleDeleteProperty(property.id, property.name)}
                                  title="Delete Property"
                                >
                                  🗑️
                                </button>
                              </div>
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
              {activeTab === 'properties' && (
                <div className="properties-page">
                  <div className="page-header">
                    <div className="page-title">
                      <h2>Properties & Units</h2>
                      <p>Manage all your properties and units in one place</p>
                    </div>
                    <button className="btn btn-primary" onClick={handleOpenPropertyModal}>
                      <span>➕</span>
                      Add Property
                    </button>
                  </div>
                  
                  {properties.length > 0 ? (
                    <div className="properties-expandable-list">
                      {properties.map((property) => (
                        <div key={property.id} className="property-expandable-card">
                          {/* Property Header */}
                          <div 
                            className="property-expandable-header"
                            onClick={() => togglePropertyExpansion(property.id)}
                          >
                            <div className="property-expand-indicator">
                              <span className={`expand-arrow ${expandedProperties.has(property.id) ? 'expanded' : ''}`}>
                                ▶
                              </span>
                            </div>
                            <div className="property-image-medium"></div>
                            <div className="property-summary">
                              <h3>{property.name}</h3>
                              <p className="property-address">{property.address}</p>
                              <div className="property-quick-stats">
                                <span className="quick-stat">{property.numUnits} Units</span>
                                <span className="quick-stat">{property.units.filter(unit => unit.tenant).length} Occupied</span>
                                <span className="quick-stat revenue">${property.units.reduce((total, unit) => total + (parseFloat(unit.rent) || 0), 0).toLocaleString()}/mo</span>
                              </div>
                            </div>
                            <div className="property-actions" onClick={(e) => e.stopPropagation()}>
                              <button 
                                className="btn-icon" 
                                onClick={() => handleEditProperty(property)}
                                title="Edit Property"
                              >
                                ✏️
                              </button>
                              <button 
                                className="btn-icon btn-danger" 
                                onClick={() => handleDeleteProperty(property.id, property.name)}
                                title="Delete Property"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          
                          {/* Expandable Units Section */}
                          {expandedProperties.has(property.id) && (
                            <div className="property-units-expanded">
                              <div className="units-grid">
                                {property.units.map((unit) => (
                                  <div 
                                    key={unit.id} 
                                    className={`unit-card ${selectedUnit?.id === unit.id ? 'selected' : ''}`}
                                    onClick={() => handleUnitClick(unit, property)}
                                  >
                                    <div className="unit-card-header">
                                      <div className="unit-number-large">#{unit.number}</div>
                                      <div className="unit-status-indicator">
                                        {unit.tenant ? (
                                          <span className="status-occupied-dot">●</span>
                                        ) : (
                                          <span className="status-vacant-dot">●</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="unit-card-body">
                                      <div className="unit-specs">
                                        <span>{unit.bedrooms}BR • {unit.bathrooms}BA</span>
                                        {unit.squareFeet && <span>{unit.squareFeet} sq ft</span>}
                                      </div>
                                      <div className="unit-rent-display">${unit.rent}/mo</div>
                                      <div className="unit-tenant-preview">
                                        {unit.tenant ? (
                                          <span className="tenant-name-preview">{unit.tenant.name}</span>
                                        ) : (
                                          <span className="vacant-preview">Vacant</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state-large">
                      <div className="empty-icon">🏢</div>
                      <h3>No Properties Yet</h3>
                      <p>Start building your property portfolio by adding your first property</p>
                      <button className="btn btn-primary" onClick={handleOpenPropertyModal}>
                        <span>➕</span>
                        Add Your First Property
                      </button>
                    </div>
                  )}
                  
                  {/* Unit Details Panel */}
                  {selectedUnit && (
                    <div className="unit-details-panel">
                      <div className="unit-details-overlay" onClick={closeUnitDetails}></div>
                      <div className="unit-details-content">
                        <div className="unit-details-header">
                          <h3>Unit #{selectedUnit.number} Details</h3>
                          <button className="btn-close" onClick={closeUnitDetails}>×</button>
                        </div>
                        <div className="unit-details-body">
                          <div className="unit-property-info">
                            <h4>📍 {selectedUnit.propertyName}</h4>
                            <p>{selectedUnit.propertyAddress}</p>
                          </div>
                          
                          <div className="unit-specifications">
                            <h4>Unit Specifications</h4>
                            <div className="spec-grid">
                              <div className="spec-item">
                                <label>Bedrooms</label>
                                <span>{selectedUnit.bedrooms}</span>
                              </div>
                              <div className="spec-item">
                                <label>Bathrooms</label>
                                <span>{selectedUnit.bathrooms}</span>
                              </div>
                              <div className="spec-item">
                                <label>Square Feet</label>
                                <span>{selectedUnit.squareFeet || 'Not specified'}</span>
                              </div>
                              <div className="spec-item">
                                <label>Monthly Rent</label>
                                <span className="rent-highlight">${selectedUnit.rent}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="unit-tenant-info">
                            <h4>Tenant Information</h4>
                            {selectedUnit.tenant ? (
                              <div className="tenant-details">
                                <div className="tenant-avatar-large">
                                  <span>{selectedUnit.tenant.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="tenant-info-detailed">
                                  <h5>{selectedUnit.tenant.name}</h5>
                                  <div className="tenant-contact-details">
                                    {selectedUnit.tenant.email && (
                                      <div className="contact-item">
                                        <span className="contact-icon">📧</span>
                                        <span>{selectedUnit.tenant.email}</span>
                                      </div>
                                    )}
                                    {selectedUnit.tenant.phone && (
                                      <div className="contact-item">
                                        <span className="contact-icon">📞</span>
                                        <span>{selectedUnit.tenant.phone}</span>
                                      </div>
                                    )}
                                  </div>
                                  {selectedUnit.tenant.leaseStart && selectedUnit.tenant.leaseEnd && (
                                    <div className="lease-info">
                                      <div className="lease-dates">
                                        <span className="lease-icon">📅</span>
                                        <span>
                                          {new Date(selectedUnit.tenant.leaseStart).toLocaleDateString()} - 
                                          {new Date(selectedUnit.tenant.leaseEnd).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="vacant-unit-info">
                                <div className="vacant-icon">🏠</div>
                                <p>This unit is currently vacant</p>
                                <button className="btn btn-secondary">
                                  <span>👤</span>
                                  Add Tenant
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="settings-page">
                  <div className="page-header">
                    <div className="page-title">
                      <h2>Settings</h2>
                      <p>Customize your EstateFlow experience</p>
                    </div>
                  </div>
                  
                  <div className="settings-content">
                    {/* Appearance Settings */}
                    <div className="settings-section">
                      <div className="settings-card">
                        <div className="settings-card-header">
                          <div className="settings-icon">🎨</div>
                          <div className="settings-info">
                            <h3>Appearance</h3>
                            <p>Customize the look and feel of your dashboard</p>
                          </div>
                        </div>
                        
                        <div className="settings-card-content">
                          <div className="setting-item">
                            <div className="setting-details">
                              <h4>Theme</h4>
                              <p>Choose between light and dark mode</p>
                            </div>
                            <div className="setting-control">
                              <div className="theme-toggle">
                                <button 
                                  className={`theme-option ${!isDarkMode ? 'active' : ''}`}
                                  onClick={() => isDarkMode && toggleDarkMode()}
                                >
                                  <span>☀️</span>
                                  Light
                                </button>
                                <button 
                                  className={`theme-option ${isDarkMode ? 'active' : ''}`}
                                  onClick={() => !isDarkMode && toggleDarkMode()}
                                >
                                  <span>🌙</span>
                                  Dark
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* System Settings */}
                    <div className="settings-section">
                      <div className="settings-card">
                        <div className="settings-card-header">
                          <div className="settings-icon">⚙️</div>
                          <div className="settings-info">
                            <h3>System</h3>
                            <p>General application settings</p>
                          </div>
                        </div>
                        
                        <div className="settings-card-content">
                          <div className="setting-item">
                            <div className="setting-details">
                              <h4>Data Storage</h4>
                              <p>All data is stored locally in your browser</p>
                            </div>
                            <div className="setting-control">
                              <button className="btn btn-secondary">
                                <span>💾</span>
                                Export Data
                              </button>
                            </div>
                          </div>
                          
                          <div className="setting-item">
                            <div className="setting-details">
                              <h4>Reset Application</h4>
                              <p>Clear all properties and return to initial state</p>
                            </div>
                            <div className="setting-control">
                              <button className="btn btn-danger">
                                <span>🗑️</span>
                                Reset All Data
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Account Settings */}
                    <div className="settings-section">
                      <div className="settings-card">
                        <div className="settings-card-header">
                          <div className="settings-icon">👤</div>
                          <div className="settings-info">
                            <h3>Account</h3>
                            <p>Manage your account preferences</p>
                          </div>
                        </div>
                        
                        <div className="settings-card-content">
                          <div className="setting-item">
                            <div className="setting-details">
                              <h4>Profile</h4>
                              <p>Update your profile information</p>
                            </div>
                            <div className="setting-control">
                              <span className="setting-value">Property Manager</span>
                            </div>
                          </div>
                          
                          <div className="setting-item">
                            <div className="setting-details">
                              <h4>Version</h4>
                              <p>EstateFlow application version</p>
                            </div>
                            <div className="setting-control">
                              <span className="setting-value">v1.0.0</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!['properties', 'settings'].includes(activeTab) && (
                <div className="coming-soon">
                  <div className="coming-soon-icon">🚧</div>
                  <h2>Coming Soon</h2>
                  <p>The {activeTab} section is currently under development.</p>
                  <p>This will include comprehensive tools for managing your {activeTab}.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Property Modal */}
      <PropertyModal 
        isOpen={isPropertyModalOpen}
        onClose={handleClosePropertyModal}
        onSave={handleSaveProperty}
        editingProperty={editingProperty}
      />

      {/* CSV Upload Modal */}
      <CSVUpload 
        isOpen={isCSVUploadOpen}
        onClose={handleCloseCSVUpload}
        onDataParsed={handleCSVDataParsed}
      />

      {/* Chatbot Component */}
      <Chatbot 
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        properties={properties}
      />
    </div>
  );
};

export default Dashboard; 