
(async function getProducts() {

    const res = await fetch('https://fakestoreapi.com/products');
    products = await res.json();
    displayProducts(products);

    const rev = await fetch('reviews.json');
    reviewsData = await rev.json();
    startSlider();
    updateUI()
})();

let curr = 0;
let products = [];
let reviewsData = [];




// code for sliding images ===>>

const slider = document.getElementById("slide_container");
const slides = document.querySelectorAll("#slide_container img");
const nextBtn = document.getElementById("right_btn");
const prevBtn = document.getElementById("left_btn");
const dotsContainer = document.getElementById("banner-dots");


let currentIndex = 0;
const totalSlides = slides.length;


slides.forEach((slide, index) => {

    const dot = document.createElement("button");

    dot.className = "w-3 h-3 rounded-full bg-white/50 transition-all";

    if (index === 0) {
        dot.classList.add("bg-white");
    }

    dot.addEventListener("click", () => {
        currentIndex = index;
        updateSlider(currentIndex);
    });

    dotsContainer.appendChild(dot);
});

const dots = dotsContainer.querySelectorAll("button");

function updateSlider(currentIndex) {
    const imageWidth = slider.parentElement.clientWidth;

    slider.style.transform = `TranslateX(-${currentIndex * imageWidth}px)`;


    dots[currentIndex].classList.add("bg-white");
    dots[currentIndex].classList.remove("bg-white/50");

    dots.forEach((dot, index) => {
        if (index !== currentIndex) {
            dot.classList.remove("bg-white");
            dot.classList.add("bg-white/50");
        }
    });
}

prevBtn.addEventListener("click", () => {
    currentIndex--;
    if (currentIndex < 0) {
        currentIndex = totalSlides - 1;
    }
    updateSlider(currentIndex);
});

nextBtn.addEventListener("click", () => {
    currentIndex++;
    if (currentIndex >= totalSlides) {
        currentIndex = 0;
    }
    updateSlider(currentIndex);
});

let direction = 1;
setInterval(() => {
    currentIndex += direction;
    if (currentIndex >= totalSlides - 1) {
        direction = -1;
    }
    if (currentIndex <= 0) {
        direction = 1;
    }
    updateSlider(currentIndex);
}, 2000);





// code for display products ===>

function displayProducts(products) {
    const container = document.getElementById("product-container");
    container.innerHTML = "";

    products.forEach(product => {

        const card = document.createElement("div");
        card.className = "group flex flex-col bg-white p-4 border border-[#e9ecef] hover:border-[#212529] transition-all animate-fadeInUp";

        card.innerHTML = `

        <div class="relative aspect-square overflow-hidden mb-4 bg-[#f8f9fa]">
        <img src="${product.image}" alt="${product.title}" class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500">
        <div class="absolute top-2 left-2 px-2 py-1 bg-[#212529] text-white text-[10px] font-bold uppercase tracking-widest">${product.category}</div>
        </div>
        <h3 class="text-sm font-bold text-black line-clamp-1 mb-1">${product.title}</h3>

        <div class="flex items-center gap-1 mb-2">
          <span>★★★★</span>
          <span class="text-gray-300">★</span>
          <span class="text-[10px] text-[#343a40]/40 font-bold">(${product.rating.count})</span>
        </div>

        <div class="mt-auto flex items-center justify-between">
          <span class="text-lg font-bold font-mono">৳${(product.price * 100).toFixed(2)}</span>
          <button onclick="addToCart(${product.id})" class="p-2 border border-[#212529] hover:bg-[#212529] hover:text-white transition-all transform active:scale-95">
          +
          </button>
        </div>
        
        `;

        container.appendChild(card);

    });

}

const sortSelect = document.getElementById("sort-products");

sortSelect.addEventListener("change", (e) => {

    const sortValue = e.target.value;
    let sortedProducts = [...products];

    if (sortValue === "low-high") {
        sortedProducts.sort((a, b) => {
            return a.price - b.price;
        });
    }
    else if (sortValue === "high-low") {
        sortedProducts.sort((a, b) => {
            return b.price - a.price;
        });
    }
    displayProducts(sortedProducts);

});



// code for review slider ===>>

