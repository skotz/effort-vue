<template>
    <div>
        <div class="effort">
            <EffortOption :value="1" />
            <EffortOption :value="2" />
            <EffortOption :value="3" />
            <EffortOption :value="5" />
            <EffortOption :value="8" />
            <EffortOption :value="13" />
            <EffortOption :value="21" />
            <EffortOption :value="34" />
        </div>
        <div v-for="effort in efforts" :key="effort.userid">
            <div>{{ effort[".key"] }} voted {{ effort.effort }}</div>
        </div>
    </div>
</template>

<script>
    import EffortOption from '@/components/EffortOption.vue'
    import Firebase from 'firebase'

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyB9f2zmiSAmOeO0OyRajjddAw51sdCzP-U",
        authDomain: "effort-vue.firebaseapp.com",
        databaseURL: "https://effort-vue.firebaseio.com",
        projectId: "effort-vue",
        storageBucket: "effort-vue.appspot.com",
        messagingSenderId: "590099803160"
    };
    let firebase = Firebase.initializeApp(config);
    let database = firebase.database();

    // Get User ID
    var userid = sessionStorage.getItem('userid');
    if (userid == null) {
        sessionStorage.setItem('userid', Math.floor(Math.random() * 100000000));
    }

    // Get Project ID
    var projectid = 500;
    let effortdb = database.ref("effort/" + projectid);

    // Vue
    export default {
        name: 'Effort',
        props: {
            value: Number
        },
        firebase: {
            efforts: effortdb
        },
        provide: {
            vote: function (effort) {
                database.ref('effort/' + projectid + "/" + userid).set({
                    effort: effort
                });
            }
        },
        components: {
            EffortOption
        }
    }
</script>

<style scoped>
    .effort {
        background-color: #EEE;
    }
</style>