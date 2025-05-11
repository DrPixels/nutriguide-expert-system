from flask import Flask, request
from flask_cors import CORS
from expertsystem.nutritionaladvisor import NutritionalAdvisorExpertSystem

app = Flask(__name__)
CORS(app) 

# Route for accessing the meal plan
@app.route('/api/generate-meal-plan', methods=['POST'])
def generate_meal_plan() :

    # Parse the data after accepting it from the frontend
    data = request.get_json()

    days = data.get('days')
    gender = data.get('gender')
    height_in_cm = data.get('height')
    age = data.get('age')
    weight_in_kg = data.get('weight')
    activity_level_number = data.get('activityLevel')
    health_goal = data.get('healthGoal')
    
    diet_res = data.get('dietaryRestrictions')
    dietary_restrictions = []

    for key, value in diet_res.items():
        if key == 'vegan' and value:
            dietary_restrictions.append('Vegan')
        if key == 'vegetarian' and value:
            dietary_restrictions.append('Vegetarian')
        if key == 'glutenFree' and value:
            dietary_restrictions.append('Wheat/Gluten Free')
        if key == 'dairyFree' and value:
            dietary_restrictions.append('Dairy Free')
    
    meal_distribution = data.get('mealDistribution')

    included_ingredients = data.get('includedIngredients')
    excluded_ingredients = data.get('excludedIngredients')

    # Initiliaze a new expert system
    expertSystem = NutritionalAdvisorExpertSystem(days, 
                                                  gender, 
                                                  height_in_cm, 
                                                  age, 
                                                  weight_in_kg, 
                                                  activity_level_number,
                                                  health_goal,
                                                  dietary_restrictions, 
                                                  included_ingredients, 
                                                  excluded_ingredients, 
                                                  meal_distribution)
    
    # Return the meal plan
    return expertSystem.generate_meal_plan()

if __name__ == "__main__":
    app.run(debug = True)