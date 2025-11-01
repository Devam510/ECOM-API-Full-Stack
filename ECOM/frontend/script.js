// Update this with your deployed backend URL
const API_BASE_URL = "https://e-commerce-api-ff5b.onrender.com/docs";

let currentUser = null;
let cart = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
});

// Auth Functions
function showRegister() {
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
}

function showLogin() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

function hideForms() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'none';
}

async function register() {
    const email = document.getElementById('reg-email').value;
    const name = document.getElementById('reg-name').value;
    const password = document.getElementById('reg-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                full_name: name,
                password: password
            })
        });
        
        const result = await response.json();
        if (response.ok) {
            alert('Registration successful! Please login.');
            hideForms();
        } else {
            alert('Error: ' + (result.detail || 'Registration failed'));
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const result = await response.json();
        if (response.ok) {
            currentUser = { token: result.access_token, email: email };
            localStorage.setItem('user', JSON.stringify(currentUser));
            alert('Login successful!');
            hideForms();
            updateUI();
            loadUserOrders();
        } else {
            alert('Error: ' + (result.detail || 'Login failed'));
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Product Functions
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products/`);
        const products = await response.json();
        
        const productsGrid = document.getElementById('products-grid');
        productsGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <h3>${product.name}</h3>
                <p>${product.description || 'No description'}</p>
                <p class="price">$${product.price}</p>
                <p>Stock: ${product.stock_quantity}</p>
                <button onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
                    Add to Cart
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function addToCart(productId, productName, price) {
    if (!currentUser) {
        alert('Please login first!');
        return;
    }
    
    cart.push({ productId, productName, price, quantity: 1 });
    updateCartUI();
}

function updateCartUI() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            ${item.productName} - $${item.price} x ${item.quantity}
        </div>
    `).join('');
    
    document.getElementById('cart-section').style.display = 'block';
}

async function checkout() {
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }

    const shippingAddress = prompt('Enter shipping address:');
    if (!shippingAddress) return;

    try {
        const response = await fetch(`${API_BASE_URL}/orders/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({
                shipping_address: { address: shippingAddress },
                items: cart.map(item => ({
                    product_id: item.productId,
                    quantity: item.quantity,
                    price: item.price
                }))
            })
        });
        
        if (response.ok) {
            alert('Order placed successfully!');
            cart = [];
            updateCartUI();
            loadUserOrders();
        } else {
            const error = await response.json();
            alert('Error: ' + error.detail);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function loadUserOrders() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE_URL}/orders/`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (response.ok) {
            const orders = await response.json();
            const ordersList = document.getElementById('orders-list');
            ordersList.innerHTML = orders.map(order => `
                <div class="order-card">
                    <h4>Order #${order.id}</h4>
                    <p>Total: $${order.total_amount}</p>
                    <p>Status: ${order.status}</p>
                    <p>Date: ${new Date(order.created_at).toLocaleDateString()}</p>
                </div>
            `).join('');
            
            document.getElementById('orders-section').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function updateUI() {
    const authSection = document.getElementById('auth-section');
    if (currentUser) {
        authSection.innerHTML = `
            <span>Welcome, ${currentUser.email}</span>
            <button onclick="logout()">Logout</button>
        `;
    } else {
        authSection.innerHTML = `
            <button onclick="showRegister()">Register</button>
            <button onclick="showLogin()">Login</button>
        `;
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('user');
    cart = [];
    updateUI();
    updateCartUI();
    document.getElementById('orders-section').style.display = 'none';
}

// Check if user is logged in on page load
window.onload = function() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUI();
        loadUserOrders();
    }
};