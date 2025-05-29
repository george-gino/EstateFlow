import React, { useState } from 'react';
import './PropertyModal.css';

const PropertyModal = ({ isOpen, onClose, onSave, editingProperty }) => {
  const [propertyData, setPropertyData] = useState({
    name: '',
    address: '',
    numUnits: 1,
    units: [{ 
      id: 1, 
      number: '1', 
      bedrooms: 1, 
      bathrooms: 1, 
      squareFeet: '', 
      rent: '',
      tenant: null,
      rentPaid: false
    }]
  });

  const [currentStep, setCurrentStep] = useState(1); // 1: Property Details, 2: Unit Details

  // Initialize form data when editing property
  React.useEffect(() => {
    if (editingProperty) {
      setPropertyData({
        name: editingProperty.name,
        address: editingProperty.address,
        numUnits: editingProperty.numUnits,
        units: editingProperty.units.map(unit => ({ ...unit })) // Deep copy units
      });
    } else {
      // Reset to default when creating new property
      setPropertyData({
        name: '',
        address: '',
        numUnits: 1,
        units: [{ 
          id: 1, 
          number: '1', 
          bedrooms: 1, 
          bathrooms: 1, 
          squareFeet: '', 
          rent: '',
          tenant: null,
          rentPaid: false
        }]
      });
    }
    setCurrentStep(1);
  }, [editingProperty, isOpen]);

  // Handle property basic info changes
  const handlePropertyChange = (field, value) => {
    setPropertyData(prev => ({
      ...prev,
      [field]: value
    }));

    // If changing number of units, adjust units array
    if (field === 'numUnits') {
      const numUnits = parseInt(value) || 1;
      const newUnits = [];
      
      for (let i = 0; i < numUnits; i++) {
        if (propertyData.units[i]) {
          // Keep existing unit data
          newUnits.push(propertyData.units[i]);
        } else {
          // Create new unit with unique ID
          const newUnitId = editingProperty 
            ? Math.max(...propertyData.units.map(u => u.id), 0) + i + 1
            : i + 1;
          newUnits.push({
            id: newUnitId,
            number: (i + 1).toString(),
            bedrooms: 1,
            bathrooms: 1,
            squareFeet: '',
            rent: '',
            tenant: null,
            rentPaid: false
          });
        }
      }
      
      setPropertyData(prev => ({
        ...prev,
        units: newUnits
      }));
    }
  };

  // Handle unit changes
  const handleUnitChange = (unitIndex, field, value) => {
    setPropertyData(prev => ({
      ...prev,
      units: prev.units.map((unit, index) => 
        index === unitIndex 
          ? { ...unit, [field]: value }
          : unit
      )
    }));
  };

  // Handle tenant assignment
  const handleTenantChange = (unitIndex, tenantData) => {
    setPropertyData(prev => ({
      ...prev,
      units: prev.units.map((unit, index) => 
        index === unitIndex 
          ? { ...unit, tenant: tenantData }
          : unit
      )
    }));
  };

  // Reset form
  const resetForm = () => {
    setPropertyData({
      name: '',
      address: '',
      numUnits: 1,
      units: [{ 
        id: 1, 
        number: '1', 
        bedrooms: 1, 
        bathrooms: 1, 
        squareFeet: '', 
        rent: '',
        tenant: null,
        rentPaid: false
      }]
    });
    setCurrentStep(1);
  };

  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Handle save
  const handleSave = () => {
    // Basic validation
    if (!propertyData.name.trim() || !propertyData.address.trim()) {
      alert('Please fill in property name and address');
      return;
    }

    onSave(propertyData);
    handleClose();
  };

  // Handle next step
  const handleNext = () => {
    if (!propertyData.name.trim() || !propertyData.address.trim()) {
      alert('Please fill in property name and address');
      return;
    }
    setCurrentStep(2);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingProperty ? 'Edit Property' : 'Add New Property'}</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        {/* Progress indicator */}
        <div className="modal-progress">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
            <span>1</span>
            Property Details
          </div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
            <span>2</span>
            Unit Configuration
          </div>
        </div>

        <div className="modal-body">
          {currentStep === 1 && (
            <div className="step-content">
              <h3>Property Information</h3>
              
              <div className="form-group">
                <label>Property Name *</label>
                <input
                  type="text"
                  value={propertyData.name}
                  onChange={(e) => handlePropertyChange('name', e.target.value)}
                  placeholder="e.g., Sunset Apartments"
                />
              </div>

              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  value={propertyData.address}
                  onChange={(e) => handlePropertyChange('address', e.target.value)}
                  placeholder="e.g., 123 Main Street, City, State 12345"
                />
              </div>

              <div className="form-group">
                <label>Number of Units</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={propertyData.numUnits}
                  onChange={(e) => handlePropertyChange('numUnits', e.target.value)}
                />
                <small>You can customize each unit in the next step</small>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-content">
              <h3>Configure Units</h3>
              <p>Customize each unit and assign tenants if needed</p>
              
              <div className="units-grid">
                {propertyData.units.map((unit, index) => (
                  <div key={unit.id} className="unit-card">
                    <h4>Unit {unit.number}</h4>
                    
                    <div className="unit-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Unit Number</label>
                          <input
                            type="text"
                            value={unit.number}
                            onChange={(e) => handleUnitChange(index, 'number', e.target.value)}
                            placeholder="e.g., 1A, 101"
                          />
                        </div>
                        <div className="form-group">
                          <label>Bedrooms</label>
                          <select
                            value={unit.bedrooms}
                            onChange={(e) => handleUnitChange(index, 'bedrooms', parseInt(e.target.value))}
                          >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5+</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Bathrooms</label>
                          <select
                            value={unit.bathrooms}
                            onChange={(e) => handleUnitChange(index, 'bathrooms', parseFloat(e.target.value))}
                          >
                            <option value={1}>1</option>
                            <option value={1.5}>1.5</option>
                            <option value={2}>2</option>
                            <option value={2.5}>2.5</option>
                            <option value={3}>3</option>
                            <option value={3.5}>3.5</option>
                            <option value={4}>4+</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Square Feet</label>
                          <input
                            type="number"
                            value={unit.squareFeet}
                            onChange={(e) => handleUnitChange(index, 'squareFeet', e.target.value)}
                            placeholder="e.g., 850"
                          />
                        </div>
                        <div className="form-group">
                          <label>Monthly Rent ($)</label>
                          <input
                            type="number"
                            value={unit.rent}
                            onChange={(e) => handleUnitChange(index, 'rent', e.target.value)}
                            placeholder="e.g., 1200"
                          />
                        </div>
                      </div>

                      {/* Tenant Section */}
                      <div className="tenant-section">
                        <h5>Tenant (Optional)</h5>
                        {unit.tenant ? (
                          <div className="tenant-info">
                            <p><strong>{unit.tenant.name}</strong></p>
                            <p>{unit.tenant.email}</p>
                            <p>{unit.tenant.phone}</p>
                            <button 
                              type="button" 
                              className="btn-small btn-secondary"
                              onClick={() => handleTenantChange(index, null)}
                            >
                              Remove Tenant
                            </button>
                          </div>
                        ) : (
                          <TenantForm 
                            onSave={(tenantData) => handleTenantChange(index, tenantData)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {currentStep === 1 ? (
            <div className="footer-actions">
              <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
              <button className="btn btn-primary" onClick={handleNext}>Next: Configure Units</button>
            </div>
          ) : (
            <div className="footer-actions">
              <button className="btn btn-secondary" onClick={() => setCurrentStep(1)}>Back</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editingProperty ? 'Update Property' : 'Create Property'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Tenant form component
const TenantForm = ({ onSave }) => {
  const [showForm, setShowForm] = useState(false);
  const [tenantData, setTenantData] = useState({
    name: '',
    email: '',
    phone: '',
    leaseStart: '',
    leaseEnd: ''
  });

  const handleSave = () => {
    if (!tenantData.name.trim()) {
      alert('Please enter tenant name');
      return;
    }
    onSave(tenantData);
    setTenantData({ name: '', email: '', phone: '', leaseStart: '', leaseEnd: '' });
    setShowForm(false);
  };

  const handleCancel = () => {
    setTenantData({ name: '', email: '', phone: '', leaseStart: '', leaseEnd: '' });
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <button 
        type="button" 
        className="btn-small btn-outline"
        onClick={() => setShowForm(true)}
      >
        + Add Tenant
      </button>
    );
  }

  return (
    <div className="tenant-form">
      <div className="form-group">
        <label>Tenant Name *</label>
        <input
          type="text"
          value={tenantData.name}
          onChange={(e) => setTenantData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Full name"
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={tenantData.email}
            onChange={(e) => setTenantData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="email@example.com"
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            value={tenantData.phone}
            onChange={(e) => setTenantData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Lease Start</label>
          <input
            type="date"
            value={tenantData.leaseStart}
            onChange={(e) => setTenantData(prev => ({ ...prev, leaseStart: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label>Lease End</label>
          <input
            type="date"
            value={tenantData.leaseEnd}
            onChange={(e) => setTenantData(prev => ({ ...prev, leaseEnd: e.target.value }))}
          />
        </div>
      </div>

      <div className="tenant-form-actions">
        <button type="button" className="btn-small btn-secondary" onClick={handleCancel}>
          Cancel
        </button>
        <button type="button" className="btn-small btn-primary" onClick={handleSave}>
          Add Tenant
        </button>
      </div>
    </div>
  );
};

export default PropertyModal; 