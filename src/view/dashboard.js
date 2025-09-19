let displayMode = 'grid'; // or 'table'

function getFilterParams() {
	let search = '';
	const minPriceInput = document.getElementById('minPrice');
	const maxPriceInput = document.getElementById('maxPrice');
	const minPrice = minPriceInput ? parseFloat(minPriceInput.value) : null;
	const maxPrice = maxPriceInput ? parseFloat(maxPriceInput.value) : null;
	const startDateInput = document.getElementById('startDate');
	const endDateInput = document.getElementById('endDate');
	const startDate = startDateInput ? startDateInput.value : null;
	const endDate = endDateInput ? endDateInput.value : null;
	const boughtInLast30DaysInput =
		document.getElementById('boughtInPastMonth');
	const boughtInLast30Days = boughtInLast30DaysInput.checked;
	const searchInput = document.getElementById('searchInput');
	if (searchInput) search = searchInput.value.trim();

	const params = [];
	if (search) params.push(`search=${encodeURIComponent(search)}`);
	if (minPrice !== null) params.push(`minPrice=${minPrice}`);
	if (maxPrice !== null) params.push(`maxPrice=${maxPrice}`);
	if (startDate !== null) params.push(`startDate=${startDate}`);
	if (endDate !== null) params.push(`endDate=${endDate}`);
	if (boughtInLast30Days) params.push(`boughtInLast30Days=true`);

	return params;
}

async function fetchProducts() {
	const params = getFilterParams();
	let url = `${window.API_BASE_URL || ''}/api/products`;
	if (params.length) url += '?' + params.join('&');
	const res = await fetch(url);
	return await res.json();
}

async function fetchProductsCount() {
	const params = getFilterParams();
	let url = `${window.API_BASE_URL || ''}/api/products/count`;
	if (params.length) url += '?' + params.join('&');
	const res = await fetch(url);
	const data = await res.json();
	return data.count;
}
async function fetchSoldByList() {
	const res = await fetch(
		`${window.API_BASE_URL || ''}/api/products/soldby-list`
	);
	return await res.json();
}
async function fetchCategoryList() {
	const res = await fetch(
		`${window.API_BASE_URL || ''}/api/products/category-list`
	);
	return await res.json();
}
function renderSidebar(sellers, categories) {
	const sellerDiv = document.getElementById('sellerFilters');
	const categoryDiv = document.getElementById('categoryFilters');
	const sourceDiv = document.getElementById('sourceFilters');
	if (!sellerDiv || !categoryDiv || !sourceDiv) return;

	let sellerHtml = `<label class="filter-option"><input type="checkbox" name="seller" value="all" checked>All</label>`;
	sellers.forEach((seller) => {
		sellerHtml += `<label class="filter-option"><input type="checkbox" name="seller" value="${seller}"><span>${seller}</span></label>`;
	});
	sellerDiv.innerHTML = sellerHtml;

	let categoryHtml = `<label class="filter-option"><input type="checkbox" name="category" value="all" checked>All</label>`;
	categories.forEach((category) => {
		categoryHtml += `<label class="filter-option"><input type="checkbox" name="category" value="${category}"><span>${category}</span></label>`;
	});
	categoryDiv.innerHTML = categoryHtml;

	// Source filter options
	const sourceOptions = [
		{ value: 'new-releases', label: 'New Releases' },
		{ value: 'best-sellers', label: 'Best Sellers' },
		// { value: 'direct', label: 'Direct' },
		// { value: 'marketplace', label: 'Marketplace' },
		// { value: 'unknown', label: 'Unknown' },
	];

	let sourceHtml = `<label class="filter-option"><input type="checkbox" name="source" value="all" checked>All</label>`;
	sourceOptions.forEach((source) => {
		sourceHtml += `<label class="filter-option"><input type="checkbox" name="source" value="${source.value}"><span>${source.label}</span></label>`;
	});
	sourceDiv.innerHTML = sourceHtml;

	// Add event listeners
	document.querySelectorAll('input[name="seller"]').forEach((input) => {
		input.addEventListener(
			'change',
			async () => await onSellerFilterChange.call(input)
		);
	});
	document.querySelectorAll('input[name="category"]').forEach((input) => {
		input.addEventListener(
			'change',
			async () => await onCategoryFilterChange.call(input)
		);
	});
	document.querySelectorAll('input[name="source"]').forEach((input) => {
		input.addEventListener(
			'change',
			async () => await onSourceFilterChange.call(input)
		);
	});
}
async function loadSidebar() {
	const sellers = await fetchSoldByList();
	const categories = await fetchCategoryList();
	renderSidebar(sellers, categories);
}
async function onSellerFilterChange() {
	// Handle "All" checkbox logic
	const allCheckbox = document.querySelector(
		'input[name="seller"][value="all"]'
	);
	const sellerCheckboxes = Array.from(
		document.querySelectorAll('input[name="seller"]:not([value="all"])')
	);

	if (this.value === 'all' && this.checked) {
		// If "All" is checked, uncheck others
		sellerCheckboxes.forEach((cb) => (cb.checked = false));
	} else if (this.value !== 'all' && this.checked) {
		// If any other is checked, uncheck "All"
		allCheckbox.checked = false;
	}

	// If none are checked, check "All"
	const anyChecked = sellerCheckboxes.some((cb) => cb.checked);
	if (!anyChecked) {
		allCheckbox.checked = true;
	}

	// Get selected sellers
	window.selectedSellers = [];
	if (allCheckbox.checked) {
		window.selectedSellers = []; // Empty array means all sellers
	} else {
		sellerCheckboxes.forEach((cb) => {
			if (cb.checked) window.selectedSellers.push(cb.value);
		});
	}

	await filterProducts();
}

