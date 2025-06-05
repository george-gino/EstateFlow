import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdDashboard, 
  MdBusiness, 
  MdSmartToy, 
  MdSettings, 
  MdEdit, 
  MdDelete, 
  MdEmail, 
  MdPhone, 
  MdCalendarToday, 
  MdHome, 
  MdPerson, 
  MdBarChart, 
  MdLogout, 
  MdSave, 
  MdWbSunny, 
  MdAdd,
  MdBuild,
  MdPayment,
  MdTrendingUp,
  MdFolder,
  MdNightlight,
  MdPalette,
  MdAccountCircle,
  MdConstruction,
  MdNightsStay,
  MdGroup,
  MdAttachMoney
} from 'react-icons/md';
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

  const handleOpenCSVUpload = () => {
    setIsCSVUploadOpen(true);
  };

  const handleCloseCSVUpload = () => {
    setIsCSVUploadOpen(false);
  };

  const handleCSVDataParsed = (parsedData) => {
    console.log('CSV data parsed:', parsedData);
    setProperties(prev => [...prev, ...parsedData]);
    setIsCSVUploadOpen(false);
  };

  const handleClosePropertyModal = () => {
    setIsPropertyModalOpen(false);
    setEditingProperty(null);
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setIsPropertyModalOpen(true);
  };

  const handleDeleteProperty = (propertyId, propertyName) => {
    if (window.confirm(`Are you sure you want to delete "${propertyName}"? This action cannot be undone.`)) {
      setProperties(prev => prev.filter(property => property.id !== propertyId));
    }
  };

  const handleSaveProperty = (propertyData) => {
    if (editingProperty) {
      const updatedProperty = {
        ...editingProperty,
        ...propertyData,
        id: editingProperty.id,
        createdAt: editingProperty.createdAt,
        updatedAt: new Date().toISOString()
      };
      
      setProperties(prev => prev.map(property => 
        property.id === editingProperty.id ? updatedProperty : property
      ));
    } else {
      const newProperty = {
        id: Date.now(),
        ...propertyData,
        createdAt: new Date().toISOString()
      };
      
      setProperties(prev => [...prev, newProperty]);
    }
  };

  const togglePropertyExpansion = (propertyId) => {
    setExpandedProperties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  };

  const handleUnitClick = (unit, property) => {
    setSelectedUnit({ ...unit, property });
  };

  const closeUnitDetails = () => {
    setSelectedUnit(null);
  };

  return (
    <div className="dashboard">
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
              <MdBarChart className="nav-icon" />
              <span>Overview</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'properties' ? 'active' : ''}`}
              onClick={() => setActiveTab('properties')}
            >
              <MdBusiness className="nav-icon" />
              <span>Properties</span>
            </button>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">Management</h3>
            <button 
              className={`nav-item ${activeTab === 'maintenance' ? 'active' : ''}`}
              onClick={() => setActiveTab('maintenance')}
            >
              <MdBuild className="nav-icon" />
              <span>Maintenance</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              <MdPayment className="nav-icon" />
              <span>Payments</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <MdTrendingUp className="nav-icon" />
              <span>Reports</span>
            </button>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">AI Assistant</h3>
            <button 
              className={`nav-item ${isChatbotOpen ? 'active' : ''}`}
              onClick={() => setIsChatbotOpen(!isChatbotOpen)}
            >
              <MdSmartToy className="nav-icon" />
              <span>Chatbot</span>
            </button>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">Settings</h3>
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <MdSettings className="nav-icon" />
              <span>Settings</span>
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <MdLogout className="nav-icon" />
            <span>Back to Home</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-title">
              <h1>Property Management Dashboard</h1>
              <p>Manage your properties and tenants efficiently</p>
            </div>
            <div className="header-actions">
              <button className="btn btn-secondary" onClick={handleOpenCSVUpload}>
                <MdFolder style={{ marginRight: '8px' }} />
                Import CSV
              </button>
              <button className="btn btn-primary" onClick={handleOpenPropertyModal}>
                <MdAdd style={{ marginRight: '8px' }} />
                Add Property
              </button>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="tab-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon properties"><MdBusiness /></div>
                  <div className="stat-info">
                    <h3>{totalProperties}</h3>
                    <p>Total Properties</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon tenants"><MdGroup /></div>
                  <div className="stat-info">
                    <h3>{totalUnits}</h3>
                    <p>Total Units</p>
                    {occupiedUnits > 0 && <span className="stat-change positive">{occupiedUnits} occupied</span>}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon revenue"><MdAttachMoney /></div>
                  <div className="stat-info">
                    <h3>${totalRevenue.toLocaleString()}</h3>
                    <p>Monthly Revenue</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon occupancy"><MdBarChart /></div>
                  <div className="stat-info">
                    <h3>{occupancyRate}%</h3>
                    <p>Occupancy Rate</p>
                  </div>
                </div>
              </div>

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
                                  <MdEdit />
                                </button>
                                <button 
                                  className="btn-delete" 
                                  onClick={() => handleDeleteProperty(property.id, property.name)}
                                  title="Delete Property"
                                >
                                  <MdDelete />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-state">
                          <div className="empty-icon"><MdBusiness /></div>
                          <h4>No properties yet</h4>
                          <p>Click "Add Property" to get started</p>
                          <button className="btn btn-primary" onClick={handleOpenPropertyModal}>
                            <MdAdd style={{ marginRight: '8px' }} />
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
                          <div className="insight-icon"><MdBarChart /></div>
                          <div className="insight-details">
                            <p><strong>Portfolio Overview</strong></p>
                            <span className="insight-description">{totalProperties} properties with {totalUnits} total units</span>
                          </div>
                        </div>
                        
                        {occupancyRate > 0 && (
                          <div className="insight-item">
                            <div className="insight-icon"><MdHome /></div>
                            <div className="insight-details">
                              <p><strong>Occupancy Status</strong></p>
                              <span className="insight-description">{occupiedUnits} of {totalUnits} units occupied ({occupancyRate}%)</span>
                            </div>
                          </div>
                        )}
                        
                        {totalRevenue > 0 && (
                          <div className="insight-item">
                            <div className="insight-icon"><MdAttachMoney /></div>
                            <div className="insight-details">
                              <p><strong>Revenue Stream</strong></p>
                              <span className="insight-description">${totalRevenue.toLocaleString()} monthly income potential</span>
                            </div>
                          </div>
                        )}
                        
                        {properties.length > 0 && (
                          <div className="insight-item">
                            <div className="insight-icon"><MdTrendingUp /></div>
                            <div className="insight-details">
                              <p><strong>Portfolio Growth</strong></p>
                              <span className="insight-description">Recently added: {properties[properties.length - 1]?.name || 'No properties yet'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="empty-insights">
                        <div className="empty-icon"><MdBarChart /></div>
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
                      <MdAdd style={{ marginRight: '8px' }} />
                      Add Property
                    </button>
                  </div>
                  
                  {properties.length > 0 ? (
                    <div className="properties-expandable-list">
                      {properties.map((property) => (
                        <div key={property.id} className="property-expandable-card">
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
                                <MdEdit />
                              </button>
                              <button 
                                className="btn-icon btn-danger" 
                                onClick={() => handleDeleteProperty(property.id, property.name)}
                                title="Delete Property"
                              >
                                <MdDelete />
                              </button>
                            </div>
                          </div>
                          
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
                                    <div className="unit-details-preview">
                                      <p className="unit-specs">{unit.bedrooms}BR • {unit.bathrooms}BA</p>
                                      <p className="unit-rent">${(unit.rent || 0).toLocaleString()}/mo</p>
                                      <p className="unit-tenant-status">
                                        {unit.tenant ? unit.tenant.name : 'Vacant'}
                                      </p>
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
                      <div className="empty-icon"><MdBusiness /></div>
                      <h3>No Properties Yet</h3>
                      <p>Start building your property portfolio by adding your first property</p>
                      <button className="btn btn-primary" onClick={handleOpenPropertyModal}>
                        <MdAdd style={{ marginRight: '8px' }} />
                        Add Your First Property
                      </button>
                    </div>
                  )}
                  
                  {selectedUnit && (
                    <div className="unit-details-panel">
                      <div className="unit-details-overlay" onClick={closeUnitDetails}></div>
                      <div className="unit-details-content">
                        <div className="unit-details-header">
                          <h3>Unit #{selectedUnit.number}</h3>
                          <button className="close-unit-details" onClick={closeUnitDetails}>×</button>
                        </div>
                        
                        <div className="unit-details-body">
                          <div className="unit-specs-detailed">
                            <div className="spec-item">
                              <span className="spec-label">Bedrooms:</span>
                              <span className="spec-value">{selectedUnit.bedrooms}</span>
                            </div>
                            <div className="spec-item">
                              <span className="spec-label">Bathrooms:</span>
                              <span className="spec-value">{selectedUnit.bathrooms}</span>
                            </div>
                            <div className="spec-item">
                              <span className="spec-label">Square Feet:</span>
                              <span className="spec-value">{selectedUnit.squareFeet} sq ft</span>
                            </div>
                            <div className="spec-item">
                              <span className="spec-label">Monthly Rent:</span>
                              <span className="spec-value rent-amount">${(selectedUnit.rent || 0).toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <div className="tenant-section">
                            <h4>Tenant Information</h4>
                            {selectedUnit.tenant ? (
                              <div className="tenant-info-card">
                                <div className="tenant-info-detailed">
                                  <h5>{selectedUnit.tenant.name}</h5>
                                  <div className="tenant-contact-details">
                                    {selectedUnit.tenant.email && (
                                      <div className="contact-item">
                                        <MdEmail className="contact-icon" />
                                        <span>{selectedUnit.tenant.email}</span>
                                      </div>
                                    )}
                                    {selectedUnit.tenant.phone && (
                                      <div className="contact-item">
                                        <MdPhone className="contact-icon" />
                                        <span>{selectedUnit.tenant.phone}</span>
                                      </div>
                                    )}
                                  </div>
                                  {selectedUnit.tenant.leaseStart && selectedUnit.tenant.leaseEnd && (
                                    <div className="lease-info">
                                      <div className="lease-dates">
                                        <MdCalendarToday className="lease-icon" />
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
                                <div className="vacant-icon"><MdHome /></div>
                                <p>This unit is currently vacant</p>
                                <button className="btn btn-secondary">
                                  <MdPerson style={{ marginRight: '8px' }} />
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
                    <div className="settings-section">
                      <div className="settings-card">
                        <div className="settings-card-header">
                          <div className="settings-icon"><MdPalette /></div>
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
                                  <MdWbSunny />
                                  Light
                                </button>
                                <button 
                                  className={`theme-option ${isDarkMode ? 'active' : ''}`}
                                  onClick={() => !isDarkMode && toggleDarkMode()}
                                >
                                  <MdNightsStay />
                                  Dark
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="settings-section">
                      <div className="settings-card">
                        <div className="settings-card-header">
                          <div className="settings-icon"><MdSettings /></div>
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
                                <MdSave style={{ marginRight: '8px' }} />
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
                                <MdDelete style={{ marginRight: '8px' }} />
                                Reset All Data
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="settings-section">
                      <div className="settings-card">
                        <div className="settings-card-header">
                          <div className="settings-icon"><MdAccountCircle /></div>
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
                  <div className="coming-soon-icon"><MdConstruction /></div>
                  <h2>Coming Soon</h2>
                  <p>The {activeTab} section is currently under development.</p>
                  <p>This will include comprehensive tools for managing your {activeTab}.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <PropertyModal 
        isOpen={isPropertyModalOpen}
        onClose={handleClosePropertyModal}
        onSave={handleSaveProperty}
        editingProperty={editingProperty}
      />

      <CSVUpload 
        isOpen={isCSVUploadOpen}
        onClose={handleCloseCSVUpload}
        onDataParsed={handleCSVDataParsed}
      />

      <Chatbot 
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        properties={properties}
      />
    </div>
  );
};

export default Dashboard; 