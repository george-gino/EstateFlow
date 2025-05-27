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
        
        system_prompt = f"""You are a friendly, knowledgeable property management assistant. You speak naturally and conversationally, like you're chatting with a friend who owns rental properties.

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

IMPORTANT FORMATTING RULES:
- Write responses in a natural, conversational tone
- NO markdown formatting (no **, *, #, or - symbols)
- NO bullet points or numbered lists
- Use plain text only, like you're having a conversation
- Make responses feel personal and friendly
- Use "you" and "your" to keep it conversational
- When mentioning specific numbers, work them naturally into sentences
- Keep responses concise but informative
- If listing multiple items, use commas or write them in paragraph form

Example good response: "Looking at your portfolio, I can see you have 3 vacant units right now. The most expensive one is unit PH2 at Luxury Towers, which could bring in $8,500 per month once rented. That's a 4-bedroom, 4-bathroom penthouse with 3,500 square feet. It's definitely your premium unit!"

Answer questions directly based on the data and provide helpful insights in a conversational way."""

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
                return "I'm having trouble connecting to my AI service right now due to quota limits. Let me help you with a basic analysis instead! " + self._generate_fallback_response(property_data, user_message)
            elif "invalid_api_key" in error_str or "unauthorized" in error_str or "401" in error_str:
                logger.error("Invalid or insufficient OpenAI API key permissions")
                return "I'm having some technical difficulties with my AI connection. No worries though, I can still help you analyze your portfolio! " + self._generate_fallback_response(property_data, user_message)
            elif "rate_limit" in error_str:
                logger.error("OpenAI API rate limit exceeded")
                return "I'm getting a lot of questions right now! Give me just a moment and try asking again."
            else:
                logger.error(f"Unknown OpenAI error: {str(e)}")
                return "I'm experiencing some technical issues, but I can still help you out! " + self._generate_fallback_response(property_data, user_message)
    
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
        
        elif any(phrase in message_lower for phrase in ['most expensive vacant', 'highest rent vacant', 'expensive vacant']):
            return self._find_most_expensive_vacant_unit(property_data)
        
        elif any(phrase in message_lower for phrase in ['vacant units', 'empty units', 'available units']):
            return self._list_vacant_units(property_data)
        
        elif any(phrase in message_lower for phrase in ['which property', 'best property', 'most revenue property']):
            return self._analyze_property_performance(property_data)
        
        # Basic keyword matching for common queries
        elif any(word in message_lower for word in ['occupancy', 'vacant', 'empty', 'available']):
            response = f"Your current occupancy rate is {occupancy_rate}%. You have {vacant_units} vacant units out of {total_units} total units."
            if occupancy_rate >= 95:
                response += " That's excellent! Your properties are performing really well."
            else:
                response += " You might want to focus on marketing strategies to fill those empty units."
            return response
        
        elif any(word in message_lower for word in ['revenue', 'income', 'money', 'profit']):
            if occupied_units > 0:
                avg_rent = monthly_revenue / occupied_units
                return f"Your portfolio generates ${monthly_revenue:,.2f} in monthly revenue and ${annual_revenue:,.2f} annually. With {occupied_units} occupied units, that works out to an average of ${avg_rent:,.2f} per unit per month."
            else:
                return f"Your portfolio could generate revenue once you have tenants. You currently have {total_units} units available for rent."
        
        elif any(word in message_lower for word in ['property', 'properties', 'building']):
            return f"You have {total_properties} properties with a total of {total_units} units. Your portfolio maintains a {occupancy_rate}% occupancy rate."
        
        elif any(word in message_lower for word in ['tenant', 'tenants', 'renter']):
            return f"You currently have {occupied_units} tenants across your {total_properties} properties. Your occupancy rate is {occupancy_rate}%."
        
        elif any(word in message_lower for word in ['improve', 'better', 'optimize', 'increase']):
            suggestions = []
            if occupancy_rate < 95:
                suggestions.append("focus on filling vacant units to increase revenue")
            if total_units > 0 and occupied_units > 0:
                avg_rent = monthly_revenue / occupied_units
                suggestions.append(f"review market rates since your average rent is ${avg_rent:.2f}")
            suggestions.append("consider property maintenance and improvements to justify higher rents")
            
            return "Here are some suggestions to improve your portfolio: " + ", ".join(suggestions) + "."
        
        else:
            return f"I can help you analyze your {total_properties} properties with {total_units} units. You're currently at {occupancy_rate}% occupancy generating ${monthly_revenue:,.2f} per month. Try asking about occupancy rates, revenue, specific properties, or ways to improve your portfolio!"
    
    def _find_highest_rent_tenant(self, property_data):
        """Find the tenant who pays the highest rent"""
        properties = property_data.get('properties', [])
        if not properties:
            return "I don't have any property data to analyze tenant rents right now."
        
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
            return f"The tenant who pays the most rent is {highest_rent_tenant} in unit {highest_rent_unit} at {highest_rent_property}. They pay ${highest_rent:,.2f} per month."
        else:
            return "I couldn't find any occupied units with tenant information to compare rents."
    
    def _find_lowest_rent_tenant(self, property_data):
        """Find the tenant who pays the lowest rent"""
        properties = property_data.get('properties', [])
        if not properties:
            return "I don't have any property data to analyze tenant rents right now."
        
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
            return f"The tenant who pays the least rent is {lowest_rent_tenant} in unit {lowest_rent_unit} at {lowest_rent_property}. They pay ${lowest_rent:,.2f} per month."
        else:
            return "I couldn't find any occupied units with tenant information to compare rents."
    
    def _find_most_expensive_vacant_unit(self, property_data):
        """Find the most expensive vacant unit"""
        properties = property_data.get('properties', [])
        if not properties:
            return "I don't have any property data to analyze vacant units right now."
        
        highest_rent = 0
        highest_rent_unit = None
        
        for prop in properties:
            for unit in prop.get('units', []):
                if not unit.get('is_occupied'):
                    rent = unit.get('rent', 0)
                    if rent > highest_rent:
                        highest_rent = rent
                        highest_rent_unit = {
                            'property': prop.get('name'),
                            'unit': unit.get('number'),
                            'rent': rent,
                            'bedrooms': unit.get('bedrooms', 0),
                            'bathrooms': unit.get('bathrooms', 0),
                            'square_feet': unit.get('squareFeet', 0)
                        }
        
        if highest_rent_unit:
            unit = highest_rent_unit
            response = f"The most expensive vacant property in your portfolio is unit {unit['unit']} at {unit['property']}. "
            response += f"This is a {unit['bedrooms']} bedroom, {unit['bathrooms']} bathroom unit with {unit['square_feet']:,} square feet. "
            response += f"It could rent for ${unit['rent']:,.2f} per month. "
            response += "This unit is currently vacant and represents the highest rental value among your vacant units."
            return response
        else:
            return "Great news! You have no vacant units. All your properties are fully occupied."
    
    def _list_vacant_units(self, property_data):
        """List all vacant units"""
        properties = property_data.get('properties', [])
        if not properties:
            return "I don't have any property data to analyze vacant units right now."
        
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
        
        if len(vacant_units) == 1:
            unit = vacant_units[0]
            response = f"You have 1 vacant unit: unit {unit['unit']} at {unit['property']}. It's a {unit['bedrooms']} bedroom, {unit['bathrooms']} bathroom unit that could rent for ${unit['rent']:,.2f} per month."
        else:
            response = f"You have {len(vacant_units)} vacant units. "
            
            # List first few units conversationally
            unit_descriptions = []
            for i, unit in enumerate(vacant_units[:3]):  # Show first 3 units
                unit_descriptions.append(f"unit {unit['unit']} at {unit['property']} (${unit['rent']:,.2f}/month)")
            
            if len(vacant_units) <= 3:
                response += "They are: " + ", ".join(unit_descriptions) + "."
            else:
                response += "The main ones are: " + ", ".join(unit_descriptions) + f", and {len(vacant_units) - 3} others."
        
        potential_revenue = sum(unit['rent'] for unit in vacant_units)
        response += f" If you fill all vacant units, you could add ${potential_revenue:,.2f} to your monthly revenue."
        
        return response
    
    def _analyze_property_performance(self, property_data):
        """Analyze which properties perform best"""
        properties = property_data.get('properties', [])
        if not properties:
            return "I don't have any property data to analyze performance right now."
        
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
        
        if len(property_performance) == 1:
            prop = property_performance[0]
            return f"You have one property, {prop['name']}, which generates ${prop['revenue']:,.2f} per month with a {prop['occupancy']}% occupancy rate."
        
        best_property = property_performance[0]
        response = f"Your top performing property is {best_property['name']}, generating ${best_property['revenue']:,.2f} monthly with {best_property['occupancy']}% occupancy."
        
        if len(property_performance) >= 2:
            second_best = property_performance[1]
            response += f" Your second best is {second_best['name']} at ${second_best['revenue']:,.2f} monthly."
        
        if len(property_performance) >= 3:
            third_best = property_performance[2]
            response += f" Third place goes to {third_best['name']} with ${third_best['revenue']:,.2f} monthly."
        
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