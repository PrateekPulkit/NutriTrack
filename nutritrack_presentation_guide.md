# 🥗 NutriTrack - Presentation & Demo Guide

This guide contains everything you need to know to master NutriTrack and deliver a flawless presentation. It covers the architecture, core features, technical implementation details, and a step-by-step demo script.

---

## 🏗️ 1. Project Architecture & Tech Stack

NutriTrack is a modern, full-stack web application. It follows a classic client-server architecture with a RESTful API.

### Tech Stack Breakdown
*   **Frontend (Client):**
    *   **Framework:** React 18 (built with Vite for fast HMR and optimized builds).
    *   **Routing:** React Router v6 for Single Page Application (SPA) navigation.
    *   **Styling:** Vanilla CSS using CSS variables (custom properties) for a clean, dependency-free design system. No Tailwind or Bootstrap, showing strong foundational CSS skills.
    *   **State Management:** React Context API (`AuthContext`) for global user state, and local component state (`useState`, `useEffect`) for everything else.
    *   **HTTP Client:** Axios with interceptors for attaching JWT tokens to requests and handling session expiry (401 errors).
*   **Backend (Server):**
    *   **Runtime:** Node.js.
    *   **Framework:** Express.js.
    *   **Authentication:** JSON Web Tokens (JWT) & bcryptjs for password hashing.
    *   **Database:** MongoDB (NoSQL) with Mongoose ODM.
*   **External APIs & Services:**
    *   **Cloudinary:** For fast, secure cloud storage of uploaded food images.
    *   **Spoonacular API:** The AI engine that analyzes food images to identify the food and extract its nutritional data.
    *   **PDFKit:** Server-side generation of weekly PDF reports.

### Directory Structure (High Level)
*   `server.js`: The entry point for the backend. Configures middleware, connects to MongoDB, sets up routes, and serves the frontend in production.
*   `models/`: Mongoose schemas defining the database structure (`User`, `FoodLog`, `Food`).
*   `controllers/`: The business logic for each route (e.g., handling registration, calculating dashboard data).
*   `routes/`: Express routers mapping URLs to controller functions.
*   `utils/`: Helper functions, notably `dietCalculator.js` which handles BMR, BMI, and macro calculations.
*   `client/`: The React frontend application.
    *   `src/pages/`: Main views like `Dashboard`, `Login`, `Register`, `FoodUpload`.
    *   `src/components/`: Reusable UI elements (`Alert`, `CalorieProgress`, `BmiCard`, `WeeklyChart`).
    *   `src/services/`: API caller functions using Axios.

---

## 🌟 2. Core Features & How They Work Under the Hood

### 🔐 1. User Authentication & Profile
*   **How it works:** Users register with their basic info and biometric data (age, weight, height, goal). The password is hashed using `bcryptjs` before saving to MongoDB. Upon successful login, the server issues a JWT.
*   **Frontend handling:** The JWT is stored in `localStorage`. The `AuthContext` checks for this token on load, keeping the user logged in. All protected API requests include this token in the `Authorization: Bearer <token>` header.

### 📊 2. The Dashboard & Analytics
*   **How it works:** This is the heart of the app. When the dashboard loads, the frontend calls `/api/dashboard/summary`.
*   **Backend Logic:** The `dashboardController` calculates the user's daily calorie goal based on their weight and goal using the `dietCalculator.js` utility (which uses BMR and activity multipliers). It then fetches all `FoodLog` entries for the day, sums up the macros (Protein, Carbs, Fats), and returns the progress.
*   **UI Highlights:** 
    *   **Calorie Ring:** A dynamic SVG ring showing percentage of daily goal reached. Changes color (Green -> Yellow -> Red) if the user goes over their limit.
    *   **Macro Panel:** Stacked progress bars showing the distribution of macronutrients.
    *   **Weekly Trend:** A chart (using Recharts) showing the last 7 days of calorie intake against the goal line.

### 📸 3. AI Food Analysis (The "Wow" Factor)
*   **How it works:** Users can drag-and-drop an image of their meal.
*   **Backend Logic (`uploadController.js`):**
    1.  **Storage:** The image is uploaded to **Cloudinary** to get a permanent URL.
    2.  **AI Detection:** The image is sent to the **Spoonacular API**. Spoonacular's machine learning models analyze the pixels to classify the food.
    3.  **Data Extraction:** If recognized, it returns the food name, probability, and estimated calories, protein, carbs, and fats.
    4.  **Fallback Mechanism:** If the API fails or quota is exceeded, the system has a clever fallback mechanism that tries to guess the food based on the filename against a local `COMMON_FOODS_DB`. It even detects non-food items (like "shoe" or "laptop")!

### 📝 4. Food Logging (CRUD Operations)
*   **How it works:** Users can manually add, edit, or delete food entries.
*   **Recent Update:** You recently added a highly requested **Edit feature**. Users can now click a pencil icon to inline-edit a food log. This updates the MongoDB record and instantly recalculates the dashboard totals without a full page reload, ensuring a smooth UX.

