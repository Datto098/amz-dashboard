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
	try {
		const params = getFilterParams();
		let url = `${window.API_BASE_URL || ''}/api/products`;
		if (params.length) url += '?' + params.join('&');

		const res = await fetch(url);
		if (!res.ok) {
			throw new Error(`HTTP error! status: ${res.status}`);
		}
		return await res.json();
	} catch (error) {
		console.error('Error fetching products:', error);
		showError('Failed to load products. Please try again.');
		return [];
	}
}

async function fetchProductsCount() {
	try {
		const params = getFilterParams();
		let url = `${window.API_BASE_URL || ''}/api/products/count`;
		if (params.length) url += '?' + params.join('&');

		const res = await fetch(url);
		if (!res.ok) {
			throw new Error(`HTTP error! status: ${res.status}`);
		}
		const data = await res.json();
		return data.count || 0;
	} catch (error) {
		console.error('Error fetching products count:', error);
		return 0;
	}
}
async function fetchSoldByList() {
	try {
		const res = await fetch(
			`${window.API_BASE_URL || ''}/api/products/soldby-list`
		);
		if (!res.ok) {
			throw new Error(`HTTP error! status: ${res.status}`);
		}
		return await res.json();
	} catch (error) {
		console.error('Error fetching sold by list:', error);
		return [];
	}
}

async function fetchCategoryList() {
	try {
		const res = await fetch(
			`${window.API_BASE_URL || ''}/api/products/category-list`
		);
		if (!res.ok) {
			throw new Error(`HTTP error! status: ${res.status}`);
		}
		return await res.json();
	} catch (error) {
		console.error('Error fetching category list:', error);
		return [];
	}
}

