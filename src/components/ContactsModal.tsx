import { IonAvatar, IonButton, IonButtons, IonCardContent, IonCardTitle, IonContent, IonHeader, IonIcon, IonImg, IonItem, IonLabel, IonModal, IonNote, IonProgressBar, IonSearchbar, IonTitle, IonToolbar } from '@ionic/react'
import { personOutline } from 'ionicons/icons'
import React, { useEffect, useState } from 'react'
import NewContactModal from './NewContactModal'

import { Animation } from '@ionic/core';
import { fstore } from '../firebase';
import { showAlert } from '../pages/Login';
import { getLocalUser } from '../storageAPIs';
import { User } from '../types/@entities';
import { useHistory } from 'react-router';
import ChatPage from './ChatPage';
import { useSelector } from 'react-redux';
import { selectUser } from '../state/userState';


const defaultContact: User = {
  name: '',
  email: '',
  tel: '',
  password: '',
  public_key: '',
  private_key: ''
}


const ContactsModal: React.FC<{ isOpen: boolean, onDidDismiss: () => void }> = ({ isOpen, onDidDismiss }) => {
  const [addContact, setaddContact] = useState(false)
  const [user, setuser] = useState<User>()
  const [loading, setloading] = useState<boolean>(false)
  // contacts state
  const [contacts, setcontacts] = useState<User[]>([])
  const [search, setsearch] = useState<string>("")
  const [searchResults, setsearchResults] = useState<User[]>([])
  const [searching, setsearching] = useState<boolean>(false)
  const userInfo:User = useSelector(selectUser)

  const history = useHistory()

  useEffect(() => {
  
      setloading(true)
      getUser()
      setloading(false)
    
  }, [userInfo])

  async function getUser() {
    const user = userInfo.email?userInfo: await getLocalUser() as User | null
    if (user) {
      setuser(user)
      getContact(user)
    }
    else {

      history.push('/auth')
    }
    
  }




  const btnRef = React.useRef<HTMLButtonElement>(null);

  function getContact(user:User) {
    if (user) {
      setloading(true)
      fstore.collection("crypto-users").doc(user?.email).collection("contacts").onSnapshot(snapshot => {
        const contacts = snapshot.docs.map(doc => {
          return ({
            ...doc.data()
          })
        }) as User[]
        setloading(false)
        setcontacts(contacts)
        setsearchResults(contacts)
      })
    } else {
      showAlert("Error", "User not found")
      history.push('/auth')
    }


    // modalOption.onDidDismiss()
  }

  function searchContact(text:string){
    if(text==""){
      setsearchResults(contacts)
      return
    }
    setsearching(true)
    setsearchResults(contacts.filter(contact => {
      return contact.name.toLowerCase().includes(text.toLowerCase())
    }))


  }


  return (
    <IonModal swipeToClose mode="ios" onDidDismiss={onDidDismiss} isOpen={isOpen}>
      <IonHeader collapse="fade">
        <IonToolbar>
          <IonButton fill="clear" onClick={onDidDismiss} >
            <small>Close</small>
          </IonButton>
          <IonTitle>New Chat</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar onIonChange={(e)=>searchContact(e.detail.value!)} ></IonSearchbar>
        </IonToolbar>
      </IonHeader>
      {loading && <IonProgressBar color="tertiary" type='indeterminate'></IonProgressBar>}
      <IonContent>
        <IonItem onClick={() => setaddContact(true)} lines="none">
          <IonIcon icon={personOutline} slot="start"></IonIcon>
          <p>New Contact</p>
        </IonItem>
        {
          searchResults.map((contact, index) => {
            return (
              <div key={index}>
                <ContactItem contact={contact} user={user!}></ContactItem>
              </div>
            )
          })
        }
      </IonContent>
      <NewContactModal modalOption={{ isOpen: addContact, onDidDismiss: () => setaddContact(false) }}></NewContactModal>
    </IonModal>
  )
}

export default ContactsModal



const ContactItem: React.FC<{ contact: User, user: User }> = ({ contact, user }) => {
  const [openChat, setopenChat] = useState(false)
  const [loading, setloading] = useState<boolean>(false)


  return (
    <>
      <IonItem onClick={() => { setopenChat(true) }} button className="request-item" color="none" lines="none">
        <IonAvatar slot="start">
          <IonImg src="https://ionicframework.com/docs/demos/api/avatar/avatar.svg" />
        </IonAvatar>
        <IonCardContent>
          <IonCardTitle>{contact.name}</IonCardTitle>
          <IonNote>
            <IonLabel>{contact.email}</IonLabel>
          </IonNote>
        </IonCardContent>
      </IonItem>
      <ChatPage modalOption={{ isOpen: openChat, onDidDismiss: () => setopenChat(false) }} contact={contact} user={user}></ChatPage>
    </>
  );
}