const review_comment = document.getElementById("review-comment");
const review_name = document.getElementById("review-name");
const review_date = document.getElementById("review-date");
const review_count = document.getElementById("review-count");

function renderReview(index) {

    const review = reviewsData[index];

    review_count.classList.remove("opacity-100", "translate-y-0");
    review_count.classList.add("opacity-0", "translate-y-4");

    setTimeout(() => {

        review_comment.textContent = `"${review.comment}"`;
        review_name.textContent = review.name;
        review_date.textContent = review.date;

        review_count.classList.remove("opacity-0", "translate-y-4");
        review_count.classList.add("opacity-100", "translate-y-0");
    }, 300);
}
function startSlider() {
    renderReview(curr);
    intervalId = setInterval(() => {
        curr++;
        if (curr >= reviewsData.length) {
            curr = 0;
        }
        renderReview(curr);
    }, 3000);
}

document.getElementById("next-review").addEventListener("click", () => {
    curr++;
    if (curr >= reviewsData.length) {
        curr = 0;
    }

    renderReview(curr);
});
document.getElementById("prev-review").addEventListener("click", () => {

    curr--;
    if (curr < 0) {
        curr = reviewsData.length - 1;
    }
    renderReview(curr);
});








// code for cart functionality ===>>

const COUPON_CODE = "SMART10";
const COUPON_DISCOUNT = 0.1;
const SHIPPING_COST = 20;
const DELIVERY_CHARGE = 80;

let cart = JSON.parse(localStorage.getItem('cart_')) || [];
let balance = parseFloat(localStorage.getItem('balance_')) || 1000;
let appliedDiscount = 0;

const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsEl = document.getElementById('cart-items');
const cartFooter = document.getElementById('cart-footer');
const userBalanceEl = document.getElementById('user-balance');
const cartCountEl = document.getElementById('cart-count');
const subtotalEl = document.getElementById('subtotal');
const finalTotalEl = document.getElementById('final-total');
const discountRow = document.getElementById('discount-row');
const discountValEl = document.getElementById('discount-val');
const balanceWarning = document.getElementById('balance-warning');
const scrollTopBtn = document.getElementById('scroll-top');


// Cart toggle
document.getElementById('cart-toggle').onclick = () => {
    cartSidebar.classList.remove('translate-x-full');
    cartOverlay.classList.remove('hidden');
};
document.getElementById('cart-close').onclick = () => {
    cartSidebar.classList.add('translate-x-full');
    cartOverlay.classList.add('hidden');
};
cartOverlay.onclick = document.getElementById('cart-close').onclick;

// Add Money
document.getElementById('add-money-btn').onclick = () => {
    balance += 1000;
    saveBalance();
    updateUI();
};

// Add to cart
window.addToCart = (id) => {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);

    const subtotal = cart.reduce(
        (acc, item) => {
            return acc + (item.price * item.quantity)
        }, 0);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateUI();
    saveCart();
};

window.removeFromCart = (id) => {
    cart = cart.filter((item) => {
        return item.id !== id
    });

    updateUI();
    saveCart();
};

window.updateQuantity = (id, val) => {
    const item = cart.find((i) => {
        return i.id === id
    });
    if (item) {
        item.quantity += val;
        if (item.quantity <= 0) {
            cart = cart.filter((i) => {
                return i.id !== id
            });
        }
    }
    updateUI();
    saveCart();
};

function updateUI() {
    userBalanceEl.textContent = `৳${balance.toFixed(2)}`;

    const totalItems = cart.reduce((acc, item) => {
        return acc + item.quantity
    }, 0);

    if (totalItems > 0) {
        cartCountEl.textContent = totalItems;
        cartCountEl.classList.remove('hidden');
    } else {
        cartCountEl.classList.add('hidden');
    }

    document.getElementById('cart-status').textContent = `${totalItems} ITEMS`;
    renderCartItems();
    calculateTotals();
}

