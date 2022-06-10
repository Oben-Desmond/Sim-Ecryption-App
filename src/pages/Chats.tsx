import { IonAvatar, IonBadge, IonButton, IonButtons, IonCardContent, IonCardTitle, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonImg, IonItem, IonLabel, IonList, IonNote, IonPage, IonSearchbar, IonTitle, IonToolbar } from '@ionic/react';
import { add, imagesOutline, peopleOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import ChatPage from '../components/ChatPage';
import ContactsModal from '../components/ContactsModal';
import ExploreContainer from '../components/ExploreContainer';
import { fstore } from '../firebase';
import { selectUser } from '../state/userState';
import { getLocalUser, setLocalContacts } from '../storageAPIs';
import { ChatContact, ChatMessageMinified, User } from '../types/@entities';
import './Chats.css';

const Tab1: React.FC = () => {
  // startNewChat state
  const [startNewChat, setstartNewChat] = useState(false)
  const [chats, setchats] = useState<ChatContact[]>([])
  const [user, setuser] = useState<User>()
  const [loading, setloading] = useState<boolean>()
  const [contacts, setcontacts] = useState<User[]>([])
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
      getChats(user)
      getContacts(user)
    }
    else {
      history.push('/auth')
    }
  }


  async function getChats(user: User) {
    setloading(true)
    await fstore.collection("crypto-users").doc(user?.email).collection("chats").onSnapshot(function (querySnapshot) {
      const chats = querySnapshot.docs.map(doc => {
        return doc.data() as ChatContact
      })

      setchats(chats)
      setloading(false)
    })

  }

  // get contacts of user from firestore
  async function getContacts(user: User) {
    setloading(true)
    fstore.collection("crypto-users").doc(user?.email).collection("contacts").onSnapshot(function (querySnapshot) {
      const contacts = querySnapshot.docs.map(doc => {
        return doc.data() as User
      })
      if (contacts.length > 0) {
        setLocalContacts(contacts)
        setcontacts(contacts)
      }
      setloading(false)
    })

  }

  return (
    <IonPage>
      <IonHeader translucent={true} >
        <IonToolbar>
          <IonTitle>Crypto Chat</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setstartNewChat(true)}>
              <IonIcon icon={peopleOutline}></IonIcon>
              <IonBadge>{contacts.length}</IonBadge>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <div className="ion-margin-start ion-margin-bottom">
              <IonLabel>Crypto Chat</IonLabel>
            </div>
            <IonSearchbar></IonSearchbar>
          </IonToolbar>
        </IonHeader>
        <IonToolbar color="none" >
          {
            chats.map((chat, index) => {
              return (
                <ChatItem user={user!} chat={chat}></ChatItem>
              )
            })
          }
        </IonToolbar>
      </IonContent>
      <IonFab onClick={() => setstartNewChat(true)} className="add-fab" vertical="bottom" horizontal="end">
        <IonFabButton>
          <IonIcon icon={add}></IonIcon>
        </IonFabButton>
      </IonFab>

      <ContactsModal isOpen={startNewChat} onDidDismiss={() => { setstartNewChat(false) }}></ContactsModal>
    </IonPage>
  );
};

export default Tab1;



const ChatItem: React.FC<{ chat: ChatContact, user: User }> = ({ chat, user }) => {

  const [openChat, setopenChat] = useState(false)
  const [newChat, setnewChat] = useState(false)

  useEffect(() => {
    if (chat.contact.email === user.email) {
      setnewChat(true)
    }
  }, [chat])

  return (
    <>
      <IonItem onClick={() => { setopenChat(true); setnewChat(false) }} className="chat-item" color="none" lines="none">
        <IonAvatar slot="start">
          <IonImg src="https://ionicframework.com/docs/demos/api/avatar/avatar.svg" />
        </IonAvatar>
        <IonCardContent>
          <IonCardTitle>{chat.contact.name}</IonCardTitle>
          <IonNote>{chat.last_message.message || chat.last_message.attachments ? <><IonIcon size="small" icon={imagesOutline}></IonIcon> Photo</> : ""}</IonNote>
        </IonCardContent>
        <IonCardContent slot="end">
          <div> <small>{timeAgo(chat.last_message.timestamp)}</small></div>
          {newChat && <IonBadge >new</IonBadge>}
        </IonCardContent>
      </IonItem>
      <ChatPage modalOption={{ isOpen: openChat, onDidDismiss: () => setopenChat(false) }} contact={chat.contact} user={user} />
    </>
  )
}


function timeAgo(timestamp: number) {
  const date = new Date(timestamp)
  const now = new Date()
  const seconds = Math.round(Math.abs((now.getTime() - date.getTime()) / 1000))
  const minutes = Math.round(Math.abs((now.getTime() - date.getTime()) / 1000 / 60))
  const hours = Math.round(Math.abs((now.getTime() - date.getTime()) / 1000 / 60 / 60))
  const days = Math.round(Math.abs((now.getTime() - date.getTime()) / 1000 / 60 / 60 / 24))
  const months = Math.round(Math.abs((now.getTime() - date.getTime()) / 1000 / 60 / 60 / 24 / 30))
  const years = Math.round(Math.abs((now.getTime() - date.getTime()) / 1000 / 60 / 60 / 24 / 30 / 12))
  if (seconds < 60) { return 'Just now' }
  if (minutes < 60) { return `${minutes} minutes ago` }
  if (hours < 24) { return `${hours} hours ago` }
  if (days < 30) { return `${days} days ago` }
  if (months < 12) { return `${months} months ago` }
  return `${years} years ago`

}