<template>
  <div class="strike-component">
    <div class="strike-list">
      <div
        v-for="(strike, key) in reversedStrikes"
        :key="key"
        class="box"
        :class="{
          green: strike,
          yellow: isYellow(reversedStrikes, key),
          red: !strike && !isYellow(reversedStrikes, key)
        }"
        v-tooltip.bottom="reversedDateStrikes[key]"
      ></div>
    </div>
    <p v-if="largestStrike()">
      Max strike: {{ largestStrike() }} - Current strike: {{ currentStrike() }}
    </p>
  </div>
</template>

<script>
import moment from "moment";
const fb = require("../firebaseConfig.js");

export default {
  props: {
    habitId: { type: String, required: true }
  },
  data() {
    return {
      strikes: [],
      dateStrikes: []
    };
  },
  computed: {
    reversedStrikes() {
      return this.strikes.slice().reverse();
    },
    reversedDateStrikes() {
      return this.dateStrikes.slice().reverse();
    }
  },
  methods: {
    largestStrike() {
      let maxStrike = 0;
      let currentStrike = 0;

      this.strikes.forEach(strike => {
        if (strike) {
          currentStrike++;
        } else {
          if (currentStrike > maxStrike) {
            maxStrike = currentStrike;
          }
          currentStrike = 0;
        }
      });

      return maxStrike || currentStrike;
    },
    currentStrike() {
      let currentStrike = 0;

      for (let i = 0; i < this.strikes.length; i++) {
        if (this.strikes[i]) {
          currentStrike++;
        } else {
          return currentStrike;
        }
      }

      return currentStrike;
    },
    isYellow(strikes, key) {
      if (
        typeof strikes == "undefined" ||
        !key ||
        typeof strikes[key + 1] == "undefined"
      ) {
        return false;
      }

      if (key > 0 && strikes[key - 1] && strikes[key + 1]) {
        return true;
      }

      return false;
    },
    getLogs() {
      fb.commentsCollection
        .where("habitId", "==", this.habitId)
        .orderBy("createdOn", "desc")
        .get()
        .then(docs => {
          let dateStrikes = [];
          let lastLog = {};
          let lastDate = new Date();
          let currentDate = new Date();
          let logsDate = [];

          docs.forEach(doc => {
            let comment = doc.data();
            logsDate.push(
              moment(comment.createdOn.toDate()).format("MM.DD.YYYY")
            );
          });

          if (logsDate.length) {
            lastLog = logsDate[logsDate.length - 1];
            lastDate = moment(lastLog, "MM.DD.YYYY");

            while (currentDate >= lastDate) {
              dateStrikes.push(moment(currentDate).format("MM.DD.YYYY"));
              let tempDate = new Date(currentDate);
              currentDate = new Date(tempDate.setDate(tempDate.getDate() - 1));
            }
            dateStrikes.forEach(log => {
              this.strikes.push(logsDate.includes(log));
            });
            this.dateStrikes = dateStrikes;
          }
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.log(err);
        });
    }
  },
  created() {
    this.getLogs();
  }
};
</script>

<style lang="scss" scoped>
.strike-component {
  p {
    font-weight: bold;
  }
}

.strike-list {
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