function renderCartItems() {
    cartItemsEl.innerHTML = '';
    if (cart.length === 0) {
        cartItemsEl.innerHTML = `
      <div class="flex-grow flex flex-col items-center justify-center text-center opacity-40 py-20">
        <p class="text-sm font-bold uppercase tracking-widest">Cart is empty</p>
      </div>
    `;
    }
    else {
        cart.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = "flex gap-4 group animate-fade-in";
            itemEl.innerHTML = `
                <div class="w-20 h-20 bg-soft-gray shrink-0 rounded-sm overflow-hidden p-2">
                    <img src="${item.image}" alt="${item.title}" class="w-full h-full object-contain">
                </div>
                <div class="flex-grow flex flex-col">
                    <div class="flex justify-between items-start mb-1">
                        <h4 class="text-sm font-bold line-clamp-1">${item.title}</h4>
                        <button onclick="removeFromCart(${item.id})" class="text-charcoal/40 hover:text-matte-black transition-colors">
                        x
                        </button>
                    </div>
                <p class="text-xs text-charcoal/60 mb-2">৳${(item.price * 100).toFixed(2)}</p>
                
                <div class="mt-auto flex items-center justify-between">
                    <div class="flex items-center border border-[#e9ecef]">
                        <button onclick="updateQuantity(${item.id}, -1)" class="p-1 hover:bg-soft-gray">
                        -
                        </button>
                        <span class="w-8 text-center text-xs font-bold">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)" class="p-1 hover:bg-soft-gray">
                        +
                        </button>
                    </div>
                    <span class="text-sm font-bold font-mono">৳${(item.price * item.quantity * 100).toFixed(2)}</span>
                </div>
            </div>
            `;
            cartItemsEl.appendChild(itemEl);
        });
    }
}

function calculateTotals() {
    const subtotal = cart.reduce((acc, item) => {
        return acc + (item.price * item.quantity * 100);
    }, 0);

    let totalWithCharges = 0;
    if (subtotal > 0) {
        totalWithCharges = subtotal + SHIPPING_COST + DELIVERY_CHARGE
    }

    const finalTotal = totalWithCharges - (totalWithCharges * appliedDiscount);

    subtotalEl.textContent = `৳${subtotal.toFixed(2)}`;
    finalTotalEl.textContent = `৳${finalTotal.toFixed(2)}`;

    if (appliedDiscount > 0) {
        discountRow.classList.remove('hidden');
        discountValEl.textContent = `-৳${(totalWithCharges * appliedDiscount).toFixed(2)}`;
    } else {
        discountRow.classList.add('hidden');
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    const warningEl = document.getElementById('insufficient-balance');

    if (finalTotal > balance) {
        checkoutBtn.disabled = true;
        checkoutBtn.classList.replace('bg-matte-black', 'bg-soft-gray');
        checkoutBtn.classList.replace('text-white', 'text-charcoal/40');
        checkoutBtn.textContent = 'INSUFFICIENT BALANCE';
        warningEl.classList.remove('hidden');
    } else {
        checkoutBtn.disabled = false;
        checkoutBtn.classList.replace('bg-soft-gray', 'bg-matte-black');
        checkoutBtn.classList.replace('text-charcoal/40', 'text-white');
        checkoutBtn.textContent = 'CHECKOUT';
        warningEl.classList.add('hidden');
    }
}

document.getElementById('apply-coupon-btn').onclick = () => {
    const code = document.getElementById('coupon-input').value.trim().toUpperCase();
    if (code === COUPON_CODE) {
        appliedDiscount = COUPON_DISCOUNT;
        alert("Coupon applied! 10% discount subtracted.");
        updateUI();
    } else {
        alert("Invalid coupon code.");
    }
};

document.getElementById('checkout-btn').onclick = () => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity * 100), 0);
    const totalWithCharges = subtotal + SHIPPING_COST + DELIVERY_CHARGE;
    const finalTotal = totalWithCharges - (totalWithCharges * appliedDiscount);

    if (finalTotal <= balance) {
        balance = balance - finalTotal;
        cart = [];
        appliedDiscount = 0;
        document.getElementById('coupon-input').value = '';
        saveBalance();
        saveCart();
        updateUI();
        document.getElementById('cart-close').onclick();
        alert("Order placed! Thank you for choosing PrimeStore.");
    }
};

// Helpers
function saveCart() {
    localStorage.setItem('cart_', JSON.stringify(cart));
}

function saveBalance() {
    localStorage.setItem('balance_', balance.toString());
}
