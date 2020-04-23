import firebase from 'firebase'
import 'firebase/firestore'

// firebase init goes here
const config = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  applicationId: process.env.VUE_APP_FIREBASE_APP_ID,
	authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
	databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
	projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
	storageBucket: "",
	messagingSenderId: ""
}
firebase.initializeApp(config)

// firebase utils
const db = firebase.firestore()
const auth = firebase.auth()
const currentUser = auth.currentUser

// date issue fix according to firebase
const settings = {
    timestampsInSnapshots: true
}
db.settings(settings)

// firebase collections
const usersCollection = db.collection('users')
const activitiesCollection = db.collection('activities')


export {
    db,
    auth,
    currentUser,
    usersCollection,
    activitiesCollection,
}