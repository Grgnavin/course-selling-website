class ApiResponse<T>{
    public success: boolean;
    public data: T;
    public message: string;

    constructor(data: T, message: string, success: boolean){
        this.data = data;
        this.message = message;
        this.success = success;
    }
}

export { ApiResponse }