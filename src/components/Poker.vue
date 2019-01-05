<template>
    <div class="container">
        <div class="row">
            <div class="col-8">
                <p>Hello <b>{{ username }}</b>, you've joined the <b>{{ project }}</b> project. <router-link to="/">Leave</router-link></p>
            </div>
            <div class="col-4">
                <button class="btn btn-primary float-right" v-on:click="resetVotes">Reset Votes</button>
            </div>
        </div>
        <div class="effort-container">
            <div class="row effort-row effort-row-small">
                <div class="col-12">
                    <div class="effort-axis-spacer"></div>
                </div>
            </div>
            <div v-bind:class="['row', 'effort-row', myVote == 13 ? 'my-vote' : '']" data-effort-row="13" v-on:click="vote(13)">
                <div class="col-12">
                    <div class="effort-axis">
                        13
                    </div>
                    <div v-for="item in projectEfforts" v-if="item.effort==13" :key="item.userid" class="effort-user">
                        {{ item.username }}
                    </div>
                    <div class="effort-user-insert">&nbsp;</div>
                </div>
            </div>
            <div v-bind:class="['row', 'effort-row', myVote == 8 ? 'my-vote' : '']" data-effort-row="8" v-on:click="vote(8)">
                <div class="col-12">
                    <div class="effort-axis">
                        8
                    </div>
                    <div v-for="item in projectEfforts" v-if="item.effort==8" :key="item.userid" class="effort-user">
                        {{ item.username }}
                    </div>
                    <div class="effort-user-insert">&nbsp;</div>
                </div>
            </div>
            <div v-bind:class="['row', 'effort-row', myVote == 5 ? 'my-vote' : '']" data-effort-row="5" v-on:click="vote(5)">
                <div class="col-12">
                    <div class="effort-axis">
                        5
                    </div>
                    <div v-for="item in projectEfforts" v-if="item.effort==5" :key="item.userid" class="effort-user">
                        {{ item.username }}
                    </div>
                    <div class="effort-user-insert">&nbsp;</div>
                </div>
            </div>
            <div v-bind:class="['row', 'effort-row', myVote == 3 ? 'my-vote' : '']" data-effort-row="3" v-on:click="vote(3)">
                <div class="col-12">
                    <div class="effort-axis">
                        3
                    </div>
                    <div v-for="item in projectEfforts" v-if="item.effort==3" :key="item.userid" class="effort-user">
                        {{ item.username }}
                    </div>
                    <div class="effort-user-insert">&nbsp;</div>
                </div>
            </div>
            <div v-bind:class="['row', 'effort-row', myVote == 2 ? 'my-vote' : '']" data-effort-row="2" v-on:click="vote(2)">
                <div class="col-12">
                    <div class="effort-axis">
                        2
                    </div>
                    <div v-for="item in projectEfforts" v-if="item.effort==2" :key="item.userid" class="effort-user">
                        {{ item.username }}
                    </div>
                    <div class="effort-user-insert">&nbsp;</div>
                </div>
            </div>
            <div v-bind:class="['row', 'effort-row', myVote == 1 ? 'my-vote' : '']" data-effort-row="1" v-on:click="vote(1)">
                <div class="col-12">
                    <div class="effort-axis">
                        1
                    </div>
                    <div v-for="item in projectEfforts" v-if="item.effort==1" :key="item.userid" class="effort-user">
                        {{ item.username }}
                    </div>
                    <div class="effort-user-insert">&nbsp;</div>
                </div>
            </div>
            <div class="row effort-row effort-row-small">
                <div class="col-12">
                    <div class="effort-axis-spacer"></div>
                    <div class="effort-votes-axis-corner"></div>
                </div>
            </div>
            <div class="row effort-votes-row">
                <div class="col-12">
                    <div class="effort-votes-axis-spacer"></div>
                    <div class="effort-votes-axis">1</div>
                    <div class="effort-votes-axis">2</div>
                    <div class="effort-votes-axis">3</div>
                    <div class="effort-votes-axis">4</div>
                    <div class="effort-votes-axis">5</div>
                    <div class="effort-votes-axis">6</div>
                    <div class="effort-votes-axis">7</div>
                    <div class="effort-votes-axis">8</div>
                    <div class="effort-votes-axis">9</div>
                    <div class="effort-votes-axis">10</div>
                    <div class="effort-votes-axis-padding">&nbsp;</div>
                </div>
            </div>
        </div>
        <div>
            <p class="user-list">Users: <span v-for="item in allUsers" :key="item.userid"><b>{{ item.username }}</b>{{ item.last ? "" : (item.secondToLast ? ", and " : ", ") }} </span></p>
        </div>
    </div>
</template>

