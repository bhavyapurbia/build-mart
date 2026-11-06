class ApiResponse {
  constructor(statusCode, data = null, message = "Success") {
    this.statusCode = statusCode;
    this.message = message;
    this.success = statusCode < 400;
    this.data = data;

    // Spread object fields at root level for seamless backwards-compatibility with existing frontend
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      Object.assign(this, data);
    }
  }
}

export { ApiResponse };
