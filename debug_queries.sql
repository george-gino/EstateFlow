-- Debug queries to check EstateFlow database state
-- Run these in Supabase SQL Editor to see what's in the database

-- 1. Check if tables exist and their structure
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('properties', 'units', 'tenants')
ORDER BY table_name, ordinal_position;

-- 2. Count records in each table
SELECT 
  (SELECT COUNT(*) FROM public.properties) as properties_count,
  (SELECT COUNT(*) FROM public.units) as units_count,
  (SELECT COUNT(*) FROM public.tenants) as tenants_count;

-- 3. Show all properties with their units
SELECT 
  p.*,
  json_agg(
    json_build_object(
      'id', u.id,
      'unit_number', u.unit_number,
      'bedrooms', u.bedrooms,
      'bathrooms', u.bathrooms,
      'rent_amount', u.rent_amount,
      'is_occupied', u.is_occupied
    )
  ) as units
FROM public.properties p
LEFT JOIN public.units u ON p.id = u.property_id
GROUP BY p.id, p.name, p.address, p.num_units, p.created_at, p.updated_at
ORDER BY p.created_at DESC;

-- 4. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('properties', 'units', 'tenants');

-- 5. Simple insert test (run this to test if you can manually insert)
-- INSERT INTO public.properties (name, address, num_units) 
-- VALUES ('Manual Test Property', '456 Test Ave', 1);

-- 6. Check what's actually in properties table right now
SELECT * FROM public.properties ORDER BY created_at DESC LIMIT 10; 