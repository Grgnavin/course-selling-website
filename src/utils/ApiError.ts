
class ApiError<T> extends Error{
    public success: boolean;
    public data: T | null;
    public message: string = "Something went wrong";

    constructor(data: T, message: string, success: boolean){
        super(message)
        this.data = data;
        this.message = message;
        this.success = success;
    }
}

export { ApiError }