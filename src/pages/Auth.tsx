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
import { generateKeys } from '../components/encryption';
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


const Auth: React.FC = () => {
    const [user, setuser] = useState<User>(defaultUser)
    // show hide password state
    const [showPassword, setShowPassword] = useState(false);
    const history = useHistory();
    const [loading, setloading] = useState(false)
    // dispatch
    const dispatch = useDispatch()

    useEffect(() => {


    }, [])

    async function signIn(ev: any) {
        ev.preventDefault()
        const {private_key, public_key} = generateKeys()
        const temp: User = {
            ...user,
            public_key,
            private_key
        }
        setloading(true)
        await auth.createUserWithEmailAndPassword(temp.email, temp.password)
            .then(() => {
                console.log('signed in')
                //    add crypto user to database
                return fstore.collection('crypto-users').doc(temp.email).set(temp)
                    .then(() => {
                        showAlert("You have successfully signed in", 'signed in')
                        // dispatch user to store
                        dispatch(updateUser(temp))
                        setLocalUser(temp)
                        history.push('/tab1')

                    }).catch(err => {
                        showAlert(err.message, 'Unable to Add User to Database')
                    })

            }).catch(err => {
                showAlert(err.message, 'Error signing in')
            })
        setloading(false)

    }

    return (
        <IonPage>
            <IonHeader mode="ios" translucent>
                <IonToolbar>
                    <IonTitle>Crypto Chat App</IonTitle>
                    <IonButton routerLink="/login" slot="end" fill="clear">Login</IonButton>
                </IonToolbar>
            </IonHeader>
            {
                loading && <IonProgressBar type="indeterminate" color="primary" />
            }
            <IonContent fullscreen>

                <form className="ion-padding" onSubmit={signIn}>
                    <IonItem disabled={loading} color="none" lines="none" >
                        <IonInput value={user.name} onIonChange={(e) => setuser({ ...user, name: e.detail.value! })} required placeholder="Name" />
                    </IonItem>
                    <IonItem disabled={loading} lines="none" >
                        <IonInput value={user.email} onIonChange={(e) => setuser({ ...user, email: e.detail.value! })} required placeholder="Email" type="email" />
                    </IonItem>

                    <IonItem  disabled={loading}color="none" lines="none" >
                        <IonInput value={user.tel} onIonChange={(e) => setuser({ ...user, tel: e.detail.value! })} required placeholder="tel" />
                    </IonItem>
                    <IonItem  disabled={loading} color="light" lines="none" >
                        <IonInput value={user.password} onIonChange={(e) => setuser({ ...user, password: e.detail.value! })} required placeholder="Password" type={!showPassword ? "password" : "text"} />
                        <IonButton onClick={() => setShowPassword(!showPassword)} fill="clear"><IonIcon icon={showPassword ? eyeOutline : eyeOffOutline} /></IonButton>
                    </IonItem>
                    <br />
                    <br />
                    <IonButton type="submit" fill="solid" >Submit</IonButton>
                </form>
                <br />
                <br />

            </IonContent>
        </IonPage>
    );
};

export default Auth;



export function showAlert(message: string, title = "Alert") {
    Dialog.alert({ message, title, })
}