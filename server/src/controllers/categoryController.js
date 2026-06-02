const prisma = require("../prismaClient.js");

const createCategory = async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    const userId = req.user?.id;
    if (!name) {
      res.status(400).json({ message: "Please provide valid name" });
      return;
    }
    const newCategory = await prisma.category.create({
      data: {
        name,
        icon,
        color,
        userId: Number(userId),
      },
    });
    console.log(newCategory);
    res.status(201).json({
      id: newCategory.id,
      name: newCategory.name,
      color: newCategory.color,
      icon: newCategory.icon,
      userId: newCategory.userId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong in createCategory" });
  }
};

const getCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const categories = await prisma.category.findMany({
      where: {
        userId: userId,
      },
    });
    res.status(200).json({ categories });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong in getCategories" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    console.log(userId, id);
    if (!id) {
      res.status(401).json({ message: "Provide a valid id" });
      return;
    }
    const deletedCategory = await prisma.category.deleteMany({
      where: {
        id: Number(id),
        userId: Number(userId),
      },
    });
    if (deletedCategory.count === 0) {
      res.status(404).json({ message: `Category id ${id} not found` });
      return;
    }
    console.log(deletedCategory);
    res.status(200).json({
      message: `Category id:${id} deleted successfully`,
      userId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong in deleteCategory" });
  }
};

module.exports = {
  createCategory,
  getCategories,
  deleteCategory,
};
