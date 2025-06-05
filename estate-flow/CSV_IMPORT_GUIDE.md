# CSV Import Guide for EstateFlow

## Overview
EstateFlow can automatically import your property data from CSV files. The system uses intelligent auto-detection to map your CSV columns to the appropriate fields, so you don't need to worry about exact column names.

## Supported Column Names

### Property Information
**Property Name/Title:**
- `Property Name`, `Property Title`, `Building Name`, `Complex Name`
- `Property`, `Building`, `Complex`

**Property Address:**
- `Property Address`, `Full Address`, `Street Address`
- `Address`, `Location`

### Unit Information
**Unit Number/ID:**
- `Unit Number`, `Unit #`, `Unit ID`, `Apt Number`
- `Apt`, `Unit`, `Apartment`, `Suite A`, `Suite B`, etc.

**Bedrooms:**
- `Bedrooms`, `Number of Bedrooms`, `Beds`, `BR`, `Bed`

**Bathrooms:**
- `Bathrooms`, `Number of Bathrooms`, `Baths`, `BA`, `Bath`

**Square Footage:**
- `Square Feet`, `Square Footage`, `Sq Ft`, `SQFT`
- `Size`, `Size (sq ft)`

**Monthly Rent:**
- `Monthly Rent`, `Monthly Rental Price`, `Rent Cost`
- `Rent`, `Price`, `Cost`

### Tenant Information (Optional)
**Tenant Name:**
- `Tenant Name`, `Tenant Full Name`, `Renter Name`
- `Occupant Name`, `Resident`, `Tenant`

**Email:**
- `Tenant Email`, `Email Address`, `Contact Email`
- `E-mail`, `Email`

**Phone:**
- `Tenant Phone`, `Phone Number`, `Contact Number`
- `Contact Phone`, `Tel`, `Phone`, `Mobile`

**Lease Dates:**
- `Lease Start`, `Lease Start Date`, `Start Date`
- `Move In Date`, `Tenancy Start`
- `Lease End`, `Lease End Date`, `End Date`
- `Lease Expires`, `Tenancy End`

## Sample CSV Formats

### Example 1: Standard Format
```csv
Property Name,Property Address,Unit Number,Bedrooms,Bathrooms,Square Feet,Monthly Rent,Tenant Name,Tenant Email,Tenant Phone,Lease Start,Lease End
Sunset Apartments,123 Main St,101,2,1,800,1500,John Doe,john@email.com,555-0123,2023-01-01,2024-01-01
Sunset Apartments,123 Main St,102,1,1,600,1200,,,,,
```

### Example 2: Alternative Names
```csv
Building Name,Street Address,Apt Number,BR,BA,Sq Ft,Monthly Rent,Renter Name,Email Address,Contact Number,Move In Date,Lease Expires
Oceanview Heights,456 Coast Ave,A1,3,2,1200,2800,Jane Smith,jane@email.com,555-0456,2023-02-01,2024-02-01
```

### Example 3: Large Apartment Complex
```csv
Complex Name,Location,Unit #,Beds,Baths,SQFT,Price,Resident,E-mail,Tel,Start Date,End Date
Garden Towers,789 Oak St,101,1,1,650,1850,Mike Johnson,mike@email.com,555-0789,2023-01-15,2024-01-14
Garden Towers,789 Oak St,102,1,1,650,1850,,,,,
Garden Towers,789 Oak St,103,2,2,950,2400,Sarah Wilson,sarah@email.com,555-0790,2023-02-01,2024-01-31
```

## Important Notes

### Data Formatting
- **Rent Values:** Can include dollar signs ($) and decimal places - they will be automatically processed
  - Supported formats: `$2500`, `$2,500.00`, `2500`, `2500.50`
  - Commas and currency symbols are automatically removed
- **Phone Numbers:** Can include parentheses, dashes, or dots - all formats accepted
- **Dates:** Use MM/DD/YYYY or MM-DD-YYYY format for best results
- **Empty Units:** Leave tenant fields blank for vacant units
- **Large Numbers:** The system properly handles properties with high rent values and large totals

### File Requirements
- File must be in CSV format (.csv)
- First row must contain column headers
- Each row represents one unit

### Large Properties
The system handles large apartment complexes with many units efficiently:
- You can have 50+ units for a single property
- All units with the same property name will be grouped together
- Mixed occupancy is supported (some units occupied, others vacant)

## Tips for Best Results

1. **Use descriptive column headers** - the system is smart but clear names help
2. **Be consistent** - use the same property name for all units in a building
3. **Include complete addresses** - helps identify properties clearly
4. **Leave blank fields empty** - don't use "N/A" or "NULL", just leave blank
5. **Test with small files first** - try a few rows before importing large datasets

## Example Files
Check the `sample_data` folder for example CSV files:
- `apartment_complex.csv` - Large 50-unit apartment building
- `mixed_properties_alt_names.csv` - Multiple properties with alternative column names
- `real_estate_portfolio.csv` - Mixed portfolio with various naming conventions
- `property_management_export.csv` - Formal property management export format

## Getting Help
If you're having trouble with imports:
1. Check that your CSV follows the format guidelines above
2. Ensure required fields (property name, unit number, rent) are included
3. Try one of the sample files to test the system
4. The auto-detection system is constantly improving to handle more formats 