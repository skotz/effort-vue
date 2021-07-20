<template>
    <div class="container">
        <div class="row" v-if="errors.length">
            <div class="col-12">
                <p v-for="error in errors" :key="error" class="error">{{error}}</p>
            </div>
        </div>
        <div class="row">
            <div class="col-4">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text" id="project-label">Project</span>
                    </div>
                    <input v-model="project" placeholder="Project" class="form-control" aria-describedby="project-label" />
                </div>
            </div>
            <div class="col-4">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text" id="username-label">Username</span>
                    </div>
                    <input v-model="username" placeholder="Username" class="form-control" aria-describedby="username-label" />
                </div>
            </div>
            <div class="col-2">
                <div class="input-group">
                    <button type="button" class="btn btn-primary btn-save" v-on:click="saveData(false)">Go</button>
                </div>
            </div>
            <div class="col-2">
                <div class="input-group">
                    <button type="button" class="btn btn-primary btn-save" v-on:click="saveData(true)">Spectate</button>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-12 text-center">
                <div class="identicon">
                    <img :src="getIdenticon(username)" :alt="username">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
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
        data: function () {
            return {
                project: getCookie('project'),
                username: getCookie('username'),
                errors: []
            }
        },
        methods: {
            saveData: function (spec) {
                this.errors = [];
                if (!this.project && !spec) {
                    this.errors.push("Project is required");
                }
                else if (!this.username && !spec) {
                    this.errors.push("Username is required");
                }
                else {
                    setCookie('project', this.project);
                    setCookie('username', spec ? '' : this.username);
                    this.$router.push('/project');
                }
            },
            hash: function(value) {
                // eslint-disable-next-line
                return sha256(value);
            },
            getIdenticon: function(name) {
                var hash = this.hash(name);
                // eslint-disable-next-line
                var data = new Identicon(hash, {
                    background: [ 255, 255, 255, 128 ],
                    size: 100
                }).toString();
                return 'data:image/png;base64,' + data;
            }
        }
    }
</script>

<style scoped>
    .btn-save {
        width: 100%;
    }
    .error {
        color: #FF0000;
    }
    .identicon {
        border: 1px solid #BBBBBB;
        width: 102px;
        height: 102px;
        margin: 30px auto;
    }
</style>