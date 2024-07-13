
class ApiError<T> extends Error{
    public success: boolean;
    public data: T | null;
    constructor(data: T, message: string, success: boolean){
        super(message)
        this.data = null;
        this.message = message;
        this.success = success;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

export { ApiError }