// State
let products = JSON.parse(localStorage.getItem('products')) || [];
let currentPhotoBase64 = '';

// DOM Elements
const homeView = document.getElementById('home-view');
const formView = document.getElementById('form-view');
const addNewBtn = document.getElementById('add-new-btn');
const cancelBtn = document.getElementById('cancel-btn');
const productForm = document.getElementById('product-form');
const productGrid = document.getElementById('product-grid');
const emptyState = document.getElementById('empty-state');

// Form Inputs
const idInput = document.getElementById('product-id');
const nameInput = document.getElementById('product-name');
const priceInput = document.getElementById('product-price');
const descInput = document.getElementById('product-desc');
const photoInput = document.getElementById('product-photo');
const formTitle = document.getElementById('form-title');
const photoPreviewContainer = document.getElementById('photo-preview-container');
const photoPreview = document.getElementById('photo-preview');
const removePhotoBtn = document.getElementById('remove-photo-btn');

// Default Placeholder Image
const DEFAULT_IMAGE = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_18e11e51351%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3Avar(--bs-font-sans-serif)%2C%20sans-serif%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_18e11e51351%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%232d2d2d%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2260%22%20y%3D%22104.5%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';

// Initialize
function init() {
    renderProducts();
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    addNewBtn.addEventListener('click', () => openForm());
    cancelBtn.addEventListener('click', closeForm);
    productForm.addEventListener('submit', handleFormSubmit);
    
    photoInput.addEventListener('change', handlePhotoUpload);
    removePhotoBtn.addEventListener('click', removePhoto);
}

// Navigation
function openForm(product = null) {
    if (product) {
        formTitle.textContent = 'Edit Product';
        idInput.value = product.id;
        nameInput.value = product.name;
        priceInput.value = product.price;
        descInput.value = product.desc;
        if (product.photo && product.photo !== DEFAULT_IMAGE) {
            currentPhotoBase64 = product.photo;
            showPhotoPreview(currentPhotoBase64);
        } else {
            removePhoto();
        }
    } else {
        formTitle.textContent = 'Add New Product';
        productForm.reset();
        idInput.value = '';
        removePhoto();
    }
    
    homeView.classList.remove('active');
    setTimeout(() => {
        homeView.classList.add('hidden');
        formView.classList.remove('hidden');
        setTimeout(() => formView.classList.add('active'), 50);
    }, 200);
}

function closeForm() {
    formView.classList.remove('active');
    setTimeout(() => {
        formView.classList.add('hidden');
        homeView.classList.remove('hidden');
        setTimeout(() => homeView.classList.add('active'), 50);
    }, 200);
}

// Photo Handling
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            currentPhotoBase64 = event.target.result;
            showPhotoPreview(currentPhotoBase64);
        };
        reader.readAsDataURL(file);
    }
}

function showPhotoPreview(src) {
    photoPreview.src = src;
    photoPreviewContainer.classList.remove('hidden');
}

function removePhoto() {
    photoInput.value = '';
    currentPhotoBase64 = '';
    photoPreviewContainer.classList.add('hidden');
    photoPreview.src = '';
}

// Form Submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const newProduct = {
        id: idInput.value || Date.now().toString(),
        name: nameInput.value,
        price: parseFloat(priceInput.value).toFixed(2),
        desc: descInput.value,
        photo: currentPhotoBase64 || DEFAULT_IMAGE,
        createdAt: idInput.value ? undefined : Date.now()
    };
    
    if (idInput.value) {
        // Edit existing
        const index = products.findIndex(p => p.id === idInput.value);
        if (index !== -1) {
            // preserve original creation date
            newProduct.createdAt = products[index].createdAt;
            products[index] = newProduct;
        }
    } else {
        // Add new
        products.push(newProduct);
    }
    
    saveProducts();
    renderProducts();
    closeForm();
}

// Data Management
function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== id);
        saveProducts();
        renderProducts();
    }
}

// Rendering
function renderProducts() {
    productGrid.innerHTML = '';
    
    if (products.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        
        // Sort by newest first
        const sortedProducts = [...products].sort((a, b) => b.createdAt - a.createdAt);
        
        const template = document.getElementById('product-card-template');
        
        sortedProducts.forEach(product => {
            const clone = template.content.cloneNode(true);
            
            const card = clone.querySelector('.card');
            card.dataset.id = product.id;
            
            const img = clone.querySelector('.card-image');
            img.src = product.photo;
            img.alt = product.name;
            
            clone.querySelector('.card-title').textContent = product.name;
            clone.querySelector('.card-price').textContent = `$${product.price}`;
            clone.querySelector('.card-desc').textContent = product.desc;
            
            // Event Listeners for Edit and Delete
            const editBtn = clone.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => openForm(product));
            
            const deleteBtn = clone.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteProduct(product.id));
            
            productGrid.appendChild(clone);
        });
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
