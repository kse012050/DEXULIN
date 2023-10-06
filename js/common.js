import api from './api.js'
import {inputValidation, dataValidation, dataChange} from './validation.js'

function styleIdx(){
    const selector = $('[data-styleIdx]');
    selector.each(function(){
        const attrValue = $(this).attr('data-styleIdx');
        $(this).find('>' + (attrValue ? attrValue : ' *')).each(function(i){
            $(this).css('--styleIdx', i);
        })
    })
}

$(document).ready(function(){
    // css index
    $('[data-styleIdx]').length && styleIdx();

    // 토큰 검사
    $('.signInPage').length || isToken();

    // 로그인
    $('.signInPage').length && signInPage();

    // 로그아웃
    $('[data-logout]').length && logout();
    
    // 드랍 박스 이벤트
    $('.dropBox').length && dropBox();
    // 템 이벤트
    $('.tabArea').length && tab();

    // 파일 업로드
    $('.exercisePage').length && exercisePage();

    // 기록 다운로드
    $('.downloadPage').length && downloadPage();

    // 회원 페이지
    $('.memberPage').length && member();
    // 관리자 페이지
    $('.managerPage').length && manager();

    // 회원, 관리자 상세 상단 정보
    $('[class*="Detail"]').length && detailTopInfo();
    // 회원, 관리자 상세 등록
    $('.manageForm[data-type="regist"]').length && manageRegistForm();
    // 회원, 관리자 상세 수정
    $('.manageForm[data-type="update"]').length && manageUpdateForm();
    // 회원 상세 - 운동기록
    $('.memberDetailPage .boardBox.workOut').length && memberDetailWorkOut();
    // 회원 상세 - 측정기록
    $('.memberDetailPage .boardBox.measure').length && memberDetailMeasure();

    // 팝업
    $('.popup').length && popup();
});

// 토큰 검사
function isToken(){
    api('valid_token').then(function(data){
        if(data.result) {
            api('select').then(function(data){
                $('[title="name"]').html(data.data.name)
            })
        } else {
            location.href = 'index.html';
        }
    })
}

// 로그인
function signInPage() {
    sessionStorage.removeItem('token');

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

    $('input[type="text"]').on('keydown',function(e){
        if (e.keyCode === 13) {
            e.preventDefault();
            $(this).val().length === 11 && $('input[type="password"]').focus();
        }
    })

    $('input[type="password"]').on('keydown',function(e){
        if (e.keyCode === 13) {
            e.preventDefault();
            $('input[type="submit"]').click();
        }
    })

    // 로그인 submit
    $('input[type="submit"]').click(function(e){
        api('login', data).then(function(data){
            $('.loading').addClass('active')
            if(data.result) {
                sessionStorage.setItem("token", data.data.token);
                location.href = 'exercise.html';
            }else {
                $('.loading').removeClass('active')
                $('fieldset ul li input').addClass('error');
            }
        })
    })
}

// 로그아웃
function logout() {
    $('[data-logout]').click(function(){
        api('logout').then(function(data){
            if(data.result){
                sessionStorage.removeItem('token');
                location.href = 'index.html'
            }
        })
    })
}

// 드랍 박스 이벤트
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

// 템 이벤트
function tab() {
    const {userId} = urlParam();
    userId || (location.href = 'member.html');
    $('.tabArea li a').each(function(){
        $(this).attr('href', $(this).attr('href') + '?userId=' + userId);
    })
}

// 파일 업로드
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

    $('button[data-btn="delete"]').click(function(e){
        $('table tbody tr').html(uploadMessage);
        $('input[type="file"]').val('')
        $('[data-popup="delete"]').removeClass('active')
        $('.exercisePage > [data-popupOpen="upload"]').attr('disabled',true)
    })

    // RE 운동등록 - 업로드 버튼
    $('button[data-btn="upload"]').click(function(){
        const files = $('input[type="file"]')[0].files[0];
        const type = $('[data-type]').html();
        $('.loading').addClass('active');
        api('upload_exercise', {upload_file: files}).then(function(data){
            if(data.result){
                $('.loading').removeClass('active');
                location.reload();
            }
        })
    });
}

