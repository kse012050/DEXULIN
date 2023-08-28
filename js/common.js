// import validation from "./validation";
// import * as api from './validation';
// import "./validation";

export const inputValidationMap = {
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
    }
}

export function inputValidation(type, value){
    return Object.keys(inputValidationMap).includes(type) && inputValidationMap[type](value);
}

const dataValidationMap = {
    id(value) {
        const regex = /^\d{11}$/;
        return regex.test(value);
    },
    password(value) {
        const regex = /.{4,15}/;
        return regex.test(value);
    }
}

function dataValidation(type, value){
    return Object.keys(dataValidationMap).includes(type) && dataValidationMap[type](value);
}

$(document).ready(function(){
    $('input').length && inputFuc();
});

function inputFuc() {
    const data = {};
    let dataResult = false;
    $('input').each(function(){
        const input = $(this);
        const formet = input.attr('data-formet');
        if(input.attr('required')) {
            data[input.attr('name')] = '';
        }
        input.on('input', function(){
            input.hasClass('error') && input.removeClass('error');
            const value = input.val()
            $(this).val(value.replace(inputValidation(formet), ''));
            if(formet === 'password'){
                const inputPassword = $(this).siblings('.password');
                value.length ?
                    inputPassword.addClass('active') :
                    inputPassword.removeClass('active');
            }
            data[$(this).attr('name')] = value;
            dataResult = Object.entries(data).every(function([key, value]) {
                return dataValidation(key, value);
            })
            dataResult ? 
                $('input[type="submit"]').removeAttr('disabled') :
                $('input[type="submit"]').attr('disabled',true)
        })
    });

    $('input, input ~ button').click(function(e){
        e.preventDefault();
    })

    $('input ~ button.valueDelete').click(function(){
        $(this).siblings('input').val('');
        $(this).siblings('input').focus();
    })

    $('input ~ button.password').click(function(e){
        $(this).toggleClass('show');
        $(this).hasClass('show') ? 
            $(this).siblings('input').attr('type', 'text') :
            $(this).siblings('input').attr('type', 'password')
    })

    $('input[type="submit"]').click(function(e){
        const userId = '01012345678'
        const userPW = '1234'
        if(data['id'] === userId && data['password'] === userPW) {
        }else {
            $('fieldset ul li input').addClass('error');
        }
    })
}
