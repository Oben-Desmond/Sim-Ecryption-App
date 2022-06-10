import { IonAvatar, IonButton, IonButtons, IonCard, IonCardContent, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonFooter, IonGrid, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonModal, IonNote, IonPage, IonPopover, IonProgressBar, IonRow, IonSkeletonText, IonSpinner, IonTextarea, IonTitle, IonToolbar, useIonViewDidEnter } from '@ionic/react'
import { addCircle, arrowBack, checkmarkDoneOutline, checkmarkSharp, paperPlaneOutline } from 'ionicons/icons'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { app, fstore } from '../firebase'
import { showAlert } from '../pages/Auth'
import { selectSettings, Settings } from '../state/settingsState'
import { getLocalContacts } from '../storageAPIs'
import { ChatContact, ChatMessage, ChatMessageMinified, ConnectRequest, User } from '../types/@entities'
import { decryptMessage, encryptMessage } from './encryption'
import { ModalOption } from './NewContactModal'


// list of possible friend request messages
const friendRequestMessages = ["I will love to connect", "Reaching out to connect", "Connect with me", "public key required to connect"]

const ChatPage: React.FC<{ modalOption: ModalOption, contact: User, user: User }> = ({ modalOption, contact, user }) => {
    const { isOpen, onDidDismiss } = modalOption
    const [chats, setchats] = useState<ChatMessage[]>([])
    const [loading, setloading] = useState<boolean>(false)
    const [sending, setsending] = useState<boolean>(false)
    const [init, setinit] = useState(false)
    const [message, setmessage] = useState("")
    const [tempAttachment, settempAttachment] = useState("")
    const [tempFile, settempFile] = useState<Blob>()
    const [progress, setprogress] = useState<number>(0)
    const contentRef = useRef<HTMLIonContentElement>(null)
    const [noKeyWarning, setnoKeyWarning] = useState(false)


    useEffect(() => {
        verifyContactSaved()
    }, [])

    async function getChats() {

        setloading(true)
        fstore.collection("crypto-users").doc(user?.email).collection("chats").doc(contact.email).collection("messages").orderBy("timestamp", "asc").onSnapshot(async (res) => {
            const chats = res.docs.map(doc => doc.data()) as ChatMessage[]
            setchats(chats)
            console.log(chats, "chats")
            if(isOpen){
                MarkAsRead()
            }
            contentRef.current?.scrollToBottom(300)
            setloading(false)
            setTimeout(() => {
                contentRef.current?.scrollToBottom(300)
            }, 1000);
        })
       


    }
    
    function MarkAsRead() {
        // update chats where is_received property is false
        fstore.collection("crypto-users").doc(contact.email).collection("chats").doc(user?.email).collection("messages").where("is_received", "==", false).where("receiver_id","==",user?.email).get().then(async (res) => {
            if (res.empty) {
                return
            }
            res.docs.forEach(async (doc) => {
                const chat = doc.data() as ChatMessage
                chat.is_received = true
                chat.is_read = true
                await doc.ref.update(chat)
            })
        })
    }

    async function sendMessage() {

        // if no public key
        if (!contact.public_key) {
            setnoKeyWarning(true)
            return
        }

        if (!message && !tempAttachment) {
            showAlert("Please enter a message or attach a file", "Enter Message")
            return;
        }

        try {
            // send attachment to storage
            if (tempFile) {
                setsending(true)
                const storageRef = app.storage().ref("chats")
                const fileRef = storageRef.child(`${user?.email}/${contact.email}/${(tempFile as File).name}`)
                const uploadTask = fileRef.put(tempFile)
                uploadTask.on("state_changed", (snapshot) => {
                    // progress function
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    console.log(progress, "progress")
                    setprogress(progress)

                }, (error) => {
                    console.log(error, "error")
                }, async () => {
                    // complete function
                    const url = await fileRef.getDownloadURL()
                    console.log(url, "url")
                    sendMessageToDB(url)
                })
            } else {
                sendMessageToDB()
            }
        }
        catch (err) {
            console.log(err, "error")
            showAlert("Error", "Error sending message")
            setsending(false)
        }



    }

    async function sendMessageToDB(attachments: string = "") {

        const enc = encryptMessage(contact.public_key, message)
        const enc1 = encryptMessage(user.public_key, message)

        const chatmessage: ChatMessage = {
            message: enc.ciphertext,
            timestamp: Date.now(),
            sender_id: user.email,
            receiver_id: contact.email,
            sender_name: user.name,
            receiver_name: contact.name,
            attachments,
            is_read: false,
            is_sent: true,
            is_received: false,
            is_deleted: false,
            encryptionData: enc
        }

        const info: ChatMessageMinified = {
            message: enc1.ciphertext,
            timestamp: chatmessage.timestamp,
            attachments: chatmessage.attachments,
            is_read: false,
            is_sent: false,
            is_received: false,
            is_deleted: false
        }

        const minified1: ChatContact = {
            contact,
            last_message: info
        }
        const minified2: ChatContact = {
            contact: user,
            last_message: info
        }

        const messageId = Date.now() + user.email + contact.email



        setsending(true)
        await fstore.collection("crypto-users").doc(user!.email).collection("chats").doc(contact.email).collection("messages").doc(messageId).set({ ...chatmessage, message: enc1.ciphertext, encryptionData: enc1 }).then(async (res) => {
            await fstore.collection("crypto-users").doc(user!.email).collection("chats").doc(contact.email).set(minified1)
        }).catch(err => {
            showAlert(err.message, "Unable To send message")
        })
        contentRef.current?.scrollToBottom(300)
        setsending(false)
        // clear temporary states
        settempAttachment("")
        settempFile(undefined)
        setprogress(0)

        await fstore.collection("crypto-users").doc(contact.email).collection("chats").doc(user!.email).collection("messages").add(chatmessage)
            .then(async () => {
                await fstore.collection("crypto-users").doc(contact.email).collection("chats").doc(user.email).set(minified2)
                setmessage("")
            })
            .catch(err => {
                showAlert(err.message, "Unable To send message")
            })

        await fstore.collection("crypto-users").doc(user!.email).collection("chats").doc(contact.email).collection("messages").doc(messageId).update({ is_sent: true, is_received: false })


    }

    function addAttachment() {
        const picker = document.createElement("input")
        picker.type = "file"
        picker.accept = "image/*"
        picker.click()
        picker.onchange = async (ev: any) => {
            let file = ev.target.files[0]

            if (!file.type.includes("image")) {
                showAlert("Please select an image", "Invalid File Type")
                return
            }


            settempFile(file)

            //  File to base64 string
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = (ev: any) => {
                settempAttachment(reader.result!.toString())
            }


        }
    }




    async function verifyContactSaved() {
        // local contacts
        const contacts: User[] | null = await getLocalContacts()
        if (contacts) {
            const contactInfo = contacts.find(c => c.email === contact.email) as User | undefined
            if (contactInfo) {
                //  contact is saved locally
            }
        }
    }

    async function sendConnectionRequest() {
        // get random INTEGER number
        const random = Math.floor(Math.random() * 1000000)

        const request: ConnectRequest = {
            contact: user,
            bio: friendRequestMessages[random % friendRequestMessages.length],
            timestamp: Date.now(),
        }
        // setloading(true)
        try {
            await fstore.collection("crypto-users").doc(contact.email).collection("requests").doc(user.email).set(request)
            showAlert("Request sent, please wait for " + contact.name + " to respond", "Request sent");

        } catch (err: any) {
            showAlert(err.message || err, "Unable to send request")
        }
        // setloading(false)
    }
    return (
        <IonModal onDidPresent={() => {
            if (init == false) {
                getChats()
                setinit(true)
            }
        }} isOpen={isOpen} onIonModalWillPresent={() => { contentRef.current?.scrollToBottom(300) }} onDidDismiss={onDidDismiss} mode="ios" style={{ ["--min-width"]: "100%", ["--min-height"]: "100%" }}>
            <IonHeader translucent>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={onDidDismiss}>
                            <IonIcon slot="icon-only" icon={arrowBack} />
                        </IonButton>
                    </IonButtons>
                    <IonAvatar style={{ width: "35px", height: "35px", margin: "3px" }} slot="start" >
                        <IonImg src={"https://ionicframework.com/docs/demos/api/avatar/avatar.svg"}></IonImg>
                    </IonAvatar>
                    <IonTitle>{contact.name}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => contentRef.current?.scrollToBottom(400)}>
                            Latest
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>{
                loading && <IonProgressBar type='indeterminate' color="primary" />
            }
            <IonPopover isOpen={noKeyWarning} onDidDismiss={() => { setnoKeyWarning(false) }}>
                <IonContent>
                    <IonImg src={"https://miro.medium.com/max/1023/1*gNgxQTdrbgChf3U3JXrNYw.jpeg"}></IonImg>
                    <IonCardContent>
                        <IonCardSubtitle>In order to Encrypt data you need {contact.name}'s public key</IonCardSubtitle>
                    </IonCardContent>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonButton onClick={() => { setnoKeyWarning(false); sendConnectionRequest(); }}>
                                <IonLabel>Send</IonLabel>
                            </IonButton>
                            <IonButton color="danger" onClick={() => { setnoKeyWarning(false) }}>
                                <IonLabel>Cancel</IonLabel>
                            </IonButton>
                        </IonButtons>

                    </IonToolbar>
                </IonContent>
            </IonPopover>
            <IonContent ref={contentRef}>
                {
                    chats.map((chat, index) => {
                        return (
                            <ChatCard key={index} chat={chat} user={user} contact={contact} />
                        )
                    })
                }
                {
                    loading && <SkeletonLoader />
                }
            </IonContent>
            <IonFooter translucent>
                {tempAttachment && <IonToolbar>
                    {/* attachment image */}
                    {progress > 0 && <IonNote slot="end" color="success">{progress}%</IonNote>}
                    {tempAttachment && <img src={tempAttachment} style={{ width: "35px", height: "35px", objectFit: "cover" }} slot="start" />}
                </IonToolbar>}
                <IonToolbar className="ion-no-padding" style={{ padding: "5px 0px" }}>
                    <IonButton disabled={sending} onClick={addAttachment} fill="clear" slot="start">
                        <IonIcon icon={addCircle}></IonIcon>
                    </IonButton>
                    <IonItem color="light" fill="outline">
                        <IonTextarea disabled={sending} value={message} onIonChange={(e) => setmessage(e.detail.value!)} style={{ fontSize: "14px" }} placeholder="Enter Message" />
                        {
                            sending && <IonSpinner slot="end" />
                        }
                    </IonItem>
                    <IonButton disabled={sending} onClick={() => sendMessage()} style={{ transform: "rotate(40deg)" }} fill="clear" slot="end">
                        <IonIcon icon={paperPlaneOutline}></IonIcon>
                    </IonButton>
                </IonToolbar>
            </IonFooter>
        </IonModal>
    )
}