// 기록 다운로드
function downloadPage(){
    $('.loading').addClass('active');
    api('record_download').then(function(data){
        if(data.result) {
            $('[data-download="xlsx"]').attr('href', data.data.file_url)
            api('measurement_download').then(function(data){
                if(data.result) {
                    $('[data-download="record"]').attr('href', data.data.file_url)
                    $('.loading').removeClass('active');
                }
            })
        }
    })
}

// 회원 페이지
function member() {
    let { page, search} = urlParam();
    page || (page = 1);
    const boardAttr = $('.boardBox').attr('data-board');

    $('body').click(function(){
        $('.searchArea div').html('');
    })

    $('.searchArea').click(function(e){
        e.stopPropagation();
    })

    if($('.boardBox').length) {
        api_list(page, search);
    }

    // 검색어가 있을 때
    if(search){
        $('.searchArea input[type="search"]').val(decodeURIComponent(search))
        $('.searchArea button').addClass('active')
    }

    $('.searchArea input[type="search"]').on('input', function(e){
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

    $('.searchArea input[type="search"]').on('keydown',function(e){
        if(e.keyCode === 13){
            const searchValue = $(this).val();
            // let link = location.href;
            let link = location.pathname.split('/').at(-1);
            // let link = 'member.html';
            link.includes('?search=') ? 
                (link = link.replace(`?search=${search}`,`?search=${searchValue}`)) :
                link += `?search=${searchValue}`;
            link.includes('?page=') && (link = link.replace(`?page=${page}`, ''));
            location.href = link;
        }
    })

    $('.searchArea button').click(function(e){
        if($(this).hasClass('active')){
            sessionStorage.setItem('search','delete');
            const link = location.pathname.split('/').at(-1);
            location.href = link;
        }
    })
    
    function api_list(page, search){
        let data = {admin_yn: 'n', page}
        boardAttr && (data = {...data, assign_group: boardAttr})
        search && (data = {...data, search: decodeURIComponent(search)});

        if(sessionStorage.getItem('move') === 'true'){
            const pageName = $('[data-board]').attr('data-board') === 'clinical' ? '임상군' : '대조군'
            $('.loading p').html(`${pageName}으로 이동중이에요! 잠시만 기다려주세요`);
            sessionStorage.removeItem('move');
        }

        $('.loading').addClass('active');
        api('list', data).then(function(data){
            if(data.result) {
                insertData(data.list)
                addPager(data.data.current_page, data.data.total_page)
                $('.loading').removeClass('active');
                if(sessionStorage.getItem('search') === 'delete'){
                    $('.memberPage .searchArea input').focus();
                    sessionStorage.removeItem('search');
                }
            }
        })
    }
   
    function insertData(data){
        let htmlContent = '';
        data.forEach(function(data, i){
            htmlContent += `
            <li>
                <span>${(i + 1) + ((page - 1) * 10)}</span>
                <span>
                    ${data.assign_group === 'clinical' ? '임상군' : ''}
                    ${data.assign_group === 'control' ? '대조군' : ''}
                </span>
                <span>${data.name}</span>
                <span>${data.birthday.replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2.$3")}</span>
                <span>
                    ${data.gender === 'male' ? '남성' : ''}
                    ${data.gender === 'm' ? '남성' : ''}
                    ${data.gender === 'f' ? '여성' : ''}
                </span>
                <span>${data.clinical_start_date.replaceAll('-', '.')}</span>
                <span>${data.clinical_start_date.replaceAll('-', '.')}</span>
                <div><a href="member-detail-info.html?userId=${data.user_id}">상세</a></div>
            </li>
            `
        })
    
        $('.memberPage .boardBox ol').html(htmlContent);
    }

    function searchEvent(select){
        const searchValue = select.val();
        api('list_search', {admin_yn: 'n', search: searchValue}).then(function(data){
            if(!data.result){
                select.siblings('div').html('')
                return
            }
            const searchData = data.list;
            // console.log(searchData.length);
            // searchData.length || select.siblings('div').html(`<p>검색 결과 없음</p>`)
            let htmlContent = '';
            searchData.forEach(function(data){
                const userName = data.name;
                const nameFirstIdx = data.name.indexOf(searchValue);
                const nameLastIdx = nameFirstIdx + searchValue.length;
                // let link = boardAttr === data.assign_group ? 
                //             `member-detail-info.html?userId=${data.user_id}` : 
                //             `member-${data.assign_group}.html?search=${data.name}`;
                let link = `member-${data.assign_group}.html?search=${data.name}`;
                htmlContent += `
                <li data-id="${data.user_id}">
                    <a href="${link}" ${boardAttr !== data.assign_group ? 'data-move' : ''}>
                        <span>${userName.slice(0, nameFirstIdx)}<mark>${searchValue}</mark>${userName.slice(nameLastIdx)}</span>
                        <span>
                            ${data.assign_group === 'clinical' ? '임상군' : '대조군'}
                            ${boardAttr !== data.assign_group ? '바로가기' : ''}
                        </span>
                        <span>${data.gender === 'm' ? '남성' : '여성'}</span>
                        <span>${dataChange('date', data.birthday)}</span>
                        <span>${dataChange('mobile', data.mobile)}</span>
                    </a>
                </li>
                `
            })
            searchData.length ? 
                select.siblings('div').html(`<ul>${htmlContent}</ul>`) :
                select.siblings('div').html(`<p>입력하신 내용과 일치하는 리스트가 없어요!</p>`);

            $('[data-move]').click(function(){
                sessionStorage.setItem('move', 'true');
            })
        })
       /*  const searchData = testData2.filter((value)=> value.name.startsWith(select.val()));
        let htmlContent = '';
        searchData.forEach(function(data){
            htmlContent += `
            <li data-id="${data.id}">
                <span><mark>${firstName}</mark>${data.name.replace(firstName, '')}</span>
                <span>${data.type}</span>
                <span>${data.gender}</span>
                <span>${data.birthday}</span>
                <span>010-0000-0000</span>
            </li>
            `
        })
        searchData.length && select.siblings('div').html(`<ul>${htmlContent}</ul>`)

        $('.searchArea div ul li').click(function(){
            const clickData = testData2.filter((value)=> value.id == $(this).attr('data-id'));
            insertData(clickData)
            $('.searchArea div').html('');
        }) */
        
    }
}

// 관리자 페이지
function manager(){
    let activeArray = []
    let { page } = urlParam()
    page || (page = 1)

    if($('.boardBox').length) {
        let data = {admin_yn: 'y', page}
        $('.loading').addClass('active');
        api('list', data).then(function(data){
            if(data.result) {
                insertData(data.list)
                addPager(data.data.current_page, data.data.total_page)
                $('.loading').removeClass('active');
            }
        })
    }

    function insertData(data){
        let htmlContent = '';
        data.forEach(function(data, i){
            htmlContent += `
            <li>
                <div>
                    <input type="checkbox" id="${data.user_id}" ${data.activie_yn === 'n' ? 'disabled' : ''}>
                    <label for="${data.user_id}"></label>
                </div>
                <span>${data.name}</span>
                <span>${dataChange('date', data.birthday)}</span>
                <span>${data.email !== null ? data.email : ''}</span>
                <span>${dataChange('mobile', data.mobile)}</span>
                <div>
                    <a href="manager-detail.html?userId=${data.user_id}">상세</a>
                </div>
            </li>
            `
        })
    
        $('.managerPage .boardBox ol').html(htmlContent);
        $('.boardBox ol input[type="checkbox"]').on('change',function(){
            if($(this).is(':checked')){
                activeArray.push($(this).attr('id'))
            }else{
                activeArray = activeArray.filter((value)=>value !== $(this).attr('id'))
            }
            isCheckAll();
        })
        !$('.boardBox ol input[type="checkbox"]:not(:disabled)').length && $('[data-check="all"]').prop("disabled", true);
        $('[data-check="all"]').on('change',function(){
            $('.boardBox ol input[type="checkbox"]').prop("checked", $(this).is(':checked'));
            activeArray = [];
            if($(this).is(':checked')){
                $('.boardBox ol input[type="checkbox"]:not(:disabled)').each(function(){
                    activeArray.push($(this).attr('id'))
                })
            }
            isCheckAll();
        })
    }

    function isCheckAll(){
        activeArray.length ? 
            $('[data-popupOpen="disabled"]').prop("disabled", false) :
            $('[data-popupOpen="disabled"]').prop("disabled", true);
        $('[data-check="all"]').prop("checked", activeArray.length === $('.boardBox ol input[type="checkbox"]:not(:disabled)').length);
        $('[data-totalPeople]').html(activeArray.length)
    }

    $('[data-disabled]').click(function(){
        console.log(activeArray.join(','));
        api('admin_unactivie_update',{u_ids: activeArray.join(',')}).then(function(data){
            data.result && location.reload();
        })
    })
}

// 회원, 관리자 상세 등록
function manageRegistForm() {
    let data = {};
    $('input').each(function(){
        const input = $(this);
        const inputFormet = input.attr('data-formet');
        const inputName = input.attr('name');
        if(!!input.attr('required')) {
            if(input[0].type !== 'radio'){
                data[inputName] = undefined;
            }
            if(input[0].type === 'radio' && $(this).is(':checked')) {
                data[input.attr('name')] = $(this).val();
            }
        }

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
            $(`[data-error="${input.attr('name')}"]`).removeClass('active');

            const dataResult = Object.entries(data).every(function([key, value]) {
                return !!value
            })
            $('[data-btn="fin"]').attr('disabled', !dataResult)
        })
    });

    $('input ~ button.valueDelete').click(function(e){
        e.preventDefault();
        $(this).siblings('input').val('').focus().parent().removeClass('error');
    })

    $('input[type="submit"]').click(function(e){
        e.preventDefault();
    });

    // 일반회원 등록
    $('input[type="submit"]').click(function(){
        // [data-regist="user"]
        const type = $(this).attr('data-regist')
        type === 'user' && (data = {...data, 'admin_yn': 'n'});
        type === 'admin' && (data = {...data, 'admin_yn': 'y'});
        // data = {...data, 'admin_yn': 'n'};
        api('insert', data).then(function(data){
            if(!data.result){
                $('[data-error="mobile"]').addClass('active');
                $('.popup').removeClass('active');
                $('[name="mobile"]').val('').focus();
            }
            (data.result && type === 'user') && (location.href = 'member.html');
            (data.result && type === 'admin') && (location.href = 'manager.html');
        })
    })
}

