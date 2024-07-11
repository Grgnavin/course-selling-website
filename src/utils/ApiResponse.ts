class ApiResponse<T> extends Error{
    public success: boolean;
    public data: T;
    public message: string = "Something went wrong";

    constructor(data: T, message: string){
        super(message)
        this.data = data;
        this.message = message;
        this.success = true;
    }
}

export { ApiResponse }