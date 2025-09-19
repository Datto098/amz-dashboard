const productService = require('../services/product.service');

exports.deleteAllProducts = async (req, res) => {
	try {
		await productService.deleteAllProducts();
		res.json({ message: 'All products deleted' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.getUniqueSoldBy = async (req, res) => {
	try {
		const soldByList = await productService.getUniqueSoldBy();
		res.json(soldByList);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.getUniqueCategories = async (req, res) => {
	try {
		const categoryList = await productService.getUniqueCategories();
		res.json(categoryList);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.createProduct = async (req, res) => {
	console.log('req.body:', req.body);
	try {
		const product = await productService.createProduct(req.body);
		res.status(201).json(product);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

exports.getAllProducts = async (req, res) => {
	try {
		const {
			search,
			category,
			boughtInLast30Days,
			minPrice,
			maxPrice,
			startDate,
			endDate,
			source,
		} = req.query;

		console.log('req.query:', req.query);
		const products = await productService.getAllProducts({
			search,
			category,
			boughtInLast30Days,
			minPrice,
			maxPrice,
			startDate,
			endDate,
			source,
		});
		res.json(products);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.getProductsCount = async (req, res) => {
	try {
		const {
			search,
			category,
			boughtInLast30Days,
			minPrice,
			maxPrice,
			startDate,
			endDate,
			source,
		} = req.query;

		console.log('req.query for count:', req.query);
		const count = await productService.getProductsCount({
			search,
			category,
			boughtInLast30Days,
			minPrice,
			maxPrice,
			startDate,
			endDate,
			source,
		});
		res.json({ count });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.getProductById = async (req, res) => {
	try {
		const product = await productService.getProductById(req.params.id);
		if (!product)
			return res.status(404).json({ error: 'Product not found' });
		res.json(product);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.updateProduct = async (req, res) => {
	try {
		const product = await productService.updateProduct(
			req.params.id,
			req.body
		);
		if (!product)
			return res.status(404).json({ error: 'Product not found' });
		res.json(product);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

exports.deleteProduct = async (req, res) => {
	try {
		const product = await productService.deleteProduct(req.params.id);
		if (!product)
			return res.status(404).json({ error: 'Product not found' });
		res.json({ message: 'Product deleted' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