export default ChatPage




const ChatCard: React.FC<{ chat: ChatMessage, user: User, contact: User }> = ({ chat, user, contact }) => {

    const [mode, setmode] = useState<"sender" | "receiver">(chat.sender_id === user.email ? "sender" : "receiver")


    return (
        <>
            {mode == "sender" ? <ChatBubbleRight user={user} chat={chat} /> : <ChatBubbleLeft user={user} chat={chat} />}

        </>
    )
}

const SkeletonLoader: React.FC = () => {

    return (
        <IonGrid>
            <IonRow>
                <IonCol></IonCol>
                <IonCol size="9" sizeSm='8' sizeMd="6">
                    <IonSkeletonText style={{ borderRadius: "10px 10px 0px 10px", width: "100%", height: "20vh" }}> </IonSkeletonText>
                </IonCol>
            </IonRow>

            <IonRow>
                <IonCol size="9" sizeSm='8' sizeMd="6">
                    <IonSkeletonText style={{ borderRadius: "10px 10px 0px 10px", width: "100%", height: "20vh" }}> </IonSkeletonText>
                </IonCol>
                <IonCol></IonCol>
            </IonRow>
            <IonRow>
                <IonCol size="9" sizeSm='8' sizeMd="6">
                    <IonSkeletonText style={{ borderRadius: "10px 10px 0px 10px", width: "100%", height: "20vh" }}> </IonSkeletonText>
                </IonCol>
                <IonCol></IonCol>
            </IonRow>


        </IonGrid>
    )
}


