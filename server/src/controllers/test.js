const prisma = require("../prismaClient.js");

const createCategory = async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    // Assuming auth middleware sets req.user = { id, name, ... }
    const userId = req.user?.id;

    // 1. Better validation block with returns
    if (!name || !icon || !color) {
      return res
        .status(400)
        .json({ message: "Please provide name, icon, and color" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    // 2. Create category and INCLUDE the related user data for the response
    const newCategory = await prisma.category.create({
      data: {
        name,
        icon,
        color,
        userId: userId, // Fixed syntax (= changed to :)
      },
      include: {
        user: true, // Essential to allow accessing newCategory.user below
      },
    });

    return res.status(201).json({
      id: newCategory.id,
      name: newCategory.name,
      color: newCategory.color,
      userId: newCategory.userId,
      username: newCategory.user?.name, // Added optional chaining just in case
      email: newCategory.user?.email,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong in createCategory" });
  }
};

const getCategories = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Provide a valid user session" });
    }

    // Fixed: Fetch categories where userId matches (not category id)
    const categories = await prisma.category.findMany({
      where: {
        userId: userId,
      },
    });

    return res.status(200).json({ categories });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong in getCategories" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Security layer: make sure they own it

    if (!id) {
      return res.status(400).json({ message: "Provide a valid category id" });
    }

    // Double check the category exists and belongs to the user before deleting
    const deletedCategory = await prisma.category.deleteMany({
      where: {
        id: id,
        userId: userId, // Prevents User A from deleting User B's category via Postman
      },
    });

    if (deletedCategory.count === 0) {
      return res
        .status(404)
        .json({ message: "Category not found or unauthorized" });
    }

    // Fixed typo: deletedCategory instead of deleteCategory
    return res
      .status(200)
      .json({ message: `Category ${id} deleted successfully` });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong in deleteCategory" });
  }
};

module.exports = {
  createCategory,
  getCategories,
  deleteCategory,
};
