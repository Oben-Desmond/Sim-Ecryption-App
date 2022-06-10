import { IonAvatar, IonBadge, IonButton, IonCardContent, IonCardTitle, IonContent, IonHeader, IonImg, IonItem, IonLabel, IonNote, IonPage, IonProgressBar, IonSearchbar, IonSpinner, IonTitle, IonToolbar } from '@ionic/react';
import { request } from 'http';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import ExploreContainer from '../components/ExploreContainer';
import { fstore } from '../firebase';
import { selectUser } from '../state/userState';
import { getLocalUser } from '../storageAPIs';
import { ConnectRequest, User } from '../types/@entities';
import { showAlert } from './Login';
import './Requests.css';

const Tab2: React.FC = () => {
  const [requests, setrequests] = useState<ConnectRequest[]>([])
  const [loading, setloading] = useState<boolean>(false)
  const [user, setuser] = useState<User>()
  const history = useHistory()
  // userinfo info from selector
  const userInfo: User = useSelector(selectUser)

  useEffect(() => {
    getUser()
  }, [])

  async function getUser() {
    //user from redux selector store or from local storage
    const user = userInfo.email ? userInfo : await getLocalUser() as User | null

    if (user) {
      getRequests(user)
      setuser(user)
    }
    else {
      history.push('/auth')
    }
  }

  async function getRequests(user: User) {
    setloading(true)
    fstore.collection("crypto-users").doc(user.email).collection("requests").onSnapshot(function (querySnapshot) {
      const requests = querySnapshot.docs.map(doc => {
        return doc.data() as ConnectRequest
      })
      setloading(false)
      setrequests(requests)
      setloading(false)

    })
  }


  return (
    <IonPage>
      <IonHeader translucent={true} >
        <IonToolbar>
          <IonTitle>Requests to connect</IonTitle>
        </IonToolbar>
        {
          loading && <IonProgressBar type="indeterminate" />
        }
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <div className="ion-margin-start ion-margin-bottom">
              <IonLabel>Chat Requests</IonLabel>
            </div>
          </IonToolbar>
        </IonHeader>
        <IonToolbar color="none">
          {
            requests.map((request, index) => {
              return (
                <>{user && <RequestCard key={index} user={user} request={request}></RequestCard>}</>
              )
            })
          }

        </IonToolbar>

      </IonContent>
    </IonPage>
  );
};

export default Tab2;

const RequestCard: React.FC<{ request: ConnectRequest, user: User }> = ({ request, user }) => {
  // loading
  const [loading, setloading] = useState<boolean>(false)

  async function acceptRequest() {
    setloading(true)
    try {

      await fstore.collection("crypto-users").doc(request.contact.email).collection("contacts").doc(user.email).set(user)
      await fstore.collection("crypto-users").doc(user.email).collection("contacts").doc(request.contact.email).set(request.contact)
      await fstore.collection("crypto-users").doc(user.email).collection("requests").doc(request.contact.email).delete()
      await fstore.collection("crypto-users").doc(request.contact.email).collection("requests").doc(user.email).delete()

      showAlert("Success and Contact saved", "Request accepted")

    } catch (err: any) {
      showAlert(err.message || err, "Error")
    }
    setloading(false)

  }

  return (
    <IonItem className="request-item" color="none" lines="none">
      <IonAvatar slot="start">
        <IonImg src="https://ionicframework.com/docs/demos/api/avatar/avatar.svg" />
      </IonAvatar>
      <IonCardContent>
        <IonCardTitle>
          {request.contact.name}
        </IonCardTitle>
        <IonNote>
          <IonLabel>
            {request.contact.email}
          </IonLabel>
        </IonNote>
        <small>
          <p>
            {request.bio}
          </p>
        </small>
      </IonCardContent>
      <IonCardContent slot="end">
        {loading ? <IonSpinner /> : <IonButton onClick={() => { acceptRequest() }}>Accept</IonButton>}
      </IonCardContent>

    </IonItem>
  );
}

