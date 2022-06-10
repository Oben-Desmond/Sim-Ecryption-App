import { IEncryptedMsg } from "../components/encryption";


export interface User {
    name: string,
    email: string,
    tel: string,
    password: string,
    public_key: string,
    private_key: string,
}


export interface ChatMessage {
    message: string,
    timestamp: number,
    sender_id: string,
    receiver_id: string,
    sender_name: string,
    receiver_name: string,
    attachments: string,
    is_read: boolean,
    is_sent: boolean,
    is_received: boolean,
    is_deleted: boolean,
    encryptionData:IEncryptedMsg
}

export interface ChatMessageMinified {
    message: string,
    timestamp: number,
    attachments: string,
    is_read: boolean,
    is_sent: boolean,
    is_received: boolean,
    is_deleted: boolean,
}


export interface ChatContact {
    contact: User,
    last_message: ChatMessageMinified,

}


export interface ConnectRequest{
    contact:User,
    bio:string,
    timestamp:number,
}