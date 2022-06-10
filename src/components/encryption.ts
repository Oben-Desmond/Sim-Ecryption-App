import nacl from "tweetnacl"
import util from "tweetnacl-util"




export function generateKeys(){

    const keypair = nacl.box.keyPair()
    const receiverPublicKey = util.encodeBase64(keypair.publicKey)
    const receiverSecretKey = util.encodeBase64(keypair.secretKey)

    return ({
        public_key: receiverPublicKey,
        private_key: receiverSecretKey
    })
}

/* encrypted message interface */
export interface IEncryptedMsg {
    ciphertext: string
    ephemPubKey: string
    nonce: string
    version: string
}



/* This function encrypts a message using a base64 encoded
** publicKey such that only the corresponding secretKey will
** be able to decrypt
*/
export function encryptMessage(receiverPublicKey: string, msgParams: string) {

    const ephemeralKeyPair = nacl.box.keyPair()
    const pubKeyUInt8Array = util.decodeBase64(receiverPublicKey)
    const msgParamsUInt8Array = util.decodeUTF8(msgParams)
    const nonce = nacl.randomBytes(nacl.box.nonceLength)
    const encryptedMessage = nacl.box(
        msgParamsUInt8Array,
        nonce,
        pubKeyUInt8Array,
        ephemeralKeyPair.secretKey
    )

    return {
        ciphertext: util.encodeBase64(encryptedMessage),
        ephemPubKey: util.encodeBase64(ephemeralKeyPair.publicKey),
        nonce: util.encodeBase64(nonce),
        version: "x25519-xsalsa20-poly1305"
    } as IEncryptedMsg;

}/* Decrypt a message with a base64 encoded secretKey (privateKey) */


export async function decryptMessage(receiverSecretKey: string, encryptedData: IEncryptedMsg) {

    const receiverSecretKeyUint8Array = util.decodeBase64(
        receiverSecretKey
    )
    const nonce = util.decodeBase64(encryptedData.nonce)
    const ciphertext = util.decodeBase64(encryptedData.ciphertext)
    const ephemPubKey = util.decodeBase64(encryptedData.ephemPubKey)
    const decryptedMessage = nacl.box.open(
        ciphertext,
        nonce,
        ephemPubKey,
        receiverSecretKeyUint8Array
    )

    return util.encodeUTF8(decryptedMessage!)
}