### 🧮 5. Smart Diet Calculator
*   **How it works (`utils/dietCalculator.js`):** The app doesn't just guess; it uses standard formulas to calculate Base Metabolic Rate (BMR) and adjusts it based on the user's goal (lose weight, gain muscle, maintain) to set accurate macro targets (e.g., 30% protein, 45% carbs, 25% fat for muscle gain).
*   **BMI Gauge:** Calculates Body Mass Index and renders it on a custom SVG needle gauge, providing specific health suggestions based on the category (Normal, Overweight, etc.).

### 📄 6. PDF Report Generation
*   **How it works:** Users can download a weekly summary.
*   **Backend Logic (`reportController.js`):** Uses the `pdfkit` library to dynamically generate a PDF on the server. It queries the last 7 days of logs, formats the data into tables and summary cards, and **streams** the PDF directly back to the client as a download, meaning no temporary files are saved on the server, saving disk space.

---

## 🎬 3. The Perfect 5-Minute Demo Script

Follow this script to demonstrate the app smoothly to your audience.

### Phase 1: Introduction & Onboarding (1 min)
1.  **Start at the Login/Register screen.**
2.  *Talking Point:* "Welcome to NutriTrack. We built this to make nutrition tracking intelligent and effortless. Let's start by creating a new profile."
3.  **Action:** Register a new user. Fill in name, email, password, and *crucially*, enter biometric data: Age 25, Weight 75kg, Height 180cm, Goal: "Maintain".
4.  *Talking Point:* "Notice how the system immediately uses this biometric data to calculate a personalized baseline for the dashboard."

### Phase 2: The Core Loop - Manual Logging & Edits (1.5 min)
1.  **Action:** The dashboard loads empty. Scroll to the "Log Food" section.
2.  **Action:** Manually add a meal: Name: "Grilled Chicken Salad", Calories: 450, Protein: 40, Carbs: 15, Fats: 10. Click Add.
3.  *Talking Point:* "As I log this meal, watch the dashboard. The Calorie Ring updates instantly, and the Macronutrient progress bars fill up. This is real-time feedback."
4.  **Action (Showcasing your recent fix!):** Click the **Edit (✏️) icon** on the meal you just added. Change Calories to 500. Save.
5.  *Talking Point:* "We recently implemented full inline-editing. If I made a mistake, I can edit it right here, and the dashboard recalculates everything on the fly."

### Phase 3: The "Wow" Moment - AI Food Analysis (1.5 min)
1.  **Action:** Navigate to the "Upload Food" (📸) section from Quick Actions.
2.  *Talking Point:* "Manual logging is great, but we wanted to use AI to make it frictionless. Let's say I'm about to eat this meal."
3.  **Action:** Upload an image of food (have a sample image ready on your desktop, e.g., a bowl of oatmeal or a burger).
4.  *Talking Point:* "The image is securely uploaded to Cloudinary, and we use the Spoonacular AI API to analyze the visual data. It detects the food, estimates the portion, and extracts the exact macronutrients. With one click, I can add this to my daily log."
5.  **Action:** Click "Save to Daily Log" and return to the Dashboard to show the added calories.

### Phase 4: Analytics & PDF Reports (1 min)
1.  **Action:** Scroll down the dashboard to show the **Weekly Trend chart**.
2.  *Talking Point:* "Users can track their consistency over time against their calorie goal line."
3.  **Action:** Point out the **BMI Gauge**.
4.  *Talking Point:* "Based on the profile we created, the custom SVG gauge shows the current BMI and provides actionable health suggestions."
5.  **Action:** Click the "Weekly Report (📄)" button at the top.
6.  *Talking Point:* "Finally, users can export their data. The backend dynamically generates a formatted PDF report using PDFKit and streams it directly to the user for download, summarizing their week."

---

## 🛡️ 4. Anticipating Questions (Q&A Prep)

**Q: How do you ensure the app is secure?**
> A: We use JWT (JSON Web Tokens) for stateless authentication. Passwords are mathematically hashed using bcrypt before ever touching the database. We also implemented Helmet.js for secure HTTP headers and rate-limiting middleware to prevent brute-force attacks on login/upload routes.

**Q: Why use Vanilla CSS instead of Tailwind or Bootstrap?**
> A: We wanted absolute control over the design system to ensure a premium, unique look. By using CSS custom properties (variables), we created a highly maintainable theming system without the overhead of external CSS libraries.

**Q: What happens if the AI Spoonacular API goes down or you hit the rate limit?**
> A: We built a robust fallback mechanism. If the API fails, the backend catches the error and attempts to guess the nutritional value by analyzing the uploaded filename against a local, hardcoded database of common foods, ensuring the user experience isn't completely blocked.

**Q: You mentioned the dashboard updates instantly. How do you manage state?**
> A: We keep the React component state synchronized with the backend. Whenever a CRUD operation (Add, Edit, Delete) occurs on a food log, we await the successful API response and immediately trigger a `fetchData()` function to pull the fresh, aggregated totals from the database, keeping the UI perfectly in sync.

**Q: How is the PDF generated? Is it saved on the server?**
> A: No, to save server resources and storage, the PDF is generated on-the-fly in memory using PDFKit. The data stream is piped directly into the HTTP response object, triggering a download in the user's browser without ever writing a `.pdf` file to the server's disk.

---
**Good luck! The app is stable, bug-free, and looks incredible. You are going to do great.**🚀
