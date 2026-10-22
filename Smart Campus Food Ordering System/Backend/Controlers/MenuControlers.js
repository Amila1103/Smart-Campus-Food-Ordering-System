import Menu from "../Model/MenuModel.js";
import Customer from "../Model/Customer.js";

const updateAvailabilityStatusValue = (stockQty, limitedThreshold) => {
  if (stockQty <= 0) return "Sold Out";
  if (stockQty <= limitedThreshold) return "Limited";
  return "Available";
};

// GET ALL MENUS
export const getAllMenus = async (req, res) => {
  try {
    const menus = await Menu.find().sort({ createdAt: -1 });
    return res.status(200).json({ menus });
  } catch (err) {
    console.log("getAllMenus error:", err);
    return res.status(500).json({ message: "Error fetching menus" });
  }
};

// GET MENU BY ID
export const getMenuById = async (req, res) => {
  const id = req.params.id;

  try {
    const menu = await Menu.findById(id);

    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    return res.status(200).json({ menu });
  } catch (err) {
    console.log("getMenuById error:", err);
    return res.status(500).json({ message: "Error fetching menu" });
  }
};

// ADD MENU
export const addMenu = async (req, res) => {
  try {
    const {
      name,
      category,
      portionSize,
      price,
      description,
      stockQty,
      limitedThreshold,
      availableOrderTypes,
      labels,
      allergens,
      calories,
      nutrients,
      rating,
      ratingCount,
      isActive,
    } = req.body;

    const parsedStockQty = Number(stockQty ?? 0);
    const parsedLimitedThreshold = Number(limitedThreshold ?? 5);
    const parsedPrice = Number(price);
    const parsedCalories = Number(calories ?? 0);
    const parsedRating = Number(rating ?? 0);
    const parsedRatingCount = Number(ratingCount ?? 0);

    const finalAvailabilityStatus = updateAvailabilityStatusValue(
      parsedStockQty,
      parsedLimitedThreshold
    );

    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const newMenu = new Menu({
      name,
      category,
      portionSize: portionSize || "Regular",
      price: parsedPrice,
      image,
      description: description || "",
      stockQty: parsedStockQty,
      limitedThreshold: parsedLimitedThreshold,
      availabilityStatus: finalAvailabilityStatus,
      availableOrderTypes: availableOrderTypes
        ? Array.isArray(availableOrderTypes)
          ? availableOrderTypes
          : [availableOrderTypes]
        : ["Takeaway"],
      labels: labels
        ? Array.isArray(labels)
          ? labels
          : [labels]
        : [],
      allergens: allergens
        ? Array.isArray(allergens)
          ? allergens
          : [allergens]
        : [],
      calories: parsedCalories,
      nutrients: nutrients
        ? Array.isArray(nutrients)
          ? nutrients
          : [nutrients]
        : [],
      rating: parsedRating,
      ratingCount: parsedRatingCount,
      isActive: isActive !== undefined ? isActive : true,
    });

    await newMenu.save();

    return res.status(201).json({
      message: "Menu added successfully",
      menu: newMenu,
    });
  } catch (err) {
    console.log("addMenu error:", err);
    return res.status(500).json({ message: "Error adding menu" });
  }
};

