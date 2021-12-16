function NameHR(data)
{
    let HR_name = document.querySelector(".HR_name");
    HR_name.innerHTML = data.user.s_name;
}

function fillAllInterviews(data)
{
    for ( key in data )
    {
        console.log(key);
        console.log(data[key]);

        let name_interview = document.createElement("div");
        name_interview.classList.add("name_interview_candidate");
        let a = document.createElement("a");
        //a.innerHTML = data... ФИО кандидата, назначенного на собеседование
        a.href = "candidate.html";
        a.classList.add("candidates");
        name_interview.appendChild(a);

        let date_interview = document.createElement("div");
        date_interview.classList.add("date_interview_candidate");
        //name_interview.innerHTML = data... время собеседования (нужно ещё + 2 часа)

        let interview_candidate = document.createElement("div");
        interview_candidate.classList.add("interview_candidate");
        interview_candidate.appendChild(name_interview);
        interview_candidate.appendChild(date_interview);
        
    };
}
function fillAllFavorites(data)
{
    for ( key in data )
    {
        console.log(data[key]);

        let name_favorite = document.createElement("div");
        name_favorite.classList.add("name_favorite_candidate");
        let a = document.createElement("a");
        a.value = data[key].s_name;
        a.href = "candidate.html";
        a.classList.add("candidates");
        name_favorite.appendChild(a);

        let button_delete = document.createElement("button");     
        button_delete.innerHTML = "X";
        button_delete.classList.add("favorite_candidate_delete_button");

        let favorite_candidate = document.createElement("div");
        favorite_candidate.classList.add("favorite_candidate");
        favorite_candidate.appendChild(name_favorite);
        favorite_candidate.appendChild(button_delete);
        
    };
}
$.ajax({
    url: address()+endpoints.user,
    success: function (data, textStatus, request)
    {
        //console.log(data);
        NameHR(data);
        //fillAllInterviews(data.meetings);
        //fillAllFavorites(data.favorites);
    },
    error: function(request, textStatus, errorThrown){
        authCheck(request);
    },
    xhrFields: {
        withCredentials: true
    }
})

// удаление из избранных кандидата по клику
$("body").on("click", ".favorite_candidate_delete_button", function() {
    if (confirm("Удалить кандидата из избранных ?")) {
        deleteInfo(this.parentNode);
    }
});

// изменение пароля
$("body").on("click", ".save_button", function() {
    let password = document.getElementById("new_password").value;
    let password_verification = document.getElementById("verification_new_password").value;
    if (password != password_verification)
    {
        document.getElementById("error_label").value = "Пароли не совпадают.";
        return;
    }
    $.ajax({
        url: address()+endpoints.changePassword,
        type: "PUT",
        data: {s_password: password}
    });
});

// запоминаем id кандидата
$("body").on("click", ".candidates", function()
{
    sessionStorage.setItem('id_cand', this.id);
});