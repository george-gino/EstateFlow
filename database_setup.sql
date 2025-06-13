-- EstateFlow Database Setup for Supabase
-- Run these commands in the Supabase SQL Editor

-- Enable Row Level Security
ALTER TABLE IF EXISTS public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tenants ENABLE ROW LEVEL SECURITY;

-- Drop existing tables if they exist (optional - only for fresh setup)
-- DROP TABLE IF EXISTS public.tenants CASCADE;
-- DROP TABLE IF EXISTS public.units CASCADE;
-- DROP TABLE IF EXISTS public.properties CASCADE;

-- Create Properties table
CREATE TABLE IF NOT EXISTS public.properties (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    num_units INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Units table
CREATE TABLE IF NOT EXISTS public.units (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT REFERENCES public.properties(id) ON DELETE CASCADE,
    unit_number VARCHAR(50) NOT NULL,
    bedrooms INTEGER DEFAULT 1,
    bathrooms INTEGER DEFAULT 1,
    square_feet INTEGER,
    rent_amount DECIMAL(10,2),
    is_occupied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
    id BIGSERIAL PRIMARY KEY,
    unit_id BIGINT REFERENCES public.units(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    lease_start DATE,
    lease_end DATE,
    rent_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_units_property_id ON public.units(property_id);
CREATE INDEX IF NOT EXISTS idx_tenants_unit_id ON public.tenants(unit_id);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at);
CREATE INDEX IF NOT EXISTS idx_units_is_occupied ON public.units(is_occupied);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_units_updated_at ON public.units;
CREATE TRIGGER update_units_updated_at
    BEFORE UPDATE ON public.units
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenants_updated_at ON public.tenants;
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies (Allow all operations for now - you can restrict later)
-- Properties policies
DROP POLICY IF EXISTS "Allow all operations on properties" ON public.properties;
CREATE POLICY "Allow all operations on properties" ON public.properties
    FOR ALL USING (true) WITH CHECK (true);

-- Units policies
DROP POLICY IF EXISTS "Allow all operations on units" ON public.units;
CREATE POLICY "Allow all operations on units" ON public.units
    FOR ALL USING (true) WITH CHECK (true);

-- Tenants policies
DROP POLICY IF EXISTS "Allow all operations on tenants" ON public.tenants;
CREATE POLICY "Allow all operations on tenants" ON public.tenants
    FOR ALL USING (true) WITH CHECK (true);

-- Insert some sample data (optional)
INSERT INTO public.properties (name, address, num_units) VALUES 
    ('Sample Property', '123 Main Street, Sample City, SC 12345', 2)
ON CONFLICT DO NOTHING;

-- Get the property ID for sample units
DO $$
DECLARE
    property_id BIGINT;
BEGIN
    SELECT id INTO property_id FROM public.properties WHERE name = 'Sample Property' LIMIT 1;
    
    IF property_id IS NOT NULL THEN
        INSERT INTO public.units (property_id, unit_number, bedrooms, bathrooms, square_feet, rent_amount, is_occupied) VALUES 
            (property_id, '101', 2, 1, 850, 1200.00, false),
            (property_id, '102', 1, 1, 650, 950.00, false)
        ON CONFLICT DO NOTHING;
    END IF;
END $$; 