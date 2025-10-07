// Product Database
const PRODUCTS = [
    { id: 1, name: 'Wireless Headphones', price: 79.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', category: 'Electronics', stock: 15 },
    { id: 2, name: 'Smart Watch', price: 199.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', category: 'Electronics', stock: 8 },
    { id: 3, name: 'Laptop Backpack', price: 49.99, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', category: 'Accessories', stock: 20 },
    { id: 4, name: 'USB-C Hub', price: 34.99, image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400', category: 'Electronics', stock: 12 },
    { id: 5, name: 'Desk Lamp', price: 29.99, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', category: 'Home', stock: 25 },
    { id: 6, name: 'Bluetooth Speaker', price: 59.99, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', category: 'Electronics', stock: 10 }
];

// Application State
let cart = [];
let orders = [];
let currentUserEmail = null;

// Mixpanel Helper Functions
function trackEvent(eventName, properties = {}) {
    if (typeof mixpanel !== 'undefined') {
        mixpanel.track(eventName, properties);
        console.log('📊 Tracked:', eventName, properties);
    }
}

function identifyUser(email) {
    if (typeof mixpanel !== 'undefined' && email) {
        mixpanel.identify(email);
        currentUserEmail = email;
        console.log('👤 User identified:', email);
    }
}

function setUserProperties(properties) {
    if (typeof mixpanel !== 'undefined' && currentUserEmail) {
        mixpanel.people.set(properties);
        console.log('📝 User properties set:', properties);
    }
}

function incrementUserProperty(property, value = 1) {
    if (typeof mixpanel !== 'undefined' && currentUserEmail) {
        mixpanel.people.increment(property, value);
        console.log('➕ Incremented:', property, value);
    }
}

function trackRevenue(amount, properties = {}) {
    if (typeof mixpanel !== 'undefined' && currentUserEmail) {
        mixpanel.people.track_charge(amount, properties);
        console.log('💰 Revenue tracked:', amount, properties);
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    renderProducts();
    updateCartBadge();
    updateOrdersButton();
    
    // Track page view on load
    trackEvent('Page Viewed', {
        page_name: 'Products',
        product_count: PRODUCTS.length
    });
});

// Local Storage Functions
function loadFromLocalStorage() {
    const savedCart = localStorage.getItem('ecommerce_cart');
    const savedOrders = localStorage.getItem('ecommerce_orders');
    const savedEmail = localStorage.getItem('user_email');
    
    if (savedCart) cart = JSON.parse(savedCart);
    if (savedOrders) orders = JSON.parse(savedOrders);
    if (savedEmail) {
        currentUserEmail = savedEmail;
        identifyUser(savedEmail);
    }
}

function saveCart() {
    localStorage.setItem('ecommerce_cart', JSON.stringify(cart));
}

function saveOrders() {
    localStorage.setItem('ecommerce_orders', JSON.stringify(orders));
}

// View Management
function showView(viewName) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`${viewName}-view`).classList.add('active');
    const navBtn = document.getElementById(`${viewName}-btn`);
    if (navBtn) navBtn.classList.add('active');
    
    // Track page views
    if (viewName === 'products') {
        trackEvent('Page Viewed', {
            page_name: 'Products',
            product_count: PRODUCTS.length
        });
        renderProducts();
    }
    
    if (viewName === 'cart') {
        const cartTotal = getCartTotal();
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        trackEvent('Cart Viewed', {
            cart_total: cartTotal,
            item_count: itemCount,
            cart_items: cart.map(item => ({
                product_name: item.name,
                quantity: item.quantity,
                price: item.price
            }))
        });
        renderCart();
    }
    
    if (viewName === 'checkout') {
        trackEvent('Checkout Started', {
            cart_total: getCartTotal(),
            item_count: cart.reduce((sum, item) => sum + item.quantity, 0),
            items_list: cart.map(item => item.name).join(', ')
        });
        renderCheckout();
    }
    
    if (viewName === 'orders') {
        trackEvent('Page Viewed', {
            page_name: 'Orders',
            total_orders: orders.length
        });
        renderOrders();
    }
}

// Product Functions
function renderProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = PRODUCTS.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-header">
                    <h3 class="product-name">${product.name}</h3>
                    <span class="product-category">${product.category}</span>
                </div>
                <div class="product-footer">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <button class="btn-add-cart" onclick="addToCart(${product.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add
                    </button>
                </div>
                <p class="product-stock">${product.stock} in stock</p>
            </div>
        </div>
    `).join('');
}

function addToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    updateCartBadge();
    
    // Track add to cart event
    trackEvent('Product Added to Cart', {
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_category: product.category,
        quantity: 1,
        cart_total: getCartTotal()
    });
    
    // Show feedback
    const btn = event.target.closest('.btn-add-cart');
    const originalText = btn.innerHTML;
    btn.innerHTML = '✓ Added';
    btn.style.background = '#10b981';
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
    }, 1000);
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
}

// Cart Functions
function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <h2>Your cart is empty</h2>
                <button class="btn-primary" onclick="showView('products')" style="margin-top: 1rem; max-width: 200px;">
                    Continue Shopping
                </button>
            </div>
        `;
        cartTotal.innerHTML = '';
        return;
    }
    
    cartItems.innerHTML = `
        <div class="cart-items-container">
            ${cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3 class="cart-item-name">${item.name}</h3>
                        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <span class="qty-display">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="cart-item-total">
                        <p class="cart-item-total-price">$${(item.price * item.quantity).toFixed(2)}</p>
                        <button class="btn-remove" onclick="removeFromCart(${item.id})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    const total = getCartTotal();
    cartTotal.innerHTML = `
        <div class="cart-total-row">
            <span>Total:</span>
            <span class="cart-total-amount">$${total.toFixed(2)}</span>
        </div>
        <button class="btn-primary" onclick="showView('checkout')">
            Proceed to Checkout
        </button>
    `;
}

function updateQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        const oldQuantity = item.quantity;
        item.quantity = Math.max(0, item.quantity + delta);
        
        if (item.quantity === 0) {
            cart = cart.filter(item => item.id !== productId);
            trackEvent('Product Removed from Cart', {
                product_id: productId,
                product_name: item.name
            });
        } else if (delta > 0) {
            trackEvent('Cart Quantity Increased', {
                product_id: productId,
                product_name: item.name,
                old_quantity: oldQuantity,
                new_quantity: item.quantity
            });
        } else {
            trackEvent('Cart Quantity Decreased', {
                product_id: productId,
                product_name: item.name,
                old_quantity: oldQuantity,
                new_quantity: item.quantity
            });
        }
    }
    saveCart();
    updateCartBadge();
    renderCart();
}

function removeFromCart(productId) {
    const item = cart.find(item => item.id === productId);
    cart = cart.filter(item => item.id !== productId);
    
    trackEvent('Product Removed from Cart', {
        product_id: productId,
        product_name: item.name,
        quantity_removed: item.quantity
    });
    
    saveCart();
    updateCartBadge();
    renderCart();
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Checkout Functions
function renderCheckout() {
    const total = getCartTotal();
    document.getElementById('checkout-total').textContent = `$${total.toFixed(2)}`;
}

function completeCheckout() {
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        zip: document.getElementById('zip').value,
        cardNumber: document.getElementById('card-number').value,
        cardName: document.getElementById('card-name').value,
        expiry: document.getElementById('expiry').value,
        cvv: document.getElementById('cvv').value
    };
    
    // Validate all fields
    if (Object.values(formData).some(val => !val)) {
        alert('Please fill in all fields');
        return;
    }
    
    // Create order
    const orderId = 'ORD-' + Date.now();
    const orderTotal = getCartTotal();
    const newOrder = {
        id: orderId,
        date: new Date().toISOString(),
        items: [...cart],
        total: orderTotal,
        customer: { ...formData },
        status: 'Processing'
    };
    
    orders.push(newOrder);
    saveOrders();
    
    // Identify user in Mixpanel
    identifyUser(formData.email);
    localStorage.setItem('user_email', formData.email);
    
    // Track payment completed
    trackEvent('Payment Completed', {
        order_id: orderId,
        total_amount: orderTotal,
        item_count: cart.reduce((sum, item) => sum + item.quantity, 0),
        items_purchased: cart.map(item => ({
            product_name: item.name,
            quantity: item.quantity,
            price: item.price,
            category: item.category
        })),
        customer_email: formData.email,
        customer_city: formData.city,
        customer_zip: formData.zip
    });
    
    // Track revenue
    trackRevenue(orderTotal, {
        'Order ID': orderId,
        'Items Count': cart.length
    });
    
    // Update user profile properties
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const productsPurchased = orders.flatMap(order => 
        order.items.map(item => item.name)
    );
    const categories = orders.flatMap(order => 
        order.items.map(item => item.category)
    );
    const favoriteCategory = categories.sort((a,b) =>
        categories.filter(v => v===a).length - categories.filter(v => v===b).length
    ).pop();
    
    setUserProperties({
        '$email': formData.email,
        '$name': formData.name,
        'Total Orders': orders.length,
        'Total Spent': totalSpent,
        'Average Order Value': totalSpent / orders.length,
        'Last Purchase Date': new Date().toISOString(),
        'Products Purchased': productsPurchased,
        'Favorite Category': favoriteCategory,
        'Last Order ID': orderId
    });
    
    // Increment counters
    incrementUserProperty('Lifetime Orders', 1);
    incrementUserProperty('Lifetime Revenue', orderTotal);
    
    // Clear cart and form
    cart = [];
    saveCart();
    updateCartBadge();
    
    document.querySelectorAll('#checkout-view input').forEach(input => input.value = '');
    
    // Show success view
    renderSuccessView(newOrder);
    showView('success');
    updateOrdersButton();
}

function renderSuccessView(order) {
    const summary = document.getElementById('order-summary');
    summary.innerHTML = `
        <p>Order ID: ${order.id}</p>
        <p>Total: $${order.total.toFixed(2)}</p>
    `;
}

// Orders Functions
function renderOrders() {
    const ordersList = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p style="text-align: center; color: #6b7280;">No orders yet.</p>';
        return;
    }
    
    ordersList.innerHTML = orders.map((order, index) => `
        <div class="order-card">
            <div class="order-header" onclick="toggleOrderDetails(${index})">
                <div>
                    <h3 class="order-id">${order.id}</h3>
                    <p class="order-date">${new Date(order.date).toLocaleDateString()} ${new Date(order.date).toLocaleTimeString()}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span class="order-status">${order.status}</span>
                    <svg class="expand-icon" id="expand-${index}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transition: transform 0.3s;">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item-row">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
                <div class="order-total-row">
                    <span>Total:</span>
                    <span class="order-total-amount">$${order.total.toFixed(2)}</span>
                </div>
            </div>
            <div class="order-details" id="order-details-${index}" style="display: none;">
                <div class="details-section">
                    <h4>Customer Information</h4>
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Name:</span>
                            <span class="detail-value">${order.customer.name}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Email:</span>
                            <span class="detail-value">${order.customer.email}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Address:</span>
                            <span class="detail-value">${order.customer.address}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">City:</span>
                            <span class="detail-value">${order.customer.city}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">ZIP:</span>
                            <span class="detail-value">${order.customer.zip}</span>
                        </div>
                    </div>
                </div>
                <div class="details-section">
                    <h4>Payment Information</h4>
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Card:</span>
                            <span class="detail-value">**** **** **** ${order.customer.cardNumber.slice(-4)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Cardholder:</span>
                            <span class="detail-value">${order.customer.cardName}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function toggleOrderDetails(index) {
    const details = document.getElementById(`order-details-${index}`);
    const icon = document.getElementById(`expand-${index}`);
    
    if (details.style.display === 'none') {
        details.style.display = 'block';
        icon.style.transform = 'rotate(180deg)';
        
        trackEvent('Order Details Expanded', {
            order_id: orders[index].id,
            order_total: orders[index].total
        });
    } else {
        details.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
    }
}

function updateOrdersButton() {
    const ordersBtn = document.getElementById('orders-btn');
    ordersBtn.style.display = orders.length > 0 ? 'flex' : 'none';
}

// Admin Functions
function renderAdmin() {
    const adminList = document.getElementById('admin-orders-list');
    
    if (orders.length === 0) {
        adminList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">No orders to manage.</p>';
        return;
    }
    
    adminList.innerHTML = orders.map((order, index) => `
        <div class="admin-order-card">
            <div class="admin-order-header">
                <div>
                    <h3 class="order-id">${order.id}</h3>
                    <p class="order-date">${new Date(order.date).toLocaleDateString()} ${new Date(order.date).toLocaleTimeString()}</p>
                </div>
                <div class="admin-status-controls">
                    <select class="status-select" id="status-${index}" onchange="updateOrderStatus(${index}, this.value)">
                        <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
            </div>
            <div class="admin-order-content">
                <div class="admin-section">
                    <h4>Customer</h4>
                    <p><strong>${order.customer.name}</strong></p>
                    <p>${order.customer.email}</p>
                    <p>${order.customer.address}, ${order.customer.city} ${order.customer.zip}</p>
                </div>
                <div class="admin-section">
                    <h4>Order Items</h4>
                    ${order.items.map(item => `
                        <div class="admin-item-row">
                            <span>${item.name}</span>
                            <span>Qty: ${item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                    <div class="admin-total">
                        <strong>Total: ${order.total.toFixed(2)}</strong>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function updateOrderStatus(index, newStatus) {
    const oldStatus = orders[index].status;
    orders[index].status = newStatus;
    saveOrders();
    
    // Track status change
    trackEvent('Order Status Updated', {
        order_id: orders[index].id,
        old_status: oldStatus,
        new_status: newStatus,
        order_total: orders[index].total,
        customer_email: orders[index].customer.email
    });
    
    // Show success message
    const statusSelect = document.getElementById(`status-${index}`);
    const originalBg = statusSelect.style.background;
    statusSelect.style.background = '#10b981';
    statusSelect.style.color = 'white';
    setTimeout(() => {
        statusSelect.style.background = originalBg;
        statusSelect.style.color = '';
    }, 500);
}

// Admin password check
function checkAdminAccess() {
    const password = prompt('Enter admin password:');
    if (password === 'admin123') {
        trackEvent('Admin Access Granted', {
            timestamp: new Date().toISOString()
        });
        showView('admin');
        renderAdmin();
    } else if (password !== null) {
        trackEvent('Admin Access Denied', {
            timestamp: new Date().toISOString()
        });
        alert('Incorrect password!');
    }
}
