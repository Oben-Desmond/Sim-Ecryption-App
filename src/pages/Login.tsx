import { IonButton, IonCardSubtitle, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonNote, IonPage, IonProgressBar, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab3.css';
// import tweetnacl from "tweetnacl"
// import tweetnaclUtil from "tweetnacl-util"
import { useEffect, useState } from 'react';
import { User } from '../types/@entities';
import { eye, eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { auth, fstore } from '../firebase';
import { Dialog } from "@capacitor/dialog"
import { useHistory } from 'react-router';
import { setLocalUser } from '../storageAPIs';
import { useDispatch } from 'react-redux';
import { updateUser } from '../state/userState';




// let nacl = {
//     ...tweetnacl,
//     util: tweetnaclUtil
// }

const defaultUser: User = {
    name: '',
    email: '',
    tel: '',
    password: '',
    public_key: 'public_key',
    private_key: 'private_key'
}


const Login: React.FC = () => {
    const [user, setuser] = useState<User>(defaultUser)
    // show hide password state
    const [showPassword, setShowPassword] = useState(false);
    const history = useHistory();
    const [loading, setloading] = useState(false)
    // dispatch
    const dispatch = useDispatch()

    useEffect(() => {


    }, [])

    async function Login(ev: any) {
        ev.preventDefault()
        const temp: User = {
            ...user,

        }

        setloading(true)
        await auth.signInWithEmailAndPassword(temp.email, temp.password)
            .then(async () => {
                console.log('log in')
                await fstore.collection('crypto-users').doc(temp.email).get().then(doc => {
                    if (doc.exists) {
                        console.log(doc.data())
                        showAlert("You have successfully logged in", 'logged in')
                        const user = doc.data() as User
                        //    dispatch user to store
                        dispatch(updateUser(user))
                        setLocalUser(user)
                        history.push('/tab1')
                    }
                })
                setloading(false)

            }).catch(err => {
                showAlert(err.message, 'Error loging in')
            })
    }

    return (
        <IonPage>
            <IonHeader mode="ios" translucent>
                <IonToolbar>
                    <IonTitle>Crypto Chat App</IonTitle>
                    <IonButton routerLink="/auth" slot="end" fill="clear">Sign Up</IonButton>
                </IonToolbar>
            </IonHeader>
            {loading && <IonProgressBar color="tertiary" type='indeterminate'></IonProgressBar>}
            <IonContent fullscreen>

                <form className="ion-padding" onSubmit={Login}>

                    <IonItem disabled={loading} lines="none" >
                        <IonInput value={user.email} onIonChange={(e) => setuser({ ...user, email: e.detail.value! })} required placeholder="Email" type="email" />
                    </IonItem>
                    <IonItem disabled={loading} color="light" lines="none" >
                        <IonInput value={user.password} onIonChange={(e) => setuser({ ...user, password: e.detail.value! })} required placeholder="Password" type={!showPassword ? "password" : "text"} />
                        <IonButton onClick={() => setShowPassword(!showPassword)} fill="clear"><IonIcon icon={showPassword ? eyeOutline : eyeOffOutline} /></IonButton>
                    </IonItem>
                    <br />
                    <br />
                    <IonButton disabled={loading} type="submit" fill="solid" >Submit</IonButton>
                </form>
                <br />
                <br />

            </IonContent>
        </IonPage>
    );
};

export default Login;



export function showAlert(message: string, title = "Alert") {
    Dialog.alert({ message, title, })
}