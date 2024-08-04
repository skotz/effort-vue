<template>
    <div class="container">
        <div class="row" v-if="errors.length">
            <div class="col-12">
                <p v-for="error in errors" :key="error" class="error">{{error}}</p>
            </div>
        </div>
        <div class="row mt-4">
            <div class="col-12 col-lg-6 mb-4">
                <div class="row">
                    <div class="col-12 mb-3">
                        <h3>Join a session</h3>
                    </div>
                    <div class="col-12">
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text" id="project-label">Project</span>
                            </div>
                            <input v-model="project" placeholder="Project" class="form-control" aria-describedby="project-label" />
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text" id="username-label">Name</span>
                            </div>
                            <input v-model="username" placeholder="Name" class="form-control" aria-describedby="username-label" />
                            <img :src="getIdenticon(username)" alt="name" class="identicon-inner" title="Your avatar (generated based on your name)">
                        </div>
                    </div>
                    <div class="col-12 mb-3">
                        <div class="input-group">
                            <div class="custom-control custom-switch">
                                <input type="checkbox" class="custom-control-input" v-model="consensusConfetti" id="consensusConfetti">
                                <label class="custom-control-label" for="consensusConfetti"> Show confetti upon consensus</label>
                            </div>
                        </div>
                    </div>
                    <div class="col-8">
                        <div class="input-group justify-content-start">
                            <button type="button" class="btn btn-secondary btn-save" v-on:click="saveData(2)" title="You can vote, show votes, and clear votes.">Host</button>
                            <button type="button" class="btn btn-secondary btn-save" v-on:click="saveData(0)" title="You can watch, but you can't vote, show votes, or clear votes.">Spectate</button>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="input-group justify-content-end">
                            <button type="button" class="btn btn-success btn-save" v-on:click="saveData(1)" title="You can vote, but you can't show or clear votes.">Join</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 col-lg-6">
                <div class="row">
                    <div class="col-12 mb-3">
                        <h3>How to participate</h3>
                    </div>
                    <div class="col-12">
                        <p><strong>Join</strong> a project session to vote.</p>
                        <p><strong>Host</strong> a project session to vote, show votes, and clear votes.</p>
                        <p><strong>Spectate</strong> a project session to watch.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import avatarMixin from "../mixins/avatar";

    // Get saved settings
    var userid = getCookie('userid');
    if (userid == null) {
        userid = Math.floor(Math.random() * 100000000);
        setCookie('userid', userid);
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

    // Vue
    export default {
        name: 'Login',
        mixins: [avatarMixin],
        data: function () {
            return {
                project: getCookie('project'),
                username: getCookie('username'),
                level: getCookie('level'),
                consensusConfetti: getCookie('confetti') != "n",
                errors: []
            }
        },
        methods: {
            saveData: function (userType) {
                this.errors = [];
                if (!this.project) {
                    this.errors.push("Project is required");
                }
                else if (!this.username && userType != 0) {
                    this.errors.push("Username is required");
                }
                else {
                    setCookie('project', this.project);
                    setCookie('username', userType == 0 ? '' : this.username);
                    setCookie('level', userType.toString());
                    setCookie('confetti', this.consensusConfetti ? "y" : "n");
                    this.$router.push('/project');
                }
            },
            getIdenticon: function(name) {
                return 'data:image/png;base64,' + this.getAvatar(name, 36);
            }
        }
    }
</script>

<style scoped>
    .btn-save {
        padding-left: 20px;
        padding-right: 20px;
    }
    .justify-content-start .btn-save {
        margin-right: 20px;
    }
    .justify-content-end .btn-save {
        margin-left: 20px;
    }
    .error {
        color: #FF0000;
    }
    .input-group-text {
        min-width: 110px;
    }
    .identicon {
        border: 1px solid #BBBBBB;
        width: 102px;
        height: 102px;
        margin: 30px auto;
    }
    .identicon-inner {
        height: 38px;
        border: 1px solid #ced4da;
        border-left: none;
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
    }
    .input-group-prepend {
        margin-bottom: 20px;
    }
</style>