// 회원, 관리자 상세 상단 정보
function detailTopInfo(){
    const {userId} = urlParam();
    api('detail', {'u_id': userId}).then(function(data){
        if(data.result) {
            const gender = data.data.gender === 'm' ? '남성' : '여성';
            const year = data.data.birthday.substring(0, 4);
            const month = data.data.birthday.substring(4, 6);
            const day = data.data.birthday.substring(6, 8);
            const birthday = `${year}년 ${month}월 ${day}일`;
            $('[title="userName"]').html(data.data.name)
            $('[title="assign"]').html(data.data.assign_group === 'clinical' ? '임상군' : '대조군')
            $('[title="gender"]').html(gender)
            $('[title="birthday"]').html(birthday)
            $('[title="join_date"]').html(dataChange('mobile', data.data.mobile))
        }
    });
}

// 회원, 관리자 상세 수정
function manageUpdateForm() {  
    const urlParams = new URL(location.href).searchParams;
    const id = urlParams.get("userId");
    const isAdmin = location.href.includes('member') ? 'n' : (location.href.includes('manager') && 'y');

    (!id && isAdmin === 'n') && (location.href = 'member.html');
    (!id && isAdmin === 'y') && (location.href = 'manager.html');

    let userData = {};
    let currentDate;
    $('.loading').addClass('active');
    api('detail', {'u_id': id}).then(function(data){
        if(data.result) {
            if($('.managerDetailPage').length && data.data.activie_yn === 'n'){
                // data.data.activie_yn === 'y' && $('.finBtn .btn-red').addClass('active')
                // data.data.activie_yn === 'n' && $('.finBtn .btn-purple').addClass('active')
                $('.managerDetailPage').addClass('disabled');
                $('.manageForm ul li > div .buttonArea').remove();
            }
            $('input').each(function(){
                const input = $(this);
                const inputFormet = input.attr('data-formet');
                const inputName = input.attr('name');
                const apiData = (inputFormet !== 'time' ? {...data.data} : {...data.data.measurement_info})
                if(!!input.attr('required')) {
                    userData[inputName] = apiData[inputName] !== null ?
                                            (inputName !== 'email' ? 
                                                apiData[inputName].replaceAll('-','').replaceAll(':','') :
                                                apiData[inputName]
                                                ) :
                                            '';
                    if(input[0].type !== 'radio'){
                        $(`input[name="${inputName}"]`).val(dataChange(inputFormet, userData[inputName]));
                    }
                    if(input[0].type === 'radio') {
                        $(`input[name="${inputName}"]#${data.data[inputName]}`).prop("checked", true);
                    }
                }
                
                currentDate = {...userData}
        
                input.on('input', function(){
                    const value = input.val()
                    if(inputValidation(inputFormet, value) || input[0].type === 'radio') {
                        $(this).parent().removeClass('error')
                        userData[inputName] = value;
                    } else {
                        $(this).parent().addClass('error');
                        userData[inputName] = '';
                    }
                    input.hasClass('error') && input.removeClass('error');
                })
            });
            $('.loading').removeClass('active');
        }
    })
   
    // 인풋 텍스트 삭제
    $('.valueDelete').click(function(e){
        e.preventDefault();
        $(this).parent().parent().removeClass('error');
        $(this).parent().siblings('input').val('').focus();
    })
    
    // 수정 버튼
    $('.update').click(function(e){
        e.preventDefault();
        const div = $(this).parent().parent();
        const input = $(this).parent().siblings('input');
        const inputFormet = input.attr('data-formet')
        div.addClass('update');
        input.attr('disabled', false).focus();
        if(inputFormet === 'date' || inputFormet === 'time' || inputFormet === 'mobile') {
            input.val(input.val().replace(/\D/g, ""))
        }
    })
    
    // 취소버튼
    $('.cancel').click(function(e){
        e.preventDefault();
        const div = $(this).parent().parent();
        const input = $(this).parent().siblings('input');
        const inputFormet = input.attr('data-formet');
        const inputName = input.attr('name');
        input.attr('disabled', true)
        div.removeClass('error').removeClass('update')
        if(input[0].type === 'radio'){
            input.siblings(`#${currentDate[inputName]}`).prop("checked", true)
        } else {
            $(`input[name="${inputName}"]`).val(dataChange(inputFormet, currentDate[inputName]));
        }
    })

    // 확인버튼
    $('.confirm').click(function(e){
        e.preventDefault();
        const div = $(this).parent().parent();
        const input = $(this).parent().siblings('input');
        const inputFormet = input.attr('data-formet');
        const inputName = input.attr('name');
        div.removeClass('error').removeClass('update')
        input.attr('disabled', true)
        if(input[0].type === 'radio'){
            userData[inputName] = input.siblings(':checked').val();
            // console.log(inputName, userData[inputName]);
        } else {
            userData[inputName] = input.val();
            $(`input[name="${inputName}"]`).val(dataChange(inputFormet, userData[inputName]));
        }
        api('update',{admin_yn: isAdmin, [inputName]: userData[inputName], u_id: id}).then(function(data){
            // console.log(data);
        })
    })

    // 초기화 버튼
    $('input[type="reset"]').click(function(){
        $('[data-btn="fin"]').attr('disabled', true)
        $('.popup').removeClass('active');
    })

    $('[data-delete]').click(function(e){
        e.preventDefault();
        api('delete', {u_id: id}).then(function(data){
            data.result && (location.href = 'member.html');
            $('.popup').removeClass('active');
        })
    })

    // 비활성화 버튼
    $('[data-disabled]').click(function(e){
        e.preventDefault();
        api('update',{u_id: id, activie_yn: 'n', admin_yn: 'y'}).then(function(data){
            data.result && location.reload();
        })
    })
    
    // 활성화 버튼
    $('[data-active]').click(function(e){
        e.preventDefault();
        api('update',{u_id: id, activie_yn: 'y', admin_yn: 'y'}).then(function(data){
            data.result && location.reload();
        })
    })
}

