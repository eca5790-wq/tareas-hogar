export const APP = {

    currentUser: localStorage.getItem("currentUser") || "Elena",

    history: JSON.parse(localStorage.getItem("history")) || [],

    setCurrentUser(user){

        this.currentUser = user;
        localStorage.setItem("currentUser", user);

    },

    addTask(task){

        this.history.push(task);

        localStorage.setItem("history", JSON.stringify(this.history));

    }

};