export class ApiResponse {
    constructor(statusCode, message="request successfull", data) {
        this.success = statusCode < 400
        this.statusCode = statusCode
        this.message = message
        this.data = data
    }
}

