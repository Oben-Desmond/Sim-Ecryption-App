import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import React, { useState } from 'react'

const NewContact:React.FC = () => {
  
  return (
   <IonPage>
       <IonHeader>
           <IonToolbar mode="ios">
               <IonButton slot="start" fill="clear">Cancel</IonButton>
               <IonTitle>New Contact</IonTitle>
           </IonToolbar>
       </IonHeader>
       <IonContent>

       </IonContent>
       
   </IonPage>
  )
}



export default NewContact