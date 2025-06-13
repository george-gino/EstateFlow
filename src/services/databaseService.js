import { supabase } from '../supabaseClient';

/**
 * Database service for EstateFlow property management
 * Handles all CRUD operations for properties, units, and tenants
 */

// Properties CRUD Operations
export const propertyService = {
  // Get all properties with their units and tenants
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          units (
            *,
            tenant:tenants(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in propertyService.getAll:', error);
      return [];
    }
  },

  // Get a single property by ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          units (
            *,
            tenant:tenants(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching property:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in propertyService.getById:', error);
      return null;
    }
  },

  // Create a new property
  async create(propertyData) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([{
          name: propertyData.name,
          address: propertyData.address,
          num_units: propertyData.numUnits,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating property:', error);
        throw error;
      }

      // Create units for this property
      if (propertyData.units && propertyData.units.length > 0) {
        const unitsToCreate = propertyData.units.map(unit => ({
          property_id: data.id,
          unit_number: unit.number,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          square_feet: unit.squareFeet ? parseInt(unit.squareFeet) : null,
          rent_amount: unit.rent ? parseFloat(unit.rent) : null,
          is_occupied: !!unit.tenant,
          created_at: new Date().toISOString()
        }));

        const { data: unitsData, error: unitsError } = await supabase
          .from('units')
          .insert(unitsToCreate)
          .select();

        if (unitsError) {
          console.error('Error creating units:', unitsError);
          // Property was created but units failed - still return the property
        }

        // Create tenants if any
        for (let i = 0; i < propertyData.units.length; i++) {
          const unit = propertyData.units[i];
          if (unit.tenant && unitsData && unitsData[i]) {
            await tenantService.create({
              ...unit.tenant,
              unit_id: unitsData[i].id
            });
          }
        }
      }

      return data;
    } catch (error) {
      console.error('Error in propertyService.create:', error);
      throw error;
    }
  },

  // Update an existing property
  async update(id, propertyData) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update({
          name: propertyData.name,
          address: propertyData.address,
          num_units: propertyData.numUnits,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating property:', error);
        throw error;
      }

      // Update units - this is more complex as we need to handle adds/updates/deletes
      if (propertyData.units) {
        // Get existing units
        const { data: existingUnits } = await supabase
          .from('units')
          .select('*')
          .eq('property_id', id);

        const existingUnitIds = (existingUnits || []).map(unit => unit.id);
        const updatedUnitIds = propertyData.units
          .filter(unit => unit.id && typeof unit.id === 'number' && unit.id > 1000)
          .map(unit => unit.id);

        // Delete units that are no longer in the update
        const unitsToDelete = existingUnitIds.filter(unitId => !updatedUnitIds.includes(unitId));
        if (unitsToDelete.length > 0) {
          await supabase
            .from('units')
            .delete()
            .in('id', unitsToDelete);
        }

        // Update or create units
        for (const unit of propertyData.units) {
          if (unit.id && typeof unit.id === 'number' && unit.id > 1000) {
            // Update existing unit
            await unitService.update(unit.id, unit);
          } else {
            // Create new unit
            await unitService.create({
              ...unit,
              property_id: id
            });
          }
        }
      }

      return data;
    } catch (error) {
      console.error('Error in propertyService.update:', error);
      throw error;
    }
  },

  // Delete a property
  async delete(id) {
    try {
      // Delete related tenants first
      const { data: units } = await supabase
        .from('units')
        .select('id')
        .eq('property_id', id);

      if (units && units.length > 0) {
        const unitIds = units.map(unit => unit.id);
        await supabase
          .from('tenants')
          .delete()
          .in('unit_id', unitIds);
      }

      // Delete units
      await supabase
        .from('units')
        .delete()
        .eq('property_id', id);

      // Delete property
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting property:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in propertyService.delete:', error);
      throw error;
    }
  }
};

