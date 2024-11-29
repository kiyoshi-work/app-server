/**
 * This class defines constants for HTTP error codes.
 */
export class ExceptionConstants {
  /**
   * Constants for bad request HTTP error codes.
   */
  public static readonly BadRequestCodes = {
    MISSING_REQUIRED_PARAMETER: 40001, // Required parameter is missing from request
    INVALID_PARAMETER_VALUE: 40002, // Parameter value is invalid
    UNSUPPORTED_PARAMETER: 40003, // Request contains unsupported parameter
    INVALID_CONTENT_TYPE: 40004, // Content type of request is invalid
    INVALID_REQUEST_BODY: 40005, // Request body is invalid
    RESOURCE_ALREADY_EXISTS: 40906, // Resource already exists
    RESOURCE_NOT_FOUND: 40007, // Resource not found
    REQUEST_TOO_LARGE: 41308, // Request is too large
    REQUEST_ENTITY_TOO_LARGE: 41309, // Request entity is too large
    REQUEST_URI_TOO_LONG: 41410, // Request URI is too long
    UNSUPPORTED_MEDIA_TYPE: 41511, // Request contains unsupported media type
    METHOD_NOT_ALLOWED: 40512, // Request method is not allowed
    HTTP_REQUEST_TIMEOUT: 40813, // Request has timed out
    VALIDATION_ERROR: 40014, // Request validation error
    UNEXPECTED_ERROR: 40015, // Unexpected error occurred
    INVALID_INPUT: 40016, // Invalid input
  };

  /**
   * Constants for unauthorized HTTP error codes.
   */
  public static readonly UnauthorizedCodes = {
    UNAUTHORIZED_ACCESS: 40101, // Unauthorized access to resource
    INVALID_CREDENTIALS: 40102, // Invalid credentials provided
    JSON_WEB_TOKEN_ERROR: 401103, // JSON web token error
    AUTHENTICATION_FAILED: 40104, // Authentication failed
    ACCESS_TOKEN_EXPIRED: 40105, // Access token has expired
    TOKEN_EXPIRED_ERROR: 40106, // Token has expired error
    UNEXPECTED_ERROR: 40107, // Unexpected error occurred
    RESOURCE_NOT_FOUND: 40108, // Resource not found
    USER_NOT_VERIFIED: 40109, // User not verified
    REQUIRED_RE_AUTHENTICATION: 40110, // Required re-authentication
    INVALID_RESET_PASSWORD_TOKEN: 40111, // Invalid reset password token
  };

  /**
   * Constants for internal server error HTTP error codes.
   */
  public static readonly InternalServerErrorCodes = {
    INTERNAL_SERVER_ERROR: 50001, // Internal server error
    DATABASE_ERROR: 50002, // Database error
    NETWORK_ERROR: 50003, // Network error
    THIRD_PARTY_SERVICE_ERROR: 50204, // Third party service error
    SERVER_OVERLOAD: 50305, // Server is overloaded
    UNEXPECTED_ERROR: 50006, // Unexpected error occurred
  };

  /**
   * Constants for forbidden HTTP error codes.
   */
  public static readonly ForbiddenCodes = {
    FORBIDDEN: 40301, // Access to resource is forbidden
    MISSING_PERMISSIONS: 40302, // User does not have the required permissions to access the resource
    EXCEEDED_RATE_LIMIT: 42903, // User has exceeded the rate limit for accessing the resource
    RESOURCE_NOT_FOUND: 40004, // The requested resource could not be found
    TEMPORARILY_UNAVAILABLE: 40005, // The requested resource is temporarily unavailable
  };
}
