const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
	{
		productName: { type: String, required: true },
		brand: { type: String },
		brand_table: { type: String }, // Brand từ bảng thông số
		color: { type: String },
		specialFeature: { type: String },
		style: { type: String },
		theme: { type: String },
		soldBy: { type: String },
		description: { type: String },
		productImage: { type: String },
		category: { type: String },
		price: { type: Number },
		rating: { type: String },
		totalReviews: { type: String },
		asin: { type: String },
		best_sellers_rank: {
			type: [
				{
					date: { type: Date, default: Date.now },
					ranks: [
						{
							category: { type: String, required: true },
							rank: { type: Number, required: true },
						},
					],
				},
			],
			default: [],
		},
		// Thêm các trường mới để lưu số thứ tự đã trích xuất
		rank_overall: { type: Number }, // Số thứ tự tổng thể
		rank_kitchen: { type: Number }, // Số thứ tự trong danh mục Kitchen & Dining
		rank_tumbler: { type: Number }, // Số thứ tự trong danh mục Tumblers
		date_first_available: { type: Date },
		url: { type: String },
		boughtInLast30Days: { type: Number, default: 0 },
		source: {
			type: String,
			enum: [
				'direct',
				'best-sellers',
				'new-releases',
				'marketplace',
				'unknown',
			],
			default: 'unknown',
		},
		rank: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Product', productSchema);
