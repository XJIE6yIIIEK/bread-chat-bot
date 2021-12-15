// id данного кандидата
id_cand = sessionStorage.getItem('id_cand');
console.log(id_cand);

let date_start = document.getElementById("date_start");
let date_end = document.getElementById("date_end");
let date_time = document.getElementById("date_time");
let select_vac = document.getElementById("select_vac");

// добавить в избранное
$("body").on("click", ".add_to_favorites", function(){
    if (confirm("Добавить " + "data.s_name" + " в избранное ?")) {
        // пихнуть данные на сервак
    }
});

// назначить собеседование
$("body").on("click", ".set_interview", function(){
    console.log(date_start.value);
    console.log(date_end.value);
    console.log(date_time.value);
    console.log(select_vac.value);

    if (!date_start.value || !date_end.value || !date_time.value)
        alert("Заполните все поля");
    else
        if (confirm("Подтвердить собеседование?")) {
           // пихнуть данные на сервак
        }
});

function fillInterview(data)
{
    //date_start.value = ;
    //date_end.value = ;
    //date_time.value = ;

    let option = document.createElement('option');
    //option.text = ;
    document.getElementById("select_vac").add(option);
}