// 회원 상세 - 운동기록
function memberDetailWorkOut(){
    let {userId, page, filters} = urlParam()
    page || (page = 1);
    filters || (filters = 'yyyyy')

    $('.loading').addClass('active');
    typeLink(userId, filters);
    Api_workOut(filters);

    function insertData(data){
        let htmlContent = '';
        let currentDate = '';
        data.forEach(function(data){
            (currentDate && currentDate !== data.measurement_date) && (htmlContent += `</ol>`);
            currentDate !== data.measurement_date &&(htmlContent += `<ol>`);
            // 진행 시간
            let totalSeconds = data.progress_value;
            let hours = Math.floor(totalSeconds / 3600);
            let minutes = Math.floor((totalSeconds % 3600) / 60);
            let seconds = totalSeconds % 60;
            hours = hours < 10 ? '0' + hours : hours;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;
            // 진행 시간 fin
            let formattedTime = hours + ':' + minutes + ':' + seconds;
            htmlContent += `<li>
                                <span>${currentDate !== data.measurement_date ? data.measurement_date : ''}</span>
                                <div ${data.measurement_type.includes('ae') ? 
                                        (data.measurement_type === 'ae_m' ? 'data-time="아"' :
                                            (data.measurement_type === 'ae_a' ? 'data-time="점"' : 'data-time="저"')
                                            ) : ''}>
                                    <span ${data.eat_time === null ? 'data-none' : ''}>${data.eat_time ? data.eat_time : ''}</span>
                                </div>
                                <span ${data.start_date_time === null ? 'data-none' : ''}>${data.start_date_time ? data.start_date_time : ''}</span>
                                <span>${data.measurement_type.includes('ae') ? 'AE(걷기)' : 'RE(스쿼트)'}</span>
                                <span ${data.progress_value === null && !data.measurement_type.includes('ae')? 'data-none' : ''}>
                                    ${!data.measurement_type.includes('ae') && data.progress_value !== null ? formattedTime : ''}
                                </span>
                                <span ${(data.accuracy_value === null && !data.measurement_type.includes('ae')) ? 'data-none' : ''}>${(data.accuracy_value && !data.measurement_type.includes('ae')) ? data.accuracy_value : ''}</span>
                                <span ${(data.goal_value === null && !data.measurement_type.includes('ae')) ? 'data-none' : ''}>${(data.goal_value && !data.measurement_type.includes('ae')) ? data.goal_value + '회': ''}</span>
                                <span ${data.measurement_value === null ? 'data-none' : ''}
                                        ${(!data.measurement_type.includes('ae') && data.goal_value > data.measurement_value) ? 'data-not' : ''}>
                                    ${data.measurement_value ? data.measurement_value + (data.measurement_type.includes('ae') ? '걸음' : '회'): ''}
                                </span>
                            </li>`;
            (!currentDate || currentDate !== data.measurement_dat) && (currentDate = data.measurement_date);
        })
        htmlContent += '</ol>';
        $('.boardBox.workOut ol').remove();
        $('.boardBox.workOut .boardTitle').after(htmlContent);
    }

    function Api_workOut(filters) {
        let Obj_filters = {}
        for (var i = 0; i < filters.length; i++) {
            var key = 'filter' + (i + 1);
            Obj_filters[key] = filters[i];
        }
        api('exercise_recording', {u_id: userId, page, ...Obj_filters}).then(function(data){
            if(data.result) {
                insertData(data.list)
                addPager(data.data.current_page, data.data.total_page)
                $('.loading').removeClass('active');
            }
        })
    }
}

