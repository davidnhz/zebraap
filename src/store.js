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
    }
})

export const store = new Vuex.Store({
    state: {
        currentUser: null,
        userProfile: {},
    },
    actions: {
        clearData({ commit }) {
            commit('setCurrentUser', null)
            commit('setUserProfile', {})
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
    }
})