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

    $('.manageForm').length && manageForm();
    $('.popup').length && popup();
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
        $(this).siblings('.password').removeClass('active');
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
            location.href = 'exercise.html'
        }else {
            // 정보가 맞지 않을 때
            $('fieldset ul li input').addClass('error');
        }
    })
}


function dropBox(){
    $('body').click(function(){
        $('.dropBox div').removeClass('active');
    })
    $('.dropBox').click(function(e){
        e.stopPropagation();
        $(this).find('div').toggleClass('active');
    });

    $('.dropBox div button').click(function(e){
        $('.dropBox div button').removeClass('active');
        $(this).addClass('active');
        $('[data-type]').html($(this).html());
    })
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
            $('.exercisePage > [data-popupOpen="upload"]').attr('disabled',false)
        }else {
            isUpload = false
            $('table tbody tr').addClass('fail')
            $('.exercisePage > [data-popupOpen="upload"]').attr('disabled',true)
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
            <td><button data-popupOpen="delete">파일 제거</button></td>
            <td>${inputFile.name}</td>
            <td>${fileSize}</td>
            <td>${isUpload ? '완료' : '업로드 실패'}</td>
            <td>${date}</td>
        `)

        popup();
        // $('table tbody tr td button').click(function(e){
        //     $('table tbody tr').html(uploadMessage);
        //     $('input[type="file"]').val('')
        // })
    }

    function decimal(number){
        return number.toFixed(2);
    }

    // RE 운동등록 - 업로드 버튼
    $('button[data-btn="upload"]').click(function(){
        const files = $('input[type="file"]')[0].files[0];
        const type = $('[data-type]').html();
        console.log(files);
        console.log(type);
    });
}

function member() {
    const testData = []
    const testName = ['이효중', '강윤석', '정현기', '박성준', '이희준','최혜나', '김지나', '성지윤', '김은혜', '이서연', '김성은']
    for(let a = 1; a < 11; a++){
        const randomType = Math.floor(Math.random() * 10);
        const randomName = Math.floor(Math.random() * 10);
        const randomGender = Math.floor(Math.random() * 10);
        testData.push({
            id: a,
            type: randomType % 2 === 0 ? '임상군' : '대조군',
            name: testName[randomName],
            birthday: '2001.1.5',
            gender: randomGender % 2 === 0 ? '남성' : '여성',
            subscription: '2001.1.5',
            startTime: '2001.1.5'
        })
    }
    let testData2 = [...testData]

    if($('.boardBox.clinical').length){testData2 = testData.filter((value)=> value.type === '임상군')}
    if($('.boardBox.contrast').length){testData2 = testData.filter((value)=> value.type === '대조군')}

    $('body').click(function(){
        $('.searchArea div').html('');
    })

    $('.searchArea').click(function(e){
        e.stopPropagation();
    })

    insertData(testData2)

    $('.searchArea input[type="search"]').on('input', function(){
        const firstName = $(this).val();
        firstName === '' ? $(this).siblings('button').removeClass('active') : $(this).siblings('button').addClass('active')
        searchEvent($(this))
    })

    $('.searchArea input[type="search"]').on('blur',function(){
        $(this).val() === '' && $(this).siblings('button').removeClass('active');
    })

    $('.searchArea input[type="search"]').on('focus',function(){
        if($(this).val()){
            searchEvent($(this))
        }
    })

    $('.searchArea button').click(function(){
        if($(this).hasClass('active')){
            $('.searchArea input[type="search"]').val('');
            $('.searchArea input[type="search"]').focus();
            $(this).siblings('div').html('')
        }
    })

   
    function insertData(testData2){
        let htmlContent = '';
        testData2.forEach(function(data){
            htmlContent += `
            <li>
                <span>${data.id}</span>
                <span>${data.type}</span>
                <span>${data.name}</span>
                <span>${data.birthday}</span>
                <span>${data.gender}</span>
                <span>${data.subscription}</span>
                <span>${data.startTime}</span>
                <div><a href="member-detail-info.html">상세</a></div>
            <tr>
            `
        })
    
        $('.memberPage .boardBox ol').html(htmlContent);
    }

    function searchEvent(select){
        const firstName = select.val();
        const searchData = testData2.filter((value)=> value.name.startsWith(select.val()));
        let htmlContent = '';
        searchData.forEach(function(data){
            htmlContent += `
            <li data-id="${data.id}">
                <span><mark>${firstName}</mark>${data.name.replace(firstName, '')}</span>
                <span>${data.type}</span>
                <span>${data.gender}</span>
                <span>${data.birthday}</span>
                <span>010-0000-0000</span>
            <tr>
            `
        })
        searchData.length && select.siblings('div').html(`<ul>${htmlContent}</ul>`)

        $('.searchArea div ul li').click(function(){
            const clickData = testData2.filter((value)=> value.id == $(this).attr('data-id'));
            insertData(clickData)
            $('.searchArea div').html('');
        })
        
    }
}


function manageForm() {
    const data = {};
    let currentDate;
    $('input').each(function(){
        const input = $(this);
        const inputFormet = input.attr('data-formet');
        if(!!input.attr('required')) {
            if(input[0].type !== 'radio'){
                if(input.attr('data-formet') === 'date') {
                    data[input.attr('name')] = input.val().replace(/\D/g, "")
                } else if(input.attr('data-formet') === 'time') {
                    data[input.attr('name')] = input.val().replace(/\D/g, "")
                } else {
                    data[input.attr('name')] = input.val() !== '' ? input.val() : '';
                }
            }
            if(input[0].type === 'radio' && $(this).is(':checked')) {
                data[input.attr('name')] = $(this).val();
            }
        }

        currentDate = {...data}

        input.on('input', function(){
            const value = input.val()
            if(inputValidation(inputFormet, value) || input[0].type === 'radio') {
                $(this).parent().removeClass('error')
                data[input.attr('name')] = value;
            } else {
                $(this).parent().addClass('error');
                data[input.attr('name')] = '';
            }
            input.hasClass('error') && input.removeClass('error');

            const dataResult = Object.entries(data).every(function([key, value]) {
                return !!value
            })
            $('[data-btn="fin"]').attr('disabled', !dataResult)
        })
    });
    
    $('.valueDelete').click(function(e){
        e.preventDefault();
        $(this).parent().parent().removeClass('error');
        $(this).parent().siblings('input').val('').focus();
    })
    
    $('.update').click(function(e){
        e.preventDefault();
        const div = $(this).parent().parent();
        const input = $(this).parent().siblings('input');
        div.addClass('update');
        input.attr('disabled', false).focus();
        if(input.attr('data-formet') === 'date') {
            input.val(input.val().replace(/\D/g, ""))
        }
        if(input.attr('data-formet') === 'time') {
            input.val(input.val().replace(/\D/g, ""))
        }
    })
    
    $('.cancel').click(function(e){
        e.preventDefault();
        const input = $(this).parent().siblings('input');
        const div = $(this).parent().parent();
        input.attr('disabled', true)
        div.removeClass('error').removeClass('update')
        if(input[0].type === 'radio'){
            input.prop("checked", false);
            input.each(function(){
                console.log($(this).attr('id') === currentDate[input.attr('name')]);
                $(this).attr('id') === currentDate[input.attr('name')] && $(this).prop("checked", true);
            })
        }
        if(input.attr('data-formet') === 'date') {
            input.val(currentDate[input.attr('name')].replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2.$3"));
            return
        }
        if(input.attr('data-formet') === 'time') {
            input.val(currentDate[input.attr('name')].replace(/(\d{2})(\d{2})/, "$1 : $2"));
            return
        }
        input.val(currentDate[input.attr('name')])
    })
    
    $('.confirm').click(function(e){
        e.preventDefault();
        const div = $(this).parent().parent();
        const input = $(this).parent().siblings('input');
        currentDate[input.attr('name')] = input.val();
        div.removeClass('error').removeClass('update')
        input.attr('disabled', true)
        if(input.attr('data-formet') === 'date') {
            input.val(input.val().replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2.$3"));
            return;
        }
        if(input.attr('data-formet') === 'time') {
            input.val(input.val().replace(/(\d{2})(\d{2})/, "$1 : $2"));
            return
        }
    })

    $('input[type="reset"]').click(function(){
        $('[data-btn="fin"]').attr('disabled', true)
        $('.popup').removeClass('active');
    })

    $('.back').click(function(){
        !$(this).attr('data-popupOpen') && history.go(-1);
        // 값 비교
        /* const result = Object.entries(data).every(function([key, value]) {
            return value === currentDate[key]
        }) */
    })
}


function popup(){
    $('[data-popupOpen]').click(function(e){
        e.preventDefault();
        const popupName = $(this).attr('data-popupOpen');
        $(`[data-popup="${popupName}"]`).addClass('active');
    })
    $('.popup, [data-popupClose]').click(function(e){
        e.preventDefault();
        $('.popup').removeClass('active');
    });
    $('.popup > div').click(function(e){
        e.stopPropagation();
    })
}