// 회원 상세 - 측정기록
function memberDetailMeasure() {
    let {userId, page, filters} = urlParam();
    let measurement_yn;
    page || (page = 1)
    filters || (filters = 'yy')
    $('.loading').addClass('active');
    typeLink(userId, filters);
    measurement_yn = filters === 'yy' ? undefined : (filters === 'yn' ? 'y' : 'n');
    $('.typeArea li a[href *= "filters=nn"]').click(function(e){
        e.preventDefault();
    })
    api('measurement_recording', {u_id: userId, page, measurement_yn}).then(function(data){
        if(data.result) {
            insertData(data.list)
            addPager(data.data.current_page, data.data.total_page)
            $('.loading').removeClass('active');
        }
    })

    function insertData(data){
        let dataArray = [];
        data.forEach(function(current, idx, prev){
            prev[idx - 1]?.measurement_date !== current.measurement_date &&dataArray.push([]);
            dataArray[dataArray.length - 1].push(current)
        })
        dataArray = dataArray.map((arr) =>
            arr.sort((a , b) =>
                Number(a.measurement_time.split(':').join('')) - Number(b.measurement_time.split(':').join(''))
            )
        )

        let htmlContent = '';
        dataArray.forEach(function(arr){
            arr.forEach(function(data, idx){
                htmlContent += `
                <li>
                    <span>${!idx ? data.measurement_date.replaceAll('-', '.') : ''}</span>
                    <span ${data.measurement_time === null ? 'data-none' : ''}>${data.measurement_time !== null ? data.measurement_time : ''}</span>
                    <span ${data.measurement_value === null ? 'data-none' : ''}>${data.measurement_value !== null ? data.measurement_value : ''}</span>
                </li>
                `
            })
        })

        $('.boardBox.measure ol').html(htmlContent);
    }
}

