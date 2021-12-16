// id данного кандидата
id_cand = sessionStorage.getItem('id_cand');

let date_start = document.getElementById("date_start");
let date_end = document.getElementById("date_end");
let date_time = document.getElementById("date_time");
let select_vac = document.getElementById("select_vac");

// добавить в избранное
$("body").on("click", ".add_to_favorites", function(){
    let button = this;
    let fav = this.getAttribute("favorite") == "true";
    $.ajax({
        url: address()+endpoints.favorite+"/"+id_cand,
        type: fav ? "DELETE" : "POST",
        success: function (){
            button.innerHTML = fav ? "Добавить в избранное" : "Удалить из избранного";
            button.setAttribute("favorite", !fav);
        },
        xhrFields: {
            withCredentials: true
        }
    });
});

function sendMeeting()
{
    let duration = date_time.value.split(":");
    $.ajax({
        url: address() + endpoints.meeting.replace(":candidate_id", id_cand).replace(":vacancy_id", select_vac.value),
        type: "POST",
        data: {
            startDate: date_start.value,
            endDate: date_end.value,
            duration: {hours: duration[0], minutes: duration[1]}
        },
        success: function (data) {
            alert(data.message);
        },
        error: function (data) {
            alert(data.responseJSON.message);
        },
        xhrFields: {
            withCredentials: true
        }
    });
}

// назначить собеседование
$("body").on("click", ".set_interview", function(){
    if (!date_start.value || !date_end.value || !date_time.value)
        alert("Заполните все поля");
    else {
        let start = new Date(date_start.value);
        start.setHours(0);
        start.setMinutes(0);
        start.setSeconds(0);
        start.setMilliseconds(0);
        let end = new Date(date_end.value);
        end.setHours(23);
        end.setMinutes(59);
        end.setSeconds(59);
        end.setMilliseconds(59);
        let today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        if (start > end) {
            alert("Начало выборки должно быть раньше её окончания.");
            return;
        }
        if (start < today)
        {
            alert("Выборка не может начинаться с момента раньше текущего времени.");
            return;
        }
        if (confirm("Подтвердить собеседование?")) {
            sendMeeting();
            document.querySelector(".body_fade").classList.remove("active");
            document.querySelector(".modal_wind").classList.remove("active");
        }
    }
});
