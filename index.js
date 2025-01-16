import express from "express";
import axios from "axios";

const app = express();
const port = 3000;
const API_URL = "https://dummyjson.com/recipes"; // Consistent API URL

// Middleware
app.use(express.static("public")); // Only define once
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Route for the homepage
app.get("/", async (req, res) => {
  try {
    // Fetch recipes from the API
    const response = await axios.get(`${API_URL}?limit=5`); // Fetch a limited number for the homepage
    const recipes = response.data.recipes; // Extract recipes from the API response

    // Render the index.ejs template and pass recipes
    res.render("index", { recipes });
  } catch (error) {
    console.error("Error fetching recipes:", error.message);
    res.status(500).render("error", { message: "Failed to load recipes for the homepage." });
  }
});

// Search Route with multiple filters
app.get("/search", async (req, res) => {
  const { query, tag, rating, difficulty, cuisine, calories, prepTime, cookTime } = req.query;

  try {
    const response = await axios.get(API_URL);
    const recipes = response.data.recipes;

    // Filtering based on query and additional filters
    const filteredRecipes = recipes.filter(recipe => {
      let matches = true;

      if (query) {
        matches = matches && recipe.name.toLowerCase().includes(query.toLowerCase());
      }
      if (tag) {
        matches = matches && recipe.tags.some(t => t.toLowerCase() === tag.toLowerCase());
      }
      if (rating) {
        matches = matches && recipe.rating >= Number(rating);
      }
      if (difficulty) {
        matches = matches && recipe.difficulty.toLowerCase() === difficulty.toLowerCase();
      }
      if (cuisine) {
        matches = matches && recipe.cuisine.toLowerCase() === cuisine.toLowerCase();
      }
      if (calories) {
        matches = matches && recipe.calories <= Number(calories);
      }
      if (prepTime) {
        matches = matches && recipe.prepTime <= Number(prepTime);
      }
      if (cookTime) {
        matches = matches && recipe.cookTime <= Number(cookTime);
      }

      return matches;
    });

    // Render the recipes page with filtered results
    res.render("recipes", { recipes: filteredRecipes, total: filteredRecipes.length, page: 1, limit: filteredRecipes.length, searchQuery: query });
  } catch (error) {
    console.error("Error processing search:", error.message);
    res.status(500).render("error", { message: "An error occurred while processing your search." });
  }
});



// Recipes Page with Pagination
app.get("/recipes", async (req, res) => {
  const { page = 1, limit = 15 } = req.query;
  const skip = (page - 1) * limit;
  try {
    const response = await axios.get(`${API_URL}?skip=${skip}&limit=${limit}`);
    const { recipes, total } = response.data;
    res.render("recipes", { recipes, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { message: "Failed to load recipes." });
  }
});

// Recipe Details Page
app.get("/recipes/:id", async (req, res) => {
  const recipeId = req.params.id;
  try {
    const response = await axios.get(`${API_URL}/${recipeId}`);
    const recipe = response.data;
    res.render("recipeDetail", { recipe });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { message: "Failed to load recipe details." });
  }
});

app.get("/contact", (req, res) => {
  res.render('contact.ejs');
});

// About route
app.get('/about', (req, res) => {
  res.render('about.ejs');
});

// Start the Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