async function fetchSourceList() {
	try {
		const res = await fetch(
			`${window.API_BASE_URL || ''}/api/products/source-list`
		);
		if (!res.ok) {
			console.warn(
				`Source list API returned ${res.status}, using empty array`
			);
			return [];
		}
		const data = await res.json();
		return Array.isArray(data) ? data : [];
	} catch (error) {
		console.error('Error fetching source list:', error);
		return [];
	}
}
function renderSidebar(sellers, categories, sources) {
	const sellerDiv = document.getElementById('sellerFilters');
	const categoryDiv = document.getElementById('categoryFilters');
	const sourceDiv = document.getElementById('sourceFilters');
	if (!sellerDiv || !categoryDiv || !sourceDiv) return;

	// Render sellers with search and pagination
	let sellerHtml = `
		<div class="filter-search">
			<input type="text" id="sellerSearch" placeholder="Search seller.." class="filter-search-input">
		</div>
		<div class="filter-list" id="sellerList">
			<label class="filter-option">
				<input type="checkbox" name="seller" value="all" checked>
				<span>All</span>
				<a href="#" class="clear-link" onclick="clearSellerFilters()">Clear</a>
			</label>
	`;

	const visibleSellers = sellers.slice(0, 5);
	visibleSellers.forEach((seller) => {
		sellerHtml += `<label class="filter-option"><input type="checkbox" name="seller" value="${seller}"><span>${seller}</span><span class="count">0</span></label>`;
	});

	if (sellers.length > 5) {
		sellerHtml += `<div class="show-more" onclick="toggleShowMore('seller')">Show more (${
			sellers.length - 5
		})</div>`;
	}

	sellerHtml += `</div>`;
	sellerDiv.innerHTML = sellerHtml;

	// Render categories with search and pagination
	let categoryHtml = `
		<div class="filter-search">
			<input type="text" id="categorySearch" placeholder="Search category.." class="filter-search-input">
		</div>
		<div class="filter-list" id="categoryList">
			<label class="filter-option">
				<input type="checkbox" name="category" value="all" checked>
				<span>All</span>
				<a href="#" class="clear-link" onclick="clearCategoryFilters()">Clear</a>
			</label>
	`;

	const visibleCategories = categories.slice(0, 5);
	visibleCategories.forEach((category) => {
		categoryHtml += `<label class="filter-option"><input type="checkbox" name="category" value="${category}"><span>${category}</span><span class="count">0</span></label>`;
	});

	if (categories.length > 5) {
		categoryHtml += `<div class="show-more" onclick="toggleShowMore('category')">Show more (${
			categories.length - 5
		})</div>`;
	}

	categoryHtml += `</div>`;
	categoryDiv.innerHTML = categoryHtml;

	// Render sources (keep simple for now)
	let sourceHtml = `<label class="filter-option"><input type="checkbox" name="source" value="all" checked>All</label>`;
	sources.forEach((source) => {
		const label =
			source.charAt(0).toUpperCase() + source.slice(1).replace('-', ' ');
		sourceHtml += `<label class="filter-option"><input type="checkbox" name="source" value="${source}"><span>${label}</span></label>`;
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

	// Add search functionality
	setupFilterSearch('sellerSearch', 'seller');
	setupFilterSearch('categorySearch', 'category');
}

// Helper functions for sidebar
function getSellerCounts() {
	const counts = {};
	if (window.products) {
		window.products.forEach((product) => {
			if (product.soldBy) {
				counts[product.soldBy] = (counts[product.soldBy] || 0) + 1;
			}
		});
	}
	return counts;
}

function getCategoryCounts() {
	const counts = {};
	if (window.products) {
		window.products.forEach((product) => {
			if (product.category) {
				counts[product.category] = (counts[product.category] || 0) + 1;
			}
		});
	}
	return counts;
}

function setupFilterSearch(searchInputId, filterType) {
	const searchInput = document.getElementById(searchInputId);
	if (searchInput) {
		searchInput.addEventListener('input', (e) => {
			const searchTerm = e.target.value.toLowerCase();
			const filterList = document.getElementById(filterType + 'List');
			const options = filterList.querySelectorAll('.filter-option');
			const showMoreElement = filterList.querySelector('.show-more');

			// Hide/show options based on search
			options.forEach((option) => {
				const text = option.textContent.toLowerCase();
				if (text.includes(searchTerm)) {
					option.style.display = 'flex';
				} else {
					option.style.display = 'none';
				}
			});

			// Hide/show "Show more/less" button based on search
			if (showMoreElement) {
				if (searchTerm.trim() === '') {
					// Show button when no search term
					showMoreElement.style.display = 'block';
				} else {
					// Hide button when searching
					showMoreElement.style.display = 'none';
				}
			}
		});
	}
}

function toggleShowMore(type) {
	const listElement = document.getElementById(type + 'List');
	if (!listElement) return;

	// Get all items for this type
	let allItems = [];
	if (type === 'seller') {
		allItems = window.allSellers || [];
	} else if (type === 'category') {
		allItems = window.allCategories || [];
	}

	if (allItems.length === 0) return;

	// Check if currently showing limited items by checking button text
	const showMoreElement = listElement.querySelector('.show-more');
	if (!showMoreElement) return;

	const buttonText = showMoreElement.textContent.trim();
	const isShowingLimited = buttonText.includes('Show more');

	if (isShowingLimited) {
		// Show all items
		showAllItems(type, allItems);
	} else {
		// Show limited items
		showLimitedItems(type, allItems);
	}
}

function showAllItems(type, allItems) {
	const listElement = document.getElementById(type + 'List');
	if (!listElement) return;

	// Preserve selected filters
	const selectedValues = preserveSelectedFilters(type);

	// Get counts
	const counts = type === 'seller' ? getSellerCounts() : getCategoryCounts();

	// Rebuild HTML with all items
	let html = `
		<label class="filter-option">
			<input type="checkbox" name="${type}" value="all" ${
		selectedValues.length === 0 ? 'checked' : ''
	}>
			<span>All</span>
			<a href="#" class="clear-link" onclick="clear${
				type.charAt(0).toUpperCase() + type.slice(1)
			}Filters()">Clear</a>
		</label>
	`;

	allItems.forEach((item) => {
		const count = counts[item] || 0;
		const isChecked = selectedValues.includes(item) ? 'checked' : '';
		html += `<label class="filter-option"><input type="checkbox" name="${type}" value="${item}" ${isChecked}><span>${item}</span><span class="count">${count}</span></label>`;
	});

	// Add "Show less" button
	html += `<div class="show-more" onclick="toggleShowMore('${type}')">Show less</div>`;

	listElement.innerHTML = html;

	// Re-add event listeners
	document.querySelectorAll(`input[name="${type}"]`).forEach((input) => {
		input.addEventListener('change', async () => {
			if (type === 'seller') {
				await onSellerFilterChange.call(input);
			} else if (type === 'category') {
				await onCategoryFilterChange.call(input);
			}
		});
	});
}

function showLimitedItems(type, allItems) {
	const listElement = document.getElementById(type + 'List');
	if (!listElement) return;

	// Preserve selected filters
	const selectedValues = preserveSelectedFilters(type);

	// Get counts
	const counts = type === 'seller' ? getSellerCounts() : getCategoryCounts();

	// Rebuild HTML with limited items
	let html = `
		<label class="filter-option">
			<input type="checkbox" name="${type}" value="all" ${
		selectedValues.length === 0 ? 'checked' : ''
	}>
			<span>All</span>
			<a href="#" class="clear-link" onclick="clear${
				type.charAt(0).toUpperCase() + type.slice(1)
			}Filters()">Clear</a>
		</label>
	`;

	const visibleItems = allItems.slice(0, 5);
	visibleItems.forEach((item) => {
		const count = counts[item] || 0;
		const isChecked = selectedValues.includes(item) ? 'checked' : '';
		html += `<label class="filter-option"><input type="checkbox" name="${type}" value="${item}" ${isChecked}><span>${item}</span><span class="count">${count}</span></label>`;
	});

	// Add "Show more" button if there are more items
	if (allItems.length > 5) {
		html += `<div class="show-more" onclick="toggleShowMore('${type}')">Show more (${
			allItems.length - 5
		})</div>`;
	}

	listElement.innerHTML = html;

	// Re-add event listeners
	document.querySelectorAll(`input[name="${type}"]`).forEach((input) => {
		input.addEventListener('change', async () => {
			if (type === 'seller') {
				await onSellerFilterChange.call(input);
			} else if (type === 'category') {
				await onCategoryFilterChange.call(input);
			}
		});
	});
}

function clearSellerFilters() {
	document.querySelectorAll('input[name="seller"]').forEach((input) => {
		input.checked = false;
	});
	document.querySelector('input[name="seller"][value="all"]').checked = true;
}

function clearCategoryFilters() {
	document.querySelectorAll('input[name="category"]').forEach((input) => {
		input.checked = false;
	});
	document.querySelector(
		'input[name="category"][value="all"]'
	).checked = true;
}

// Update sidebar counts after products are loaded
function updateSidebarCounts() {
	if (!window.products || window.products.length === 0) {
		console.log('No products available for counting');
		return;
	}

	console.log(
		'Updating sidebar counts for',
		window.products.length,
		'products'
	);

	// Update seller counts
	const sellerCounts = getSellerCounts();
	const sellerCountElements = document.querySelectorAll('#sellerList .count');
	sellerCountElements.forEach((element) => {
		const sellerName = element.previousElementSibling.textContent;
		const count = sellerCounts[sellerName] || 0;
		element.textContent = count;
	});

	// Update category counts
	const categoryCounts = getCategoryCounts();
	const categoryCountElements = document.querySelectorAll(
		'#categoryList .count'
	);
	categoryCountElements.forEach((element) => {
		const categoryName = element.previousElementSibling.textContent;
		const count = categoryCounts[categoryName] || 0;
		element.textContent = count;
	});

	console.log('Updated seller counts:', sellerCounts);
	console.log('Updated category counts:', categoryCounts);
}

// Helper function to preserve selected filters when rebuilding sidebar
function preserveSelectedFilters(type) {
	const selectedValues = [];
	document
		.querySelectorAll(`input[name="${type}"]:checked`)
		.forEach((input) => {
			if (input.value !== 'all') {
				selectedValues.push(input.value);
			}
		});
	return selectedValues;
}

// Helper function to restore selected filters after rebuilding sidebar
function restoreSelectedFilters(type, selectedValues) {
	document.querySelectorAll(`input[name="${type}"]`).forEach((input) => {
		if (input.value === 'all') {
			input.checked = selectedValues.length === 0;
		} else {
			input.checked = selectedValues.includes(input.value);
		}
	});
}
async function loadSidebar() {
	try {
		const [sellers, categories, sources] = await Promise.all([
			fetchSoldByList(),
			fetchCategoryList(),
			fetchSourceList(),
		]);

		// Store all items globally for show more functionality
		window.allSellers = sellers;
		window.allCategories = categories;
		window.allSources = sources;

		renderSidebar(sellers, categories, sources);
	} catch (error) {
		console.error('Error loading sidebar:', error);
		showError('Failed to load filter options');
	}
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

// Helper function to get currently filtered products (without rendering)
async function getCurrentFilteredProducts() {
	let filtered = window.products || [];

	// Filter by search input
	const searchInput = document.getElementById('searchInput');
	if (searchInput && searchInput.value.trim()) {
		const searchTerm = searchInput.value.toLowerCase().trim();

		// Try different field names
		filtered = filtered.filter((p) => {
			const name = p.name || p.productName || p.title || '';
			const brand = p.brand || '';
			const asin = p.asin || '';

			return (
				name.toLowerCase().includes(searchTerm) ||
				brand.toLowerCase().includes(searchTerm) ||
				asin.toLowerCase().includes(searchTerm)
			);
		});
	}

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

	return filtered;
}

async function filterProducts() {
	let filtered = await getCurrentFilteredProducts();

	console.log('Total products available:', window.products?.length || 0);
	console.log('Filtered products:', filtered.length);
	if (filtered.length > 0) {
		console.log('Sample filtered product:', filtered[0]);
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
	try {
		showLoading(true);
		const products = await fetchProducts();
		console.log('Loaded products from API:', products.length);
		window.products = products;

		// Update sidebar counts after products are loaded
		updateSidebarCounts();

		// Use filterProducts to handle stats and rendering
		await filterProducts();
	} catch (error) {
		console.error('Error loading products:', error);
		showError('Failed to load products');
	} finally {
		showLoading(false);
	}
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

		// Helper function để format số với dấu phẩy
		const formatNumber = (num) => {
			if (!num) return '0';
			return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		};

		// Chuẩn bị nội dung HTML cho product link theo giao diện mới
		productLink.innerHTML = `
            <!-- Header: Brand + Rank Badge + Time -->
            <div class="card-header-v2">
                <div class="header-left">
                    <span class="brand-name-v2">${
						p.brand || p.soldBy || 'Unknown Brand'
					}</span>
                    <div class="rank-badge">#${i + 1}</div>
                </div>
                ${
					daysSinceUpdate
						? `<span class="time-indicator">${daysSinceUpdate}d</span>`
						: ''
				}
            </div>

            <!-- Hình ảnh sản phẩm -->
            <div class="product-image-v2">
                <img src="${p.productImage || ''}" alt="product image" />
            </div>

            <!-- ASIN + Search + FBA -->
            <div class="asin-row">
                <span class="asin-text">${p.asin || ''}</span>
                ${
					p.soldBy
						? `<span class="fba-badge-v2 ${fulfillmentClass}">${fulfillmentType}</span>`
						: ''
				}
            </div>

            <!-- Best Sellers Rank với category -->
            ${
				latestRanks && latestRanks.length > 0
					? `<div class="ranks-section">
                        ${latestRanks
							.slice(0, 2)
							.map(
								(rankObj) =>
									`<div class="rank-item-v2"><span class="highlight">#${formatNumber(
										rankObj.rank
									)}</span> in ${rankObj.category}</div>`
							)
							.join('')}
                    </div>`
					: ''
			}

            <!-- Bottom section: Unit Sold + Sales trend -->
            <div class="bottom-section">
                <div class="unit-sold sales-trend">${
					p.boughtInLast30Days
						? formatNumber(p.boughtInLast30Days) + '+'
						: '0'
				} in last 30 days</div>
            </div>

            <!-- Rating và Price cùng hàng -->
            <div class="rating-price-row-v2">
                <div class="rating-v2">⭐ ${p.rating || '0.0'} (${formatNumber(
			p.totalReviews || 0
		)})</div>
                ${p.price ? `<div class="price-v2">$${p.price}</div>` : ''}
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
	let html = `<table class="product-table">
        <thead>
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

		// Helper function to truncate text
		const truncateText = (text, maxLength = 30) => {
			if (!text) return '';
			return text.length > maxLength
				? text.slice(0, maxLength) + '...'
				: text;
		};

		html += `<tr>
            <td><img src="${
				p.productImage || ''
			}" alt="Product Image" class="table-product-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik0yMCAxNUg0MFYyNUgyMFYxNVoiIGZpbGw9IiNEOUQ5REQiLz4KPC9zdmc+'" /></td>
            <td><span class="table-text-truncate" title="${
				p.productName || ''
			}">${truncateText(p.productName || '', 40)}</span></td>
            <td><span class="table-text-truncate" title="${
				p.brand || p.brand_table || ''
			}">${truncateText(p.brand || p.brand_table || '', 20)}</span></td>
            <td><span class="table-text-truncate" title="${
				p.asin || ''
			}">${truncateText(p.asin || '', 15)}</span></td>
            <td><span class="table-text-truncate" title="${
				p.category || ''
			}">${truncateText(p.category || '', 25)}</span></td>
            <td class="table-price">${p.price ? '$' + p.price : '-'}</td>
            <td class="table-rating">${p.rating ? '⭐ ' + p.rating : '-'}</td>
            <td>${p.totalReviews || '-'}</td>
            <td><span class="table-text-truncate" title="${
				p.soldBy || ''
			}">${truncateText(p.soldBy || '', 20)}</span></td>
            <td>
                ${
					latestRanks && latestRanks.length > 0
						? latestRanks
								.slice(0, 3) // Show only first 3 ranks
								.map((rankObj) => {
									const rankText = `#${rankObj.rank} in ${rankObj.category}`;
									return `<div class="rank-item" title="${rankText}">${truncateText(
										rankText,
										25
									)}</div>`;
								})
								.join('') +
						  (latestRanks.length > 3
								? `<div class="rank-item">+${
										latestRanks.length - 3
								  } more</div>`
								: '')
						: '-'
				}
            </td>
            <td>${formattedDate || '-'}</td>
            <td><a href="${
				p.url || '#'
			}" target="_blank" class="table-link">View</a></td>
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

async function sortProducts(sortBy = null) {
	if (!sortBy) {
		const sortSelect = document.getElementById('sortBy');
		sortBy = sortSelect ? sortSelect.value : '';
	}

	// Get currently filtered products instead of all products
	let sortedProducts = await getCurrentFilteredProducts();
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

	// Update stats with sorted products (keep original total for stats)
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

// Utility functions for UI feedback
function showError(message) {
	// Create or update error message
	let errorDiv = document.getElementById('error-message');
	if (!errorDiv) {
		errorDiv = document.createElement('div');
		errorDiv.id = 'error-message';
		errorDiv.style.cssText = `
			position: fixed;
			top: 20px;
			right: 20px;
			background: #f44336;
			color: white;
			padding: 12px 20px;
			border-radius: 8px;
			box-shadow: 0 4px 12px rgba(0,0,0,0.15);
			z-index: 1000;
			max-width: 300px;
		`;
		document.body.appendChild(errorDiv);
	}
	errorDiv.textContent = message;
	errorDiv.style.display = 'block';

	// Auto hide after 5 seconds
	setTimeout(() => {
		errorDiv.style.display = 'none';
	}, 5000);
}

function showLoading(show = true) {
	let loadingDiv = document.getElementById('loading-indicator');
	if (show && !loadingDiv) {
		loadingDiv = document.createElement('div');
		loadingDiv.id = 'loading-indicator';
		loadingDiv.style.cssText = `
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background: rgba(255,255,255,0.9);
			padding: 20px;
			border-radius: 8px;
			box-shadow: 0 4px 12px rgba(0,0,0,0.15);
			z-index: 1000;
			text-align: center;
		`;
		loadingDiv.innerHTML = `
			<div style="
				width: 40px;
				height: 40px;
				border: 4px solid #f3f3f3;
				border-top: 4px solid #ef6c00;
				border-radius: 50%;
				animation: spin 1s linear infinite;
				margin: 0 auto 10px;
			"></div>
			<div>Loading...</div>
		`;
		document.body.appendChild(loadingDiv);
	} else if (!show && loadingDiv) {
		loadingDiv.remove();
	}
}

// Add CSS for loading animation
const style = document.createElement('style');
style.textContent = `
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
`;
document.head.appendChild(style);

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

// Dropdown Functions
function toggleDropdown(type) {
	const dropdown = document.getElementById(type + 'Dropdown');
	const otherDropdown =
		type === 'sort'
			? document.getElementById('filterDropdown')
			: document.getElementById('sortDropdown');

	// Close other dropdown
	if (otherDropdown) {
		otherDropdown.classList.remove('show');
	}

	// Toggle current dropdown
	dropdown.classList.toggle('show');
}

// Close dropdowns when clicking outside
document.addEventListener('click', (event) => {
	if (!event.target.closest('.dropdown')) {
		document.querySelectorAll('.dropdown-content').forEach((dropdown) => {
			dropdown.classList.remove('show');
		});
	}
});

// Sort Functions
function selectSort(value) {
	const sortText = document.getElementById('sortText');
	const sortDropdown = document.getElementById('sortDropdown');

	// Update text based on selection
	const sortOptions = {
		'': 'Sort by',
		price_asc: 'Price: Low to High',
		price_desc: 'Price: High to Low',
		date_asc: 'Date: Oldest to Newest',
		date_desc: 'Date: Newest to Oldest',
		bought_desc: 'Bought: High to Low',
		bought_asc: 'Bought: Low to High',
	};

	sortText.textContent = sortOptions[value] || 'Sort by';
	sortDropdown.classList.remove('show');

	// Apply sort
	if (value) {
		sortProducts(value);
	}
}

// Filter Functions
function applyFilters() {
	const filterDropdown = document.getElementById('filterDropdown');
	filterDropdown.classList.remove('show');

	// Get filter values
	const minPrice = document.getElementById('minPrice').value;
	const maxPrice = document.getElementById('maxPrice').value;
	const startDate = document.getElementById('startDate').value;
	const endDate = document.getElementById('endDate').value;
	const boughtInPastMonth =
		document.getElementById('boughtInPastMonth').checked;

	// Apply filters (you can implement the actual filtering logic here)
	loadProducts();
}

function resetFilters() {
	// Reset all filter inputs
	document.getElementById('minPrice').value = '';
	document.getElementById('maxPrice').value = '';
	document.getElementById('startDate').value = '';
	document.getElementById('endDate').value = '';
	document.getElementById('boughtInPastMonth').checked = false;

	// Close dropdown
	document.getElementById('filterDropdown').classList.remove('show');

	// Reload products
	loadProducts();
}

// View Switch Functions
function switchView(view) {
	const gridBtn = document.getElementById('gridBtn');
	const tableBtn = document.getElementById('tableBtn');
	const productList = document.getElementById('productList');
	const productTable = document.getElementById('productTable');

	if (view === 'grid') {
		gridBtn.classList.add('active');
		tableBtn.classList.remove('active');
		productList.style.display = 'grid';
		productTable.style.display = 'none';
	} else {
		tableBtn.classList.add('active');
		gridBtn.classList.remove('active');
		productList.style.display = 'none';
		productTable.style.display = 'block';
	}
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
	const searchInput = document.getElementById('searchInput');
	if (searchInput) {
		// Add debounced search
		let searchTimeout;
		searchInput.addEventListener('input', () => {
			clearTimeout(searchTimeout);
			searchTimeout = setTimeout(() => {
				filterProducts();
			}, 300); // 300ms delay
		});
	}
});

// Test function to check database
async function testDatabase() {
	try {
		const res = await fetch(
			`${window.API_BASE_URL || ''}/api/products/test`
		);
		const data = await res.json();
		console.log('Database test result:', data);
		return data;
	} catch (error) {
		console.error('Database test failed:', error);
		return null;
	}
}

window.onload = async () => {
	// Test database first
	await testDatabase();

	await loadSidebar();
	await loadProducts();
};
