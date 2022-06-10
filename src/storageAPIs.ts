import { Storage } from "@capacitor/storage"
import { User } from "./types/@entities"


export const set = async (key: string, value: any) => {
    return await Storage.set({
        key,
        value: JSON.stringify(value)
    })
}

export const get = async (key: string) => {
    const ret = await Storage.get({ key })
    if (ret.value) {
        return JSON.parse(ret.value)
    }
    return null
}


export const getLocalUser = async () => {
    const user = await get("user")
    !user && alert("unable to get user information")
    return user;
}

// set local user
export const setLocalUser = async (user: User) => {
    return await set("user", user)
}

export const getLocalContacts = async () => {
    const contacts = await get("contacts")
    !contacts && alert("unable to get contacts")
    return contacts as User[]|null;
}

export const setLocalContacts = async (contacts: User[]) => {
    return await set("contacts", contacts)
}