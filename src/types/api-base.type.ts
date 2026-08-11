export interface ApiBaseResponse<T> {
    statusCode: number;
    message: string;
    data: T; 
  }