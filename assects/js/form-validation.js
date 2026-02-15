/* ==========================================================================
   VoiceMaster Pro - Form Validation
   Version: 1.0.0
   Author: VoiceMaster Pro
   Description: Advanced form validation with real-time feedback
   ========================================================================== */

(function() {
    "use strict";

    /* ----------------------------------------------------------------------
       1. FORM VALIDATOR CLASS
    ---------------------------------------------------------------------- */

    class FormValidator {
        constructor(formElement, options = {}) {
            this.form = formElement;
            this.options = {
                validateOnBlur: options.validateOnBlur || true,
                validateOnInput: options.validateOnInput || true,
                showSuccessStates: options.showSuccessStates || true,
                errorClassName: 'error',
                successClassName: 'success',
                errorMessageClassName: 'error-message',
                successMessageClassName: 'success-message',
                ...options
            };
            
            this.fields = [];
            this.errorMessages = [];
            this.isValid = false;
            
            this.init();
        }
        
        init() {
            if (!this.form) return;
            
            this.cacheFields();
            this.bindEvents();
            this.addValidationAttributes();
            
            console.log('FormValidator initialized');
        }
        
        cacheFields() {
            // Get all form fields
            const inputs = this.form.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                const field = {
                    element: input,
                    name: input.name || input.id,
                    type: input.type,
                    required: input.required,
                    pattern: input.pattern,
                    minLength: input.minLength,
                    maxLength: input.maxLength,
                    min: input.min,
                    max: input.max,
                    validators: []
                };
                
                // Add validators based on field type
                if (field.required) {
                    field.validators.push('required');
                }
                
                if (field.type === 'email') {
                    field.validators.push('email');
                }
                
                if (field.type === 'tel') {
                    field.validators.push('phone');
                }
                
                if (field.type === 'url') {
                    field.validators.push('url');
                }
                
                if (field.type === 'number') {
                    field.validators.push('number');
                }
                
                if (field.pattern) {
                    field.validators.push('pattern');
                }
                
                if (field.minLength) {
                    field.validators.push('minlength');
                }
                
                if (field.maxLength) {
                    field.validators.push('maxlength');
                }
                
                this.fields.push(field);
            });
        }
        
        bindEvents() {
            // Form submit event
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.validateForm(e);
            });
            
            // Field blur events
            if (this.options.validateOnBlur) {
                this.fields.forEach(field => {
                    field.element.addEventListener('blur', () => {
                        this.validateField(field);
                    });
                });
            }
            
            // Field input events
            if (this.options.validateOnInput) {
                this.fields.forEach(field => {
                    field.element.addEventListener('input', () => {
                        this.validateField(field);
                    });
                });
            }
            
            // Reset event
            this.form.addEventListener('reset', () => {
                this.resetForm();
            });
        }
        
        addValidationAttributes() {
            // Add aria attributes for accessibility
            this.fields.forEach(field => {
                field.element.setAttribute('aria-invalid', 'false');
                
                if (field.required) {
                    field.element.setAttribute('aria-required', 'true');
                }
                
                // Add describedby for error messages
                if (field.name) {
                    const errorId = `${field.name}-error`;
                    field.element.setAttribute('aria-describedby', errorId);
                }
            });
        }
        
        /* ------------------------------------------------------------------
           2. VALIDATION METHODS
        ------------------------------------------------------------------ */
        
        validateForm(e) {
            let formIsValid = true;
            
            // Validate all fields
            this.fields.forEach(field => {
                const isValid = this.validateField(field);
                if (!isValid) {
                    formIsValid = false;
                }
            });
            
            this.isValid = formIsValid;
            
            if (formIsValid) {
                this.handleSuccess();
            } else {
                this.handleError();
            }
            
            return formIsValid;
        }
        
        validateField(field) {
            const value = field.element.value.trim();
            let isValid = true;
            let errorMessage = '';
            
            // Run all validators
            for (const validator of field.validators) {
                switch(validator) {
                    case 'required':
                        if (!this.validateRequired(value)) {
                            isValid = false;
                            errorMessage = 'This field is required';
                        }
                        break;
                        
                    case 'email':
                        if (value && !this.validateEmail(value)) {
                            isValid = false;
                            errorMessage = 'Please enter a valid email address';
                        }
                        break;
                        
                    case 'phone':
                        if (value && !this.validatePhone(value)) {
                            isValid = false;
                            errorMessage = 'Please enter a valid phone number';
                        }
                        break;
                        
                    case 'url':
                        if (value && !this.validateUrl(value)) {
                            isValid = false;
                            errorMessage = 'Please enter a valid URL';
                        }
                        break;
                        
                    case 'number':
                        if (value && !this.validateNumber(value)) {
                            isValid = false;
                            errorMessage = 'Please enter a valid number';
                        }
                        break;
                        
                    case 'pattern':
                        if (value && !this.validatePattern(value, field.pattern)) {
                            isValid = false;
                            errorMessage = 'Please match the requested format';
                        }
                        break;
                        
                    case 'minlength':
                        if (value && value.length < field.minLength) {
                            isValid = false;
                            errorMessage = `Minimum ${field.minLength} characters required`;
                        }
                        break;
                        
                    case 'maxlength':
                        if (value && value.length > field.maxLength) {
                            isValid = false;
                            errorMessage = `Maximum ${field.maxLength} characters allowed`;
                        }
                        break;
                }
                
                if (!isValid) break;
            }
            
            // Update field state
            this.updateFieldState(field, isValid, errorMessage);
            
            return isValid;
        }
        
        /* ------------------------------------------------------------------
           3. VALIDATION RULES
        ------------------------------------------------------------------ */
        
        validateRequired(value) {
            return value !== undefined && value !== null && value.trim() !== '';
        }
        
        validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
        
        validatePhone(phone) {
            const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
            return re.test(phone);
        }
        
        validateUrl(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        }
        
        validateNumber(value) {
            return !isNaN(value) && isFinite(value);
        }
        
        validatePattern(value, pattern) {
            const re = new RegExp(pattern);
            return re.test(value);
        }
        
        /* ------------------------------------------------------------------
           4. UI UPDATES
        ------------------------------------------------------------------ */
        
        updateFieldState(field, isValid, errorMessage) {
            const container = field.element.closest('.form-group') || field.element.parentNode;
            
            // Remove existing classes
            field.element.classList.remove(this.options.errorClassName, this.options.successClassName);
            container.classList.remove(this.options.errorClassName, this.options.successClassName);
            
            // Remove existing messages
            const existingError = container.querySelector(`.${this.options.errorMessageClassName}`);
            const existingSuccess = container.querySelector(`.${this.options.successMessageClassName}`);
            
            if (existingError) existingError.remove();
            if (existingSuccess) existingSuccess.remove();
            
            // Update ARIA attributes
            field.element.setAttribute('aria-invalid', (!isValid).toString());
            
            if (isValid) {
                // Success state
                if (this.options.showSuccessStates && field.required) {
                    field.element.classList.add(this.options.successClassName);
                    container.classList.add(this.options.successClassName);
                    
                    const successMessage = document.createElement('span');
                    successMessage.className = this.options.successMessageClassName;
                    successMessage.textContent = '✓ Valid';
                    successMessage.setAttribute('aria-live', 'polite');
                    container.appendChild(successMessage);
                }
            } else if (errorMessage) {
                // Error state
                field.element.classList.add(this.options.errorClassName);
                container.classList.add(this.options.errorClassName);
                
                const errorSpan = document.createElement('span');
                errorSpan.className = this.options.errorMessageClassName;
                errorSpan.textContent = errorMessage;
                errorSpan.id = `${field.name || 'field'}-error`;
                errorSpan.setAttribute('aria-live', 'polite');
                container.appendChild(errorSpan);
            }
        }
        
        /* ------------------------------------------------------------------
           5. FORM HANDLERS
        ------------------------------------------------------------------ */
        
        handleSuccess() {
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'form-success-message';
            successMessage.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <h4>Thank you!</h4>
                <p>Your message has been sent successfully. We'll get back to you within 24 hours.</p>
            `;
            
            // Replace form with success message
            this.form.style.display = 'none';
            this.form.parentNode.insertBefore(successMessage, this.form);
            
            // Log to console
            console.log('Form submitted successfully:', this.getFormData());
            
            // Reset form after 5 seconds
            setTimeout(() => {
                this.resetForm();
                successMessage.remove();
                this.form.style.display = 'block';
            }, 5000);
        }
        
        handleError() {
            // Scroll to first error
            const firstError = this.form.querySelector(`.${this.options.errorClassName}`);
            if (firstError) {
                firstError.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                firstError.focus();
            }
            
            // Show error summary
            const errorSummary = document.createElement('div');
            errorSummary.className = 'form-error-summary';
            errorSummary.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                <p>Please fix the errors above before submitting.</p>
            `;
            
            const existingSummary = this.form.querySelector('.form-error-summary');
            if (existingSummary) existingSummary.remove();
            
            this.form.prepend(errorSummary);
            
            // Remove error summary after 5 seconds
            setTimeout(() => {
                errorSummary.remove();
            }, 5000);
        }
        
        resetForm() {
            // Reset form fields
            this.form.reset();
            
            // Reset field states
            this.fields.forEach(field => {
                const container = field.element.closest('.form-group') || field.element.parentNode;
                
                field.element.classList.remove(this.options.errorClassName, this.options.successClassName);
                container.classList.remove(this.options.errorClassName, this.options.successClassName);
                
                const existingError = container.querySelector(`.${this.options.errorMessageClassName}`);
                const existingSuccess = container.querySelector(`.${this.options.successMessageClassName}`);
                
                if (existingError) existingError.remove();
                if (existingSuccess) existingSuccess.remove();
                
                field.element.setAttribute('aria-invalid', 'false');
            });
            
            // Remove error summary
            const errorSummary = this.form.querySelector('.form-error-summary');
            if (errorSummary) errorSummary.remove();
            
            // Show form
            this.form.style.display = 'block';
            
            // Remove success message
            const successMessage = this.form.parentNode.querySelector('.form-success-message');
            if (successMessage) successMessage.remove();
        }
        
        getFormData() {
            const formData = new FormData(this.form);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                if (data[key]) {
                    if (!Array.isArray(data[key])) {
                        data[key] = [data[key]];
                    }
                    data[key].push(value);
                } else {
                    data[key] = value;
                }
            }
            
            return data;
        }
        
        /* ------------------------------------------------------------------
           6. UTILITIES
        ------------------------------------------------------------------ */
        
        addCustomValidator(fieldName, validatorFn, errorMessage) {
            const field = this.fields.find(f => f.name === fieldName);
            if (field) {
                field.validators.push('custom');
                field.customValidator = validatorFn;
                field.customErrorMessage = errorMessage;
            }
        }
    }

    /* ----------------------------------------------------------------------
       7. INITIALIZE FORM VALIDATORS
    ---------------------------------------------------------------------- */

    const initFormValidators = () => {
        // Find all forms
        const forms = document.querySelectorAll('#contactForm, .contact-form, .quote-form, .booking-form');
        
        forms.forEach(form => {
            new FormValidator(form);
        });
        
        console.log('Form Validators initialized');
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFormValidators);
    } else {
        initFormValidators();
    }

    // Export for global use
    window.FormValidator = FormValidator;

})();