const ChatBubbleRight: React.FC<{ user: User, chat: ChatMessage }> = ({ chat, user }) => {

    // select settings from store
    const settings: Settings = useSelector(selectSettings)

    const [decrypted_message_user, setdecrypted_message_user] = useState("")

    useEffect(() => {

        decryptChat()

    }, [])

    async function decryptChat() {

        try {
            const m = await decryptMessage(user.private_key, chat.encryptionData)
            setdecrypted_message_user(m)

        } catch (err) {
            console.log(err)
        }


    }

    return (
        <IonRow>
            <IonCol></IonCol>
            <IonCol size="9" sizeSm='8' sizeMd="auto">
                <IonCard mode="ios" style={{ borderRadius: "10px 10px 0px 10px" }}>
                    <div style={{ margin: "2px 8px", fontSize: "12px" }}><IonNote color="warning" className="header">{"You"}</IonNote>
                        <IonIcon style={{ "float": "right" }} color={chat.is_read ? "warning" : "medium"} icon={chat.is_read ? checkmarkDoneOutline : chat.is_received ? checkmarkSharp : ""}></IonIcon>
                    </div>

                    <div className="ion-padding">
                        {settings.autoDecrypt ? (decrypted_message_user || chat.message) : chat.message}
                    </div>
                    {chat.attachments && settings.autoDecrypt && <IonImg style={{ minHeight: "100px", background: "var(--ion-color-light)" }} src={chat.attachments}></IonImg>}
                    {
                        chat.attachments && !settings.autoDecrypt && <div className="ion-text-end" style={{ margin: "5px" }}> <small>Image Encrypted </small></div>
                    }
                    <div className="ion-text-end" style={{ margin: "5px" }}>
                        <small>
                            <GetTimeAMorPM time={chat.timestamp}></GetTimeAMorPM>
                        </small>
                    </div>
                </IonCard>
            </IonCol>
        </IonRow>
    )
}



