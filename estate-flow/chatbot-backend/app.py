from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv
import json
import logging

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PropertyAnalyzer:
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        if self.api_key:
            try:
                self.client = openai.OpenAI(api_key=self.api_key)
                logger.info("OpenAI client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {str(e)}")
                self.client = None
        else:
            logger.warning("No OpenAI API key found")
            self.client = None
    
    def analyze_properties(self, properties, user_message):
        """Analyze properties and generate insights based on user query"""
        
        try:
            # Ensure properties is a list
            if not isinstance(properties, list):
                logger.warning("Properties data is not a list")
                return "I'm having trouble reading your property data. Please make sure you have imported your properties correctly."
            
            # Extract key metrics from properties
            total_properties = len(properties)
            total_units = sum(len(prop.get('units', [])) for prop in properties if isinstance(prop, dict))
            
            occupied_units = []
            vacant_units = []
            total_revenue = 0
            
            for prop in properties:
                for unit in prop.get('units', []):
                    tenant = unit.get('tenant')
                    if tenant and isinstance(tenant, dict) and tenant.get('name'):
                        occupied_units.append(unit)
                        rent = self._parse_rent(unit.get('rent', 0))
                        total_revenue += rent
                    else:
                        vacant_units.append(unit)
            
            occupancy_rate = (len(occupied_units) / total_units * 100) if total_units > 0 else 0
            
            # Create property summary for AI
            property_summary = {
                "total_properties": total_properties,
                "total_units": total_units,
                "occupied_units": len(occupied_units),
                "vacant_units": len(vacant_units),
                "occupancy_rate": round(occupancy_rate, 1),
                "monthly_revenue": total_revenue,
                "annual_revenue": total_revenue * 12,
                "properties": []
            }
            
            # Add detailed property information
            for prop in properties:
                property_info = {
                    "name": prop.get('name', 'Unknown'),
                    "address": prop.get('address', 'Unknown'),
                    "total_units": len(prop.get('units', [])),
                    "units": []
                }
                
                prop_revenue = 0
                prop_occupied = 0
                
                for unit in prop.get('units', []):
                    tenant = unit.get('tenant', {})
                    rent = self._parse_rent(unit.get('rent', 0))
                    
                    unit_info = {
                        "number": unit.get('number', 'Unknown'),
                        "bedrooms": unit.get('bedrooms', 0),
                        "bathrooms": unit.get('bathrooms', 0),
                        "square_feet": unit.get('squareFeet', 0),
                        "rent": rent,
                        "is_occupied": bool(tenant and isinstance(tenant, dict) and tenant.get('name')),
                        "tenant_name": tenant.get('name') if tenant and isinstance(tenant, dict) else None
                    }
                    
                    if unit_info["is_occupied"]:
                        prop_revenue += rent
                        prop_occupied += 1
                    
                    property_info["units"].append(unit_info)
                
                property_info["monthly_revenue"] = prop_revenue
                property_info["occupancy_rate"] = round((prop_occupied / len(prop.get('units', [])) * 100) if len(prop.get('units', [])) > 0 else 0, 1)
                property_summary["properties"].append(property_info)
            
            return self._generate_ai_response(property_summary, user_message)
            
        except Exception as e:
            logger.error(f"Error in analyze_properties method: {str(e)}")
            # Create basic property data for fallback
            fallback_data = {
                "total_properties": len(properties) if isinstance(properties, list) else 0,
                "total_units": 0,
                "occupied_units": 0,
                "vacant_units": 0,
                "occupancy_rate": 0,
                "monthly_revenue": 0,
                "annual_revenue": 0
            }
            return self._generate_fallback_response(fallback_data, user_message)
    
    def _parse_rent(self, rent_value):
        """Parse rent value to float, handling various formats"""
        if isinstance(rent_value, (int, float)):
            return float(rent_value)
        
        if isinstance(rent_value, str):
            # Remove currency symbols, commas, and spaces
            cleaned = rent_value.replace('$', '').replace(',', '').replace(' ', '')
            try:
                return float(cleaned)
            except ValueError:
                return 0.0
        
        return 0.0
    
    def _generate_ai_response(self, property_data, user_message):
        """Generate AI response using OpenAI API"""
        
        # Check if OpenAI client is available
        if not self.client:
            logger.info("OpenAI client not available, using fallback response")
            return self._generate_fallback_response(property_data, user_message)
        
        system_prompt = f"""You are an expert property management AI assistant. You have access to detailed property portfolio data and can provide insights, analysis, and recommendations.

Current Portfolio Overview:
- Total Properties: {property_data['total_properties']}
- Total Units: {property_data['total_units']}
- Occupied Units: {property_data['occupied_units']}
- Vacant Units: {property_data['vacant_units']}
- Occupancy Rate: {property_data['occupancy_rate']}%
- Monthly Revenue: ${property_data['monthly_revenue']:,.2f}
- Annual Revenue: ${property_data['annual_revenue']:,.2f}

Detailed Property Data:
{json.dumps(property_data['properties'], indent=2)}

You should:
1. Answer user questions directly and accurately based on the data
2. Provide actionable insights and recommendations
3. Identify trends, opportunities, and potential issues
4. Be conversational and helpful
5. Use specific numbers and data points when relevant
6. Suggest improvements for revenue optimization, occupancy rates, or operational efficiency
7. If asked about specific properties or units, provide detailed information
8. If the question is general, provide portfolio-wide insights
9. For questions about specific tenants, units, or properties, analyze the actual data to find the answer
10. Be able to handle obscure or complex questions by reasoning about the data

Keep responses concise but informative. Use bullet points for lists when appropriate."""

        try:
            logger.info(f"Sending request to OpenAI API for message: {user_message}")
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Using more cost-effective model
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            ai_response = response.choices[0].message.content
            logger.info("Successfully received response from OpenAI API")
            return ai_response
            
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            
            # Check for specific error types
            error_str = str(e).lower()
            if "insufficient_quota" in error_str or "quota" in error_str:
                logger.error("OpenAI API quota exceeded")
                return "❌ **OpenAI API Issue**: Your API quota has been exceeded. Please check your OpenAI billing settings and add credits to your account."
            elif "invalid_api_key" in error_str or "unauthorized" in error_str or "401" in error_str:
                logger.error("Invalid or insufficient OpenAI API key permissions")
                return "🔑 **API Key Issue**: Your OpenAI API key doesn't have the required permissions. Please:\n\n• Get a new API key from https://platform.openai.com/api-keys\n• Ensure your OpenAI account has billing set up\n• Make sure the key has 'model.request' permissions\n\nUsing basic analysis for now: " + self._generate_fallback_response(property_data, user_message)
            elif "rate_limit" in error_str:
                logger.error("OpenAI API rate limit exceeded")
                return "⏱️ **Rate Limit**: Too many requests to OpenAI API. Please wait a moment and try again."
            else:
                logger.error(f"Unknown OpenAI error: {str(e)}")
                return f"🔧 **Technical Issue**: {str(e)[:100]}...\n\nUsing basic analysis: " + self._generate_fallback_response(property_data, user_message)
    
    def _generate_fallback_response(self, property_data, user_message):
        """Generate a fallback response when OpenAI API is not available"""
        
        message_lower = user_message.lower()
        
        # Ensure property_data has all required fields
        total_properties = property_data.get('total_properties', 0)
        total_units = property_data.get('total_units', 0)
        occupied_units = property_data.get('occupied_units', 0)
        vacant_units = property_data.get('vacant_units', 0)
        occupancy_rate = property_data.get('occupancy_rate', 0)
        monthly_revenue = property_data.get('monthly_revenue', 0)
        annual_revenue = property_data.get('annual_revenue', 0)
        
        # Advanced analytical queries
        if any(phrase in message_lower for phrase in ['highest rent', 'most rent', 'pays the most', 'highest paying']):
            return self._find_highest_rent_tenant(property_data)
        
        elif any(phrase in message_lower for phrase in ['lowest rent', 'least rent', 'pays the least', 'cheapest']):
            return self._find_lowest_rent_tenant(property_data)
        
        elif any(phrase in message_lower for phrase in ['vacant units', 'empty units', 'available units']):
            return self._list_vacant_units(property_data)
        
        elif any(phrase in message_lower for phrase in ['which property', 'best property', 'most revenue property']):
            return self._analyze_property_performance(property_data)
        
        # Basic keyword matching for common queries
        elif any(word in message_lower for word in ['occupancy', 'vacant', 'empty', 'available']):
            return f"Your current occupancy rate is {occupancy_rate}%. You have {vacant_units} vacant units out of {total_units} total units. " + \
                   ("This is a good occupancy rate!" if occupancy_rate >= 95 else "Consider marketing strategies to fill vacant units.")
        
        elif any(word in message_lower for word in ['revenue', 'income', 'money', 'profit']):
            if occupied_units > 0:
                avg_rent = monthly_revenue / occupied_units
                return f"Your portfolio generates ${monthly_revenue:,.2f} in monthly revenue and ${annual_revenue:,.2f} annually. " + \
                       f"With {occupied_units} occupied units, that's an average of ${avg_rent:,.2f} per unit per month."
            else:
                return f"Your portfolio could generate revenue once you have tenants. You currently have {total_units} units available for rent."
        
        elif any(word in message_lower for word in ['property', 'properties', 'building']):
            return f"You have {total_properties} properties with a total of {total_units} units. " + \
                   f"Your portfolio maintains a {occupancy_rate}% occupancy rate."
        
        elif any(word in message_lower for word in ['tenant', 'tenants', 'renter']):
            return f"You currently have {occupied_units} tenants across your {total_properties} properties. " + \
                   f"Your occupancy rate is {occupancy_rate}%."
        
        elif any(word in message_lower for word in ['improve', 'better', 'optimize', 'increase']):
            suggestions = []
            if occupancy_rate < 95:
                suggestions.append("Focus on filling vacant units to increase revenue")
            if total_units > 0 and occupied_units > 0:
                avg_rent = monthly_revenue / occupied_units
                suggestions.append(f"Review market rates - your average rent is ${avg_rent:.2f}")
            suggestions.append("Consider property maintenance and improvements to justify higher rents")
            
            return "Here are some suggestions to improve your portfolio:\n• " + "\n• ".join(suggestions)
        
        else:
            return f"I can help you analyze your {total_properties} properties with {total_units} units. " + \
                   f"You're currently at {occupancy_rate}% occupancy generating ${monthly_revenue:,.2f}/month. " + \
                   "Try asking about occupancy rates, revenue, specific properties, or ways to improve your portfolio!"
    
    def _find_highest_rent_tenant(self, property_data):
        """Find the tenant who pays the highest rent"""
        properties = property_data.get('properties', [])
        if not properties:
            return "No property data available to analyze tenant rents."
        
        highest_rent = 0
        highest_rent_tenant = None
        highest_rent_unit = None
        highest_rent_property = None
        
        for prop in properties:
            for unit in prop.get('units', []):
                if unit.get('is_occupied') and unit.get('tenant_name'):
                    rent = unit.get('rent', 0)
                    if rent > highest_rent:
                        highest_rent = rent
                        highest_rent_tenant = unit.get('tenant_name')
                        highest_rent_unit = unit.get('number')
                        highest_rent_property = prop.get('name')
        
        if highest_rent_tenant:
            return f"The tenant who pays the most rent is **{highest_rent_tenant}** in unit #{highest_rent_unit} at {highest_rent_property}, paying ${highest_rent:,.2f} per month."
        else:
            return "I couldn't find any occupied units with tenant information to compare rents."
    
    def _find_lowest_rent_tenant(self, property_data):
        """Find the tenant who pays the lowest rent"""
        properties = property_data.get('properties', [])
        if not properties:
            return "No property data available to analyze tenant rents."
        
        lowest_rent = float('inf')
        lowest_rent_tenant = None
        lowest_rent_unit = None
        lowest_rent_property = None
        
        for prop in properties:
            for unit in prop.get('units', []):
                if unit.get('is_occupied') and unit.get('tenant_name'):
                    rent = unit.get('rent', 0)
                    if rent > 0 and rent < lowest_rent:
                        lowest_rent = rent
                        lowest_rent_tenant = unit.get('tenant_name')
                        lowest_rent_unit = unit.get('number')
                        lowest_rent_property = prop.get('name')
        
        if lowest_rent_tenant:
            return f"The tenant who pays the least rent is **{lowest_rent_tenant}** in unit #{lowest_rent_unit} at {lowest_rent_property}, paying ${lowest_rent:,.2f} per month."
        else:
            return "I couldn't find any occupied units with tenant information to compare rents."
    
    def _list_vacant_units(self, property_data):
        """List all vacant units"""
        properties = property_data.get('properties', [])
        if not properties:
            return "No property data available to analyze vacant units."
        
        vacant_units = []
        for prop in properties:
            for unit in prop.get('units', []):
                if not unit.get('is_occupied'):
                    vacant_units.append({
                        'property': prop.get('name'),
                        'unit': unit.get('number'),
                        'rent': unit.get('rent', 0),
                        'bedrooms': unit.get('bedrooms', 0),
                        'bathrooms': unit.get('bathrooms', 0)
                    })
        
        if not vacant_units:
            return "Great news! You have no vacant units. All your properties are fully occupied."
        
        response = f"You have {len(vacant_units)} vacant units:\n\n"
        for unit in vacant_units:
            response += f"• **{unit['property']}** - Unit #{unit['unit']} | {unit['bedrooms']}BR/{unit['bathrooms']}BA | ${unit['rent']:,.2f}/mo\n"
        
        potential_revenue = sum(unit['rent'] for unit in vacant_units)
        response += f"\nPotential additional monthly revenue: ${potential_revenue:,.2f}"
        
        return response
    
    def _analyze_property_performance(self, property_data):
        """Analyze which properties perform best"""
        properties = property_data.get('properties', [])
        if not properties:
            return "No property data available to analyze performance."
        
        property_performance = []
        for prop in properties:
            revenue = prop.get('monthly_revenue', 0)
            occupancy = prop.get('occupancy_rate', 0)
            units = prop.get('total_units', 0)
            
            property_performance.append({
                'name': prop.get('name'),
                'revenue': revenue,
                'occupancy': occupancy,
                'units': units,
                'avg_rent': revenue / max(1, units) if units > 0 else 0
            })
        
        # Sort by revenue (highest first)
        property_performance.sort(key=lambda x: x['revenue'], reverse=True)
        
        response = "Here's your property performance analysis:\n\n"
        for i, prop in enumerate(property_performance[:3], 1):
            response += f"{i}. **{prop['name']}**\n"
            response += f"   • Revenue: ${prop['revenue']:,.2f}/month\n"
            response += f"   • Occupancy: {prop['occupancy']}%\n"
            response += f"   • Average rent: ${prop['avg_rent']:,.2f}\n\n"
        
        best_property = property_performance[0]
        response += f"Your top performer is **{best_property['name']}** generating ${best_property['revenue']:,.2f} monthly."
        
        return response

# Initialize the analyzer
analyzer = PropertyAnalyzer()

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        user_message = data.get('message', '')
        properties = data.get('properties', [])
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        logger.info(f"Received message: {user_message}")
        logger.info(f"Properties count: {len(properties)}")
        
        # Generate response
        if not properties:
            response = "I don't see any property data yet. Please import your properties using the CSV upload feature, then I can help you analyze your portfolio!"
        else:
            response = analyzer.analyze_properties(properties, user_message)
        
        return jsonify({'response': response})
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Chatbot backend is running'})

@app.route('/', methods=['GET'])
def root():
    """Root endpoint with API information"""
    return jsonify({
        'message': 'EstateFlow Chatbot Backend',
        'version': '1.0.0',
        'endpoints': {
            '/chat': 'POST - Send messages to the AI assistant',
            '/health': 'GET - Health check',
        }
    })

if __name__ == '__main__':
    # Check if OpenAI API key is set
    if not os.getenv('OPENAI_API_KEY'):
        logger.warning("OPENAI_API_KEY not found in environment variables. The chatbot will use fallback responses.")
    
    app.run(debug=True, host='0.0.0.0', port=5001) 