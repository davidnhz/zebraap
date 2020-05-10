<template>
    <div id="dashboard">
        <section>
            <div class="col1">
                <div class="profile">
                    <h5>{{ userProfile.name }}</h5>
                    <p>{{ userProfile.title }}</p>
                    <div class="create-post">
                        <p>create a habit</p>
                        <form @submit.prevent>
                            <textarea v-model.trim="habit.description"></textarea>
                            <button @click="createHabit" :disabled="habit.description == ''" class="button">Add</button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col2">
                <div v-if="habits.length">
                    <div v-for="habit in habits" :key="habit.id" class="post">
                        <span>{{ habit.createdOn | formatDateFromNow }}</span>
                        <p>{{ habit.description | trimLength }}</p>
                        <ul>
                            <li><a @click="openCommentModal(habit)">logs {{ habit.comments }}</a></li>
                            <li><a @click="viewHabit(habit)">view full habit</a></li>
                        </ul>
                    </div>
                </div>
                <div v-else>
                    <p class="no-results">There are currently no habits</p>
                </div>
            </div>
        </section>

        <!-- comment modal -->
        <transition name="fade">
            <div v-if="showCommentModal" class="c-modal">
                <div class="c-container">
                    <a @click="closeCommentModal">X</a>
                    <p>Add a log</p>
                    <form @submit.prevent>
                        <div class="flex-container">
                            <input type="checkbox" id="is-done" v-model="comment.done">
                            <label for="is-done">Done!</label>
                        </div>
                        <textarea v-model.trim="comment.content"></textarea>
                        <button @click="addComment" :disabled="comment.done == false" class="button">add log</button>
                    </form>
                </div>
            </div>
        </transition>

        <!-- habit modal -->
        <transition name="fade">
            <div v-if="showHabitModal" class="p-modal">
                <div class="p-container">
                    <a @click="closeHabitModal" class="close">X</a>
                    <div class="post">
                        <h5>{{ fullHabit.userName }}</h5>
                        <span>{{ fullHabit.createdOn | formatDateFromNow }}</span>
                        <p>{{ fullHabit.description }}</p>
                        <ul>
                            <li><a>comments {{ fullHabit.comments }}</a></li>
                        </ul>
                    </div>
                    <div v-show="habitComments.length" class="comments">
                        <div v-for="comment in habitComments" :key="comment.id" class="comment">
                            <span>{{ comment.userName }} {{ comment.createdOn | formatDate }}</span>
                            <p>{{ comment.content }}</p>
                            <span>{{ comment.createdOn | formatDateFromNow }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import moment from 'moment'
    const fb = require('../firebaseConfig.js')

    export default {
        data() {
            return {
                habit: {
                    description: ''
                },
                comment: {
                    habitId: '',
                    userId: '',
                    content: '',
                    done: false,
                    habitComments: 0
                },
                showCommentModal: false,
                showHabitModal: false,
                fullHabit: {},
                habitComments: []
            }
        },
        computed: {
            ...mapState(['userProfile', 'currentUser', 'habits'])
        },
        methods: {
            createHabit() {
                fb.habitsCollection.add({
                    createdOn: new Date(),
                    description: this.habit.description,
                    userId: this.currentUser.uid,
                    comments: 0,
                }).then(ref => {
                    this.habit.description = ''
                }).catch(err => {
                    console.log(err)
                })
            },
            openCommentModal(habit) {
                this.comment.habitId = habit.id
                this.comment.userId = habit.userId
                this.comment.habitComments = habit.comments
                this.showCommentModal = true
            },
            closeCommentModal() {
                this.comment.habitId = ''
                this.comment.userId = ''
                this.comment.content = ''
                this.comment.done = false
                this.showCommentModal = false
            },
            addComment() {
                let habitId = this.comment.habitId
                let habitComments = this.comment.habitComments

                fb.commentsCollection.add({
                    createdOn: new Date(),
                    content: this.comment.content,
                    done: this.comment.done,
                    habitId: habitId,
                    userId: this.currentUser.uid,
                    userName: this.userProfile.name
                }).then(doc => {
                    fb.habitsCollection.doc(habitId).update({
                        comments: habitComments + 1
                    }).then(() => {
                        this.closeCommentModal()
                    })
                }).catch(err => {
                    console.log(err)
                })
            },
            viewHabit(habit) {
                fb.commentsCollection.where('habitId', '==', habit.id).get().then(docs => {
                    let commentsArray = []

                    docs.forEach(doc => {
                        let comment = doc.data()
                        comment.id = doc.id
                        commentsArray.push(comment)
                    })

                    this.habitComments = commentsArray
                    this.fullHabit = habit
                    this.showHabitModal = true
                }).catch(err => {
                    console.log(err)
                })
            },
            closeHabitModal() {
                this.habitComments = []
                this.showHabitModal = false
            }
        },
        filters: {
            formatDate(val) {
                if (!val) { return '-' }
                let date = val.toDate()
                return moment(date).format("DD.MM.YYYY hh:mm A");
            },
            formatDateFromNow(val) {
                if (!val) { return '-' }
                let date = val.toDate()
                return moment(date).fromNow()
            },
            trimLength(val) {
                if (val.length < 200) { return val }
                return `${val.substring(0, 200)}...`
            }
        }
    }
</script>