// 팝업
function popup(){
    $('[data-popupOpen]').click(function(e){
        e.preventDefault();
        const popupName = $(this).attr('data-popupOpen');
        $(`[data-popup="${popupName}"]`).addClass('active');
    })

    // 팝업
    $('[data-popupClose]').click(function(e){
        e.preventDefault();
        $('.popup').removeClass('active');
    });

    // 등록 팝업
    $('[data-popupRegistClose]').click(function(e){
        e.preventDefault();
        $('.popup-regist').removeClass('active');
    });

    // 등록 팝업 닫기
    $('[data-popupCloseAll]').click(function(){
        $('.popup, .popup-regist').removeClass('active');
        $('.manageForm ul li div').removeClass('error')
        $('.manageForm ul li div input[type="text"]').val('');
        $('[data-error]').removeClass('active');
    })
    $('[class*="popup"] > div').click(function(e){
        e.stopPropagation();
    })
    $('input[type="reset"]').click(function(){
        $('.popup').removeClass('active');
        $('.manageForm ul li div').removeClass('error')
        $('[data-btn="fin"]').prop('disabled',true);
    })

    $('.back').click(function(){
        // !$(this).attr('data-popupOpen') && history.go(-1);
        // 값 비교
        /* const result = Object.entries(data).every(function([key, value]) {
            return value === currentDate[key]
        }) */
    })
}

