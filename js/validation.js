export const validationMap = {
    number(value) {
        const regex = /^\d+$/;
        return regex.test(value);
    }
}

export function validation(type, value){
    return Object.keys(validationMap).includes(type) && validationMap[type](value);
}