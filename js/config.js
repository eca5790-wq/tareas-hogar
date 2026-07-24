export const APP = {

    currentUser: localStorage.getItem("currentUser") || "Elena",

    setCurrentUser(user){

        this.currentUser = user;

        localStorage.setItem("currentUser", user);

    }

};