// url 파라미터
function urlParam(){
    const obj = {}
    location.search.slice(1).split('?').forEach((value)=>{
        value = value.split('=')
        obj[value[0]] = value[1];
    })
    return obj;
}

// 페이저 추가
function addPager(currentPage, totalPage) {
    const {userId, page, filters, search} = urlParam();
    $('.pagerBox').remove();
    if(!totalPage){return}
    let pageName = location.pathname.split('/').at(-1);
    userId && (pageName += `?userId=${userId}`)
    filters && (pageName += `?filters=${filters}`)
    search && (pageName += `?search=${search}`)
    let htmlContent = '';
    htmlContent += `<div class="pagerBox" data-styleIdx="a">
                        <a href="${pageName}?page=${1}" ${currentPage !== 1 ? 'class="active"' : ''}>맨 앞 페이지로 이동</a>
                        <a href="${pageName}?page=${currentPage - 1}" ${currentPage !== 1 ? 'class="active"' : ''}>앞 페이지로 이동</a>
                        <ol>`;
    for(let a = 1; a < totalPage + 1; a++){
        htmlContent += `<li ${currentPage === a ? 'class="active"' : ''}><a href="${pageName}?page=${a}">${a}</a></li>`
    }
    htmlContent += `</ol>
                    <a href="${pageName}?page=${currentPage + 1}" ${currentPage !== totalPage ? 'class="active"' : ''}>뒷 페이지 이동</a>
                    <a href="${pageName}?page=${totalPage}" ${currentPage !== totalPage ? 'class="active"' : ''}>맨 뒷 페이지 이동</a>
                </div>`;
    $('.boardBox').after(htmlContent)
    styleIdx();

    $('.pagerBox > a:not(.active)').click(function(e){
        e.preventDefault();
    })
}

// 타입 링크 - 회원 상세 - 운동 기록, 측정 기록 페이지 사용
function typeLink(userId, filters){
    $('.typeArea li').each(function(i){
        filters[i] === 'y' && $(this).addClass('active');
        let addFilters = filters.split('')
        addFilters[i] = addFilters[i] !== 'y' ? 'y' : 'n';
        addFilters = addFilters.join('')
        
        const link = location.pathname.split('/').at(-1) + `?userId=${userId}?filters=${addFilters}`;
        $(this).children('a').attr('href', link)
    })
}