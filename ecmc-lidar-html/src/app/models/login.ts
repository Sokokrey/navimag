export interface Login{
    _id? :string;
    email?:string;
    user: string,
    password?:string;
    name?:string;
    category?:number;
    token?:string;
    confirmPassword?:string;
    validated?:number;
    validate?:string;
    createdDate?:Date;
    url?:string
}