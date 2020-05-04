import Vue from 'vue'
import Vuex from 'vuex'
const fb = require('./firebaseConfig.js')

Vue.use(Vuex)

// handle page reload
fb.auth.onAuthStateChanged(user => {
    if (user) {
        store.commit('setCurrentUser', user)
        store.dispatch('fetchUserProfile')
        fb.usersCollection.doc(user.uid).onSnapshot(doc => {
            store.commit('setUserProfile', doc.data())
        })

        fb.habitsCollection.where('userId', '==', store.state.currentUser.uid).orderBy('createdOn', 'desc').onSnapshot(querySnapshot => {
            let habitsArray = []

            querySnapshot.forEach(doc => {
                let habit = doc.data()
                habit.id = doc.id
                habitsArray.push(habit)
            })
            
            store.commit('setHabits', habitsArray)
        })
    }
})

export const store = new Vuex.Store({
    state: {
        currentUser: null,
        userProfile: {},
        habits: [],
    },
    actions: {
        clearData({ commit }) {
            commit('setCurrentUser', null)
            commit('setUserProfile', {})
            commit('setHabits', null)
        },
        fetchUserProfile({ commit, state }) {
            fb.usersCollection.doc(state.currentUser.uid).get().then(res => {
                commit('setUserProfile', res.data())
            }).catch(err => {
                console.log(err)
            })
        },
    },
    mutations: {
        setCurrentUser(state, val) {
            state.currentUser = val
        },
        setUserProfile(state, val) {
            state.userProfile = val
        },
        setHabits(state, val) {
            if (val) {
                state.habits = val
            } else {
                state.habits = []                
            }
        },
    }
})