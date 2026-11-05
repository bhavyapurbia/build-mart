const Product = require('../models/Product');
const Inventory = require('../models/Inventory');

exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      brand,
      search,
      deal,
      featured,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 24
    } = req.query;

    let filter = { isActive: true };

    if (category) {
      filter.category = category;
    }
    if (subcategory) {
      filter.subcategory = subcategory;
    }
    if (brand) {
      const coreBrand = brand.split(' by ')[0].replace(/India.*|Group.*|Ltd\.*/gi, '').trim();
      filter.brand = { $regex: coreBrand || brand, $options: 'i' };
    }
    if (deal === 'true') {
      filter.isDeal = true;
    }
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    let products = await Product.find(filter);

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (minPrice) {
      products = products.filter(p => Number(p.price) >= Number(minPrice));
    }
    if (maxPrice) {
      products = products.filter(p => Number(p.price) <= Number(maxPrice));
    }

    // Sort
    if (sort === 'price-asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'discount') {
      products.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    } else {
      // Default: newest or featured
      products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    const total = products.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedProducts = products.slice(startIndex, startIndex + Number(limit));

    res.json({
      products: paginatedProducts,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
      total
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
};

exports.getDeals = async (req, res) => {
  try {
    const deals = await Product.find({ isDeal: true, isActive: true }).limit(8);
    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching deals', error: err.message });
  }
};

exports.getBestsellers = async (req, res) => {
  try {
    const bestsellers = await Product.find({ isFeatured: true, isActive: true }).limit(8);
    res.json(bestsellers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bestsellers', error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      subcategory,
      brand,
      price,
      mrp,
      unit,
      stock,
      description,
      specifications,
      images,
      isFeatured,
      isDeal
    } = req.body;

    if (!name || !category || !brand || price === undefined || mrp === undefined) {
      return res.status(400).json({ message: 'Name, category, brand, price and MRP are required.' });
    }

    const sku = 'BM-' + Date.now().toString().slice(-6);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    const product = await Product.create({
      name,
      slug,
      sku,
      category,
      subcategory: subcategory || '',
      brand,
      price: Number(price),
      mrp: Number(mrp),
      discount,
      unit: unit || 'Piece',
      stock: Number(stock) || 50,
      description: description || '',
      specifications: specifications || [],
      images: Array.isArray(images) && images.length ? images : ['/placeholder-material.jpg'],
      isFeatured: !!isFeatured,
      isDeal: !!isDeal,
      isActive: true
    });

    // Sync inventory record
    await Inventory.create({
      productId: product._id,
      productName: product.name,
      sku: product.sku,
      currentStock: product.stock,
      unit: product.unit
    });

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    res.status(500).json({ message: 'Error creating product', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.mrp && updateData.price) {
      updateData.discount = updateData.mrp > updateData.price
        ? Math.round(((updateData.mrp - updateData.price) / updateData.mrp) * 100)
        : 0;
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Update inventory if stock changed
    if (updateData.stock !== undefined) {
      await Inventory.updateOne(
        { productId: id },
        { currentStock: Number(updateData.stock) }
      );
    }

    res.json({ message: 'Product updated successfully', product: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await Product.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    await Inventory.deleteOne({ productId: id });
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
};