// Units CRUD Operations
export const unitService = {
  // Create a new unit
  async create(unitData) {
    try {
      const { data, error } = await supabase
        .from('units')
        .insert([{
          property_id: unitData.property_id,
          unit_number: unitData.number,
          bedrooms: unitData.bedrooms,
          bathrooms: unitData.bathrooms,
          square_feet: unitData.squareFeet ? parseInt(unitData.squareFeet) : null,
          rent_amount: unitData.rent ? parseFloat(unitData.rent) : null,
          is_occupied: !!unitData.tenant,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating unit:', error);
        throw error;
      }

      // Create tenant if provided
      if (unitData.tenant) {
        await tenantService.create({
          ...unitData.tenant,
          unit_id: data.id
        });
      }

      return data;
    } catch (error) {
      console.error('Error in unitService.create:', error);
      throw error;
    }
  },

  // Update an existing unit
  async update(id, unitData) {
    try {
      const { data, error } = await supabase
        .from('units')
        .update({
          unit_number: unitData.number,
          bedrooms: unitData.bedrooms,
          bathrooms: unitData.bathrooms,
          square_feet: unitData.squareFeet ? parseInt(unitData.squareFeet) : null,
          rent_amount: unitData.rent ? parseFloat(unitData.rent) : null,
          is_occupied: !!unitData.tenant,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating unit:', error);
        throw error;
      }

      // Handle tenant updates
      if (unitData.tenant) {
        // Check if tenant already exists for this unit
        const { data: existingTenant } = await supabase
          .from('tenants')
          .select('*')
          .eq('unit_id', id)
          .single();

        if (existingTenant) {
          await tenantService.update(existingTenant.id, unitData.tenant);
        } else {
          await tenantService.create({
            ...unitData.tenant,
            unit_id: id
          });
        }
      } else {
        // Remove tenant if none provided
        await supabase
          .from('tenants')
          .delete()
          .eq('unit_id', id);
      }

      return data;
    } catch (error) {
      console.error('Error in unitService.update:', error);
      throw error;
    }
  }
};

// Tenants CRUD Operations
export const tenantService = {
  // Get all tenants
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          unit:units(
            *,
            property:properties(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tenants:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in tenantService.getAll:', error);
      return [];
    }
  },

  // Create a new tenant
  async create(tenantData) {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .insert([{
          unit_id: tenantData.unit_id,
          name: tenantData.name,
          email: tenantData.email,
          phone: tenantData.phone,
          lease_start: tenantData.leaseStart,
          lease_end: tenantData.leaseEnd,
          rent_paid: tenantData.rentPaid || false,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating tenant:', error);
        throw error;
      }

      // Update unit occupancy status
      await supabase
        .from('units')
        .update({ is_occupied: true })
        .eq('id', tenantData.unit_id);

      return data;
    } catch (error) {
      console.error('Error in tenantService.create:', error);
      throw error;
    }
  },

  // Update an existing tenant
  async update(id, tenantData) {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .update({
          name: tenantData.name,
          email: tenantData.email,
          phone: tenantData.phone,
          lease_start: tenantData.leaseStart,
          lease_end: tenantData.leaseEnd,
          rent_paid: tenantData.rentPaid || false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating tenant:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in tenantService.update:', error);
      throw error;
    }
  },

  // Delete a tenant
  async delete(id) {
    try {
      // Get the unit_id before deleting
      const { data: tenant } = await supabase
        .from('tenants')
        .select('unit_id')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting tenant:', error);
        throw error;
      }

      // Update unit occupancy status
      if (tenant) {
        await supabase
          .from('units')
          .update({ is_occupied: false })
          .eq('id', tenant.unit_id);
      }

      return true;
    } catch (error) {
      console.error('Error in tenantService.delete:', error);
      throw error;
    }
  }
};

// Utility function to transform Supabase data to frontend format
export const transformSupabaseData = (properties) => {
  if (!properties) return [];
  
  return properties.map(property => ({
    id: property.id,
    name: property.name,
    address: property.address,
    numUnits: property.num_units,
    createdAt: property.created_at,
    updatedAt: property.updated_at,
    units: (property.units || []).map(unit => ({
      id: unit.id,
      number: unit.unit_number,
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
      squareFeet: unit.square_feet?.toString() || '',
      rent: unit.rent_amount?.toString() || '',
      tenant: unit.tenant ? {
        id: unit.tenant.id,
        name: unit.tenant.name,
        email: unit.tenant.email,
        phone: unit.tenant.phone,
        leaseStart: unit.tenant.lease_start,
        leaseEnd: unit.tenant.lease_end,
        rentPaid: unit.tenant.rent_paid
      } : null,
      rentPaid: unit.tenant?.rent_paid || false
    }))
  }));
};

// CSV Import service
export const csvImportService = {
  async importProperties(csvData) {
    try {
      const results = [];
      
      for (const propertyData of csvData) {
        const result = await propertyService.create(propertyData);
        results.push(result);
      }
      
      return results;
    } catch (error) {
      console.error('Error importing CSV data:', error);
      throw error;
    }
  }
}; 