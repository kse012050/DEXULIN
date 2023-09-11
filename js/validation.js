const inputValidationMap = {
    mobile() {
        const regex = /^\d{0,11}$/;
        // return regex.test(value);
        return regex;
    },
    number() {
        const regex = /[^0-9]/g;
        return regex;
    },
    password() {
        const regex = /[^a-zA-Z0-9]/g;
        return regex;
    },
    number(value) {
        const regex = /^[0-9]+$/;
        return regex.test(value);
    },
    hangle(value) {
        const regex = /^[가-힣]*$/;
        return regex.test(value);
    },
    mobile(value) {
        const regex = /^\d{11}$/;
        return regex.test(value);
    },
    date(value) {
        const regex = /^\d{8}$/;
        return regex.test(value);
    },
    time(value) {
        const regex = /^\d{4}$/;
        return regex.test(value);
    },
    email(value){
        const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        return regex.test(value);
    }
}

function inputValidation(type, value){
    return Object.keys(inputValidationMap).includes(type) && inputValidationMap[type](value);
}

const dataValidationMap = {
    id(value) {
        const regex = /^\d{11}$/;
        return regex.test(value);
    },
    pw(value) {
        const regex = /.{4,15}/;
        return regex.test(value);
    }
}

function dataValidation(type, value){
    return Object.keys(dataValidationMap).includes(type) && dataValidationMap[type](value);
}

function a(){console.log('a');}
function b(){console.log('b');}

export {inputValidation, dataValidation}