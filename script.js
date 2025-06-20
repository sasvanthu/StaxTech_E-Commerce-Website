// ---------- Firebase Setup ----------
// Replace the placeholder values with your own Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Optional Firestore for future use (cart/orders)
const db = firebase.firestore();

// ---------- Application State ----------
let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ---------- Fetch Products ----------
async function fetchProducts() {
  const res = await fetch("products.json");
  products = await res.json();
  renderProducts(products);
  updateCartCount();
}

// ---------- Rendering ----------
function renderProducts(list) {
  const container = document.getElementById("product-list");
  container.innerHTML = "";
  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "product";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p>₹${p.price}</p>
      <button onclick="addToCart(${p.id})">Add to Cart</button>
      <button onclick="showDetails(${p.id})">View</button>`;
    container.appendChild(card);
  });
}

function filterProducts() {
  const search = document.getElementById("search").value.toLowerCase();
  const category = document.getElementById("category").value;
  const filtered = products.filter(p =>
    (category === "all" || p.category === category) &&
    p.name.toLowerCase().includes(search)
  );
  renderProducts(filtered);
}

// ---------- Cart Functions ----------
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert(`${product.name} added to cart!`);
}

function updateCartCount() {
  document.getElementById("cart-count").innerText = cart.length;
}

function showCart() {
  const cartPanel = document.getElementById("cart");
  const itemsList = document.getElementById("cart-items");
  const totalSpan = document.getElementById("total");
  itemsList.innerHTML = "";
  let total = 0;
  cart.forEach((item, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `${item.name} - ₹${item.price} <button onclick="removeFromCart(${idx})">Remove</button>`;
    itemsList.appendChild(li);
    total += item.price;
  });
  totalSpan.innerText = total;
  cartPanel.style.display = "block";
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showCart();
}

function clearCart() {
  if (!confirm("Clear all items from cart?")) return;
  cart = [];
  localStorage.removeItem("cart");
  updateCartCount();
  showCart();
}

function checkout() {
  if (cart.length === 0) { alert("Your cart is empty!"); return; }
  if (!auth.currentUser) {
    alert("Please log in to place your order.");
    return;
  }
  // Simulate checkout
  alert("Order placed successfully!\nThank you for shopping with us.");
  clearCart();
  // TODO: Optional – save order in Firestore under user.uid
}

// ---------- Modal ----------
function showDetails(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  const modal = document.getElementById("modal");
  const content = document.getElementById("modal-content");
  content.innerHTML = `
    <h3>${product.name}</h3>
    <img src="${product.image}" style="width: 100%; max-height: 200px; object-fit: cover;" />
    <p>${product.description}</p>
    <p><strong>₹${product.price}</strong></p>
    <button onclick="addToCart(${product.id})">Add to Cart</button>
    <button onclick="closeModal()">Close</button>`;
  modal.style.display = "flex";
}
function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// ---------- Firebase Auth ----------
function signup() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, pass)
    .then(cred => {
      alert("Signed up successfully!");
      updateUserInfo(cred.user);
    })
    .catch(err => alert(err.message));
}
function login() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, pass)
    .then(cred => {
      alert("Logged in!");
      updateUserInfo(cred.user);
    })
    .catch(err => alert(err.message));
}
function logout() {
  auth.signOut().then(() => {
    alert("Logged out!");
    document.getElementById("logout-btn").style.display = "none";
    document.getElementById("user-info").innerText = "";
  });
}
function updateUserInfo(user) {
  document.getElementById("user-info").innerText = `Logged in as: ${user.email}`;
  document.getElementById("logout-btn").style.display = "inline-block";
}

auth.onAuthStateChanged(user => {
  if (user) updateUserInfo(user);
});

// ---------- Init ----------
fetchProducts();