async function onCategoryFilterChange() {
	// Handle "All" checkbox logic
	const allCheckbox = document.querySelector(
		'input[name="category"][value="all"]'
	);
	const categoryCheckboxes = Array.from(
		document.querySelectorAll('input[name="category"]:not([value="all"])')
	);

	if (this.value === 'all' && this.checked) {
		// If "All" is checked, uncheck others
		categoryCheckboxes.forEach((cb) => (cb.checked = false));
	} else if (this.value !== 'all' && this.checked) {
		// If any other is checked, uncheck "All"
		allCheckbox.checked = false;
	}

	// If none are checked, check "All"
	const anyChecked = categoryCheckboxes.some((cb) => cb.checked);
	if (!anyChecked) {
		allCheckbox.checked = true;
	}

	// Get selected categories
	window.selectedCategories = [];
	if (allCheckbox.checked) {
		window.selectedCategories = []; // Empty array means all categories
	} else {
		categoryCheckboxes.forEach((cb) => {
			if (cb.checked) window.selectedCategories.push(cb.value);
		});
	}

	await filterProducts();
}

async function onSourceFilterChange() {
	// Handle "All" checkbox logic
	const allCheckbox = document.querySelector(
		'input[name="source"][value="all"]'
	);
	const sourceCheckboxes = Array.from(
		document.querySelectorAll('input[name="source"]:not([value="all"])')
	);

	if (this.value === 'all' && this.checked) {
		// If "All" is checked, uncheck others
		sourceCheckboxes.forEach((cb) => (cb.checked = false));
	} else if (this.value !== 'all' && this.checked) {
		// If any other is checked, uncheck "All"
		allCheckbox.checked = false;
	}

	// If none are checked, check "All"
	const anyChecked = sourceCheckboxes.some((cb) => cb.checked);
	if (!anyChecked) {
		allCheckbox.checked = true;
	}

	// Get selected sources
	window.selectedSources = [];
	if (allCheckbox.checked) {
		window.selectedSources = []; // Empty array means all sources
	} else {
		sourceCheckboxes.forEach((cb) => {
			if (cb.checked) window.selectedSources.push(cb.value);
		});
	}

	await filterProducts();
}

