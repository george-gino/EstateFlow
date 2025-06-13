import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { propertyService, transformSupabaseData } from '../services/databaseService';

const DebugDatabase = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [currentData, setCurrentData] = useState(null);

  // Add console logs to debug visibility
  console.log('🔍 DebugDatabase component loaded!');
  console.log('🔍 isVisible:', isVisible);

  const addTestResult = (test, result, error = null, data = null) => {
    setTestResults(prev => [...prev, {
      test,
      result,
      error,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runFullDataFlowTest = async () => {
    setIsLoading(true);
    setTestResults([]);

    // Test 1: Basic connection
    try {
      const { data, error } = await supabase.from('properties').select('count');
      if (error) {
        addTestResult('1. Basic Connection', 'Failed', error.message);
        return;
      } else {
        addTestResult('1. Basic Connection', 'Success');
      }
    } catch (error) {
      addTestResult('1. Basic Connection', 'Failed', error.message);
      return;
    }

    // Test 2: Get current data count
    try {
      const { data: properties, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        addTestResult('2. Count Current Data', 'Failed', error.message);
      } else {
        addTestResult('2. Count Current Data', `Found ${properties.length} properties`, null, properties);
        setCurrentData(properties);
      }
    } catch (error) {
      addTestResult('2. Count Current Data', 'Failed', error.message);
    }

    // Test 3: Test propertyService.create (what Dashboard uses)
    const testProperty = {
      name: 'Debug Test Property - ' + Date.now(),
      address: '123 Debug Street, Test City, TC 12345',
      numUnits: 2,
      units: [
        {
          number: '1A',
          bedrooms: 1,
          bathrooms: 1,
          squareFeet: '500',
          rent: '1000'
        },
        {
          number: '1B',
          bedrooms: 2,
          bathrooms: 1,
          squareFeet: '750',
          rent: '1200'
        }
      ]
    };

    try {
      const result = await propertyService.create(testProperty);
      addTestResult('3. propertyService.create', `Success - Created ID: ${result.id}`, null, result);
    } catch (error) {
      addTestResult('3. propertyService.create', 'Failed', error.message);
    }

    // Test 4: Test propertyService.getAll (what Dashboard uses to load)
    try {
      const properties = await propertyService.getAll();
      addTestResult('4. propertyService.getAll', `Success - Found ${properties.length} properties`, null, properties);
    } catch (error) {
      addTestResult('4. propertyService.getAll', 'Failed', error.message);
    }

    // Test 5: Test data transformation (what Dashboard uses)
    try {
      const rawProperties = await propertyService.getAll();
      const transformedProperties = transformSupabaseData(rawProperties);
      addTestResult('5. Data Transformation', `Success - Transformed ${transformedProperties.length} properties`, null, {
        raw: rawProperties,
        transformed: transformedProperties
      });
    } catch (error) {
      addTestResult('5. Data Transformation', 'Failed', error.message);
    }

    // Test 6: Check database after operations
    try {
      const { data: finalProperties, error } = await supabase
        .from('properties')
        .select(`
          *,
          units (*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        addTestResult('6. Final Database State', 'Failed', error.message);
      } else {
        addTestResult('6. Final Database State', `Found ${finalProperties.length} properties total`, null, finalProperties);
      }
    } catch (error) {
      addTestResult('6. Final Database State', 'Failed', error.message);
    }

    // Test 7: Direct comparison test
    try {
      // Insert directly via Supabase
      const { data: directInsert, error: directError } = await supabase
        .from('properties')
        .insert([{ 
          name: 'Direct Insert Test - ' + Date.now(), 
          address: '456 Direct Street', 
          num_units: 1 
        }])
        .select();
      
      if (directError) {
        addTestResult('7. Direct Insert Test', 'Failed', directError.message);
      } else {
        addTestResult('7. Direct Insert Test', `Success - ID: ${directInsert[0]?.id}`, null, directInsert[0]);
        
        // Now test if we can read it back
        const allPropsAfter = await propertyService.getAll();
        addTestResult('7b. Read After Direct Insert', `Found ${allPropsAfter.length} properties`);
      }
    } catch (error) {
      addTestResult('7. Direct Insert Test', 'Failed', error.message);
    }

    setIsLoading(false);
  };

  const runCleanupTest = async () => {
    try {
      // Delete test properties
      const { data: testProps, error } = await supabase
        .from('properties')
        .select('id, name')
        .or('name.ilike.%Debug Test%,name.ilike.%Direct Insert Test%');
      
      if (!error && testProps.length > 0) {
        for (const prop of testProps) {
          await supabase.from('properties').delete().eq('id', prop.id);
        }
        addTestResult('Cleanup', `Deleted ${testProps.length} test properties`);
      }
    } catch (error) {
      addTestResult('Cleanup', 'Failed', error.message);
    }
  };

  useEffect(() => {
    runFullDataFlowTest();
  }, []);

  if (!isVisible) {
    return (
      <div>
        <button 
          onClick={() => setIsVisible(true)}
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            padding: '15px 20px',
            background: '#ff0000',
            color: 'white',
            border: '3px solid #ffffff',
            borderRadius: '8px',
            cursor: 'pointer',
            zIndex: 99999,
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 4px 20px rgba(255,0,0,0.6)',
            animation: 'blink 1s infinite'
          }}
        >
          🔍 SHOW DEBUG PANEL
        </button>
        <style>{`
          @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '5px solid #ff0000', 
      padding: '20px', 
      borderRadius: '12px',
      minWidth: '550px',
      maxWidth: '650px',
      maxHeight: '85vh',
      overflow: 'auto',
      zIndex: 99999,
      fontSize: '12px',
      boxShadow: '0 8px 32px rgba(255,0,0,0.4)',
      animation: 'pulse 2s infinite'
    }}>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 8px 32px rgba(255,0,0,0.4); }
          50% { box-shadow: 0 8px 32px rgba(255,0,0,0.8); }
          100% { box-shadow: 0 8px 32px rgba(255,0,0,0.4); }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#ff0000', fontSize: '16px', fontWeight: 'bold' }}>
          🔍 DATA FLOW DEBUG PANEL - VISIBLE?
        </h3>
        <button 
          onClick={() => setIsVisible(false)}
          style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#ff0000' }}
        >
          ×
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
        <button 
          onClick={runFullDataFlowTest} 
          disabled={isLoading} 
          style={{ 
            padding: '6px 10px',
            background: isLoading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '10px'
          }}
        >
          {isLoading ? 'Testing...' : 'Run Full Test'}
        </button>
        
        <button 
          onClick={runCleanupTest} 
          style={{ 
            padding: '6px 10px',
            background: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Cleanup Tests
        </button>
      </div>
      
      <div>
        {testResults.length === 0 && !isLoading && (
          <div style={{ padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
            No tests run yet. Click "Run Full Test" to start.
          </div>
        )}
        
        {testResults.map((result, index) => (
          <div key={index} style={{ 
            marginBottom: '8px', 
            padding: '8px', 
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: result.error ? '#ffebee' : '#e8f5e8'
          }}>
            <strong style={{ color: result.error ? '#d32f2f' : '#2e7d32' }}>
              {result.error ? '❌' : '✅'} {result.test}
            </strong>: {result.result}
            <br />
            <small style={{ color: '#666' }}>{result.timestamp}</small>
            {result.error && (
              <div style={{ color: '#d32f2f', fontSize: '10px', marginTop: '4px', fontFamily: 'monospace' }}>
                Error: {result.error}
              </div>
            )}
            {result.data && (
              <details style={{ marginTop: '4px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '10px', color: '#666' }}>
                  View Data ({Array.isArray(result.data) ? result.data.length + ' items' : 'object'})
                </summary>
                <pre style={{ 
                  fontSize: '9px', 
                  background: '#f5f5f5', 
                  padding: '4px', 
                  borderRadius: '2px', 
                  overflow: 'auto',
                  maxHeight: '100px',
                  marginTop: '4px'
                }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugDatabase; 