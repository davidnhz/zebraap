<template>
  <div class="strike">
    <div
        v-for="(strike, key) in reversedStrikes"
        :key="key"
    >
        {{ strike }}
    </div>
  </div>
</template>

<script>
    import moment from 'moment'
    const fb = require('../firebaseConfig.js')

    export default {
        props: {
            habitId: { type: String, required: true }
        },
        data() {
            return {
                strikes: [],
            }
        },
        computed: {
            reversedStrikes() {
                return this.strikes.slice().reverse()
            }
        },
        methods: {
            getLogs() {
                fb.commentsCollection.where('habitId', '==', this.habitId).orderBy('createdOn', "desc").get().then(docs => {
                    let dateStrikes = []
                    let lastLog = {}
                    let lastDate = new Date()
                    let currentDate = new Date()
                    let logsDate = []

                    docs.forEach(doc => {
                        let comment = doc.data()
                        logsDate.push(moment(comment.createdOn.toDate()).format("MM.DD.YYYY"))
                    })

                    if (logsDate.length) {
                        lastLog = logsDate[logsDate.length - 1]
                        lastDate = moment(lastLog,"MM.DD.YYYY")

                        while (currentDate >= lastDate) {
                            dateStrikes.push(moment(currentDate).format("MM.DD.YYYY"))
                            let tempDate = new Date(currentDate)
                            currentDate = new Date(tempDate.setDate(tempDate.getDate() - 1))
                        }
                        dateStrikes.forEach(log => {
                            this.strikes.push(logsDate.includes(log))
                        })
                    }
                }).catch(err => {
                    console.log(err)
                })
            }
        },
        created() {
            this.getLogs();
        }
    }
</script>

<style>

</style>