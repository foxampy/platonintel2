/**
 * Plato-Intel v2 - Forms JavaScript
 * Form validation and handling
 */

import { showToast } from './animations.js';

// ==========================================
// Form Validation
// ==========================================
const validators = {
    required: (value) => ({
        valid: value.trim().length > 0,
        message: 'Это поле обязательно для заполнения'
    }),
    
    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
            valid: emailRegex.test(value),
            message: 'Введите корректный email адрес'
        };
    },
    
    phone: (value) => {
        // Belarus phone: +375 XX XXX XX XX (13 chars with formatting)
        const phoneRegex = /^\+375\s\d{2}\s\d{3}\s\d{2}\s\d{2}$/;
        return {
            valid: phoneRegex.test(value),
            message: 'Введите телефон в формате +375 XX XXX XX XX'
        };
    },
    
    minLength: (value, length) => ({
        valid: value.length >= length,
        message: `Минимум ${length} символов`
    }),
    
    maxLength: (value, length) => ({
        valid: value.length <= length,
        message: `Максимум ${length} символов`
    })
};

const validateField = (field) => {
    const value = field.value;
    const validations = field.dataset.validate?.split('|') || [];
    const errors = [];

    for (const validation of validations) {
        const [rule, param] = validation.split(':');
        
        if (rule === 'required' && !value.trim()) {
            const result = validators.required(value);
            if (!result.valid) errors.push(result.message);
        } else if (value.trim()) {
            // Only validate other rules if field has value
            switch (rule) {
                case 'email':
                    const emailResult = validators.email(value);
                    if (!emailResult.valid) errors.push(emailResult.message);
                    break;
                case 'phone':
                    const phoneResult = validators.phone(value);
                    if (!phoneResult.valid) errors.push(phoneResult.message);
                    break;
                case 'min':
                    const minResult = validators.minLength(value, parseInt(param));
                    if (!minResult.valid) errors.push(minResult.message);
                    break;
                case 'max':
                    const maxResult = validators.maxLength(value, parseInt(param));
                    if (!maxResult.valid) errors.push(maxResult.message);
                    break;
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

// ==========================================
// Phone Mask (+375 __ ___ __ __)
// ==========================================
const initPhoneMask = () => {
    const phoneInputs = document.querySelectorAll('input[type="tel"], input[data-mask="phone"]');
    
    phoneInputs.forEach(input => {
        // Set initial placeholder
        input.placeholder = input.placeholder || '+375 __ ___ __ __';
        
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            // Always start with 375
            if (!value.startsWith('375')) {
                value = '375' + value;
            }
            
            // Limit to 12 digits (375 + 9)
            value = value.slice(0, 12);
            
            // Format: +375 XX XXX XX XX
            let formatted = '+' + value.slice(0, 3);
            if (value.length > 3) {
                formatted += ' ' + value.slice(3, 5);
            }
            if (value.length > 5) {
                formatted += ' ' + value.slice(5, 8);
            }
            if (value.length > 8) {
                formatted += ' ' + value.slice(8, 10);
            }
            if (value.length > 10) {
                formatted += ' ' + value.slice(10, 12);
            }
            
            e.target.value = formatted;
        });

        input.addEventListener('focus', () => {
            if (!input.value) {
                input.value = '+375 ';
            }
        });

        input.addEventListener('blur', () => {
            if (input.value === '+375 ' || input.value === '+375') {
                input.value = '';
            }
        });

        // Prevent cursor jumping
        input.addEventListener('keydown', (e) => {
            const pos = input.selectionStart;
            if (pos <= 5 && (e.key === 'Backspace' || e.key === 'Delete')) {
                e.preventDefault();
            }
        });
    });
};

// ==========================================
// Form Field Validation UI
// ==========================================
const showFieldError = (field, message) => {
    const formGroup = field.closest('.form-group') || field.parentElement;
    formGroup.classList.add('has-error');
    
    // Remove existing error
    const existingError = formGroup.querySelector('.form-error');
    if (existingError) existingError.remove();
    
    // Add error message
    const errorElement = document.createElement('span');
    errorElement.className = 'form-error';
    errorElement.textContent = message;
    formGroup.appendChild(errorElement);
};

const clearFieldError = (field) => {
    const formGroup = field.closest('.form-group') || field.parentElement;
    formGroup.classList.remove('has-error');
    
    const errorElement = formGroup.querySelector('.form-error');
    if (errorElement) errorElement.remove();
};

const clearAllErrors = (form) => {
    form.querySelectorAll('.form-error').forEach(el => el.remove());
    form.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
};

// ==========================================
// AJAX Form Submission
// ==========================================
const submitForm = async (form) => {
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn?.innerHTML || 'Отправить';
    
    // Show loading state
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner spinner--small"></span> Отправка...';
    }
    
    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Simulate API call (replace with actual endpoint)
        // const response = await fetch('/api/submit', {
        //     method: 'POST',
        //     body: formData
        // });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate success (90% success rate for demo)
        if (Math.random() > 0.1) {
            return { success: true, message: 'Форма успешно отправлена!' };
        } else {
            throw new Error('Ошибка сервера');
        }
        
    } catch (error) {
        return { success: false, message: error.message || 'Ошибка отправки формы' };
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
};

// ==========================================
// Success/Error Message Display
// ==========================================
const showFormMessage = (form, type, message) => {
    // Remove existing messages
    form.querySelectorAll('.form-message').forEach(el => el.remove());
    
    const messageEl = document.createElement('div');
    messageEl.className = `form-message form-message--${type}`;
    messageEl.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${type === 'success' 
                ? '<path d="M20 6 9 17l-5-5"/>' 
                : '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>'
            }
        </svg>
        <span>${message}</span>
    `;
    
    form.appendChild(messageEl);
    
    // Auto-remove success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageEl.remove();
        }, 5000);
    }
};

// ==========================================
// File Upload Preview
// ==========================================
const initFileUpload = () => {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        const wrapper = input.closest('.file-upload') || input.parentElement;
        const preview = wrapper.querySelector('.file-upload__preview');
        const nameDisplay = wrapper.querySelector('.file-upload__name');
        const removeBtn = wrapper.querySelector('.file-upload__remove');
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                showToast('Файл слишком большой (макс. 10MB)', 'error');
                input.value = '';
                return;
            }
            
            // Validate file type
            const allowedTypes = input.accept?.split(',').map(t => t.trim()) || [];
            if (allowedTypes.length && !allowedTypes.some(type => file.type.match(type))) {
                showToast('Неподдерживаемый формат файла', 'error');
                input.value = '';
                return;
            }
            
            // Show file name
            if (nameDisplay) {
                nameDisplay.textContent = file.name;
                wrapper.classList.add('has-file');
            }
            
            // Preview for images
            if (preview && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                    preview.classList.add('is-visible');
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Remove file
        removeBtn?.addEventListener('click', () => {
            input.value = '';
            if (nameDisplay) {
                nameDisplay.textContent = '';
            }
            if (preview) {
                preview.innerHTML = '';
                preview.classList.remove('is-visible');
            }
            wrapper.classList.remove('has-file');
        });
        
        // Drag and drop
        wrapper.addEventListener('dragover', (e) => {
            e.preventDefault();
            wrapper.classList.add('is-dragover');
        });
        
        wrapper.addEventListener('dragleave', () => {
            wrapper.classList.remove('is-dragover');
        });
        
        wrapper.addEventListener('drop', (e) => {
            e.preventDefault();
            wrapper.classList.remove('is-dragover');
            
            const files = e.dataTransfer.files;
            if (files.length) {
                input.files = files;
                input.dispatchEvent(new Event('change'));
            }
        });
    });
};

// ==========================================
// Initialize Forms
// ==========================================
const initForms = () => {
    // Phone mask
    initPhoneMask();
    
    // File uploads
    initFileUpload();
    
    // Form validation and submission
    document.querySelectorAll('form[data-validate]').forEach(form => {
        // Real-time validation
        form.querySelectorAll('[data-validate]').forEach(field => {
            field.addEventListener('blur', () => {
                const result = validateField(field);
                if (!result.valid) {
                    showFieldError(field, result.errors[0]);
                } else {
                    clearFieldError(field);
                }
            });
            
            field.addEventListener('input', () => {
                if (field.closest('.has-error')) {
                    const result = validateField(field);
                    if (result.valid) {
                        clearFieldError(field);
                    }
                }
            });
        });
        
        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            clearAllErrors(form);
            
            // Validate all fields
            let isValid = true;
            const fields = form.querySelectorAll('[data-validate]');
            
            fields.forEach(field => {
                const result = validateField(field);
                if (!result.valid) {
                    isValid = false;
                    showFieldError(field, result.errors[0]);
                }
            });
            
            if (!isValid) {
                showToast('Пожалуйста, исправьте ошибки в форме', 'error');
                return;
            }
            
            // Submit form
            const result = await submitForm(form);
            
            if (result.success) {
                showFormMessage(form, 'success', result.message);
                showToast('Форма успешно отправлена!', 'success');
                form.reset();
                
                // Clear file previews
                form.querySelectorAll('.file-upload').forEach(wrapper => {
                    wrapper.classList.remove('has-file');
                    const preview = wrapper.querySelector('.file-upload__preview');
                    if (preview) {
                        preview.innerHTML = '';
                        preview.classList.remove('is-visible');
                    }
                });
                
                // Custom success callback
                const onSuccess = form.dataset.onSuccess;
                if (onSuccess && window[onSuccess]) {
                    window[onSuccess](form);
                }
            } else {
                showFormMessage(form, 'error', result.message);
                showToast(result.message, 'error');
            }
        });
    });
    
    // Inquiry form specific
    const inquiryForm = document.querySelector('#inquiry-form');
    if (inquiryForm) {
        initInquiryForm(inquiryForm);
    }
};

// ==========================================
// Inquiry Form
// ==========================================
const initInquiryForm = (form) => {
    // Load inquiry items
    const loadInquiryItems = async () => {
        const { getInquiry } = await import('./data.js');
        const inquiry = getInquiry();
        const container = form.querySelector('.inquiry-items');
        
        if (!container) return;
        
        if (inquiry.length === 0) {
            container.innerHTML = `
                <div class="inquiry-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M9 11V6a3 3 0 0 1 6 0v5M9 11h6M9 11H6a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-4a3 3 0 0 0-3-3h-3"/>
                    </svg>
                    <p>Ваш запрос пуст</p>
                    <a href="catalog.html" class="btn btn--primary">Перейти в каталог</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = inquiry.map(item => `
            <div class="inquiry-item" data-product-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="inquiry-item__image">
                <div class="inquiry-item__info">
                    <h4 class="inquiry-item__name">${item.name}</h4>
                    <p class="inquiry-item__sku">Арт: ${item.sku}</p>
                    <span class="inquiry-item__price">${item.price.toLocaleString()} BYN</span>
                </div>
                <button type="button" class="inquiry-item__remove" data-action="remove-item" title="Удалить">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `).join('');
    };
    
    // Handle item removal
    form.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('[data-action="remove-item"]');
        if (removeBtn) {
            const item = removeBtn.closest('[data-product-id]');
            const productId = item.dataset.productId;
            
            import('./data.js').then(({ removeFromInquiry }) => {
                removeFromInquiry(productId);
                item.remove();
                loadInquiryItems();
                showToast('Товар удалён из запроса', 'info');
            });
        }
    });
    
    loadInquiryItems();
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForms);
} else {
    initForms();
}

export { initForms, validators, validateField };
