# CSV Import Guide for EstateFlow

## Overview
EstateFlow now supports importing property data from CSV files! This feature automatically detects and maps your data fields, making it easy to bulk import properties, units, and tenant information.

## How to Use

1. **Prepare Your CSV File**: Create a CSV file with your property data using spreadsheet software like Excel, Google Sheets, or any text editor.

2. **Access the Import Feature**: In the EstateFlow dashboard, click the "Import CSV" button in the top right corner.

3. **Upload and Map**: The system will automatically detect column mappings, but you can adjust them if needed.

4. **Review and Import**: Review the parsed data and confirm the import.

## CSV Format Requirements

### Required Fields
- **Property Name**: Name or identifier for your property
- **Property Address**: Full address of the property
- **Unit Number**: Unit identifier (e.g., "101", "1A", "Suite 200")
- **Monthly Rent**: Rent amount (numbers only, dollar signs will be removed automatically)

### Optional Fields
- **Bedrooms**: Number of bedrooms (default: 1)
- **Bathrooms**: Number of bathrooms (default: 1)
- **Square Feet**: Size of the unit
- **Tenant Name**: Current tenant's full name
- **Tenant Email**: Tenant's email address
- **Tenant Phone**: Tenant's phone number
- **Lease Start**: Lease start date (YYYY-MM-DD format)
- **Lease End**: Lease end date (YYYY-MM-DD format)

## Column Headers
The system will automatically detect these common column names:

### Property Information
- Property Name: `Property Name`, `Property`, `Building`
- Address: `Property Address`, `Address`, `Location`

### Unit Information
- Unit Number: `Unit Number`, `Unit`, `Apartment`, `Apt`
- Bedrooms: `Bedrooms`, `Bed`, `BR`
- Bathrooms: `Bathrooms`, `Bath`, `BA`
- Square Feet: `Square Feet`, `Sq Ft`, `SqFt`, `Size`
- Rent: `Monthly Rent`, `Rent`, `Price`, `Cost`

### Tenant Information
- Name: `Tenant Name`, `Tenant`, `Renter`, `Name`
- Email: `Tenant Email`, `Email`, `Mail`
- Phone: `Tenant Phone`, `Phone`, `Tel`, `Mobile`
- Lease Start: `Lease Start`, `Start Date`
- Lease End: `Lease End`, `End Date`

## Sample CSV Format

```csv
Property Name,Property Address,Unit Number,Bedrooms,Bathrooms,Square Feet,Monthly Rent,Tenant Name,Tenant Email,Tenant Phone,Lease Start,Lease End
Sunset Apartments,123 Sunset Blvd Los Angeles CA 90210,101,2,2,950,2200,John Smith,john.smith@email.com,(555) 123-4567,2024-01-01,2024-12-31
Sunset Apartments,123 Sunset Blvd Los Angeles CA 90210,102,2,2,950,2200,Sarah Johnson,sarah.j@email.com,(555) 987-6543,2024-02-15,2025-02-14
Sunset Apartments,123 Sunset Blvd Los Angeles CA 90210,103,1,1,750,1800,,,,
Downtown Plaza,456 Main Street Downtown CA 90213,1A,1,1,650,1600,Lisa Chen,lisa.chen@email.com,(555) 234-5678,2024-03-01,2025-02-28
```

## Tips for Success

### Data Organization
- **One row per unit**: Each row should represent a single unit
- **Group by property**: Units from the same property should have identical property names and addresses
- **Empty tenant fields**: Leave tenant fields blank for vacant units

### Data Formatting
- **Dates**: Use YYYY-MM-DD format (e.g., "2024-12-31")
- **Phone numbers**: Any format is acceptable (e.g., "(555) 123-4567" or "555-123-4567")
- **Rent amounts**: Numbers only, currency symbols will be automatically removed
- **Unit numbers**: Can be alphanumeric (e.g., "101", "1A", "Suite 200")

### Column Flexibility
- **Case insensitive**: Column headers work regardless of capitalization
- **Alternative names**: The system recognizes many variations of column names
- **Custom mapping**: You can manually map any column to any field during import

## Troubleshooting

### Common Issues
1. **CSV not recognized**: Ensure your file has a .csv extension
2. **Missing required fields**: Make sure you have Property Name, Address, Unit Number, and Rent columns
3. **Data not grouping correctly**: Ensure property names are exactly the same for units in the same building

### File Size Limits
- **Recommended**: Up to 1000 rows for optimal performance
- **Maximum**: Browser-dependent, typically up to 5MB

### Data Validation
- The system will skip empty rows
- Invalid rent amounts will default to 0
- Missing bedrooms/bathrooms will default to 1
- Invalid dates will be ignored

## After Import

Once imported, you can:
- Edit individual properties and units
- Add or modify tenant information
- Update rent amounts and lease terms
- View comprehensive portfolio analytics

## Need Help?

If you encounter issues:
1. Check that your CSV follows the format guidelines above
2. Verify required fields are present and properly formatted
3. Use the sample CSV file as a reference template

The CSV import feature uses intelligent field detection to make the process as smooth as possible, automatically mapping your data even if column names don't exactly match the expected format. 