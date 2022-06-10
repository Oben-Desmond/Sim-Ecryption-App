import { IonButton, IonCardSubtitle, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonNote, IonPage, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import { refresh } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ExploreContainer from '../components/ExploreContainer';
import { selectSettings, Settings, updateSettings } from '../state/settingsState';
import { selectUser } from '../state/userState';
import { getLocalUser } from '../storageAPIs';
import { User } from '../types/@entities';
import './Tab3.css';

const Setings: React.FC = () => {
  // user
  const [user, setuser] = useState<User>()
  // user info from store
  const userInfo: User = useSelector(selectUser)
  // settings from store
  const settings: Settings = useSelector(selectSettings)
  // dispatch
  const dispatch = useDispatch()

  useEffect(() => {
    getUser()
  }, [userInfo])

  async function getUser() {
    // get local user or from user info
    const user = userInfo.email ? userInfo : await getLocalUser() as User | null
    if (user) {
      setuser(user)
    }
  }
  function updateDecrptionSettings(checked:boolean){
    dispatch(updateSettings({...settings,autoDecrypt:checked}))
  }
  return (
    <IonPage>
      <IonHeader mode="ios" translucent>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
          <IonButton routerLink='/auth' slot="end" fill="clear">Logout</IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {[
          {
            name: "Name",
            value: user?.name
          },
          {
            name: "Email",
            value: user?.email
          },
          {
            name: "tel",
            value: user?.tel
          }

        ].map((prop, index) => {
          return (
            <>
              <IonItem color="none" lines="none" key={index}>
                <IonLabel>{prop.name}</IonLabel>
              </IonItem>
              <IonItem>
                <IonCardSubtitle>{prop.value}</IonCardSubtitle>
              </IonItem>
            </>

          )
        })

        }
        <IonToolbar color="none"></IonToolbar>
        <div>
          <IonItem color="light" lines="none">
            <div>Auto Decrypt Messages</div>
            <IonToggle onIonChange={(e)=>{updateDecrptionSettings(e.detail.checked)}} checked={settings.autoDecrypt} slot="end"></IonToggle>
          </IonItem>
          <IonItem color="light" lines="none">
            <div>Dark Theme</div>
            <IonToggle checked={settings.theme=="dark"} slot="end"></IonToggle>
          </IonItem>
          <IonItem color="light" lines="none">
            <div>Language</div>
            <span slot="end">English</span>
          </IonItem>
          <IonItem href="/" button color="light" lines="none">
             Refresh App
             <IonIcon slot="end" icon={refresh}></IonIcon>
          </IonItem>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default Setings;
