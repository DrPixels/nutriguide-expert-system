# Imports
import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl
import json
import random
import os

# For filing purposes
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
data_file_path = os.path.join(BASE_DIR, '..', 'data', 'healthy_foods.json')
case_base_file_path = os.path.join(BASE_DIR, '..', 'data', 'case_base.json')

# Create the Nutrional Advisor Expert System Class
class NutritionalAdvisorExpertSystem():
    def __init__(self, 
                 days: int,
                 gender: str, 
                 height_in_cm: float, 
                 age:int, 
                 weight_in_kg:float, 
                 activity_level_number:int, 
                 health_goal:str, 
                 dietary_restrictions: list,
                 included_ingredients: list,
                 excluded_ingredients: list,
                 meal_distribution: list):
        self.days = int(days) # Days of meal plan    
        self.gender = gender # Gender of the user
        self.height_in_cm = float(height_in_cm)  # Height of the user in cm
        self.age = int(age) # Age of the user
        self.weight_in_kg = float(weight_in_kg) # Weight of the user in kg
        self.activity_level_number = int(activity_level_number) # Activity level number
        self.health_goal = health_goal # Health goal of the user
        self.dietary_restrictions = dietary_restrictions # Dietary Restrictions
        self.included_ingredients = included_ingredients # Included Ingredients
        self.excluded_ingredients = excluded_ingredients # Excluded Ingredients
        self.meal_distribution = meal_distribution # Meal distribution
    
    # Get the data
    def get_data(self):
        data: list
        # Open and read the JSON file
        with open(data_file_path, 'r') as file:
            data = json.load(file)
        return data

    # Compute the activity level multiplier based on the activity level
    # Using fuzzy logic
    def compute_activity_level_multiplier(self) -> int:

        if(self.activity_level_number < 1 or self.activity_level_number > 10):
            raise Exception('Invalid activity level. Accepted values are from 1 to 10 only')

        # Input variable: Activity Level (on a scale of 1 to 10)
        activity_level = ctrl.Antecedent(np.arange(1, 11, 1), 'activity_level')

        # Output variable: Multiplier (ranges from 1.2 to 1.9)
        multiplier = ctrl.Consequent(np.arange(1.2, 2.0, 0.01), 'multiplier')

        # Membership functions for activity level
        activity_level['low'] = fuzz.trimf(activity_level.universe, [1, 1, 4])
        activity_level['moderate'] = fuzz.trimf(activity_level.universe, [3, 5, 7])
        activity_level['high'] = fuzz.trimf(activity_level.universe, [6, 10, 10])

        # Membership functions for multiplier
        multiplier['low'] = fuzz.trimf(multiplier.universe, [1.2, 1.2, 1.4])
        multiplier['moderate'] = fuzz.trimf(multiplier.universe, [1.3, 1.5, 1.7])
        multiplier['high'] = fuzz.trimf(multiplier.universe, [1.6, 1.9, 1.9])

        # Step 3: Define fuzzy rules
        rule1 = ctrl.Rule(activity_level['low'], multiplier['low'])
        rule2 = ctrl.Rule(activity_level['moderate'], multiplier['moderate'])
        rule3 = ctrl.Rule(activity_level['high'], multiplier['high'])

        # Step 4: Create the control system
        activity_ctrl = ctrl.ControlSystem([rule1, rule2, rule3])
        activity_sim = ctrl.ControlSystemSimulation(activity_ctrl)

        # Step 5: Input user activity level and compute multiplier
        activity_sim.input['activity_level'] = self.activity_level_number  # Example input
        activity_sim.compute()

        # Step 6: Output the result
        return round(activity_sim.output['multiplier'], 2)
    
    # For Calculating the BMR (Basic Metabolic Rate)
    # Mifflin St Jeor Equation
    def calculate_bmr(self) -> float:

        if self.gender.lower() == 'male':
            return int(round(10 * self.weight_in_kg + 6.25 * self.height_in_cm - 5 * self.age + 5, 0))
        elif self.gender.lower() == 'female':
            return int(round(10 * self.weight_in_kg + 6.25 * self.height_in_cm - 5 * self.age - 161))
        else:
            raise(Exception("Invalid gender. Please provide a valid gender."))
    
    # For calculating the TDEE (Total Daily Energy Expenditure)
    def calculate_tdee(self):
        # BMR * Activity Level
        return self.calculate_bmr() * self.compute_activity_level_multiplier()

    # For calculating the calorie limit
    def calculate_calorie_limit(self):

        # Reducing 15% per day
        if self.health_goal == "weightLoss":
            return int(round(self.calculate_tdee() * 0.85))
        # Adding 15% per day
        elif self.health_goal == "weightGain":
            return int(round(self.calculate_tdee() * 1.15))
        # Maintain the weight
        elif self.health_goal == "maintainWeight":
            return self.calculate_tdee()
        else:
            raise Exception("Invalid health goal.")
    
    # For getting the valid recipes based on the restrictions
    def is_recipe_valid(self, recipe, calorie_limit):

        # Check calorie limit
        if recipe["calories"] > calorie_limit:
            return False
        
        # Check dietary restrictions
        if not any(cat in recipe["categories"] for cat in self.dietary_restrictions):
            return False

        # Check included ingredients
        if self.included_ingredients and not any(ing.lower() in (", ".join(recipe['ingredients'])).lower() for ing in self.included_ingredients):
            return False
        
        # Check excluded ingredients
        if self.excluded_ingredients and any(ing.lower() in (", ".join(recipe['ingredients'])).lower() for ing in self.excluded_ingredients):
            return False
        
        return True
    
    # For generating the meal plan
    def generate_meal_plan(self):

        # Calculate the calorie limit
        calorie_limit = self.calculate_calorie_limit()

        # Get the recipes
        recipes = self.get_data()
        # Shuffle them to avoid repeating recipes
        random.shuffle(recipes)

        # Filter the recipes based on the restriction
        valid_recipes = [
            recipe for recipe in recipes if self.is_recipe_valid(recipe, calorie_limit)
        ]

        # Meal plan
        meal_plan = {}

        # To track recipes already used (for variety)
        used_recipes = set()  

        # Calorie Breakdown
        calorie_breakdown = {
            "Breakfast": int(round(calorie_limit * 0.3)),
            "Lunch": int(round(calorie_limit * 0.35)),
            "Dinner": int(round(calorie_limit * 0.25)),
            "Snacks": int(round(calorie_limit * 0.1))
        }

        for meal in self.meal_distribution:
            calorie_breakdown[meal['mealType']] = int(round(calorie_limit * (meal['percentage'] / 100)))

        # Loop through the days
        for day in range(1, self.days + 1):
            day_meals = {"Breakfast": None, "Lunch": None, "Dinner": None, "Snacks": None}
            total_day_calories = 0

            for meal_type in ["Breakfast", "Lunch", "Dinner", "Snacks"]:
                threshold = 20
                # Try to find a valid recipe for the current meal type
                recipe_found = False  # Flag to track if a recipe is assigned

                while not recipe_found:
                    for recipe in valid_recipes:
                        # To ensure that the recipe is valid
                        # Calorie limit won't exceed
                        # Limit the discrepancy of the recipe
                        if (recipe['title'] not in used_recipes 
                            and total_day_calories + recipe['calories'] <= calorie_limit 
                            and abs(calorie_breakdown[meal_type] - recipe['calories']) <= threshold):

                            # Set the recipe
                            day_meals[meal_type] = recipe
                            # Add to the total calorie for that day
                            total_day_calories += recipe["calories"]
                            # Add the recipe
                            used_recipes.add(recipe["title"])
                            recipe_found = True
                            break  # Move to the next meal type
                    
                    # Increase the threshold if there is no recipe found
                    threshold = threshold + 20
                
                # Add the day's meals to the meal plan
                meal_plan[f"Day {day}"] = day_meals
    
        # Write to JSON file
        with open(case_base_file_path, 'w') as file:
            total_calorie_limit = self.calculate_total_calories(meal_plan)

            user: dict = {
                "days": self.days,
                "gender": self.gender,
                "height_in_cm": self.height_in_cm,
                "age": self.age,
                "weight_in_kg": self.weight_in_kg,
                "activity_level_number": self.activity_level_number,
                "health_goal": self.health_goal,
                "dietary_restrictions": self.dietary_restrictions,
                "included_ingredients": self.included_ingredients,
                'excluded_ingredients': self.excluded_ingredients,
                'total_calorie_limit': total_calorie_limit
            }
            json.dump({"input": user, "output": meal_plan}, file, indent=4)
        
        return {"activityMultiplier": self.compute_activity_level_multiplier(), 
            "bmr": self.calculate_bmr(), 
            "tdee": self.calculate_tdee() ,
            "calorieLimit": self.calculate_calorie_limit(),
            "mealPlan": meal_plan}

    
    def retrieve_similar_cases(self):
        total_calories_needed = int(round(self.calculate_calorie_limit * self.days))
        similar_cases = []
        for case in self.case_base:
            similarity_score = 0

            # Compare number of days
            if abs(case["input"]["days"] - self.days) == 0:
                similarity_score += 1
            
            # Compare total calorie limit
            if abs(case["input"]["total_calorie_limit"] - total_calories_needed) <= 500:
                similarity_score += 1
            
            # Compare dietary restrictions
            if set(case["input"]["dietary_restrictions"]) == set(self.dietary_restrictions):
                similarity_score += 1
            
            # Compare included ingredients
            if all(ing in case["input"]["included_ingredients"] for ing in self.included_ingredients):
                similarity_score += 1
            
            # Compare excluded ingredients
            if not any(ing in case["input"]["included_ingredients"] for ing in self.excluded_ingredients):
                similarity_score += 1
            
            if similarity_score == 5:  # Threshold for similarity
                similar_cases.append({"output": case['output'], "similarity_score": similarity_score})
        
        return similar_cases
    
    def get_used_recipes(self, meal_plan):
        used_recipes = set()  # Initialize an empty set to store recipe titles
        
        # Iterate through each day and its meals
        for day, meals in meal_plan.items():
            for meal_type, recipe in meals.items():
                # Add the recipe title to the set
                used_recipes.add(recipe["title"])
        
        return used_recipes
    
    def find_lowest_calorie_meal(meals):
        # Find the meal type with the lowest calorie count
        lowest_calorie_meal_type = min(meals, key=lambda meal_type: meals[meal_type]["calories"])
        lowest_calorie_count = meals[lowest_calorie_meal_type]["calories"]
        
        return lowest_calorie_meal_type, lowest_calorie_count
    
    def find_highest_calorie_meal(meals):
        # Find the meal type with the highest calorie count
        highest_calorie_meal_type = max(meals, key=lambda meal_type: meals[meal_type]["calories"])
        highest_calorie_count = meals[highest_calorie_meal_type]["calories"]
        
        return highest_calorie_meal_type, highest_calorie_count

    def adapt_by_swapping(self, retrieved_cases):
        random.shuffle(retrieved_cases)
        most_similar_case = retrieved_cases[0]

        recipes_pool = self.get_data()

        # Users calorie limit per day
        calorie_limit = self.calculate_calorie_limit()
        calorie_limit_in_case = most_similar_case['input']['calorie_limit']

        adapted_case = {}

        used_recipes = self.get_used_recipes(most_similar_case['output'])
        
        valid_recipes = [
            recipe for recipe in recipes_pool if self.is_recipe_valid(recipe, calorie_limit)
        ]

        # Determine the calorie difference
        calorie_difference = calorie_limit - calorie_limit_in_case
        
        if calorie_difference > 0:

            # Iterate through days and meals to refine the plan
            for day, meals in most_similar_case["output"].items():
                adapted_day = {}
                
                # Kulang yung calorie limit ng nasa case
                lowest_calorie_meal_type, lowest_calorie_count = self.find_lowest_calorie_meal(meals)

                                
                # Total calories of the case for the day without the meal that has the minimum calories
                total_calories = sum(
                        meal["calories"] for meal_type, meal in meals.items()
                        if meal_type != lowest_calorie_meal_type
                    )
                    
                deficient_calorie = calorie_limit - total_calories
                    
                for recipe in valid_recipes:
                    if recipe['title'] not in used_recipes and total_calories + recipe['calories'] <= calorie_limit and abs(deficient_calorie - recipe['calories']) <= 10:
                        most_similar_case[day][lowest_calorie_meal_type] = recipe
                        used_recipes.add(recipe["title"])
                        break  # Move to the next meal type

        if calorie_difference < 0:

            # Iterate through days and meals to refine the plan
            for day, meals in most_similar_case["output"].items():
                adapted_day = {}
                
                # Kulang yung calorie limit ng nasa case
                highest_calorie_meal_type, highest_calorie_count = self.find_highest_calorie_meal(meals)

                 # Total calories of the case for the day without the meal that has the minimum calories
                total_calories = sum(
                        meal["calories"] for meal_type, meal in meals.items()
                        if meal_type != highest_calorie_meal_type
                    )
                    
                deficient_calorie = calorie_limit - total_calories
                    
                for recipe in valid_recipes:
                    if recipe['title'] not in used_recipes and total_calories + recipe['calories'] <= calorie_limit and abs(deficient_calorie - recipe['calories']) <= 10:
                        most_similar_case[day][highest_calorie_meal_type] = recipe
                        used_recipes.add(recipe["title"])
                        break  # Move to the next meal type

        return most_similar_case
    
    def calculate_total_calories(self, meal_plan):
        total_calories = 0  # Initialize a variable to store the total calories
        
        # Iterate through each day and its meals
        for day, meals in meal_plan.items():
            for meal_type, recipe in meals.items():
                # Add the recipe's calorie value to the total
                total_calories += recipe["calories"]
        
        return total_calories