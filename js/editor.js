let currentTask = null;

export function setCurrentTask(task){

    currentTask = structuredClone(task);

}

export function getCurrentTask(){

    return currentTask;

}

export function updateCurrentTask(field,value){

    currentTask[field] = value;

}