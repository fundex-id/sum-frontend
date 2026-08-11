import { Tokens, UsersAttempt, UsersAttribute, UsersIdentity, UsersStatus } from "../types/auth.type";


//LOGIN
export interface LoginRequest 
extends Pick<UsersIdentity, 'email'> {
    password: string;
}

export interface LoginResponse 
extends UsersIdentity, 
    UsersAttribute, 
    Tokens {}


//REGISTER
export interface RegisterResponse 
extends UsersIdentity, 
        UsersAttribute, 
        UsersStatus, 
        UsersAttempt {}
  
export interface RegisterRequest 
extends Pick<UsersIdentity, 'email'> {
    password: string;
}
  

  