async function updateStats(products, filteredProducts) {
	// Get total count from API (without any filters)
	let url = `${window.API_BASE_URL || ''}/api/products/count`;
	const res = await fetch(url);
	const data = await res.json();
	const totalProducts = data.count;

	const showingProducts = filteredProducts ? filteredProducts.length : 0;
	const withPrice = filteredProducts
		? filteredProducts.filter((p) => p.price && p.price > 0).length
		: 0;
	const withRating = filteredProducts
		? filteredProducts.filter((p) => p.rating && p.rating > 0).length
		: 0;

	// Update DOM elements
	const totalElement = document.getElementById('total-products-count');
	const showingElement = document.getElementById('showing-products-count');
	const priceElement = document.getElementById('with-price-count');
	const ratingElement = document.getElementById('with-rating-count');

	if (totalElement) totalElement.textContent = totalProducts;
	if (showingElement) showingElement.textContent = showingProducts;
	if (priceElement) priceElement.textContent = withPrice;
	if (ratingElement) ratingElement.textContent = withRating;
}

async function filterProducts() {
	let filtered = window.products || [];

	// Filter by selected sellers
	if (window.selectedSellers && window.selectedSellers.length > 0) {
		filtered = filtered.filter((p) =>
			window.selectedSellers.includes(p.soldBy)
		);
	}

	// Filter by selected categories
	if (window.selectedCategories && window.selectedCategories.length > 0) {
		filtered = filtered.filter((p) =>
			window.selectedCategories.includes(p.category)
		);
	}

	// Filter by selected sources
	if (window.selectedSources && window.selectedSources.length > 0) {
		filtered = filtered.filter((p) =>
			window.selectedSources.includes(p.source)
		);
	}

	// Update stats
	await updateStats(window.products, filtered);

	// Render the filtered products
	if (displayMode === 'grid') {
		await renderGrid(filtered);
	} else {
		await renderTable(filtered);
	}
}
async function loadProducts() {
	const products = await fetchProducts();
	window.products = products;

	// Use filterProducts to handle stats and rendering
	await filterProducts();
}
function showGrid() {
	document.getElementById('productList').style.display = 'grid';
	document.getElementById('productTable').style.display = 'none';
}
function showTable() {
	document.getElementById('productList').style.display = 'none';
	document.getElementById('productTable').style.display = 'block';
}
async function renderGrid(products) {
	showGrid();
	const list = document.getElementById('productList');
	if (!list) return;
	list.innerHTML = '';
	if (!products.length) {
		list.innerHTML = '<p>No products found.</p>';
		// Update stats even when no products
		await updateStats(window.products, []);
		return;
	}
	products.forEach((p, i) => {
		// Tạo container thay vì link trực tiếp để có thể thêm nút xóa
		const card = document.createElement('div');
		card.className = 'product-card-v2';
		card.setAttribute('data-id', p._id);
		card.setAttribute('data-product-name', p.productName);

		// Tạo link riêng để mở sản phẩm
		const productLink = document.createElement('a');
		productLink.href = p.url || '#';
		productLink.target = '_blank';
		productLink.style.textDecoration = 'none';
		productLink.style.color = 'inherit';
		productLink.style.display = 'block';
		productLink.style.width = '100%';
		productLink.style.height = '100%';

		// Tạo nút xóa
		const deleteBtn = document.createElement('button');
		deleteBtn.className = 'delete-product-btn';
		deleteBtn.innerHTML = '&times;'; // X symbol
		deleteBtn.title = 'Delete this product';
		deleteBtn.onclick = function (e) {
			e.preventDefault();
			e.stopPropagation();
			showDeleteModal(p._id, p.productName);
		};

		// Determine if it's FBA or FBM based on seller info
		// In real data we might not have this info, so we'll use a placeholder
		const fulfillmentType = p.fulfillmentType || 'FBA';
		const fulfillmentClass = fulfillmentType === 'FBA' ? 'fba' : 'fbm';

		// Calculate days since update based on updatedAt field if available
		let daysSinceUpdate = '';
		if (p.updatedAt) {
			const updateDate = new Date(p.date_first_available);
			const currentDate = new Date();
			const diffTime = Math.abs(currentDate - updateDate);
			daysSinceUpdate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		}

		// Get rank information from the API data
		const rankKitchen = p.rank_kitchen || '';
		const rankTumbler = p.rank_tumbler || '';

		// Get best rank to display
		let bestRank = '';
		let rankCategory = '';

		if (rankTumbler && rankTumbler !== rankKitchen) {
			bestRank = rankTumbler;
			rankCategory = 'Tumblers & Water Glasses';
		} else if (rankKitchen) {
			bestRank = rankKitchen;
			rankCategory = 'Kitchen & Dining';
		}

		// Get latest best_sellers_rank data if available in new format
		let latestRanks = [];
		if (
			p.best_sellers_rank &&
			Array.isArray(p.best_sellers_rank) &&
			p.best_sellers_rank.length > 0
		) {
			// Sort by date descending to get the latest entry
			const sortedRankEntries = [...p.best_sellers_rank].sort(
				(a, b) => new Date(b.date) - new Date(a.date)
			);

			// Get the latest entry
			const latestEntry = sortedRankEntries[0];
			if (latestEntry && latestEntry.ranks) {
				latestRanks = latestEntry.ranks;
			}
		}

		// Chuẩn bị nội dung HTML cho product link
		productLink.innerHTML = `
            <div class="product-image">
                <div class="index-ab">#${i + 1}</div>
                <img src="${p.productImage || ''}" alt="product image" />
            </div>
            <div class="product-card-body">
                <p class="product-card-header">
                    ${
						p.productName.length > 50
							? p.productName.slice(0, 50) + '...'
							: p.productName
					}
                </p>

                <p>
                    <strong>${p.asin || ''}</strong>
                    ${
						p.soldBy
							? `<span class="${fulfillmentClass}">${fulfillmentType}</span>`
							: ''
					}
                    ${
						daysSinceUpdate
							? `<span style="float:right; margin-left: 20px">${daysSinceUpdate}d</span>`
							: ''
					}
                </p>



				${
					latestRanks && latestRanks.length > 0
						? `<div class="best-sellers-rank">
                        <span class="highlight">Best Sellers Rank</span>
                        <div class="rank-list">
                            ${latestRanks
								.map(
									(rankObj) =>
										`<span class="rank-item">#${rankObj.rank} in ${rankObj.category}</span>`
								)
								.join('')}
                        </div>
                    </div>`
						: ''
				}

                <div class="product-card-footer">
                    <div>
                        <p class="rating">⭐ ${p.rating || '0.0'} ${
			p.totalReviews ? `(${p.totalReviews})` : '(0)'
		}</p>
                        ${
							p.boughtInLast30Days
								? `<p style="color:green; font-weight: bold">${p.boughtInLast30Days} <span style="color: green">+</span> Bought in Last 30 Days </p>`
								: 'No Bought in Last 30 Days'
						}
                    </div>
                    ${p.price ? `<p class="price">$${p.price}</p>` : ''}
                </div>
            </div>
        `;

		// Thêm các phần tử vào DOM
		card.appendChild(productLink);
		card.appendChild(deleteBtn);
		list.appendChild(card);
	});
}
async function renderTable(products) {
	showTable();
	const tableDiv = document.getElementById('productTable');
	if (!tableDiv) return;
	if (!products.length) {
		tableDiv.style.display = 'none';
		// Update stats even when no products
		await updateStats(window.products, []);
		return;
	}
	let html = `<table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(45,108,223,0.08);overflow:hidden;">
        <thead style="background:#f4f6fb;color:var(--primary);font-weight:600;">
            <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Brand</th>
                <th>ASIN</th>
                <th>Category</th>
                <th>Price</th>
                <th>Rating</th>
                <th>Reviews</th>
                <th>Sold By</th>
                <th>Best Sellers Rank</th>
                <th>Date First Available</th>
                <th>Link</th>
            </tr>
        </thead>
        <tbody>`;
	products.forEach((p) => {
		// Format date if available
		let formattedDate = '';
		if (p.date_first_available) {
			const date = new Date(p.date_first_available);
			formattedDate = date.toLocaleDateString();
		}

		// Get latest best_sellers_rank data if available in new format
		let latestRanks = [];
		if (
			p.best_sellers_rank &&
			Array.isArray(p.best_sellers_rank) &&
			p.best_sellers_rank.length > 0
		) {
			// Sort by date descending to get the latest entry
			const sortedRankEntries = [...p.best_sellers_rank].sort(
				(a, b) => new Date(b.date) - new Date(a.date)
			);

			// Get the latest entry
			const latestEntry = sortedRankEntries[0];
			if (latestEntry && latestEntry.ranks) {
				latestRanks = latestEntry.ranks;
			}
		}

		html += `<tr>
            <td><img src="${
				p.productImage || ''
			}" alt="Image" style="width:60px;height:40px;object-fit:cover;border-radius:4px;background:#e9eefa;"/></td>
            <td>${
				p.productName.length > 50
					? p.productName.slice(0, 50) + '...'
					: p.productName
			}</td>
            <td>${p.brand || p.brand_table || ''}</td>
            <td>${p.asin || ''}</td>
            <td>${p.category || ''}</td>
            <td>${p.price ? '$' + p.price : ''}</td>
            <td>${p.rating || ''}</td>
            <td>${p.totalReviews || ''}</td>
            <td>${p.soldBy || ''}</td>
            <td style="max-width:200px;font-size:0.85em;">
                ${
					latestRanks && latestRanks.length > 0
						? latestRanks
								.map((rankObj) => {
									const rankText = `#${rankObj.rank} in ${rankObj.category}`;
									return `<div style="margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${rankText}">${rankText}</div>`;
								})
								.join('')
						: ''
				}
            </td>
            <td>${formattedDate}</td>
            <td><a href="${
				p.url || '#'
			}" target="_blank" style="color:#2d6cdf;text-decoration:underline;">Amazon</a></td>
        </tr>`;
	});
	html += `</tbody></table>`;
	tableDiv.innerHTML = html;
	tableDiv.style.display = 'block';
}

// Hàm trích xuất số từ best_sellers_rank
function extractRankNumber(rankString) {
	if (!rankString) return Number.MAX_SAFE_INTEGER; // Nếu không có rank, đặt giá trị cao nhất

	// Trích xuất số từ chuỗi kiểu "#123,456 in Category"
	const match = rankString.match(/#([0-9,]+)/);
	if (match && match[1]) {
		// Chuyển đổi chuỗi số có dấu phẩy thành số nguyên
		return parseInt(match[1].replace(/,/g, ''), 10);
	}
	return Number.MAX_SAFE_INTEGER;
}

// Hàm lấy số thứ tự trong danh mục cụ thể từ mảng best_sellers_rank
function getRankInCategory(rankArray, categoryKeyword) {
	if (!rankArray || !Array.isArray(rankArray) || rankArray.length === 0) {
		return Number.MAX_SAFE_INTEGER;
	}

	// Tìm rank trong danh mục cụ thể (nếu có)
	if (categoryKeyword) {
		const categoryRank = rankArray.find((rank) =>
			rank.toLowerCase().includes(categoryKeyword.toLowerCase())
		);
		if (categoryRank) {
			return extractRankNumber(categoryRank);
		}
	}

	// Nếu không tìm thấy danh mục cụ thể hoặc không chỉ định, lấy rank đầu tiên
	return extractRankNumber(rankArray[0]);
}

async function sortProducts() {
	const sortSelect = document.getElementById('sortBy');
	const sortBy = sortSelect.value;
	let sortedProducts = [...(window.products || [])];
	if (sortBy === 'price_asc') {
		sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
	} else if (sortBy === 'price_desc') {
		sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
	} else if (sortBy === 'date_asc') {
		sortedProducts.sort(
			(a, b) =>
				new Date(a.date_first_available || '1970-01-01') -
				new Date(b.date_first_available || '1970-01-01')
		);
	} else if (sortBy === 'date_desc') {
		sortedProducts.sort(
			(a, b) =>
				new Date(b.date_first_available || '1970-01-01') -
				new Date(a.date_first_available || '1970-01-01')
		);
	} else if (sortBy === 'bought_desc') {
		sortedProducts.sort(
			(a, b) => (b.boughtInLast30Days || 0) - (a.boughtInLast30Days || 0)
		);
	} else if (sortBy === 'bought_asc') {
		sortedProducts.sort(
			(a, b) => (a.boughtInLast30Days || 0) - (b.boughtInLast30Days || 0)
		);
	} else if (sortBy === 'rank_asc') {
		// Sắp xếp theo thứ hạng tăng dần (thứ hạng thấp = tốt hơn)
		sortedProducts.sort(
			(a, b) =>
				getRankInCategory(a.best_sellers_rank) -
				getRankInCategory(b.best_sellers_rank)
		);
	} else if (sortBy === 'rank_desc') {
		// Sắp xếp theo thứ hạng giảm dần
		sortedProducts.sort(
			(a, b) =>
				getRankInCategory(b.best_sellers_rank) -
				getRankInCategory(a.best_sellers_rank)
		);
	} else if (sortBy === 'rank_kitchen_asc') {
		// Sắp xếp theo thứ hạng trong danh mục Kitchen & Dining
		sortedProducts.sort(
			(a, b) =>
				getRankInCategory(a.best_sellers_rank, 'Kitchen & Dining') -
				getRankInCategory(b.best_sellers_rank, 'Kitchen & Dining')
		);
	} else if (sortBy === 'rank_tumbler_asc') {
		// Sắp xếp theo thứ hạng trong danh mục Tumblers
		sortedProducts.sort(
			(a, b) =>
				getRankInCategory(
					a.best_sellers_rank,
					'Tumblers & Water Glasses'
				) -
				getRankInCategory(
					b.best_sellers_rank,
					'Tumblers & Water Glasses'
				)
		);
	}

	// Update stats with sorted products
	await updateStats(window.products, sortedProducts);

	if (displayMode === 'grid') {
		await renderGrid(sortedProducts);
	} else {
		await renderTable(sortedProducts);
	}
}

window.selectedSellers = [];
window.selectedCategories = [];
window.selectedSources = [];

document.getElementById('gridBtn').onclick = async () => {
	displayMode = 'grid';
	await renderGrid(window.products || []);
};
document.getElementById('tableBtn').onclick = async () => {
	displayMode = 'table';
	await renderTable(window.products || []);
};

// Xử lý xóa sản phẩm
let currentProductId = null;
const deleteModal = document.getElementById('deleteModal');
const deleteProductName = document.getElementById('deleteProductName');
const closeModal = document.querySelector('.close-modal');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');

function showDeleteModal(productId, productName) {
	currentProductId = productId;
	deleteProductName.textContent = productName;
	deleteModal.style.display = 'block';
}

function hideDeleteModal() {
	deleteModal.style.display = 'none';
	currentProductId = null;
}

async function deleteProduct(productId) {
	try {
		const response = await fetch(
			`${window.API_BASE_URL || ''}/api/products/${productId}`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

		if (response.ok) {
			// Xóa sản phẩm khỏi mảng products
			window.products = window.products.filter(
				(p) => p._id !== productId
			);
			// Cập nhật lại giao diện và stats
			await filterProducts();

			// Hiển thị thông báo thành công
			alert('Product deleted successfully');
		} else {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Failed to delete product');
		}
	} catch (error) {
		console.error('Error deleting product:', error);
		alert('Failed to delete product: ' + error.message);
	}
}

// Thêm event listeners cho modal
if (closeModal) closeModal.addEventListener('click', hideDeleteModal);
if (cancelDelete) cancelDelete.addEventListener('click', hideDeleteModal);
if (confirmDelete) {
	confirmDelete.addEventListener('click', () => {
		if (currentProductId) {
			deleteProduct(currentProductId);
			hideDeleteModal();
		}
	});
}

// Đóng modal khi click bên ngoài
window.addEventListener('click', (event) => {
	if (event.target === deleteModal) {
		hideDeleteModal();
	}
});

window.onload = async () => {
	await loadSidebar();
	await loadProducts();
};