<script>
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

    var resetVote = -1;
    var nullVote = -2;

    // Get saved settings
    var userid = sessionStorage.getItem('userid');
    if (userid == null) {
        userid = Math.floor(Math.random() * 100000000);
        sessionStorage.setItem('userid', userid);
    }

    // Vue
    export default {
        name: 'Poker',
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
        mounted() {
            var projectid = this.project; 
            try {
                if (this.$route.query.p.length) {
                    projectid = this.$route.query.p;
                }
            } catch { }
            if (projectid != null) {
                this.project = projectid;
                sessionStorage.setItem('project', projectid);
            }
            if (projectid == null || this.username == null) {
                this.$router.push('/');
            } else {
                database.ref('effort/' + this.project + "/" + userid).set({
                    username: this.username,
                    effort: resetVote,
                    timestamp: Math.round((new Date()).getTime() / 1000)
                });
            }
        },
        computed: {
            projectEfforts: function () {
                var all = [];
                for (var i in this.efforts) {
                    if (this.efforts[i] != null && this.efforts[i].username != null && this.efforts[i].effort != null) {
                        all.push({ 
                            userid: i,
                            username: this.efforts[i].username, 
                            effort: this.efforts[i].effort,
                            timestamp: this.efforts[i].timestamp != null ? parseInt(this.efforts[i].timestamp, 10) : 0
                        });
                    }
                }
                all.sort(function (c, n) { return c.timestamp - n.timestamp });
                return all;
            },
            allUsers: function () {
                var all = [];
                for (var i in this.efforts) {
                    if (this.efforts[i] != null && this.efforts[i].username != null && this.efforts[i].effort != nullVote) {
                        all.push({ 
                            userid: i,
                            username: this.efforts[i].username,
                            effort: this.efforts[i].effort,
                            voted: this.efforts[i].effort > 0,
                            last: false,
                            secondToLast: false
                        });
                    }
                }
                if (all.length > 0) {
                    all[all.length - 1].last = true;
                }
                if (all.length > 1) {
                    all[all.length - 2].secondToLast = true;
                }
                return all;
            },
            myVote: function() {
                var users = this.allUsers;
                for (var i = 0; i < users.length; i++) {
                    if (users[i].userid == userid) {
                        return users[i].effort;
                    }
                }
                return -1;
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
        methods: {
            saveData: function () {
                sessionStorage.setItem('project', this.project);
                sessionStorage.setItem('username', this.username);
            },
            vote: function (effort) {
                database.ref('effort/' + this.project + "/" + userid).set({
                    username: this.username,
                    effort: effort,
                    timestamp: Math.round((new Date()).getTime() / 1000)
                });
            },
            resetVotes: function () {
                var users = this.allUsers;
                for (var i = 0; i < users.length; i++) {
                    database.ref('effort/' + this.project + "/" + users[i].userid).set({
                        username: users[i].username,
                        effort: resetVote,
                        timestamp: Math.round((new Date()).getTime() / 1000)
                    });
                }
            },
            leave: function() {
                database.ref('effort/' + this.project + "/" + userid).set({
                    username: this.username,
                    effort: nullVote,
                    timestamp: Math.round((new Date()).getTime() / 1000)
                });
                this.$router.push('/');
            }
        }
    }
</script>

<style scoped>
    .effort-row {
        cursor: pointer;
    }
    .effort-axis {
        display: inline-flex;
        padding: 0 15px 0 0;
        margin: 0 15px 0 0;
        align-items: center;
        border-right: 2px solid #0000AA;
        height: 65px;
        width: 50px;
        justify-content: flex-end;
        font-size: 1.5em;
        white-space: nowrap;
    }
    .effort-axis:after {
        content: "";
        position: absolute;
        width: 10px;
        border-bottom: 2px solid #0000AA;
        left: 55px;
    }
    .effort-row-small {
        line-height: 2px;
    }
    .effort-axis-spacer {
        display: inline-flex;
        padding: 0 15px 0 0;
        margin: 0 15px 0 0;
        height: 7px;
        width: 50px;
        border-right: 2px solid #0000AA;
    }
    .effort-votes-axis-spacer {
        display: inline-flex;
        width: 48px;
    }
    .effort-votes-axis-corner {
        display: inline-flex;
        border-right: 2px solid #0000AA;
        width: 2px;
    }
    .effort-votes-axis,
    .effort-votes-axis-padding {
        display: inline-flex;
        padding: 0px;
        margin: 0px;
        align-items: center;
        border-top: 2px solid #0000AA;
        height: 50px;
        width: 65px;
        justify-content: center;
        padding-left: 15px;
        font-size: 1.5em;
    }
    .effort-votes-axis-padding {
        width: 15px;
    }
    .effort-votes-axis:after {
        content: "";
        position: absolute;
        height: 10px;
        border-right: 1px solid #0000AA;
        top: 0px;
    }
    .effort-user,
    .effort-user-insert {
        display: inline-flex;
        margin: 0 15px 0 0;
        height: 50px;
        width: 50px;
        border: 1px solid #BBBBBB;
        background: linear-gradient(135deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.01) 100%);
        align-items: center;
        white-space: nowrap;
        overflow: hidden;
    }
    .effort-user-insert {
        display: none;
        border: 1px dashed #AAAAAA;
        background: none;
    }
    .effort-row:hover:not(.my-vote) .effort-user-insert {
        display: inline-flex;
    }
    .user-list {
    }
    .my-vote-tile {
        background: red;
    }
</style>