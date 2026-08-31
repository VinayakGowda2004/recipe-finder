const express = require("express");
const router = express.Router();

router.post("/ai-preparation", async (req, res) => {
  try {
    const { instructions, ingredients, people } = req.body;

    if (!instructions || !ingredients || !people || people < 1) {
      return res.status(400).json({ message: "❗ Invalid input data" });
    }

    const instructionsArray = Array.isArray(instructions) ? instructions : [instructions];
    const ingredientsArray = Array.isArray(ingredients) ? ingredients : [ingredients];

    const baseTime = 20;
    const adjustedTime = baseTime + Math.round(people * 1.5);

    const formatNumber = (num) => {
      const rounded = parseFloat(num).toFixed(2);
      return rounded.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
    };

    const safeScale = (text) => {
      return text.replace(
        /(\d+(?:\.\d+)?)(\s?(g|ml|tsp|tbsp|kg|l|cup|cups|inch|inches|small|medium|large|clove|cloves)?)?/gi,
        (match, num, unit = "") => {
          const number = parseFloat(num);
          if (isNaN(number)) return match; // 🔒 don't replace if not a valid number
          const scaled = number * people;
          return `${formatNumber(scaled)}${unit}`;
        }
      );
    };

    const adjustedIngredients = ingredientsArray.map((item) => safeScale(item));

    const updatedInstructions = instructionsArray.map((step, index) => {
      const updated = safeScale(step);
      return `Step ${index + 1}: ${updated}`;
    });

    res.json({
      stepByStep: updatedInstructions.join("\n"),
      adjustedIngredients,
      time: `${adjustedTime} minutes`,
    });
  } catch (error) {
    console.error("❌ AI Processing Error:", error);
    res.status(500).json({ message: "❌ Internal Server Error" });
  }
});

module.exports = router;
