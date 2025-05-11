"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { ArrowDown, ArrowUp, GripVertical, Key, X, Users, Github, Linkedin, Twitter, Mail } from "lucide-react";
import { HashLoader, PulseLoader } from "react-spinners";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function NutrionalAdvisor() {
  const [includedIngredients, setIncludedIngredients] = useState<string[]>([]);
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const [newIncludeIngredient, setNewIncludeIngredient] = useState("");
  const [newExcludeIngredient, setNewExcludeIngredient] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [generatedMealPlanData, setGeneratedMealPlanData] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);

  const [formData, setFormData] = useState({
    days: 1,
    gender: "male",
    height: "",
    age: "",
    weight: "",
    activityLevel: "low",
    healthGoal: "weightLoss",
    dietaryRestrictions: {
      vegan: false,
      vegetarian: false,
      dairyFree: false,
      none: true,
      glutenFree: false,
    },
    includedIngredients: [] as string[],
    excludedIngredients: [] as string[],
    mealDistribution: [
      { mealType: "Lunch", percentage: 35, order: 0 },
      { mealType: "Breakfast", percentage: 30, order: 1 },
      { mealType: "Dinner", percentage: 25, order: 2 },
      { mealType: "Snacks", percentage: 10, order: 3 },
    ],
  });

  // Team members data
  const teamMembers = [
    {
      name: "Lorenzo Arwen Argayoso",
      role: "UI/UX Designer",
      bio: "Full-stack developer with 8 years of experience in React and TypeScript. Passionate about creating intuitive user interfaces and optimizing application performance.",
      avatar: "/placeholder.svg?height=200&width=200",
      social: {
        github: "https://github.com/alexjohnson",
        linkedin: "https://linkedin.com/in/alexjohnson",
        twitter: "https://twitter.com/alexjohnson",
        email: "alex@mealplanner.com",
      },
    },
    {
      name: "Stevie Ray Llemit",
      role: "UI/UX Designer",
      bio: "Registered dietitian with a Master's in Nutrition Science. Specializes in personalized meal planning and has contributed to numerous health publications.",
      avatar: "/placeholder.svg?height=200&width=200",
      social: {
        linkedin: "https://linkedin.com/in/sophiachen",
        twitter: "https://twitter.com/sophiachen",
        email: "sophia@mealplanner.com",
      },
    },
    {
      name: "Adrian Macabutas",
      role: "UI/UX Designer",
      bio: "Award-winning designer with a focus on creating accessible and beautiful user experiences. Previously worked at top design agencies before joining the team.",
      avatar: "/placeholder.svg?height=200&width=200",
      social: {
        github: "https://github.com/marcuswilliams",
        linkedin: "https://linkedin.com/in/marcuswilliams",
        email: "marcus@mealplanner.com",
      },
    },
    {
      name: "Mikhail Angelo Mistula",
      role: "UI/UX Designer",
      bio: "Systems architect specializing in scalable applications. Experienced in building robust APIs and database structures for health and wellness platforms.",
      avatar: "/placeholder.svg?height=200&width=200",
      social: {
        github: "https://github.com/priyapatel",
        linkedin: "https://linkedin.com/in/priyapatel",
        email: "priya@mealplanner.com",
      },
    },
    {
      name: "Jedd Benedick Salvador",
      role: "UI/UX Designer",
      bio: "Systems architect specializing in scalable applications. Experienced in building robust APIs and database structures for health and wellness platforms.",
      avatar: "/placeholder.svg?height=200&width=200",
      social: {
        github: "https://github.com/priyapatel",
        linkedin: "https://linkedin.com/in/priyapatel",
        email: "priya@mealplanner.com",
      },
    },
    {
      name: "Rhem Giou Salvador",
      role: "Lead Developer",
      bio: "Systems architect specializing in scalable applications. Experienced in building robust APIs and database structures for health and wellness platforms.",
      avatar: "/placeholder.svg?height=200&width=200",
      social: {
        github: "https://github.com/priyapatel",
        linkedin: "https://linkedin.com/in/priyapatel",
        email: "priya@mealplanner.com",
      },
    },
  ];

  const [errors, setErrors] = useState({
    gender: "",
    height: "",
    age: "",
    weight: "",
    activityLevel: "",
    healthGoal: "",
    calorieLimit: "",
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  const addIncludedIngredient = () => {
    if (newIncludeIngredient.trim() !== "") {
      setIncludedIngredients([...includedIngredients, newIncludeIngredient.trim()]);
      setNewIncludeIngredient("");
    }
  };

  const addExcludedIngredient = () => {
    if (newExcludeIngredient.trim() !== "") {
      setExcludedIngredients([...excludedIngredients, newExcludeIngredient.trim()]);
      setNewExcludeIngredient("");
    }
  };

  const removeIncludedIngredient = (index: number) => {
    setIncludedIngredients(includedIngredients.filter((_, i) => i !== index));
  };

  const removeExcludedIngredient = (index: number) => {
    setExcludedIngredients(excludedIngredients.filter((_, i) => i !== index));
  };

  const handleIncludeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIncludedIngredient();
    }
  };

  const handleExcludeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addExcludedIngredient();
    }
  };

  const handleChangeDietaryRestriction = (e: React.ChangeEvent) => {
    const name = e.target.name;
    const isChecked = e.target.checked;

    if (name == "none") {
      setFormData({
        ...formData,
        dietaryRestrictions: {
          vegan: false,
          vegetarian: false,
          dairyFree: false,
          glutenFree: false,
          none: isChecked,
        },
      });
      return;
    } else {
      setFormData({
        ...formData,
        dietaryRestrictions: {
          ...formData.dietaryRestrictions,
          [name]: isChecked,
          none: false,
        },
      });
    }
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, days: Number.parseInt(e.target.value) });
  };

  // Move a meal type up in the order
  const moveMealUp = (index: number) => {
    if (index === 0) return; // Already at the top

    const newDistribution = [...formData.mealDistribution];

    // Swap the order values
    const temp = newDistribution[index].order;
    newDistribution[index].order = newDistribution[index - 1].order;
    newDistribution[index - 1].order = temp;

    // Sort by order
    newDistribution.sort((a, b) => a.order - b.order);

    // Update percentages based on new order
    updateMealPercentages(newDistribution);

    setFormData({ ...formData, mealDistribution: newDistribution });
  };

  // Move a meal type down in the order
  const moveMealDown = (index: number) => {
    if (index === formData.mealDistribution.length - 1) return; // Already at the bottom

    const newDistribution = [...formData.mealDistribution];

    // Swap the order values
    const temp = newDistribution[index].order;
    newDistribution[index].order = newDistribution[index + 1].order;
    newDistribution[index + 1].order = temp;

    // Sort by order
    newDistribution.sort((a, b) => a.order - b.order);

    // Update percentages based on new order
    updateMealPercentages(newDistribution);

    setFormData({ ...formData, mealDistribution: newDistribution });
  };

  // Update meal percentages based on priority order
  const updateMealPercentages = (distribution) => {
    // Assign percentages based on position (higher position = higher percentage)
    distribution[0].percentage = 35; // Highest priority gets 40%
    distribution[1].percentage = 30; // Second priority gets 30%
    distribution[2].percentage = 25; // Third priority gets 20%
    distribution[3].percentage = 10; // Lowest priority gets 10%
  };

  // Function to generate day labels for the slider
  const generateDayLabels = () => {
    const labels = [];
    for (let i = 1; i <= 7; i++) {
      labels.push(
        <div key={i} className="text-center">
          {i}
        </div>
      );
    }
    return labels;
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Validate personal information
    if (!formData.gender.trim()) {
      newErrors.gender = "Gender is required";
      isValid = false;
    } else {
      newErrors.gender = "";
    }

    if (!formData.height) {
      newErrors.height = "Height is required";
      isValid = false;
    } else {
      newErrors.height = "";
    }

    if (!formData.age) {
      newErrors.age = "Age is required";
      isValid = false;
    } else {
      newErrors.age = "";
    }

    if (!formData.weight) {
      newErrors.weight = "Weight is required";
      isValid = false;
    } else {
      newErrors.weight = "";
    }

    // Validate activity level
    if (!formData.activityLevel) {
      newErrors.activityLevel = "Please select an activity level";
      isValid = false;
    } else {
      newErrors.activityLevel = "";
    }

    // Validate health goal
    if (!formData.healthGoal) {
      newErrors.healthGoal = "Please select a health goal";
      isValid = false;
    } else {
      newErrors.healthGoal = "";
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    formData.includedIngredients = includedIngredients;
    formData.excludedIngredients = excludedIngredients;

    if (validateForm()) {
      console.log("Form submitted successfully", formData);

      try {
        setIsGenerating(true);
        const response = await fetch("http://localhost:5000/api/generate-meal-plan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        console.table(data);
        console.log(data);
        setGeneratedMealPlanData(data);
        setShowModal(true);
      } catch (error) {
        console.log(error);
      } finally {
        setIsGenerating(false);
      }
    } else {
      console.log("Form validation failed");
    }
  };

  useEffect(() => {
    if (formSubmitted) {
      validateForm();
    }
  }, [formData, formSubmitted]);

  return (
    <div className="min-h-screen bg-green-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-center text-3xl font-bold text-green-700 mb-2">NUTRIGUIDE</h1>
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowTeamModal(true)}
            className="justify-center flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            <Users size={16} />
            <span>Meet Our Team</span>
          </button>
        </div>
        <h1 className=" text-2xl font-semibold text-green-600 mb-1">Create your meal plan</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {/* Gender */}
              <div>
                <label htmlFor="height" className="block text-sm font-medium mb-1">
                  Gender: <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`flex items-center border ${
                        errors.gender ? "border-red-500" : "border-gray-300"
                      } rounded p-2 cursor-pointer ${formData.gender === "male" ? "bg-green-50" : ""}`}
                    >
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border border-gray-400 mr-2">
                        <div
                          className={`w-3 h-3 rounded-full ${formData.gender === "male" ? "bg-gray-600" : "bg-white"}`}
                        ></div>
                      </div>
                      <input
                        type="radio"
                        name="activityLevel"
                        value="low"
                        className="sr-only"
                        checked={formData.gender === "male"}
                        onChange={() => setFormData({ ...formData, gender: "male" })}
                      />
                      <span>Male</span>
                    </label>
                  </div>
                  <div>
                    <label
                      className={`flex items-center border ${
                        errors.gender ? "border-red-500" : "border-gray-300"
                      } rounded p-2 cursor-pointer ${formData.gender === "female" ? "bg-green-50" : ""}`}
                    >
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border border-gray-400 mr-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            formData.gender === "female" ? "bg-gray-600" : "bg-white"
                          }`}
                        ></div>
                      </div>
                      <input
                        type="radio"
                        name="activityLevel"
                        value="low"
                        className="sr-only"
                        checked={formData.gender === "female"}
                        onChange={() => setFormData({ ...formData, gender: "female" })}
                      />
                      <span>Female</span>
                    </label>
                  </div>
                </div>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
              </div>
              {/* Height */}
              <div>
                <label htmlFor="height" className="block text-sm font-medium mb-1">
                  Height (cm): <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="height"
                  className={`w-full border ${errors.height ? "border-red-500" : "border-gray-300"} rounded p-2`}
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                />
                {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
              </div>
              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium mb-1">
                  Age: <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="age"
                  className={`w-full border ${errors.age ? "border-red-500" : "border-gray-300"} rounded p-2`}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
              </div>
              {/* Weight */}
              <div>
                <label htmlFor="weight" className="block text-sm font-medium mb-1">
                  Weight (kg): <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="weight"
                  className={`w-full border ${errors.weight ? "border-red-500" : "border-gray-300"} rounded p-2`}
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
                {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
              </div>
              {/* Activity Level */}
              <div>
                <label htmlFor="weight" className="block text-sm font-medium mb-1">
                  Activity Level (1 - 10): <span className="text-red-500">*</span>{" "}
                  <span className="italic font-normal">The higher the value, the more active you are</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  id="weight"
                  className={`w-full border ${errors.activityLevel ? "border-red-500" : "border-gray-300"} rounded p-2`}
                  value={formData.activityLevel}
                  onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                />
                {errors.activityLevel && <p className="text-red-500 text-xs mt-1">{errors.activityLevel}</p>}
              </div>
            </div>
          </div>

          {/* Number of Days Slider */}
          <section className="mb-6 bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-xl font-semibold mb-3">Meal Plan Duration</h2>
            <div>
              <label htmlFor="days" className="block text-sm font-medium mb-1">
                Number of days: <span className="font-bold text-green-600">{formData.days}</span>
              </label>

              <input
                type="range"
                id="days"
                min="1"
                max="7"
                step="1"
                value={formData.days}
                onChange={handleDaysChange}
                className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
              />

              <div className="flex justify-between mt-1 text-xs text-gray-600">{generateDayLabels()}</div>
            </div>
          </section>

          {/* Meal Calorie Distribution */}
          <section className="mb-6 bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-xl font-semibold mb-3">Meal Calorie Distribution</h2>
            <p className="text-sm text-gray-600 mb-3">
              Arrange meals in order of calorie priority (top = most calories, bottom = least calories)
            </p>

            <div className=" rounded-lg  ">
              {formData.mealDistribution
                .sort((a, b) => a.order - b.order)
                .map((meal, index) => (
                  <div
                    key={meal.mealType}
                    className={`flex items-center justify-between p-3 mb-2 bg-white rounded-lg border ${
                      index === 0
                        ? "border-green-500"
                        : index === 1
                        ? "border-green-400"
                        : index === 2
                        ? "border-green-300"
                        : "border-green-200"
                    }`}
                  >
                    <div className="flex items-center">
                      <GripVertical className="text-gray-400 mr-2" size={18} />
                      <div>
                        <div className="font-medium">{meal.mealType}</div>
                        <div className="text-sm text-gray-500">{meal.percentage}% of daily calories</div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={() => moveMealUp(index)}
                        disabled={index === 0}
                        className={`p-1 rounded ${index === 0 ? "text-gray-300" : "text-gray-600 hover:bg-gray-100"}`}
                      >
                        <ArrowUp size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveMealDown(index)}
                        disabled={index === formData.mealDistribution.length - 1}
                        className={`p-1 rounded ${
                          index === formData.mealDistribution.length - 1
                            ? "text-gray-300"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <ArrowDown size={18} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* Dietary Restriction and Calorie Limit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Health Goal */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="text-xl font-bold mb-4">
                Health Goal <span className="text-red-500">*</span>
              </h2>
              {errors.healthGoal && <p className="text-red-500 text-xs mb-2">{errors.healthGoal}</p>}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <label
                  className={`flex items-center border ${
                    errors.healthGoal ? "border-red-500" : "border-gray-300"
                  } rounded p-2 cursor-pointer ${formData.healthGoal === "weightLoss" ? "bg-green-50" : ""}`}
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border border-gray-400 mr-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        formData.healthGoal === "weightLoss" ? "bg-gray-600" : "bg-white"
                      }`}
                    ></div>
                  </div>
                  <input
                    type="radio"
                    name="healthGoal"
                    value="weightLoss"
                    className="sr-only"
                    checked={formData.healthGoal === "weightLoss"}
                    onChange={() => setFormData({ ...formData, healthGoal: "weightLoss" })}
                  />
                  <span>Weight Loss</span>
                </label>
                <label
                  className={`flex items-center border ${
                    errors.healthGoal ? "border-red-500" : "border-gray-300"
                  } rounded p-2 cursor-pointer ${formData.healthGoal === "weightGain" ? "bg-green-50" : ""}`}
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border border-gray-400 mr-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        formData.healthGoal === "weightGain" ? "bg-gray-600" : "bg-white"
                      }`}
                    ></div>
                  </div>
                  <input
                    type="radio"
                    name="healthGoal"
                    value="weightGain"
                    className="sr-only"
                    checked={formData.healthGoal === "weightGain"}
                    onChange={() => setFormData({ ...formData, healthGoal: "weightGain" })}
                  />
                  <span>Weight Gain</span>
                </label>
                <label
                  className={`flex items-center border ${
                    errors.healthGoal ? "border-red-500" : "border-gray-300"
                  } rounded p-2 cursor-pointer ${formData.healthGoal === "maintainWeight" ? "bg-green-50" : ""}`}
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border border-gray-400 mr-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        formData.healthGoal === "maintainWeight" ? "bg-gray-600" : "bg-white"
                      }`}
                    ></div>
                  </div>
                  <input
                    type="radio"
                    name="healthGoal"
                    value="maintainWeight"
                    className="sr-only"
                    checked={formData.healthGoal === "maintainWeight"}
                    onChange={() => setFormData({ ...formData, healthGoal: "maintainWeight" })}
                  />
                  <span>Maintain Weight</span>
                </label>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Dietary Restriction</h2>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2"
                    name="vegan"
                    checked={formData.dietaryRestrictions.vegan}
                    onChange={(e) => handleChangeDietaryRestriction(e)}
                  />
                  <span>Vegan</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2"
                    name="vegetarian"
                    checked={formData.dietaryRestrictions.vegetarian}
                    onChange={(e) => handleChangeDietaryRestriction(e)}
                  />
                  <span>Vegetarian</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2"
                    name="dairyFree"
                    checked={formData.dietaryRestrictions.dairyFree}
                    onChange={(e) => handleChangeDietaryRestriction(e)}
                  />
                  <span>Dairy-Free</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2"
                    name="glutenFree"
                    checked={formData.dietaryRestrictions.glutenFree}
                    onChange={(e) => handleChangeDietaryRestriction(e)}
                  />
                  <span>Gluten-Free</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2"
                    name="none"
                    checked={formData.dietaryRestrictions.none}
                    onChange={(e) => handleChangeDietaryRestriction(e)}
                  />
                  <span>None</span>
                </label>
              </div>
            </div>
          </div>

          {/* Ingredient Preferences */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Ingredient Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="include" className="block text-sm font-medium mb-1">
                  Include Specific Ingredient
                </label>
                <div className="flex">
                  <div className="relative flex-1">
                    <div className="flex flex-wrap gap-1 p-1 border border-gray-300 rounded-l min-h-10">
                      {includedIngredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center bg-gray-100 rounded px-2 py-1 text-sm">
                          {ingredient}
                          <button
                            onClick={() => removeIncludedIngredient(index)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                            type="button"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        value={newIncludeIngredient}
                        onChange={(e) => setNewIncludeIngredient(e.target.value)}
                        onKeyDown={handleIncludeKeyDown}
                        placeholder="e.g. egg"
                        className="flex-1 outline-none min-w-[100px] p-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="exclude" className="block text-sm font-medium mb-1">
                  Exclude Specific Ingredient
                </label>
                <div className="flex">
                  <div className="relative flex-1">
                    <div className="flex flex-wrap gap-1 p-1 border border-gray-300 rounded-l min-h-10">
                      {excludedIngredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center bg-gray-100 rounded px-2 py-1 text-sm">
                          {ingredient}
                          <button
                            onClick={() => removeExcludedIngredient(index)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                            type="button"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        value={newExcludeIngredient}
                        onChange={(e) => setNewExcludeIngredient(e.target.value)}
                        onKeyDown={handleExcludeKeyDown}
                        placeholder="e.g. carrot"
                        className="flex-1 outline-none min-w-[100px] p-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            disabled={isGenerating}
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded transition-colors"
          >
            {isGenerating ? <HashLoader color="#ffffff" size={15} /> : "Generate Nutritional Plan"}
          </button>
        </form>
      </div>

      {/* Team Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-green-700">Meet Our Team</h2>
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-gray-600 mb-8">
                Our dedicated team of professionals has worked tirelessly to create this meal planning system. Each
                member brings unique expertise to ensure you receive the most accurate and personalized meal plans.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teamMembers.map((member, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg overflow-hidden shadow-md">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/3">
                        <img
                          src={member.avatar || "/placeholder.svg"}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 sm:w-2/3">
                        <h3 className="text-xl font-semibold text-green-700">{member.name}</h3>
                        <p className="text-sm font-medium text-gray-500 mb-2">{member.role}</p>
                        <p className="text-sm text-gray-600 mb-3">{member.bio}</p>

                        <div className="flex space-x-2">
                          {member.social.github && (
                            <a
                              href={member.social.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Github size={18} />
                            </a>
                          )}
                          {member.social.linkedin && (
                            <a
                              href={member.social.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Linkedin size={18} />
                            </a>
                          )}
                          {member.social.twitter && (
                            <a
                              href={member.social.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Twitter size={18} />
                            </a>
                          )}
                          {member.social.email && (
                            <a href={`mailto:${member.social.email}`} className="text-gray-600 hover:text-gray-900">
                              <Mail size={18} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-700 mb-2">About Our Project</h3>
                <p className="text-gray-600 mb-3">
                  The NutriGuide was developed to help individuals create personalized nutrition plans based on their
                  specific needs and goals. Our system combines nutritional science with technology to deliver accurate
                  and actionable meal plans.
                </p>
                <p className="text-gray-600">
                  We're constantly working to improve our system and would love to hear your feedback. Feel free to
                  reach out to any team member with suggestions or questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meal Plan Modal */}
      {showModal && generatedMealPlanData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-green-700">{formData.days}-Day Meal Plan</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Calorie Calculations */}
              <div className="mb-8 p-4 bg-green-50 rounded-lg">
                {/* User Inputs Summary */}
                <div className="mb-4 pb-4 border-b border-green-200">
                  <h3 className="text-xl font-semibold mb-2">Your Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="font-medium">Age:</span> {formData.age} years
                    </div>
                    <div>
                      <span className="font-medium">Gender:</span> {formData.gender === "male" ? "Male" : "Female"}
                    </div>
                    <div>
                      <span className="font-medium">Weight:</span> {formData.weight} kg
                    </div>
                    <div>
                      <span className="font-medium">Height:</span> {formData.height} cm
                    </div>
                    <div>
                      <span className="font-medium">Activity Level:</span> {formData.activityLevel}
                    </div>
                    <div>
                      <span className="font-medium">Goal:</span>{" "}
                      {formData.healthGoal === "weightLoss"
                        ? "Weight Loss"
                        : formData.healthGoal === "weightGain"
                        ? "Weight Gain"
                        : "Maintain Weight"}
                    </div>
                    <div>
                      <span className="font-medium">Plan Duration:</span> {formData.days}{" "}
                      {formData.days > 1 ? "days" : "day"}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Dietary Restrictions */}
                  <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">Dietary Restrictions</h2>
                    <div className="flex gap-2">
                      {Object.entries(formData.dietaryRestrictions).map(([key, value]) =>
                        value ? (
                          <span className=" bg-blue-700 text-white text-xs font-medium px-2.5 py-0.5 rounded">
                            {key}
                          </span>
                        ) : (
                          ""
                        )
                      )}
                    </div>
                  </section>
                  <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">Included Ingredients</h2>
                    <div className="flex gap-2">
                      {formData.includedIngredients.length == 0 ? (
                        <span className=" bg-gray-700 text-white text-xs font-medium px-2.5 py-0.5 rounded">None</span>
                      ) : (
                        formData.includedIngredients.map((ing) => (
                          <span className=" bg-green-800 text-white text-xs font-medium px-2.5 py-0.5 rounded">
                            {ing}
                          </span>
                        ))
                      )}
                    </div>
                  </section>
                  <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">Excluded Ingredients</h2>
                    <div className="flex gap-2">
                      {formData.excludedIngredients.length == 0 ? (
                        <span className=" bg-gray-700 text-white text-xs font-medium px-2.5 py-0.5 rounded">None</span>
                      ) : (
                        formData.excludedIngredients.map((ing) => (
                          <span className=" bg-red-500 text-white text-xs font-medium px-2.5 py-0.5 rounded">
                            {ing}
                          </span>
                        ))
                      )}
                    </div>
                  </section>
                </div>
              </div>

              <div id="meal-plan-content">
                {/* Calorie Calculations */}
                <div className="mb-8 p-4 bg-green-50 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Nutritional Calculations</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium">BMR Calculation ({formData.gender.charAt(0).toUpperCase()}):</h4>
                      <p className="text-sm">
                        {formData.gender === "male"
                          ? `10 × ${formData.weight} kg + 6.25 × ${formData.height} cm - 5 × ${formData.age} years + 5`
                          : `10 × ${formData.weight} kg + 6.25 × ${formData.height} cm - 5 × ${formData.age} years - 161`}
                      </p>
                      <p className="font-medium mt-1">BMR = {generatedMealPlanData.bmr.toFixed(0)} calories/day</p>
                    </div>
                    <div>
                      <h4 className="font-medium">TDEE Calculation:</h4>
                      <p className="text-sm">BMR × Activity Multiplier ({generatedMealPlanData.activityMultiplier})</p>
                      <p className="font-medium mt-1">TDEE = {generatedMealPlanData.tdee.toFixed(0)} calories/day</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium">Goal Adjustment:</h4>
                    <p className="text-sm">
                      {formData.healthGoal === "weightLoss"
                        ? `TDEE × 0.85 (15% calorie deficit for weight loss)`
                        : formData.healthGoal === "weightGain"
                        ? `TDEE × 1.15 (15% calorie surplus for weight gain)`
                        : `TDEE (maintenance calories)`}
                    </p>
                    <p className="font-medium mt-1">
                      Daily Calorie Target = {generatedMealPlanData.calorieLimit.toFixed(0)} calories/day
                    </p>
                  </div>
                </div>

                {/* Meal Plan */}
                <div className="space-y-8">
                  {Object.entries(generatedMealPlanData.mealPlan).map(([key, value]) => (
                    <div key={key} className="border rounded-lg overflow-hidden">
                      <div className="bg-green-600 text-white p-3">
                        <h3 className="text-xl font-bold">{key} </h3>
                      </div>

                      {/* Breakfast */}
                      <div className="p-4 border-b">
                        <h4 className="text-lg font-semibold text-green-700 mb-2">Breakfast</h4>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-lg font-medium">{value["Breakfast"].title}</h5>
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              {value["Breakfast"].calories} calories
                            </span>
                          </div>

                          <div className="mb-2 flex flex-wrap gap-1">
                            {value["Breakfast"].categories.map((category, i) => (
                              <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                                {category}
                              </span>
                            ))}
                          </div>

                          <p className="text-sm text-gray-600 mb-3">
                            {value["Breakfast"].description
                              ? value["Breakfast"].description
                              : "No description provided for this meal."}
                          </p>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h6 className="font-medium mb-1">Ingredients:</h6>
                              <div className="max-h-70 overflow-auto">
                                <ul className="list-disc list-inside text-sm">
                                  {value["Breakfast"].ingredients.map((ingredient, i) => (
                                    <li key={i}>{ingredient}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <div>
                              <h6 className="font-medium mb-1">Directions:</h6>
                              <div className="max-h-70 overflow-auto">
                                <ol className="list-decimal list-inside text-sm">
                                  {value["Breakfast"].directions.map((direction, i) => (
                                    <li key={i} className="mb-1">
                                      {direction}
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Lunch */}
                      <div className="p-4 border-b">
                        <h4 className="text-lg font-semibold text-green-700 mb-2">Lunch</h4>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-lg font-medium">{value["Lunch"].title}</h5>
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              {value["Lunch"].calories} calories
                            </span>
                          </div>

                          <div className="mb-2 flex flex-wrap gap-1">
                            {value["Lunch"].categories.map((category, i) => (
                              <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                                {category}
                              </span>
                            ))}
                          </div>

                          <p className="text-sm text-gray-600 mb-3">
                            {value["Lunch"].description
                              ? value["Lunch"].description
                              : "No description provided for this meal."}
                          </p>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h6 className="font-medium mb-1">Ingredients:</h6>
                              <div className="max-h-70 overflow-auto">
                                <ul className="list-disc list-inside text-sm">
                                  {value["Lunch"].ingredients.map((ingredient, i) => (
                                    <li key={i}>{ingredient}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <div>
                              <h6 className="font-medium mb-1">Directions:</h6>
                              <div className="max-h-70 overflow-auto">
                                <ol className="list-decimal list-inside text-sm">
                                  {value["Lunch"].directions.map((direction, i) => (
                                    <li key={i} className="mb-1">
                                      {direction}
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dinner */}
                      <div className="p-4 border-b">
                        <h4 className="text-lg font-semibold text-green-700 mb-2">Dinner</h4>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-lg font-medium">{value["Dinner"].title}</h5>
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              {value["Dinner"].calories} calories
                            </span>
                          </div>

                          <div className="mb-2 flex flex-wrap gap-1">
                            {value["Dinner"].categories.map((category, i) => (
                              <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                                {category}
                              </span>
                            ))}
                          </div>

                          <p className="text-sm text-gray-600 mb-3">
                            {value["Dinner"].description
                              ? value["Dinner"].description
                              : "No description provided for this meal."}
                          </p>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <div className="max-h-70 overflow-auto">
                                <h6 className="font-medium mb-1">Ingredients:</h6>
                                <ul className="list-disc list-inside text-sm">
                                  {value["Dinner"].ingredients.map((ingredient, i) => (
                                    <li key={i}>{ingredient}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <div>
                              <h6 className="font-medium mb-1">Directions:</h6>
                              <div className="max-h-70 overflow-auto">
                                <ol className="list-decimal list-inside text-sm">
                                  {value["Dinner"].directions.map((direction, i) => (
                                    <li key={i} className="mb-1">
                                      {direction}
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Snacks */}
                      <div className="p-4 border-b">
                        <h4 className="text-lg font-semibold text-green-700 mb-2">Snacks</h4>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-lg font-medium">{value["Snacks"].title}</h5>
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              {value["Snacks"].calories} calories
                            </span>
                          </div>

                          <div className="mb-2 flex flex-wrap gap-1">
                            {value["Snacks"].categories.map((category, i) => (
                              <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                                {category}
                              </span>
                            ))}
                          </div>

                          <p className="text-sm text-gray-600 mb-3">
                            {value["Snacks"].description
                              ? value["Snacks"].description
                              : "No description provided for this meal."}
                          </p>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h6 className="font-medium mb-1">Ingredients:</h6>
                              <div className="max-h-70 overflow-auto">
                                <ul className="list-disc list-inside text-sm">
                                  {value["Snacks"].ingredients.map((ingredient, i) => (
                                    <li key={i}>{ingredient}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <div>
                              <h6 className="font-medium mb-1">Directions:</h6>
                              <div className="max-h-70 overflow-auto">
                                <ol className="list-decimal list-inside text-sm">
                                  {value["Snacks"].directions.map((direction, i) => (
                                    <li key={i} className="mb-1">
                                      {direction}
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Add this after the Snacks section but before the closing div for the day */}
                      {/* Calorie Summary for the day */}
                      <div className="p-4 bg-green-700 border-t">
                        <h4 className="text-lg font-semibold text-white mb-2">Daily Calorie Summary</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          <div className="bg-white p-2 rounded shadow-sm text-center">
                            <div className="text-xs text-gray-500">Breakfast</div>
                            <div className="font-medium">{value["Breakfast"].calories} cal</div>
                          </div>
                          <div className="bg-white p-2 rounded shadow-sm text-center">
                            <div className="text-xs text-gray-500">Lunch</div>
                            <div className="font-medium">{value["Lunch"].calories} cal</div>
                          </div>
                          <div className="bg-white p-2 rounded shadow-sm text-center">
                            <div className="text-xs text-gray-500">Dinner</div>
                            <div className="font-medium">{value["Dinner"].calories} cal</div>
                          </div>
                          <div className="bg-white p-2 rounded shadow-sm text-center">
                            <div className="text-xs text-gray-500">Snacks</div>
                            <div className="font-medium">{value["Snacks"].calories} cal</div>
                          </div>
                          <div className="bg-green-100 p-2 rounded shadow-sm text-center">
                            <div className="text-xs text-gray-700">Daily Total</div>
                            <div className="font-medium">
                              {value["Breakfast"].calories +
                                value["Lunch"].calories +
                                value["Dinner"].calories +
                                value["Snacks"].calories}
                              cal
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-right">
                          <span
                            className={`font-medium ${
                              value["Breakfast"].calories +
                                value["Lunch"].calories +
                                value["Dinner"].calories +
                                value["Snacks"].calories <=
                              generatedMealPlanData.calorieLimit
                                ? "text-white"
                                : "text-red-500"
                            }`}
                          >
                            {value["Breakfast"].calories +
                              value["Lunch"].calories +
                              value["Dinner"].calories +
                              value["Snacks"].calories <=
                            generatedMealPlanData.calorieLimit
                              ? "Within"
                              : "Exceeds"}{" "}
                            daily target of {generatedMealPlanData.calorieLimit.toFixed(0)} calories
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
