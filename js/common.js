// import validation from "./validation";
// import * as api from './validation';
// import "./validation";
// css index
function styleIdx(){
    const selector = $('[data-styleIdx]');
    selector.each(function(){
        const attrValue = $(this).attr('data-styleIdx');
        $(this).find('>' + (attrValue ? attrValue : ' *')).each(function(i){
            $(this).css('--styleIdx', i);
        })
    })
}


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
    password(value) {
        const regex = /.{4,15}/;
        return regex.test(value);
    }
}

function dataValidation(type, value){
    return Object.keys(dataValidationMap).includes(type) && dataValidationMap[type](value);
}

$(document).ready(function(){
    // css index
    $('[data-styleIdx]').length && styleIdx();

    $('.signInPage fieldset input').length && signInPage();
    $('.dropBox').length && dropBox();
    $('.exercisePage').length && exercisePage();

    $('[class^="member"][class$="Page"]').length && member();
});

function signInPage() {
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

    $('input, input ~ button').not('[type="file"], [type="checkbox"], [type="radio"], [type="reset"]').click(function(e){
        e.preventDefault();
    })

    $('input ~ button.valueDelete').click(function(){
        $(this).siblings('input').val('').focus().removeClass('error');
    })

    $('input ~ button.password').click(function(e){
        $(this).toggleClass('show');
        $(this).hasClass('show') ? 
            $(this).siblings('input').attr('type', 'text') :
            $(this).siblings('input').attr('type', 'password')
    })

    // 로그인 submit
    $('input[type="submit"]').click(function(e){
        // 임시 아이디, 임시 비밀번호
        const userId = '01012345678'
        const userPW = '1234'

        if(data['id'] === userId && data['password'] === userPW) {

        }else {
            // 정보가 맞지 않을 때
            $('fieldset ul li input').addClass('error');
        }
    })
}


function dropBox(){
    $('.dropBox').click(function(){
        $(this).find('div').toggleClass('active');
    });
}


function exercisePage(){
    let isUpload = false;
    $('table tbody tr').on("drop",function(e){
        e.preventDefault();
        $('input[type="file"]')[0].files = e.originalEvent.dataTransfer.files
        fileInfoAdd($('input[type="file"]')[0].files[0])
    })
    $('table tbody tr').on("dragover",function(e){
        e.preventDefault();
    })
    
    $('input[type="file"]').change(function(e){
        fileInfoAdd($('input[type="file"]')[0].files[0])
    })
    
    const uploadMessage = $('table tbody tr').html();
    function fileInfoAdd(inputFile){
        // 파일 사이즈
        let fileSize = inputFile.size;

        if((inputFile.type.includes('sheet') && fileSize < 524288000)) {
            isUpload = true
            $('table tbody tr').removeClass('fail')
            $('[data-btn="upload"]').attr('disabled',false)
        }else {
            isUpload = false
            $('table tbody tr').addClass('fail')
            $('[data-btn="upload"]').attr('disabled',true)
        }

        (fileSize >= 1048576) ?
            (fileSize = decimal(fileSize / 1048576) + 'MB') :
            (fileSize >= 1024 ? 
                (fileSize = decimal(fileSize / 1024) + 'KB') :
                (fileSize += 'Byte'));

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        let month = currentDate.getMonth() + 1;
        month < 10 && (month = '0' + month);
        const day = currentDate.getDate();
        const date = `${year}.${month}.${day}`

        $('table tbody tr').html(`
            <td><button>파일 제거</button></td>
            <td>${inputFile.name}</td>
            <td>${fileSize}</td>
            <td>${isUpload ? '완료' : '업로드 실패'}</td>
            <td>${date}</td>
        `)

        $('table tbody tr td button').click(function(e){
            $('table tbody tr').html(uploadMessage);
            $('input[type="file"]').val('')
        })
    }

    function decimal(number){
        return number.toFixed(2);
    }

    // RE 운동등록 - 업로드 버튼
    $('button[data-btn="upload"]').click(function(){
        const files = $('input[type="file"]')[0].files[0];
        console.log(files);
    });
}

function member() {
    const testData = []
    for(let a = 1; a < 11; a++){
        const randomType = Math.floor(Math.random() * 2) + 1;
        const randomGender = Math.floor(Math.random() * 2) + 1;
        testData.push({
            id: a,
            type: randomType % 2 === 0 ? '임상군' : '대조군',
            name: '김리자',
            birthday: '2001.1.5',
            gender: randomGender % 2 === 0 ? '남성' : '여성',
            subscription: '2001.1.5',
            startTime: '2001.1.5'
        })
    }
    console.log(testData);
    let htmlContent = '';
    testData.forEach(function(data){
        htmlContent += `
        <li>
            <span>${data.id}</span>
            <span>${data.type}</span>
            <span>${data.name}</span>
            <span>${data.birthday}</span>
            <span>${data.gender}</span>
            <span>${data.subscription}</span>
            <span>${data.startTime}</span>
            <div><a href="">상세</a></div>
        <tr>
        `
    })

    $('.memberPage .boardBox ol').html(htmlContent);
}