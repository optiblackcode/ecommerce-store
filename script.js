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

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    renderProducts();
    updateCartBadge();
    updateOrdersButton();
});

// Local Storage Functions
function loadFromLocalStorage() {
    const savedCart = localStorage.getItem('ecommerce_cart');
    const savedOrders = localStorage.getItem('ecommerce_orders');
    
    if (savedCart) cart = JSON.parse(savedCart);
    if (savedOrders) orders = JSON.parse(savedOrders);
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
    
    if (viewName === 'cart') renderCart();
    if (viewName === 'checkout') renderCheckout();
    if (viewName === 'orders') renderOrders();
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
        item.quantity = Math.max(0, item.quantity + delta);
        if (item.quantity === 0) {
            cart = cart.filter(item => item.id !== productId);
        }
    }
    saveCart();
    updateCartBadge();
    renderCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
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
    const newOrder = {
        id: orderId,
        date: new Date().toISOString(),
        items: [...cart],
        total: getCartTotal(),
        customer: { ...formData },
        status: 'Processing'
    };
    
    orders.push(newOrder);
    saveOrders();
    
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
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <h3 class="order-id">${order.id}</h3>
                    <p class="order-date">${new Date(order.date).toLocaleDateString()}</p>
                </div>
                <span class="order-status">${order.status}</span>
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
        </div>
    `).join('');
}

function updateOrdersButton() {
    const ordersBtn = document.getElementById('orders-btn');
    ordersBtn.style.display = orders.length > 0 ? 'flex' : 'none';
}
