import { Redirect, Route, useHistory, useLocation } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { chatbox, chatboxEllipsesOutline, chatboxOutline, cogOutline, ellipse, peopleOutline, settingsSharp, square, triangle } from 'ionicons/icons';
import Tab1 from './pages/Chats';
import Tab2 from './pages/Requests';
import Tab3 from './pages/Tab3';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import "./App.css"

/* Theme variables */
import './theme/variables.css';
import NewContact from './pages/NewContact';
import { useEffect, } from 'react';
import Auth from './pages/Auth';
import Login from './pages/Login';

setupIonicReact();

const App: React.FC = () => {


  return (
    <IonApp>
      <IonReactRouter >

        <IonTabs  >
          <IonRouterOutlet>
            <Menu></Menu>
            <Route exact path="/tab1">
              <Tab1 />
            </Route>
            <Route exact path="/new-contact">
              <NewContact />
            </Route>
            <Route exact path="/tab2">
              <Tab2 />
            </Route>
            <Route path="/tab3">
              <Tab3 />
            </Route>
            <Route exact path="/">
              <Redirect to="/tab1" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar translucent={true} slot="bottom">
            <IonTabButton tab="tab1" href="/tab1">
              <IonIcon icon={chatboxEllipsesOutline} />
              <IonLabel>Chats</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab2" href="/tab2">
              <IonIcon icon={peopleOutline} />
              <IonLabel>Requests</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab3" href="/tab3">
              <IonIcon icon={cogOutline} />
              <IonLabel>Settings</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
        <Route path="/auth">
          <Auth />
        </Route>
        <Route path="/login">
          <Login />
        </Route>
      </IonReactRouter>
    </IonApp>
  )
};

export default App;


function Menu() {

  const location = useLocation();

  useEffect(() => {
    console.log(location.pathname)
  }, [location])

  return (

    <></>

  )
}