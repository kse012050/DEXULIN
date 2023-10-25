function dataToform(type, data){
    const formData = new FormData();
    formData.append("func_type", type);
    data && Object.entries(data).forEach(function([key, value]){
        formData.append(key, value);
    })
    type === 'login' || formData.append('token', sessionStorage.getItem("token"));
    return formData;
}


export default function api(type, data) {
    const formData = dataToform(type, data);
    return fetch(`http://dexulin.team1985.com/api/admin/${(type.includes('download') || type.includes('upload')) ? 'record' : 'profile'}`, {
        "method": "POST",
        body: formData
    }).then((res)=>res.json())

    /* return new Promise(function(resolve, reject) {
        $.ajax({
            ...settings,
            success: function(data) {
                console.log('success', data);
                resolve(data);
            },
            error: function(request, status, error) {
                reject(new Error(status));
            }
        });
    }); */
}