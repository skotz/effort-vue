<template>
    <div class="container">
        <div>
            <div class="row">
                <div class="col-12">
                    <p>Hello <b>{{ username }}</b>, you've joined the <b>{{ project }}</b> project. <router-link to="/">Leave</router-link></p>
                </div>
            </div>
        </div>
        <div class="effort-container">
            <div class="row effort-row effort-row-small">
                <div class="col-12">
                    <div class="effort-axis-spacer"></div>
                </div>
            </div>
            <div class="row effort-row" data-effort-row="13" v-on:click="vote(13)">
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
            <div class="row effort-row" data-effort-row="8" v-on:click="vote(8)">
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
            <div class="row effort-row" data-effort-row="5" v-on:click="vote(5)">
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
            <div class="row effort-row" data-effort-row="3" v-on:click="vote(3)">
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
            <div class="row effort-row" data-effort-row="2" v-on:click="vote(2)">
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
            <div class="row effort-row" data-effort-row="1" v-on:click="vote(1)">
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
        border-right: 1px solid #0000AA;
        height: 65px;
        width: 50px;
        justify-content: flex-end;
        font-size: 1.5em;
    }
    .effort-axis:after {
        content: "";
        position: absolute;
        width: 10px;
        border-bottom: 1px solid #0000AA;
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
        border-right: 1px solid #0000AA;
    }
    .effort-votes-axis-spacer {
        display: inline-flex;
        width: 49px;
    }
    .effort-votes-axis,
    .effort-votes-axis-padding {
        display: inline-flex;
        padding: 0px;
        margin: 0px;
        align-items: center;
        border-top: 1px solid #0000AA;
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
        border: 1px solid #000000;
        align-items: center;
        white-space: nowrap;
        overflow: hidden;
    }
    .effort-user-insert {
        display: none;
        border: 1px dashed #AAAAAA;
    }
    .effort-row:hover .effort-user-insert {
        display: inline-flex;
    }
</style>