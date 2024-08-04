<template>
    <div class="container">
        <div class="row">
            <div class="col-6">
                <p>Hello <b>{{ parseName(username) }}</b>, you've joined the <a :href="getPath()" target="_blank"><b>{{ project }}</b></a> project as {{ getUserLevel }}.</p>
                <p v-if="!hasHost"><em class="text-danger">Waiting for host to join...</em></p>
            </div>
            <div class="col-6 fix-right">
                <button class="btn btn-primary ml-15 float-right" v-if="this.level == '2'" v-on:click="resetVotes" title="Reset votes (clear all votes and start a new session)">Reset</button>
                <div class="btn-group ml-15 float-right">
                    <button class="btn btn-primary" v-if="this.level == '2'" :disabled="this.noVoteUsers.length == 0" v-on:click="showVotes" title="Show or hide votes (note that votes will be automatically shown once everyone has voted)">{{ votesHidden ? 'Show' : 'Hide' }}</button>
                    <button class="btn btn-primary dropdown-toggle dropdown-toggle-split" 
                            v-if="this.level == '2'" 
                            :disabled="this.noVoteUsers.length == 0"
                            data-toggle="dropdown" 
                            aria-haspopup="true" 
                            aria-expanded="false">
                        <span class="sr-only">Toggle Dropdown</span>
                    </button>
                    <div class="dropdown-menu">
                        <a class="dropdown-item" href="#" v-on:click="showVotes" title="Show votes to all participants">Reveal now</a>
                        <a class="dropdown-item" href="#" v-on:click="startShowTimer(10)" title="Start a countdown after which votes will be shown">Reveal in 10 seconds</a>
                    </div>
                </div>
                <button class="btn btn-secondary float-right ml-15" v-on:click="leave" title="Leave the current session">Leave</button>
                <button class="btn btn-danger float-right ml-15" v-if="!hasHost && this.level == '1'" v-on:click="host" title="Claim the host role for this session">Host</button>
            </div>
        </div>
        <div :class="['effort-container', votesHidden ? 'effort-hide' : '']">
            <div class="countdown" v-show="remainingTime >= 0 && votesHidden">{{remainingTime}}</div>
            <div class="line-average" v-bind:style="{ top: (averageVoteHeight == 0 ? -100000 : averageVoteHeight) + 'px' }"></div>
            <div class="line-average-label" v-bind:style="{ top: (averageVoteHeight - 20) + 'px' }">{{ averageVote > 0 ? averageVote.toFixed(2) : "" }}</div>
            <div class="row effort-row effort-row-small">
                <div class="col-12">
                    <div class="effort-axis-spacer"></div>
                </div>
            </div>
            <div v-for="i in options" v-bind:class="['row', 'effort-row', myVote == i ? 'my-vote' : '']" :key="i" v-on:click="vote(i)">
                <div class="col-12">
                    <div class="effort-axis">
                        {{ i }}
                    </div>
                    <div v-for="item in projectEfforts(i)" :key="item.userid" :class="['effort-user', item.userid == userid ? 'effort-self' : 'effort-other']" :title="parseName(item.username)">
                        <img :src="getIdenticon(item.username)" :alt="parseName(item.username)" :title="parseName(item.username)">
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
                    <div v-for="i in labels" :key="i" class="effort-votes-axis">{{i}}</div>
                    <div class="effort-votes-axis-padding">&nbsp;</div>
                </div>
            </div>
        </div>
        <div>
            <div v-if="allUsers.length > 0" class="row">
                <div class="col-12">
                    <div class="effort-axis voters-axis">?</div>
                    <div v-for="item in allUsers" 
                        :key="item.userid" 
                        :class="['effort-user', 'benched-user', item.voted ? 'user-voted' : 'user-not-voted']">
                        <img :src="getIdenticon(item.username)" :alt="parseName(item.username)" :title="parseName(item.username)">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Firebase from 'firebase'
    import confetti from 'canvas-confetti'
    import avatarMixin from "../mixins/avatar";

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
    
    var timeoutSeconds = 30;
    var keepaliveMilliseconds = 5000;

    function getUtc() {
        return + new Date() / 1000;
    }
    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/";
    }
    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    // Get saved settings
    var userid = getCookie('userid');
    if (userid == null) {
        userid = Math.floor(Math.random() * 100000000);
        setCookie('userid', userid);
    }

    // The available options (the last one isn't displayed and is only for calculating where the average line goes)
    var options = [1, 2, 3, 5, 8, 13, 20, 40];

    // m = (y1-y2)/(x1-x2)
    // b = y-m*x
    // fib = y = mx+b
    // lin = x = (y-b)/m

    //// Convert the linear value of the option to it's fibonacci number
    //var linToFib = function (x) {
    //    var i = Math.floor(x);
    //    var m = options[i] - options[i - 1];
    //    var b = options[i - 1] - m * i;
    //    var y = m * x + b
    //    // console.log('i = ' + i + ' m = ' + m + ' b = ' + b + ' x = ' + x + ' y = ' + y);
    //    return y;
    //};

    // Convert a fibonacci number to a linear value (inverse)
    var fibToLin = function (y) {
        var i = 0;
        while (options[i] < y) {
            i++;
        }
        var m = i == 0 ? 1 : options[i] - options[i - 1];
        var b = i == 0 ? 0 : options[i - 1] - m * i;
        var x = (y - b) / m;
        // console.log('i = ' + i + ' m = ' + m + ' b = ' + b + ' x = ' + x + ' y = ' + y);
        return x;
    };

    // Confetti
    var showConfetti = function() {
        var count = 200;
        var defaults = {
            origin: { y: 0.7 }
        };

        function fire(particleRatio, opts) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });
        fire(0.2, {
            spread: 60,
        });
        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }

    // Vue
    export default {
        name: 'Poker',
        mixins: [avatarMixin],
        props: {
            value: Number
        },
        data: function () {
            return {
                project: getCookie('project'),
                username: getCookie('username'),
                level: getCookie('level'),
                allowConfetti: getCookie('confetti') != 'n',
                userid: userid,
                settings: {},
                efforts: {},
                options: options.slice(0, -1).reverse(),
                labels: [1, 2, 3, 4],
                ping: null,
                countdown: null,
                startedCountdown: false,
                remainingTime: -1,
                confetti: false,
            }
        },
        mounted() {
            var projectid = this.project; 
            try {
                if (this.$route.query.p.length) {
                    projectid = this.$route.query.p;
                }
            } catch {
                projectid = this.project;
            }
            if (projectid != null) {
                this.project = projectid;
                setCookie('project', projectid);
            }
            if (projectid == null || this.username == null || (this.level != '0' && this.level != '1' && this.level != '2')) {
                this.$router.push('/');
            } else {
                database.ref('effort/' + this.project + "/" + userid).set({
                    username: this.username,
                    effort: resetVote,
                    keepalive: getUtc(),
                    timestamp: getUtc(),
                    level: this.level,
                });
            }
            var proj = this.project;
            database.ref("settings/" + this.project).once('value').then(function (snapshot) {
                var val = snapshot.val();
                if (val == null || typeof val.hidden === 'undefined') {
                    database.ref('settings/' + proj).set({
                        hidden: true,
                        showAt: -1,
                    });
                }
            });

            var keepalive = this.keepalive;
            clearInterval(this.ping);
            this.ping = setInterval(function () {
                keepalive();
            }, keepaliveMilliseconds);
            keepalive();

            // Countdown timer
            var handleCountdown = this.handleCountdown;
            clearInterval(this.countdown);
            this.countdown = setInterval(function () {
                handleCountdown();
            }, 250);
            handleCountdown();

            this.$nextTick(() => {
                window.addEventListener('resize', () => {
                    this.updateLabels();
                });
            })
            this.updateLabels();
        },
        computed: {
            getUserLevel: function() {
                if (this.level == '2') {
                    return "the host";
                }
                if (this.level == '1') {
                    return "a voter";
                }
                return "a spectator";
            },
            hasHost: function() {
                if (this.level == '2') {
                    return true;
                }
                for (var i in this.efforts) {
                    if (this.efforts[i] != null &&
                        this.efforts[i].username != null &&
                        this.efforts[i].effort != nullVote &&
                        this.efforts[i].username.length &&
                        this.efforts[i].keepalive > getUtc() - timeoutSeconds &&
                        this.efforts[i].level == '2') {
                        return true;
                    }
                }
                return false;
            },
            allUsers: function () {
                var all = [];
                for (var i in this.efforts) {
                    if (this.efforts[i] != null && 
                        this.efforts[i].username != null && 
                        this.efforts[i].effort != nullVote && 
                        this.efforts[i].username.length &&
                        this.efforts[i].keepalive > getUtc() - timeoutSeconds) {
                        all.push({ 
                            userid: i,
                            username: this.efforts[i].username,
                            effort: this.efforts[i].effort,
                            voted: this.efforts[i].effort > 0,
                            last: false,
                            secondToLast: false,
                            timestamp: this.efforts[i].timestamp,
                            level: this.efforts[i].level,
                        });
                    }
                }
                all.sort(function (c, n) { return c.timestamp - n.timestamp });
                if (all.length > 0) {
                    all[all.length - 1].last = true;
                }
                if (all.length > 1) {
                    all[all.length - 2].secondToLast = true;
                }
                return all;
            },
            noVoteUsers: function () {
                var users = this.allUsers;
                var noVote = [];
                for (var i = 0; i < users.length; i++) {
                    if (users[i].effort <= 0) {
                        noVote.push(users[i]);
                    }
                }
                return noVote;
            },
            myVote: function() {
                var users = this.allUsers;
                for (var i = 0; i < users.length; i++) {
                    if (users[i].userid == userid) {
                        return users[i].effort;
                    }
                }
                return -1;
            },
            averageVote: function () {
                var avg = 0;
                var count = 0;
                var users = this.allUsers;
                for (var i = 0; i < users.length; i++) {
                    if (users[i].effort > 0) {
                        avg += users[i].effort;
                        count++;
                    }
                }
                avg /= count;
                return Number.isNaN(avg) ? 0 : avg;
            },
            consensus: function () {
                var last = -1;
                var users = this.allUsers;
                if (users.length == 0) {
                    return false;
                }
                for (var i = 0; i < users.length; i++) {
                    if (last == -1) {
                        last = users[i].effort;
                    }
                    if (users[i].effort <= 0 || users[i].effort != last) {
                        return false;
                    }
                }
                return true;
            },
            averageVoteHeight: function() {
                // max-height = (height-per-box + padding) * num-options + padding - offset
                // max-height = (50 + 15) * 6 + 15 - 1 = 404
                var maxHeight = (50 + 15) * this.options.length + 15 - 1;
                var padding = 25 + 15;
                var pixelRange = maxHeight - padding * 2 + 1;
                var avg = 0;
                var count = 0;
                var users = this.allUsers;
                for (var i = 0; i < users.length; i++) {
                    if (users[i].effort > 0) {
                        avg += users[i].effort;
                        count++;
                    }
                }
                avg /= count;
                
                // Map a fibonacci number to a percentage of a linear scale
                var linear = fibToLin(avg);
                var minLin = fibToLin(1);
                var maxLin = fibToLin(this.options[0]);

                // Percentage between 1 and 13
                var percentage = (linear - minLin) / (maxLin - minLin);
                var pixels = Math.ceil(percentage * pixelRange) + padding;
                var reverse = maxHeight - pixels;

                return Number.isNaN(reverse) ? 0 : reverse;
            },
            votesHidden: function() {
                return this.noVoteUsers.length > 0 && this.settings.hidden;
            }
        },
        created: function () {
            this.$bindAsObject('efforts', database.ref("effort/" + this.project))
            this.$bindAsObject('settings', database.ref("settings/" + this.project))
        },
        watch: {
            project: function () {
                this.$bindAsObject('efforts', database.ref("effort/" + this.project))
                this.$bindAsObject('settings', database.ref("settings/" + this.project))
            }
        },
        methods: {
            startShowTimer: function(seconds) {
                this.startedCountdown = true;
                database.ref('settings/' + this.project).set({
                    hidden: true,
                    showAt: getUtc() + seconds,
                });
            },
            handleCountdown: function () {
                if (this.settings == null || this.settings.showAt == null) {
                    return;
                }
                var remaining = this.settings.showAt - getUtc();
                if (remaining > 0) {
                    this.remainingTime = Math.floor(remaining);
                } else {
                    this.remainingTime = -1;
                    if (this.startedCountdown) {
                        this.startedCountdown = false;
                        if (this.level == '2') {
                            database.ref('settings/' + this.project).set({
                                hidden: false,
                                showAt: -1,
                            });
                        }
                    }
                }
            },
            host: function() {
                this.level = '2';
                this.saveData();
            },
            projectEfforts: function (effort) {
                var all = [];
                for (var i in this.efforts) {
                    if (this.efforts[i] != null && 
                        this.efforts[i].username != null && 
                        this.efforts[i].effort == effort && 
                        this.efforts[i].username.length &&
                        this.efforts[i].keepalive > getUtc() - timeoutSeconds) {
                        all.push({ 
                            userid: i,
                            username: this.efforts[i].username, 
                            effort: this.efforts[i].effort,
                            timestamp: this.efforts[i].timestamp != null ? parseInt(this.efforts[i].timestamp, 10) : 0
                        });
                    }
                }
                if (this.consensus) {
                    if (!this.confetti) {
                        this.confetti = true;
                        if (this.allowConfetti) {
                            showConfetti();
                        }
                    }
                } else {
                    this.confetti = false;
                }
                all.sort(function (c, n) { return c.timestamp - n.timestamp });
                return all;
            },
            saveData: function () {
                setCookie('project', this.project);
                setCookie('username', this.username);
                setCookie('level', this.level);
            },
            vote: function (effort) {
                database.ref('effort/' + this.project + "/" + userid).set({
                    username: this.username,
                    effort: effort,
                    timestamp: getUtc(),
                    keepalive: getUtc(),
                    level: this.level,
                });
            },
            resetVotes: function () {     
                this.remainingTime = -1;   
                this.startedCountdown = false;      
                for (var i in this.efforts) {
                    // all users, whether within the keepalive or not
                    if (this.efforts[i] != null && 
                        this.efforts[i].username != null && 
                        this.efforts[i].effort != nullVote && 
                        this.efforts[i].username.length) {
                        this.efforts[i].effort = resetVote;
                        database.ref('effort/' + this.project + "/" + i).update({
                            effort: resetVote,
                        });
                    }
                }
                database.ref('settings/' + this.project).set({
                    hidden: true,
                    showAt: -1,
                });
            },
            leave: function() {
                database.ref('effort/' + this.project + "/" + userid).set({
                    username: this.username,
                    effort: nullVote,
                    timestamp: getUtc(),
                    keepalive: getUtc(),
                    level: this.level,
                });
                clearInterval(this.ping);
                this.$router.push('/');
            },
            getPath: function() {
                return (window.location.href + '?').split('?')[0] + "?p=" + this.project;
            },
            showVotes: function() {
                database.ref('settings/' + this.project).set({
                    hidden: !this.settings.hidden,
                    showAt: -1,
                });
            },
            keepalive: function() {
                database.ref('effort/' + this.project + "/" + userid).update({
                    keepalive: getUtc(),
                    level: this.level,
                });
            },
            updateLabels: function() {
                // lazy programming
                var newLabels = [1, 2, 3, 4];
                if (window.innerWidth >= 576) {
                    for (let i = newLabels[newLabels.length - 1] + 1; i <= 6; i++) {
                        newLabels.push(i);
                    }
                }
                if (window.innerWidth >= 768) {
                    for (let i = newLabels[newLabels.length - 1] + 1; i <= 9; i++) {
                        newLabels.push(i);
                    }
                }
                if (window.innerWidth >= 992) {
                    for (let i = newLabels[newLabels.length - 1] + 1; i <= 13; i++) {
                        newLabels.push(i);
                    }
                }
                if (window.innerWidth >= 1200) {
                    for (let i = newLabels[newLabels.length - 1] + 1; i <= 16; i++) {
                        newLabels.push(i);
                    }
                }
                this.labels = newLabels;
            },
            getIdenticon: function (name) {
                return 'data:image/png;base64,' + this.getAvatar(name, 48);
            }
        }
    }
