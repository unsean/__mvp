import { useState, useCallback } from 'react';
import { validateEmail, validatePassword, validateName, validatePhone } from './validation';
import { logError } from './errorHandler';

/**
 * Custom hook for form validation and state management
 * 
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Form submission handler
 * @param {Object} customValidators - Custom validation functions
 * @returns {Object} Form state and handlers
 */
export default function useFormValidation(initialValues = {}, onSubmit, customValidators = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form values
  const handleChange = useCallback((name, value) => {
    setValues(prevValues => ({
      ...prevValues,
      [name]: value
    }));

    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  }, [errors]);

  // Mark field as touched on blur
  const handleBlur = useCallback((name) => {
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true
    }));

    // Validate on blur
    validateField(name, values[name]);
  }, [values]);

  // Validate a specific field
  const validateField = useCallback((name, value) => {
    let error = '';

    // Use custom validator if provided
    if (customValidators[name]) {
      const customResult = customValidators[name](value);
      if (customResult !== true) {
        error = customResult;
      }
    } else {
      // Use built-in validators based on field name
      switch (name) {
        case 'email':
          if (!value) {
            error = 'Email is required';
          } else if (!validateEmail(value)) {
            error = 'Please enter a valid email address';
          }
          break;

        case 'password':
          if (!value) {
            error = 'Password is required';
          } else {
            const { isValid, errors } = validatePassword(value);
            if (!isValid) {
              error = errors[0]; // Use first error message
            }
          }
          break;

        case 'firstName':
        case 'lastName':
        case 'name':
          if (!value) {
            error = `${name === 'firstName' ? 'First name' : name === 'lastName' ? 'Last name' : 'Name'} is required`;
          } else {
            const { isValid, error: nameError } = validateName(value);
            if (!isValid) {
              error = nameError;
            }
          }
          break;

        case 'phone':
        case 'phoneNumber':
          if (value && !validatePhone(value)) {
            error = 'Please enter a valid phone number';
          }
          break;

        case 'confirmPassword':
          if (value !== values.password) {
            error = 'Passwords do not match';
          }
          break;
      }
    }

    // Update errors state
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: error
    }));

    return !error;
  }, [values, customValidators]);

  // Validate all form fields
  const validateForm = useCallback(() => {
    const formErrors = {};
    let isValid = true;

    // Validate each field
    Object.keys(values).forEach(name => {
      if (!validateField(name, values[name])) {
        isValid = false;
        formErrors[name] = errors[name] || 'Invalid field';
      }
    });

    setErrors(formErrors);
    return isValid;
  }, [values, errors, validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate all fields
    const isValid = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      logError('useFormValidation.handleSubmit', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit]);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues
  };
}
