<template>
    <div class="container">
        <div class="row effort">
            <EffortOption :parent="this" :order="1" :value="1" :left="39" :top="25" />
            <EffortOption :parent="this" :order="2" :value="2" :left="40" :top="24" />
            <EffortOption :parent="this" :order="3" :value="3" :left="39" :top="21" />
            <EffortOption :parent="this" :order="4" :value="5" :left="34" :top="21" />
            <EffortOption :parent="this" :order="5" :value="8" :left="34" :top="26" />
            <EffortOption :parent="this" :order="6" :value="13" :left="42" :top="21" />
            <EffortOption :parent="this" :order="7" :value="21" :left="34" :top="0" />
            <EffortOption :parent="this" :order="8" :value="34" :left="0" :top="0" />
        </div>
        <div class="row">
            <div class="col-3"></div>
            <div class="col-6">
                <div class="row">
                    <div class="col-6">
                        <div class="form-group">
                            <label>Project</label>
                            <input v-model="project" placeholder="Project" class="form-control" v-on:change="saveData()" />
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="form-group">
                            <label>Username</label>
                            <input v-model="username" placeholder="Username" class="form-control" v-on:change="saveData()" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-3"></div>
            <div class="col-6">
                <div class="row">
                    <div class="col-12 votes">
                        <div v-for="item in projectEfforts" :key="item.userid">
                            <span class="username">{{ item.username }}</span>
                            <span class="vote">{{ item.effort }}</span>
                        </div>
                    </div>
                </div>
            </div>
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

    // Get saved settings
    var userid = sessionStorage.getItem('userid');
    if (userid == null) {
        userid = Math.floor(Math.random() * 100000000);
        sessionStorage.setItem('userid', userid);
    }

    // Vue
    export default {
        name: 'Effort',
        props: {
            value: Number
        },
        data: function () {
            return {
                project: sessionStorage.getItem('project'),
                username: sessionStorage.getItem('username'),
                efforts: {}
            }
        },
        computed: {
            projectEfforts: function () {
                var all = [];
                for (var i in this.efforts) {
                    if (this.efforts[i] != null && this.efforts[i].username != null && this.efforts[i].effort != null) {
                        all.push({ 
                            userid: userid,
                            username: this.efforts[i].username, 
                            effort: this.efforts[i].effort 
                        });
                    }
                }
                return all;
            }
        },
        created: function () {
            this.$bindAsObject('efforts', database.ref("effort/" + this.project))
        },
        watch: {
            project: function () {
                this.$bindAsObject('efforts', database.ref("effort/" + this.project))
            }
        },
        provide: {
            vote: function (effort, _this) {
                database.ref('effort/' + _this.project + "/" + userid).set({
                    username: _this.username,
                    effort: effort
                });
            }
        },
        methods: {
            saveData: function () {
                sessionStorage.setItem('project', this.project);
                sessionStorage.setItem('username', this.username);
            }
        },
        components: {
            EffortOption
        }
    }
</script>

<style scoped>
    .effort {
        margin: 30px auto;
        background-color: #EEE;
        position: relative;
        width: 61.818vw;
        height: calc(61.818vw * 34 / (34 + 21))
    }
    .username {
        display: inline-block;
    }
    .vote {
        display: inline-block;
        float: right;
        font-weight: bold;
    }
    .votes > div {
        padding-left: 15px;
        padding-right: 15px;
        height: calc(2.25rem + 2px);
        line-height: calc(2.25rem + 2px);
    }
    .votes > div:nth-child(even) {
        background-color: #EEEEEE;
    }
    .votes > div:nth-child(odd) {
        background-color: #DDDDDD;
    }
</style>