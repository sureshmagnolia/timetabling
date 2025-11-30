/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Step 3: Install Dependencies
Open your terminal inside your `timetable-architect` folder and run these commands one by one:

1.  **Install the libraries** (React, etc.):
    ```bash
    npm install
    ```
2.  **Install the Deploy Tool** (helps push to GitHub Pages):
    ```bash
    npm install gh-pages --save-dev
    ```

### Step 4: Configure for GitHub
You need to tell the app where it will live on the internet.

1.  **Go to GitHub.com** and create a new **Empty Repository**. Name it (e.g., `timetable-maker`).
2.  **Open `package.json`** and add these lines:
    * At the very top, add: `"homepage": "https://YOUR_GITHUB_USERNAME.github.io/timetable-maker",`
    * Inside `"scripts"`, add: `"deploy": "gh-pages -d dist",`

    Your `package.json` should look like this (abbreviated):
    ```json
    {
      "name": "timetable-architect",
      "homepage": "https://yourusername.github.io/timetable-maker", 
      "scripts": {
        "dev": "vite",
        "build": "vite build",
        "deploy": "gh-pages -d dist" 
      },
      ...
    }
    ```
3.  **Open `vite.config.js`** and ensure the base matches your repo name:
    ```javascript
    base: '/timetable-maker/',
    ```

### Step 5: Push and Deploy
Back in your terminal, run these commands to put it online:

1.  **Initialize Git:**
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  **Connect to GitHub** (Replace URL with your actual repo URL):
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/timetable-maker.git
    git branch -M main
    git push -u origin main
    ```
3.  **Deploy to the Web:**
    ```bash
    npm run build
    npm run deploy