</script>

<style scoped>
    .countdown {
        position: absolute;
        top: 0;
        right: 0;
        font-size: 200px;
        width: 100%;
        text-align: center;
        color: #6c757d;
    }
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
    .effort-axis.voters-axis {
        border-right: 2px solid #444444;
    }
    .effort-axis.voters-axis:after {
        border-bottom: 2px solid #444444;
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
        border-right: 2px solid #0000AA;
        top: 0px;
    }
    .effort-user,
    .effort-user-insert {
        display: inline-table;
        margin: 0 15px 0 0;
        padding: 0;
        height: 50px;
        width: 50px;
        border: 1px solid #BBBBBB;
        background: linear-gradient(135deg, #EEEEEE 0%, #FFFFFF 100%);
        align-items: center;
        white-space: nowrap;
        overflow: hidden;
        position: relative;
        top: -4px;
    }
    .effort-user-insert {
        display: none;
        border: 1px dashed #AAAAAA;
        background: none;
    }
    .effort-row:hover:not(.my-vote) .effort-user-insert {
        display: inline-flex;
    }
    .effort-user.benched-user {
        opacity: 0.8;
    }
    .effort-user.benched-user.user-voted {
        border: 1px solid #22AA22;
        background: linear-gradient(135deg, #88DD88 0%, #AADDAA 100%);
    }
    .effort-user.benched-user.user-not-voted {
        border: 1px solid #DD5555;
        background: linear-gradient(135deg, #DD8888 0%, #DDAAAA 100%);
    }
    .my-vote-tile {
        background: red;
    }
    .effort-container {
        position: relative;
        margin-top: 15px;
    }
    .line-average {
        /* width-of-axis-label * num-labels + padding - line-width */
        width: calc(65px * 4 + 15px - 2px);
        position: absolute;
        border-bottom: 2px solid #008000;
        left: 50px;
    }
    .line-average-label {
        color: #008000;
        position: absolute;
        right: 25px;
        font-weight: bold;
    }
    .ml-15 {
        margin-left: 15px;
    }
    .effort-hide .effort-other,
    .effort-hide .line-average,
    .effort-hide .line-average-label {
        display: none;
    }

    @media (min-width: 576px) {
        .line-average {
            width: calc(65px * 7 + 15px - 2px);
        }
    }
    @media (min-width: 768px) {
        .line-average {
            width: calc(65px * 9 + 15px - 2px);
        }
    }
    @media (min-width: 992px) {
        .line-average {
            width: calc(65px * 13 + 15px - 2px);
        }
    }
    @media (min-width: 1200px) {
        .line-average {
            width: calc(65px * 16 + 15px - 2px);
        }
    }
</style>