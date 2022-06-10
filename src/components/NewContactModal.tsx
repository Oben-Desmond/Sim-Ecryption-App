import { IonAvatar, IonButton, IonContent, IonHeader, IonImg, IonInput, IonItem, IonModal, IonPage, IonProgressBar, IonTitle, IonToolbar } from '@ionic/react'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { fstore } from '../firebase';
import { showAlert } from '../pages/Login';
import { selectUser } from '../state/userState';
import { getLocalUser } from '../storageAPIs';
import { User } from '../types/@entities';


export interface ModalOption {
    onDidDismiss: (value?: any) => void;
    isOpen: boolean,
}

const defaultContact: User = {
    name: '',
    email: '',
    tel: '',
    password: '',
    public_key: '',
    private_key: ''
}

const NewContactModal: React.FC<{ modalOption: ModalOption }> = ({ modalOption }) => {

    const [contact, setcontact] = useState<User>(defaultContact)
    const [user, setuser] = useState<User>()
    const [loading, setloading] = useState<boolean>()
    const history = useHistory()
    // user info from selector
    const userInfo:User = useSelector(selectUser)

    useEffect(() => {
        getUser()
    }, [userInfo])

    async function getUser() {
        const user = userInfo.email?userInfo: await getLocalUser() as User | null
        if (user) {
            setuser(user)
        }
        else {
            modalOption.onDidDismiss()
            history.push('/auth')
        }
    }




    const btnRef = React.useRef<HTMLButtonElement>(null);

    function saveContact(ev: any) {

        ev.preventDefault()

        if (user?.email) {
            setloading(true)
            fstore.collection("crypto-users").doc(user?.email).collection("contacts").doc(contact.email).set(contact)
                .then(async (res) => {

                    await fstore.collection("crypto-users").doc(contact.email).collection("requests").doc(user?.email).set(user)
                    setloading(false)
                    showAlert("Contact added successfully", "Contact added")
                    setcontact(defaultContact)
                    modalOption.onDidDismiss()
                }).catch(err => {
                    setloading(false)
                    showAlert("Error", err.message)
                })
            
        }


        // modalOption.onDidDismiss()
    }

    return (
        <IonModal mode="ios" swipeToClose isOpen={modalOption.isOpen} onDidDismiss={() => modalOption.onDidDismiss()}>
            <IonHeader translucent={true}>
                <IonToolbar mode="ios">
                    <IonButton onClick={modalOption.onDidDismiss} slot="start" color="medium" fill="clear">Cancel</IonButton>
                    <IonTitle>New Contact</IonTitle>
                    <IonButton onClick={() => btnRef.current?.click()} slot="end" fill="clear">Done</IonButton>
                </IonToolbar>
            </IonHeader>
            {loading && <IonProgressBar color="tertiary" type='indeterminate'></IonProgressBar>}
            <IonContent>
                <form onSubmit={saveContact}>
                    <IonToolbar  >
                        <br /><br />
                        <IonAvatar style={{ margin: "auto", width: "70px", height: "70px" }}>
                            <IonImg src={"https://ionicframework.com/docs/demos/api/avatar/avatar.svg"}></IonImg>
                        </IonAvatar>
                        <br /><br />
                    </IonToolbar>
                    <IonToolbar color="none">
                        <IonItem color="none" lines="none">
                            <IonInput name={contact.name} required onIonChange={(e) => setcontact({ ...contact, name: e.detail.value! })} placeholder="Names"></IonInput>
                        </IonItem>
                        <hr />
                        <IonItem color="none" lines="none">
                            <IonInput name={contact.email} required onIonChange={(e) => setcontact({ ...contact, email: e.detail.value! })} placeholder="Email"></IonInput>
                        </IonItem>
                        <hr />
                        <IonItem color="none" lines="none">
                            <IonInput name={contact.tel} required onIonChange={(e) => setcontact({ ...contact, tel: e.detail.value! })} placeholder="Telephone"></IonInput>
                        </IonItem>
                        <hr />
                    </IonToolbar>
                    <button ref={btnRef} type="submit" style={{ visibility: "hidden" }} ></button>
                </form>
            </IonContent>
        </IonModal>
    )
}



export default NewContactModal