import React, { useState } from 'react';
import Papa from 'papaparse';
import './CSVUpload.css';

const CSVUpload = ({ isOpen, onClose, onDataParsed }) => {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(1); // 1: Upload, 2: Review & Import
  // eslint-disable-next-line no-unused-vars
  const [csvData, setCsvData] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [headers, setHeaders] = useState([]);
  const [mappedData, setMappedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const parseCSV = () => {
    if (!file) return;

    setIsLoading(true);
    Papa.parse(file, {
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const headers = results.data[0];
          const data = results.data.slice(1).filter(row => 
            row.some(cell => cell && cell.trim() !== '')
          );
          
          setHeaders(headers);
          setCsvData(data);
          
          // Auto-detect mapping using AI-like logic
          const autoMapping = autoDetectMapping(headers);
          
          // Automatically process the data and go to review step
          processDataWithMapping(data, headers, autoMapping);
        } else {
          alert('Unable to parse CSV file. Please check the format.');
          setIsLoading(false);
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        alert('Error parsing CSV file');
        setIsLoading(false);
      }
    });
  };

  const autoDetectMapping = (headers) => {
    const mapping = {};
    
    console.log('CSV Headers:', headers); // Debug log
    
    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().trim();
      
      // Property Name Detection (Enhanced)
      if (normalizedHeader === 'property name' || 
          normalizedHeader === 'property title' ||
          normalizedHeader === 'building name' ||
          normalizedHeader === 'complex name' ||
          normalizedHeader === 'property' ||
          normalizedHeader === 'building' ||
          normalizedHeader === 'complex') {
        mapping.propertyName = index;
      }
      
      // Property Address Detection (Enhanced)
      else if (normalizedHeader === 'property address' ||
               normalizedHeader === 'full address' ||
               normalizedHeader === 'street address' ||
               normalizedHeader === 'address' ||
               normalizedHeader === 'location') {
        mapping.propertyAddress = index;
      }
      
      // Unit Number Detection (Enhanced)
      else if (normalizedHeader === 'unit number' ||
               normalizedHeader === 'unit #' ||
               normalizedHeader === 'unit id' ||
               normalizedHeader === 'apt number' ||
               normalizedHeader === 'apt' ||
               normalizedHeader === 'apartment' ||
               normalizedHeader === 'unit') {
        mapping.unitNumber = index;
      }
      
      // Bedrooms Detection (Enhanced)
      else if (normalizedHeader === 'bedrooms' ||
               normalizedHeader === 'number of bedrooms' ||
               normalizedHeader === 'beds' ||
               normalizedHeader === 'br' ||
               normalizedHeader === 'bed') {
        mapping.bedrooms = index;
      }
      
      // Bathrooms Detection (Enhanced)
      else if (normalizedHeader === 'bathrooms' ||
               normalizedHeader === 'number of bathrooms' ||
               normalizedHeader === 'baths' ||
               normalizedHeader === 'ba' ||
               normalizedHeader === 'bath') {
        mapping.bathrooms = index;
      }
      
      // Square Feet Detection (Enhanced)
      else if (normalizedHeader === 'square feet' ||
               normalizedHeader === 'square footage' ||
               normalizedHeader === 'sq ft' ||
               normalizedHeader === 'sqft' ||
               normalizedHeader === 'size' ||
               normalizedHeader === 'size (sq ft)') {
        mapping.squareFeet = index;
      }
      
      // Rent Detection (Enhanced)
      else if (normalizedHeader === 'monthly rent' ||
               normalizedHeader === 'monthly rental price' ||
               normalizedHeader === 'rent cost' ||
               normalizedHeader === 'rent' ||
               normalizedHeader === 'price' ||
               normalizedHeader === 'cost') {
        mapping.rent = index;
      }
      
      // Tenant Name Detection (Enhanced)
      else if (normalizedHeader === 'tenant name' ||
               normalizedHeader === 'tenant full name' ||
               normalizedHeader === 'renter name' ||
               normalizedHeader === 'occupant name' ||
               normalizedHeader === 'resident' ||
               normalizedHeader === 'tenant') {
        mapping.tenantName = index;
      }
      
      // Email Detection (Enhanced)
      else if (normalizedHeader === 'tenant email' ||
               normalizedHeader === 'email address' ||
               normalizedHeader === 'contact email' ||
               normalizedHeader === 'e-mail' ||
               normalizedHeader === 'email') {
        mapping.tenantEmail = index;
      }
      
      // Phone Detection (Enhanced)
      else if (normalizedHeader === 'tenant phone' ||
               normalizedHeader === 'phone number' ||
               normalizedHeader === 'contact number' ||
               normalizedHeader === 'contact phone' ||
               normalizedHeader === 'tel' ||
               normalizedHeader === 'phone' ||
               normalizedHeader === 'mobile') {
        mapping.tenantPhone = index;
      }
      
      // Lease Start Detection (Enhanced)
      else if (normalizedHeader === 'lease start' ||
               normalizedHeader === 'lease start date' ||
               normalizedHeader === 'start date' ||
               normalizedHeader === 'move in date' ||
               normalizedHeader === 'tenancy start') {
        mapping.leaseStart = index;
      }
      
      // Lease End Detection (Enhanced)
      else if (normalizedHeader === 'lease end' ||
               normalizedHeader === 'lease end date' ||
               normalizedHeader === 'end date' ||
               normalizedHeader === 'lease expires' ||
               normalizedHeader === 'tenancy end') {
        mapping.leaseEnd = index;
      }
      
      // Fallback patterns for partial matches (if not already mapped)
      else {
        // Property name fallbacks
        if (!mapping.propertyName && (normalizedHeader.includes('property') || normalizedHeader.includes('building') || normalizedHeader.includes('complex'))) {
          mapping.propertyName = index;
        }
        // Address fallbacks
        else if (!mapping.propertyAddress && normalizedHeader.includes('address')) {
          mapping.propertyAddress = index;
        }
        // Unit fallbacks
        else if (!mapping.unitNumber && (normalizedHeader.includes('unit') || normalizedHeader.includes('apt') || normalizedHeader.includes('suite'))) {
          mapping.unitNumber = index;
        }
        // Bedroom fallbacks
        else if (!mapping.bedrooms && normalizedHeader.includes('bed')) {
          mapping.bedrooms = index;
        }
        // Bathroom fallbacks
        else if (!mapping.bathrooms && normalizedHeader.includes('bath')) {
          mapping.bathrooms = index;
        }
        // Square feet fallbacks
        else if (!mapping.squareFeet && (normalizedHeader.includes('sqft') || normalizedHeader.includes('sq') || normalizedHeader.includes('size'))) {
          mapping.squareFeet = index;
        }
        // Rent fallbacks
        else if (!mapping.rent && (normalizedHeader.includes('rent') || normalizedHeader.includes('price') || normalizedHeader.includes('cost'))) {
          mapping.rent = index;
        }
        // Phone fallbacks
        else if (!mapping.tenantPhone && (normalizedHeader.includes('phone') || normalizedHeader.includes('tel') || normalizedHeader.includes('mobile'))) {
          mapping.tenantPhone = index;
        }
        // Email fallbacks
        else if (!mapping.tenantEmail && (normalizedHeader.includes('email') || normalizedHeader.includes('mail'))) {
          mapping.tenantEmail = index;
        }
        // Tenant name fallbacks
        else if (!mapping.tenantName && ((normalizedHeader.includes('tenant') || normalizedHeader.includes('renter') || normalizedHeader.includes('resident') || normalizedHeader.includes('occupant')) && normalizedHeader.includes('name'))) {
          mapping.tenantName = index;
        }
        // Lease date fallbacks
        else if (!mapping.leaseStart && normalizedHeader.includes('start')) {
          mapping.leaseStart = index;
        }
        else if (!mapping.leaseEnd && normalizedHeader.includes('end')) {
          mapping.leaseEnd = index;
        }
      }
    });
    
    console.log('Auto-detected mapping:', mapping); // Debug log
    return mapping;
  };

  const processDataWithMapping = (data, headers, mapping) => {
    try {
      const processedData = data.map((row, index) => {
        const property = {};
        
        // Extract mapped values
        Object.keys(mapping).forEach(field => {
          const headerIndex = mapping[field];
          if (headerIndex !== undefined && row[headerIndex] !== undefined) {
            property[field] = row[headerIndex].trim();
          }
        });
        
        return property;
      });
      
      // Group by property name to create property objects
      const propertiesMap = new Map();
      
      processedData.forEach(item => {
        const propertyKey = item.propertyName || 'Unknown Property';
        
        if (!propertiesMap.has(propertyKey)) {
          propertiesMap.set(propertyKey, {
            id: Date.now() + Math.random(),
            name: item.propertyName || 'Unknown Property',
            address: item.propertyAddress || '',
            units: [],
            createdAt: new Date().toISOString()
          });
        }
        
        const property = propertiesMap.get(propertyKey);
        
        // Create unit object
        const unit = {
          id: Date.now() + Math.random(),
          number: item.unitNumber || property.units.length + 1,
          bedrooms: parseInt(item.bedrooms) || 1,
          bathrooms: parseFloat(item.bathrooms) || 1,
          squareFeet: item.squareFeet || '',
          rent: item.rent ? parseFloat(item.rent.replace(/[^0-9.]/g, '')) || 0 : 0,
          tenant: null,
          rentPaid: false
        };
        
        // Add tenant if data exists
        if (item.tenantName && item.tenantName.trim() !== '') {
          console.log('Creating tenant with data:', {
            name: item.tenantName.trim(),
            email: item.tenantEmail ? item.tenantEmail.trim() : '',
            phone: item.tenantPhone ? item.tenantPhone.trim() : '',
            leaseStart: item.leaseStart ? item.leaseStart.trim() : '',
            leaseEnd: item.leaseEnd ? item.leaseEnd.trim() : ''
          }); // Debug log
          
          unit.tenant = {
            name: item.tenantName.trim(),
            email: item.tenantEmail ? item.tenantEmail.trim() : '',
            phone: item.tenantPhone ? item.tenantPhone.trim() : '',
            leaseStart: item.leaseStart ? item.leaseStart.trim() : '',
            leaseEnd: item.leaseEnd ? item.leaseEnd.trim() : ''
          };
        } else {
          unit.tenant = null; // Explicitly set to null if no tenant
        }
        
        property.units.push(unit);
      });
      
      // Update numUnits for each property
      const properties = Array.from(propertiesMap.values()).map(property => ({
        ...property,
        numUnits: property.units.length
      }));
      
      setMappedData(properties);
      setStep(2);
      setIsLoading(false);
    } catch (error) {
      console.error('Error processing data:', error);
      alert('Error processing data. Please check your CSV format and try again.');
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    onDataParsed(mappedData);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setMappedData([]);
    setStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="csv-upload-overlay" onClick={handleClose}>
      <div className="csv-upload-modal" onClick={e => e.stopPropagation()}>
        <div className="csv-upload-header">
          <h2>Import Properties from CSV</h2>
          <button className="csv-close-btn" onClick={handleClose}>×</button>
        </div>

        {/* Progress indicator */}
        <div className="csv-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <span>1</span>
            Upload CSV
          </div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <span>2</span>
            Review & Import
          </div>
        </div>

        <div className="csv-upload-body">
          {step === 1 && (
            <div className="upload-step">
              <div className="upload-info">
                <h3>Upload Your CSV File</h3>
                <p>Your CSV should contain property and unit information. The system will automatically detect and map your data fields. Common columns include:</p>
                <ul>
                  <li>Property Name</li>
                  <li>Property Address</li>
                  <li>Unit Number</li>
                  <li>Bedrooms & Bathrooms</li>
                  <li>Square Feet</li>
                  <li>Monthly Rent</li>
                  <li>Tenant Information (optional)</li>
                </ul>
              </div>
              
              <div className="file-upload">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  id="csv-file"
                  className="file-input"
                />
                <label htmlFor="csv-file" className="file-label">
                  <span className="upload-icon">📁</span>
                  {file ? file.name : 'Choose CSV File'}
                </label>
              </div>
              
              {file && (
                <button 
                  className="btn-parse" 
                  onClick={parseCSV}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Process & Review'}
                </button>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="review-step">
              <h3>Review Imported Data</h3>
              <p>Review the processed data before importing into your portfolio. The system has automatically mapped your CSV fields.</p>
              
              <div className="review-summary">
                <div className="summary-card">
                  <span className="summary-number">{mappedData.length}</span>
                  <span className="summary-label">Properties</span>
                </div>
                <div className="summary-card">
                  <span className="summary-number">
                    {mappedData.reduce((sum, prop) => sum + prop.units.length, 0)}
                  </span>
                  <span className="summary-label">Units</span>
                </div>
                <div className="summary-card">
                  <span className="summary-number">
                    {mappedData.reduce((sum, prop) => 
                      sum + prop.units.filter(unit => unit.tenant).length, 0
                    )}
                  </span>
                  <span className="summary-label">Tenants</span>
                </div>
              </div>
              
              <div className="review-properties">
                {mappedData.map((property, index) => (
                  <div key={index} className="review-property">
                    <h4>{property.name}</h4>
                    <p className="property-address">{property.address}</p>
                    <div className="units-summary">
                      <span>{property.units.length} units</span>
                      <span>
                        ${property.units.reduce((sum, unit) => 
                          sum + (parseFloat(unit.rent) || 0), 0
                        ).toLocaleString()}/mo total
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="csv-upload-footer">
          {step === 2 && (
            <div className="footer-actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="btn-primary" onClick={handleImport}>
                Import {mappedData.length} Properties
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVUpload; 