const ChatBubbleLeft: React.FC<{ chat: ChatMessage, user: User }> = ({ chat, user }) => {
    const settings: Settings = useSelector(selectSettings)
    const [decrypted_message_contact, setdecrypted_message_contact] = useState("")
    useEffect(() => {

        decryptChat()

    }, [])

    async function decryptChat() {

        try {
            const m2 = await decryptMessage(user.private_key, chat.encryptionData)
            setdecrypted_message_contact(m2)

        } catch (err) {
            console.log(err)
        }
    }


    return (
        <IonRow>
            <IonCol size="9" sizeSm='8' sizeMd="auto">
                <IonCard mode="ios" style={{ borderRadius: "10px 10px 0px 10px" }}>
                    <small style={{ margin: "2px 8px" }}><IonNote color="warning" className="header">{chat.sender_name}</IonNote></small>
                    <div className="ion-padding">
                        {settings.autoDecrypt ? (decrypted_message_contact || chat.message) : chat.message}
                    </div>
                    {chat.attachments && settings.autoDecrypt && <IonImg style={{ minHeight: "100px", background: "var(--ion-color-light)" }} src={chat.attachments}></IonImg>}
                    {
                        chat.attachments && !settings.autoDecrypt && <div className="ion-text-end" style={{ margin: "5px" }}> <small>Image Encrypted </small></div>
                    }
                    <div className="ion-text-end" style={{ margin: "5px" }}>
                        <small>
                            <GetTimeAMorPM time={chat.timestamp}></GetTimeAMorPM>
                        </small>
                    </div>
                </IonCard>
            </IonCol>
            <IonCol></IonCol>
        </IonRow>
    )

}

export function GetTimeAMorPM(props: { time: number }) {
    const { time } = props;
    const date = new Date(time)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const hh = hours % 12 || 12
    const mm = minutes < 10 ? '0' + minutes : minutes
    return <span>{hh + ':' + mm + ' ' + ampm}</span>
}