// UPDATE MENU
export const updateMenu = async (req, res) => {
  const id = req.params.id;

  try {
    const existingMenu = await Menu.findById(id);

    if (!existingMenu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    const {
      name,
      category,
      portionSize,
      price,
      description,
      stockQty,
      limitedThreshold,
      availableOrderTypes,
      labels,
      allergens,
      calories,
      nutrients,
      rating,
      ratingCount,
      isActive,
    } = req.body;

    const nextStockQty =
      stockQty !== undefined ? Number(stockQty) : existingMenu.stockQty;

    const nextLimitedThreshold =
      limitedThreshold !== undefined
        ? Number(limitedThreshold)
        : existingMenu.limitedThreshold;

    const nextAvailabilityStatus = updateAvailabilityStatusValue(
      nextStockQty,
      nextLimitedThreshold
    );

    existingMenu.name = name ?? existingMenu.name;
    existingMenu.category = category ?? existingMenu.category;
    existingMenu.portionSize = portionSize ?? existingMenu.portionSize;
    existingMenu.price = price !== undefined ? Number(price) : existingMenu.price;
    existingMenu.description = description ?? existingMenu.description;
    existingMenu.stockQty = nextStockQty;
    existingMenu.limitedThreshold = nextLimitedThreshold;
    existingMenu.availabilityStatus = nextAvailabilityStatus;
    existingMenu.availableOrderTypes = availableOrderTypes
      ? Array.isArray(availableOrderTypes)
        ? availableOrderTypes
        : [availableOrderTypes]
      : existingMenu.availableOrderTypes;
    existingMenu.labels = labels
      ? Array.isArray(labels)
        ? labels
        : [labels]
      : existingMenu.labels;
    existingMenu.allergens = allergens
      ? Array.isArray(allergens)
        ? allergens
        : [allergens]
      : existingMenu.allergens;
    existingMenu.calories =
      calories !== undefined ? Number(calories) : existingMenu.calories;
    existingMenu.nutrients = nutrients
      ? Array.isArray(nutrients)
        ? nutrients
        : [nutrients]
      : existingMenu.nutrients;
    existingMenu.rating =
      rating !== undefined ? Number(rating) : existingMenu.rating;
    existingMenu.ratingCount =
      ratingCount !== undefined ? Number(ratingCount) : existingMenu.ratingCount;
    existingMenu.isActive =
      isActive !== undefined ? isActive : existingMenu.isActive;

    if (req.file) {
      existingMenu.image = `/uploads/${req.file.filename}`;
    }

    await existingMenu.save();

    return res.status(200).json({
      message: "Menu updated successfully",
      menu: existingMenu,
    });
  } catch (err) {
    console.log("updateMenu error:", err);
    return res.status(500).json({ message: "Error updating menu" });
  }
};

// DELETE MENU
export const deleteMenu = async (req, res) => {
  const id = req.params.id;

  try {
    const menu = await Menu.findByIdAndDelete(id);

    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    return res.status(200).json({
      message: "Menu deleted successfully",
      menu,
    });
  } catch (err) {
    console.log("deleteMenu error:", err);
    return res.status(500).json({ message: "Error deleting menu" });
  }
};

// UPDATE MENU STOCK
export const updateMenuStock = async (req, res) => {
  const id = req.params.id;
  const { stockQty } = req.body;

  try {
    const menu = await Menu.findById(id);

    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    menu.stockQty = Number(stockQty);
    menu.availabilityStatus = updateAvailabilityStatusValue(
      menu.stockQty,
      menu.limitedThreshold
    );

    await menu.save();

    return res.status(200).json({
      message: "Menu stock updated successfully",
      menu,
    });
  } catch (err) {
    console.log("updateMenuStock error:", err);
    return res.status(500).json({ message: "Error updating stock" });
  }
};

// GET RECOMMENDED MENUS
export const getRecommendedMenus = async (req, res) => {
  const customerId = req.params.customerId;

  try {
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const customerAllergies = (customer.allergies || []).map((a) =>
      a.toLowerCase()
    );
    const customerDietaryPreferences = (
      customer.dietaryPreferences || []
    ).map((p) => p.toLowerCase());

    const menus = await Menu.find({
      isActive: true,
      availabilityStatus: { $ne: "Sold Out" },
    });

    const safeMenus = menus.filter((menu) => {
      const menuAllergens = (menu.allergens || []).map((a) => a.toLowerCase());

      const hasBlockedAllergen = menuAllergens.some((allergen) =>
        customerAllergies.includes(allergen)
      );

      return !hasBlockedAllergen;
    });

    const scoredMenus = safeMenus.map((menu) => {
      let score = 0;

      const menuLabels = (menu.labels || []).map((l) => l.toLowerCase());

      customerDietaryPreferences.forEach((pref) => {
        if (menuLabels.includes(pref)) {
          score += 3;
        }
      });

      if (customer.calorieGoal) {
        const goal = customer.calorieGoal.toLowerCase();

        if (
          (goal.includes("low") && menu.calories <= 400) ||
          (goal.includes("medium") && menu.calories > 400 && menu.calories <= 700) ||
          (goal.includes("high") && menu.calories > 700)
        ) {
          score += 2;
        }
      }

      if (menu.availabilityStatus === "Available") {
        score += 2;
      }

      score += Number(menu.rating || 0);

      return { ...menu.toObject(), recommendationScore: score };
    });

    scoredMenus.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return res.status(200).json({
      customer: {
        id: customer._id,
        name: customer.name,
        allergies: customer.allergies,
        dietaryPreferences: customer.dietaryPreferences,
        calorieGoal: customer.calorieGoal,
      },
      recommendedMenus: scoredMenus,
    });
  } catch (err) {
    console.log("getRecommendedMenus error:", err);
    return res.status(500).json({ message: "Error fetching recommendations" });
  }
};