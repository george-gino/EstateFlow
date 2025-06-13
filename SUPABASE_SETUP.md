# EstateFlow Supabase Integration Setup

This guide will help you set up the Supabase database integration for your EstateFlow property management application.

## 🚀 Quick Start

### 1. Database Setup

1. **Go to your Supabase project dashboard**
   - Visit: https://app.supabase.com/
   - Select your project: `gpfqvqkiffpzwhczrnru`

2. **Run the SQL Setup**
   - Navigate to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `database_setup.sql`
   - Click "Run" to create all tables and relationships

### 2. Verify Database Structure

After running the SQL, you should have these tables:
- `properties` - Stores property information
- `units` - Stores individual unit details
- `tenants` - Stores tenant information

### 3. Test the Connection

1. **Start your React application:**
   ```bash
   cd estate-flow
   npm start
   ```

2. **Check the browser console for any connection errors**

3. **Try adding a property** through the Dashboard to test database operations

## 📊 Database Schema

### Properties Table
- `id` - Primary key
- `name` - Property name
- `address` - Property address
- `num_units` - Number of units
- `created_at` / `updated_at` - Timestamps

### Units Table
- `id` - Primary key
- `property_id` - Foreign key to properties
- `unit_number` - Unit identifier (e.g., "101", "A1")
- `bedrooms` / `bathrooms` - Unit specifications
- `square_feet` - Unit size
- `rent_amount` - Monthly rent
- `is_occupied` - Occupancy status

### Tenants Table
- `id` - Primary key
- `unit_id` - Foreign key to units
- `name` - Tenant name
- `email` / `phone` - Contact information
- `lease_start` / `lease_end` - Lease dates
- `rent_paid` - Payment status

## 🔧 Features Implemented

### ✅ Complete CRUD Operations
- **Create** properties with units and tenants
- **Read** all property data with relationships
- **Update** existing properties and units
- **Delete** properties (cascades to units and tenants)

### ✅ Real-time Data Sync
- All operations immediately sync with Supabase
- Automatic data fetching on component mount
- Loading states during database operations

### ✅ Error Handling
- Graceful error handling for network issues
- Fallback to cached data when offline
- User-friendly error messages

### ✅ CSV Import Integration
- Import properties directly to Supabase
- Maintains data relationships
- Automatic data refresh after import

### ✅ Chatbot Integration
- Real-time property data for AI responses
- Fresh data loading when chatbot opens
- Fallback to cached data if needed

## 🛠️ Technical Implementation

### Database Service Layer
The application uses a comprehensive service layer (`src/services/databaseService.js`) that handles:
- Property operations
- Unit operations  
- Tenant operations
- Data transformation between Supabase and frontend formats

### Key Functions
- `propertyService.getAll()` - Fetch all properties with relationships
- `propertyService.create(data)` - Create new property with units/tenants
- `propertyService.update(id, data)` - Update existing property
- `propertyService.delete(id)` - Delete property and related data
- `transformSupabaseData()` - Convert database format to frontend format

### Caching System
- Properties cached in localStorage for offline support
- 5-minute cache duration
- Automatic fallback during network issues

## 🔒 Security

### Row Level Security (RLS)
- Enabled on all tables
- Currently allows all operations (can be restricted later)
- Policies can be customized for user-specific access

### Best Practices
- Environment variables for sensitive data
- Input validation and sanitization
- Error handling without exposing sensitive information

## 🎯 Usage Examples

### Adding a Property
```javascript
const newProperty = {
  name: "Sunset Apartments",
  address: "123 Main St, City, State 12345",
  numUnits: 2,
  units: [
    {
      number: "101",
      bedrooms: 2,
      bathrooms: 1,
      squareFeet: "850",
      rent: "1200"
    }
  ]
};

await propertyService.create(newProperty);
```

### Fetching Properties
```javascript
const properties = await propertyService.getAll();
const transformed = transformSupabaseData(properties);
```

## 🐛 Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify Supabase URL and API key
   - Check network connectivity
   - Ensure tables exist in database

2. **Data Not Appearing**
   - Check browser console for errors
   - Verify RLS policies allow access
   - Confirm tables were created correctly

3. **Create/Update Failures**
   - Check required fields are provided
   - Verify data types match schema
   - Look for foreign key constraint errors

### Debug Mode
Enable console logging by opening browser DevTools and checking the Console tab for detailed error messages.

## 📱 Mobile Responsiveness

The integration maintains full mobile responsiveness with:
- Loading states on mobile devices
- Touch-friendly buttons and interactions
- Responsive error messages
- Optimized network requests

## 🚀 Next Steps

### Potential Enhancements
1. **Real-time Subscriptions** - Live updates when data changes
2. **Batch Operations** - Bulk property imports/updates
3. **Data Analytics** - Revenue tracking and insights
4. **File Storage** - Property images via Supabase Storage
5. **User Authentication** - Multi-tenant support

### Performance Optimizations
1. **Query Optimization** - Selective field loading
2. **Pagination** - For large property lists
3. **Background Sync** - Offline operation support
4. **Caching Strategy** - Smart cache invalidation

---

## 📞 Support

If you encounter any issues during setup:
1. Check the browser console for error messages
2. Verify your Supabase project settings
3. Ensure all SQL commands ran successfully
4. Test with a simple property creation first

The integration is now complete and ready for production use! 🎉 