import firebase from "firebase";


const config = {

    apiKey: "AIzaSyCfyn-tKgI0fatEZlbwNPqKIVNHrw0-7lc",

    authDomain: "messaging-projects.firebaseapp.com",

    databaseURL: "https://messaging-projects.firebaseio.com",

    projectId: "messaging-projects",

    storageBucket: "messaging-projects.appspot.com",

    messagingSenderId: "1001641803012",

    appId: "1:1001641803012:web:6b4327220db40f7a3ba451",

    measurementId: "G-W2GKGW0BM1"

};



export const app = firebase.initializeApp(config)
export const fstore = app.firestore()
export const auth = app.auth()

