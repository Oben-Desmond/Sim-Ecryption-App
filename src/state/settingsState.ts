
export interface Settings{
    language: string
    theme: "dark" | "light"
    autoDecrypt: boolean,

}


export const initSettings:Settings={
    language: "en",
    theme: "dark",
    autoDecrypt: false,
}

// update settings action
export const updateSettings = (settings:Settings) => {
    return {
        type: "UPDATE_SETTINGS",
        payload: settings
    }
}

// Reducer
export const settingsReducer = (state:Settings = initSettings, action:any) => {
    switch (action.type) {
        case "UPDATE_SETTINGS":
            return action.payload
        default:
            return state
    }
}


export const selectSettings = (state:any) => state.settingsReducer