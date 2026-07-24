export const APP = {

    currentUser: localStorage.getItem("currentUser") || "Elena",

    setUser(user){

        this.currentUser = user;

        localStorage.setItem("currentUser", user);

    }

}