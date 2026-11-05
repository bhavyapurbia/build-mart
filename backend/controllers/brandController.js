const Brand = require('../models/Brand');

exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: { $ne: false } });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching brands', error: err.message });
  }
};

exports.createBrand = async (req, res) => {
  try {
    const { name, logo, description, isFeatured } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Brand name is required.' });
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const brand = await Brand.create({
      name,
      slug,
      logo: logo || '',
      description: description || '',
      isFeatured: !!isFeatured,
      isActive: true
    });
    res.status(201).json({ message: 'Brand created successfully', brand });
  } catch (err) {
    res.status(500).json({ message: 'Error creating brand', error: err.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.name) {
      updateData.slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const updated = await Brand.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Brand not found.' });
    }
    res.json({ message: 'Brand updated successfully', brand: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating brand', error: err.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Brand.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Brand not found.' });
    }
    res.json({ message: 'Brand deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting brand', error: err.message });
  }
};

