function NameHR(data)
{
    let HR_name = document.querySelector(".HR_name");
    HR_name.innerHTML = data.user.s_name;
}

function fillAllInterviews(data)
{
    for ( key in data )
    {
        let frame = document.querySelector(".interviews");

        let interview_candidate = document.createElement("div");
        interview_candidate.classList.add("interview_candidate");
        interview_candidate.setAttribute("candidate_id", data[key].n_candidate);
        interview_candidate.setAttribute("vacancy_id", data[key].n_vacancy);
        frame.appendChild(interview_candidate);

        let name_interview = document.createElement("div");
        name_interview.classList.add("name_interview_candidate");
        let a = document.createElement("a");
        a.innerHTML = data[key].s_name;
        a.href = "candidate.html";
        a.classList.add("candidates");
        name_interview.appendChild(a);
        interview_candidate.appendChild(name_interview);

        let status_interview = document.createElement("div");
        status_interview.classList.add("status_interview_candidate");
        status_interview.innerHTML = data[key].s_status_name;
        interview_candidate.appendChild(status_interview);

        let vacans_interview = document.createElement("div");
        vacans_interview.classList.add("vacans_interview_candidate");
        vacans_interview.innerHTML = data[key].s_vacancy_name;
        interview_candidate.appendChild(vacans_interview);

        let date_interview = document.createElement("div");
        date_interview.classList.add("date_interview_candidate");
        date_interview.innerHTML = data[key].d_date;
        interview_candidate.appendChild(date_interview);

        let button_delete = document.createElement("button");
        button_delete.innerHTML = "X";
        button_delete.classList.add("interview_candidate_delete_button");
        interview_candidate.appendChild(button_delete);
    };
}
function fillAllFavorites(data)
{
    for ( key in data )
    {
        let name_favorite = document.createElement("div");
        name_favorite.classList.add("name_favorite_candidate");
        let a = document.createElement("a");
        a.innerHTML = data[key].s_name;
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
        favorite_candidate.setAttribute("candidate_id", data[key].id);
        document.querySelector(".favorites").appendChild(favorite_candidate);
    };
}
$.ajax({
    url: address()+endpoints.user,
    success: function (data, textStatus, request)
    {
        NameHR(data);
        fillAllInterviews(data.meetings);
        fillAllFavorites(data.favorites);
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
    if (confirm("Удалить кандидата из избранных ?"))
    {
        $.ajax({
            url: address()+endpoints.favorite+"/"+this.parentNode.getAttribute("candidate_id"),
            type:"POST",
            success: function (){
                this.parentNode.remove();
            },
            xhrFields:{
                withCredentials: true
            }
        });
    }
});

$("body").on("click", ".interview_candidate_delete_button", function (){
    if (confirm("Вы точно хотите отменить сосбеседование?"))
    {
        let candidate_item = this.parentNode;
        let candidate_id = candidate_item.getAttribute("candidate_id");
        let vacancy_id = candidate_item.getAttribute("vacancy_id");
        $.ajax({
            url: address()+endpoints.deleteMeeting.replace(":n_candidate", candidate_id).replace(":n_vacancy",vacancy_id),
            type:"DELETE",
            success: function (){
                candidate_item.remove();
            },
            xhrFields:{
                withCredentials: true
            }
        });
    }
});

// изменение пароля
$("body").on("click", ".save_button", function() {
    let password = document.getElementById("new_password").value;
    let password_verification = document.getElementById("verification_new_password").value;
    if (password != password_verification)
    {
        document.getElementById("error_label").innerHTML = "Пароли не совпадают.";
        return;
    }
    $.ajax({
        url: address()+endpoints.changePassword,
        type: "PUT",
        data: {s_password: password},
        xhrFields: {
            withCredentials: true
        }
    });
});

// запоминаем id кандидата
$("body").on("click", ".candidates", function()
{
    sessionStorage.setItem('id_cand', this.parentNode.parentNode.getAttribute("candidate_id"));
});
