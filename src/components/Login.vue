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
    var userid = sessionStorage.getItem('userid');
    if (userid == null) {
        userid = Math.floor(Math.random() * 100000000);
        sessionStorage.setItem('userid', userid);
    }

    // Vue
    export default {
        name: 'Login',
        data: function () {
            return {
                project: sessionStorage.getItem('project'),
                username: sessionStorage.getItem('username')
            }
        },
        methods: {
            saveData: function () {
                sessionStorage.setItem('project', this.project);
                sessionStorage.setItem('username', this.username);
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