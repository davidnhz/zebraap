<template>
  <div class="strike">
    <div
        v-for="(strike, key) in reversedStrikes"
        :key="key"
        class="box"
        :class="{ green: strike, yellow: isYellow(reversedStrikes, key), red: !strike && !isYellow(reversedStrikes, key) }"
        :alt="reversedDateStrikes[key]"
    >
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
                dateStrikes: []
            }
        },
        computed: {
            reversedStrikes() {
                return this.strikes.slice().reverse()
            },
            reversedDateStrikes() {
                return this.dateStrikes.slice().reverse()
            }
        },
        methods: {
            isYellow(strikes, key) {
                if (typeof strikes == 'undefined' || !key || typeof strikes[key + 1] == 'undefined') {
                    return false;
                }

                if (key > 0 && strikes[key - 1] && strikes[key + 1]) {
                    return true;
                }
                
                return false;
            },
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
                        this.dateStrikes = dateStrikes
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

<style lang="scss" scoped>
.strike {
    display: inline-flex;
    
    .box {
        height: 15px;
        width: 15px;
        margin-bottom: 10px;
        border: 1px solid lightgrey;
    }

    .green {
        background-color: green;
    }
    
    .red {
        background-color: red;
    }

    .yellow {
        background-color: yellow;
    }
}
</style>