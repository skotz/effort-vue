<template>
    <div class="container">
        <div class="row">
            <div class="col-5">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text" id="project-label">Project</span>
                    </div>
                    <input v-model="project" placeholder="Project" class="form-control" aria-describedby="project-label" />
                </div>
            </div>
            <div class="col-5">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text" id="username-label">Username</span>
                    </div>
                    <input v-model="username" placeholder="Username" class="form-control" aria-describedby="username-label" />
                </div>
            </div>
            <div class="col-2">
                <div class="input-group">
                    <button type="button" class="btn btn-primary btn-save" v-on:click="saveData()">Go</button>
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
                username: getCookie('username')
            }
        },
        methods: {
            saveData: function () {
                setCookie('project', this.project);
                setCookie('username', this.username);
                this.$router.push('/project');
            }
        }
    }
</script>

<style scoped>
    .btn-save {
        width: 100%;
    }
</style>