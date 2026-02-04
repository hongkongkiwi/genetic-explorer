/**
 * Standardized Form Validation Hook
 * 
 * Uses Zod for schema validation with TanStack Form integration
 * Provides consistent validation patterns across all forms
 */

import { useState, useCallback } from 'react';
import { z, type ZodSchema, type ZodError } from 'zod';

// Common validation schemas
export const schemas = {
  email: z.string().email('Please enter a valid email address'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  passwordConfirm: (passwordField: string = 'password') =>
    z.string().refine((val) => val === passwordField, {
      message: 'Passwords do not match',
    }),
  
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  
  required: (fieldName: string) =>
    z.string().min(1, `${fieldName} is required`),
};

export interface ValidationError {
  field: string;
  message: string;
}

export interface UseFormValidationOptions<T> {
  schema: ZodSchema<T>;
  initialValues: T;
  onSubmit: (values: T) => Promise<void> | void;
}

export interface UseFormValidationReturn<T> {
  values: T;
  errors: ValidationError[];
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  setValue: (field: keyof T, value: any) => void;
  setTouched: (field: keyof T, touched?: boolean) => void;
  validate: () => boolean;
  validateField: (field: keyof T) => boolean;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
  getFieldError: (field: keyof T) => string | undefined;
}

export function useFormValidation<T extends Record<string, any>>(
  options: UseFormValidationOptions<T>
): UseFormValidationReturn<T> {
  const { schema, initialValues, onSubmit } = options;
  
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when value changes
    setErrors((prev) => prev.filter((e) => e.field !== field));
  }, []);

  const setTouched = useCallback((field: keyof T, touched: boolean = true) => {
    setTouchedState((prev) => ({ ...prev, [field as string]: touched }));
  }, []);

  const validate = useCallback((): boolean => {
    try {
      schema.parse(values);
      setErrors([]);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        setErrors(validationErrors);
      }
      return false;
    }
  }, [schema, values]);

  const validateField = useCallback(
    (field: keyof T): boolean => {
      try {
        // Create a partial schema for just this field
        const fieldSchema = schema instanceof z.ZodObject 
          ? (schema as z.ZodObject<any>).shape[field as string]
          : null;
        
        if (fieldSchema) {
          fieldSchema.parse(values[field]);
        }
        
        // Remove error for this field
        setErrors((prev) => prev.filter((e) => e.field !== field));
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const message = error.errors[0]?.message || 'Invalid value';
          setErrors((prev) => [
            ...prev.filter((e) => e.field !== field),
            { field: field as string, message },
          ]);
        }
        return false;
      }
    },
    [schema, values]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouchedState(allTouched);

      if (!validate()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, onSubmit, values]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors([]);
    setTouchedState({});
    setIsSubmitting(false);
  }, [initialValues]);

  const getFieldError = useCallback(
    (field: keyof T): string | undefined => {
      return touched[field as string]
        ? errors.find((e) => e.field === field)?.message
        : undefined;
    },
    [errors, touched]
  );

  const isValid = errors.length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setTouched,
    validate,
    validateField,
    handleSubmit,
    reset,
    getFieldError,
  };
}

// Hook specifically for password validation with strength indicator
export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function usePasswordValidation() {
  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    label: 'Too weak',
    color: 'text-red-600',
    requirements: {
      minLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecial: false,
    },
  });

  const validatePassword = useCallback((password: string): PasswordStrength => {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    const passedCount = Object.values(requirements).filter(Boolean).length;
    const score = Math.min(4, Math.floor((passedCount / 5) * 4));

    let label = 'Too weak';
    let color = 'text-red-600';

    switch (score) {
      case 0:
      case 1:
        label = 'Weak';
        color = 'text-red-600';
        break;
      case 2:
        label = 'Fair';
        color = 'text-yellow-600';
        break;
      case 3:
        label = 'Good';
        color = 'text-blue-600';
        break;
      case 4:
        label = 'Strong';
        color = 'text-green-600';
        break;
    }

    const result = { score, label, color, requirements };
    setStrength(result);
    return result;
  }, []);

  return {
    strength,
    validatePassword,
  };
}
