import { useQuasar } from 'quasar';

export interface AppError {
  type: 'validation' | 'upload' | 'network' | 'server' | 'unknown';
  message: string;
  userMessage: string;
  code?: string;
  details?: unknown;
}

// Define specific error response structures to avoid 'any' types
interface AxiosErrorResponse {
  status: number;
  data: {
    message?: string;
    detail?: unknown;
    errors?: unknown;
  };
}

interface NetworkError {
  code: string;
  message: string;
  response?: AxiosErrorResponse;
}

interface AxiosError {
  response: AxiosErrorResponse;
}

export function useErrorHandling() {
  const $q = useQuasar();

  // Create structured error objects based on error type
  const createError = (
    type: AppError['type'],
    message: string,
    userMessage: string,
    code?: string,
    details?: unknown
  ): AppError => {
    // Build the base error object
    const error: AppError = {
      type,
      message,
      userMessage
    };

    // Only add code if it's provided
    if (code !== undefined) {
      error.code = code;
    }

    // Only add details if they're provided
    if (details !== undefined) {
      error.details = details;
    }

    return error;
  };

  // Type guard functions to safely check error types
  const isNetworkError = (error: unknown): error is NetworkError => {
    return error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      'message' in error;
  };

  const isAxiosError = (error: unknown): error is AxiosError => {
    return error !== null &&
      typeof error === 'object' &&
      'response' in error &&
      error.response !== null &&
      typeof error.response === 'object' &&
      'status' in error.response;
  };

  // Parse different types of errors and convert them to our AppError format
  const parseError = (error: unknown): AppError => {
    // Handle network errors (no internet, server down, etc.)
    if (isNetworkError(error)) {
      // Check if it's a pure network error (no response from server)
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        return createError(
          'network',
          `Network error: ${error.message}`,
          'Unable to connect to the server. Please check your internet connection and try again.',
          'NETWORK_ERROR'
        );
      }
    }

    // Handle Axios HTTP errors (server responded with error status)
    if (isAxiosError(error)) {
      const status = error.response.status;
      const data = error.response.data;

      // Authentication errors - user needs to log in again
      if (status === 401) {
        return createError(
          'server',
          'Authentication failed',
          'Your session has expired. Please log in again.',
          'AUTH_ERROR'
        );
      }

      // Validation errors from server - input data was invalid
      if (status === 422) {
        const validationDetails = data.detail || data.errors || [];
        return createError(
          'validation',
          `Validation error: ${JSON.stringify(validationDetails)}`,
          'Please check your input and try again. Some fields may be missing or invalid.',
          'VALIDATION_ERROR',
          validationDetails
        );
      }

      // File upload errors - file too large
      if (status === 413) {
        return createError(
          'upload',
          'File too large',
          'One or more files are too large. Please reduce file size and try again.',
          'FILE_TOO_LARGE'
        );
      }

      // Server errors - something went wrong on the server side
      if (status >= 500) {
        return createError(
          'server',
          `Server error: ${status}`,
          'The server is experiencing issues. Please try again in a few minutes.',
          'SERVER_ERROR'
        );
      }

      // Rate limiting - user is making too many requests
      if (status === 429) {
        return createError(
          'server',
          'Rate limit exceeded',
          'You are posting too frequently. Please wait a moment and try again.',
          'RATE_LIMIT'
        );
      }

      // Generic HTTP errors - any other status code
      return createError(
        'server',
        `HTTP ${status}: ${data.message || 'Unknown error'}`,
        `Request failed with status ${status}. Please try again.`,
        `HTTP_${status}`
      );
    }

    // Handle JavaScript Error objects
    if (error instanceof Error) {
      // File upload specific errors based on message content
      if (error.message.includes('file')) {
        return createError(
          'upload',
          error.message,
          'There was a problem uploading your files. Please check file formats and sizes.',
          'UPLOAD_ERROR'
        );
      }

      // Generic Error object handling
      return createError(
        'unknown',
        error.message,
        'An unexpected error occurred. Please try again.',
        'UNKNOWN_ERROR'
      );
    }

    // Handle string errors (when someone throws a string)
    if (typeof error === 'string') {
      return createError(
        'unknown',
        error,
        'An unexpected error occurred. Please try again.',
        'UNKNOWN_ERROR'
      );
    }

    // Generic fallback for truly unknown error types
    return createError(
      'unknown',
      'Unknown error occurred',
      'An unexpected error occurred. Please try again.',
      'UNKNOWN_ERROR'
    );
  };

  // Display error to user with appropriate styling and actions
  const handleError = (error: unknown, context?: string) => {
    const appError = parseError(error);

    // Log detailed error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context || 'Error'}]`, appError);
    }

    // Show user-friendly notification
    $q.notify({
      type: 'negative',
      message: appError.message,
      position: 'top-right',
      timeout: appError.type === 'network' ? 8000 : 5000, // Network errors need more time
      actions: [
        {
          icon: 'close',
          color: 'white',
          handler: () => {}
        }
      ]
    });

    // Return the structured error for further handling if needed
    return appError;
  };

  // Validation helper functions for post content
  const validatePost = (message: string, images: File[], video: File | null): AppError[] => {
    const errors: AppError[] = [];

    // Check if post has any content at all
    if (!message.trim() && images.length === 0 && !video) {
      errors.push(createError(
        'validation',
        'Empty post',
        'Please add a message, images, or video before posting.',
        'EMPTY_POST'
      ));
    }

    // Validate message length (prevent extremely long posts)
    if (message.length > 2000) {
      errors.push(createError(
        'validation',
        'Message too long',
        'Your message is too long. Please keep it under 2000 characters.',
        'MESSAGE_TOO_LONG'
      ));
    }

    // Validate number of images (prevent too many uploads)
    if (images.length > 10) {
      errors.push(createError(
        'validation',
        'Too many images',
        'You can upload a maximum of 10 images per post.',
        'TOO_MANY_IMAGES'
      ));
    }

    // Check individual image files for size and type
    images.forEach((image, index) => {
      // Check file size (10MB limit per image)
      if (image.size > 10 * 1024 * 1024) {
        errors.push(createError(
          'validation',
          `Image ${index + 1} too large`,
          `Image ${index + 1} is too large. Please keep images under 10MB.`,
          'IMAGE_TOO_LARGE'
        ));
      }

      // Check file type (ensure it's actually an image)
      if (!image.type.startsWith('image/')) {
        errors.push(createError(
          'validation',
          `Invalid file type for image ${index + 1}`,
          `File ${index + 1} is not a valid image format.`,
          'INVALID_IMAGE_TYPE'
        ));
      }
    });

    // Validate video file if present
    if (video) {
      // Check video file size (100MB limit)
      if (video.size > 100 * 1024 * 1024) {
        errors.push(createError(
          'validation',
          'Video too large',
          'Video file is too large. Please keep videos under 100MB.',
          'VIDEO_TOO_LARGE'
        ));
      }

      // Check video type (ensure it's actually a video)
      if (!video.type.startsWith('video/')) {
        errors.push(createError(
          'validation',
          'Invalid video type',
          'The selected file is not a valid video format.',
          'INVALID_VIDEO_TYPE'
        ));
      }
    }

    return errors;
  };

  // Show validation errors to user with notifications
  const showValidationErrors = (errors: AppError[]) => {
    errors.forEach(error => {
      $q.notify({
        type: 'negative',
        message: error.userMessage,
        position: 'top-right',
        timeout: 5000,
        actions: [
          {
            icon: 'close',
            color: 'white',
            handler: () => {}
          }
        ]
      });
    });
  };

  return {
    createError,
    parseError,
    handleError,
    validatePost,
    showValidationErrors
  };
}
