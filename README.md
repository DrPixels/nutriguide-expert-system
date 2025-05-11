# NutriGuide Expert System

## Expert System Description
* The NutriGuide Expert System is a full-stack website that uses React + Typescript for its frontend and Flask for backend.  
* The NutriGuide Expert System is using a hybrid method that combines both the Rules-Based and Fuzzy Logic approach.  
* This expert system aims to provide a meal planning depending on the days desired by the user and restrictions such as dietary restrictions and included or excluded ingredients.
* Moreover, the expert system uses the personal information of the user such as gender, height, weight and age.

## Frontend Installation Steps
1. Go to the Frontend Folder.
   * Go to the terminal, then run:
  ```
   cd frontend
  ```
2. Install Vite with React + Typescript
  ```
   npm install vite@latest
  ```
3. Install other dependencies
  ```
   npm install lucide-react
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   npm install react-spinners --save
  ```
4. Run the program
  ```
   npm run dev
  ```
## Backend Installation Steps
1. Go to the Backend Folder.
   * Go to the terminal, then run:
  ```
   cd backend
  ```
2. Install required packages
  ```
   pip install Flask
   pip install flask_cors
   pip install numpy
   pip install scikit-fuzzy
   pip install json
   pip install random
   pip install os
  ```
4. Run the program
  ```
   python app.py
  ```
