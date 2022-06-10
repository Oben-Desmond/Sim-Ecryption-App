import { User } from "../types/@entities"

const initUser:User={
    name: "",
    email: "",
    tel: "",
    password: "",
    public_key: "",
    private_key: ""
}


// update user action
export const updateUser = (user:User) => {
    return {
        type: "UPDATE_USER",
        payload: user
    }
}

// Reducer
export const userReducer = (state:User = initUser, action:any) => {
    switch (action.type) {
        case "UPDATE_USER":
            return action.payload
        default:
            return state
    }
}

export const selectUser = (state:any) => state.userReducer