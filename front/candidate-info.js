let id_cand_on_second_page = sessionStorage.getItem('id_cand');

function fillCandidate(data)
{
    // заполняем таблицу с информацией о кандидате
    let candidate_data = '';

    candidate_data += '<tr>';
    candidate_data += '<th class = "table_body_style">' + "ФИО:" + '</th>';
    candidate_data += '<th class = "table_body_style">' + data.candidate.s_name + '</th>';
    candidate_data += '</tr>';

    candidate_data += '<tr>';
    candidate_data += '<th class = "table_body_style">' + "Дата рождения:" + '</th>';
    candidate_data += '<th class = "table_body_style">' + data.candidate.d_birth_date + '</th>';
    candidate_data += '</tr>';

    candidate_data += '<tr>';
    candidate_data += '<th class = "table_body_style">' + "Адрес:" + '</th>';
    candidate_data += '<th class = "table_body_style">' + data.candidate.s_address + '</th>';
    candidate_data += '</tr>';

    candidate_data += '<tr>';
    candidate_data += '<th class = "table_body_style">' + "Телефон:" + '</th>';
    candidate_data += '<th class = "table_body_style">' + data.candidate.s_phone_number + '</th>';
    candidate_data += '</tr>';

    candidate_data += '<tr>';
    candidate_data += '<th class = "table_body_style">' + "Почта:" + '</th>';
    candidate_data += '<th class = "table_body_style">' + data.candidate.e_mail + '</th>';
    candidate_data += '</tr>';

    candidate_data += '<tr>';
    candidate_data += '<th class = "table_body_style">' + "Ссылка на резюме:" + '</th>';
    console.log(data.candidate.s_external_resumes);
    if (data.candidate.s_external_resumes)
    {
        candidate_data += '<th class = "table_body_style">' + '<a href="' + data.candidate.s_external_resumes + '" target = "_blank">'+ data.candidate.s_external_resumes +'</a>'+ '</th>';
    }
    else
        candidate_data += '<th class = "table_body_style">' + "Отсутствует" + '</th>';
    candidate_data += '</tr>';

    $("#table_candidate").append(candidate_data);

    // заполняем таблицу с информацией о резюме`
    let resume_data = '';

    for (let i = 0; i < data.resume.length; i++)
    {
        resume_data += '<tr>';
        resume_data += '<th class = "table_body_style">' + data.resume[i].s_name + '</th>';
        resume_data += '<th class = "table_body_style">' + data.resume[i].s_value + '</th>';
        resume_data += '</tr>';
    }
    $("#table_resume").append(resume_data);

    // заполняем таблицу с информацией о вакансиях
    let approp_vacans_data = '';

    for (let i = 0; i < data.appropriateVacancies.length; i++)
    {
        let option = document.createElement('option');
        let vac_name = data.appropriateVacancies[i].s_name;
        let vac_wanted = data.appropriateVacancies[i].b_wanted;
        option.innerHTML = vac_name;
        option.value = data.appropriateVacancies[i].id;
        document.getElementById("select_vac").appendChild(option);

        approp_vacans_data += '<tr>';
        if (vac_wanted)
            approp_vacans_data += '<th class = "wanted_table_body_style">' + vac_name + '</th>';
        else
            approp_vacans_data += '<th class = "table_body_style">' + vac_name + '</th>';
        approp_vacans_data += '</tr>';
    }
    $("#table_approp_vacans").append(approp_vacans_data);

    let favorite_button = document.querySelector(".add_to_favorites");
    favorite_button.setAttribute("favorite", data.favorite);
    if (data.favorite)
    {
        favorite_button.innerHTML = "Удалить из избранного";
    }

}

$.ajax({
    url:address()+endpoints.candidates+"/"+ id_cand_on_second_page,
    success: function (data, textStatus, request)
    {
        fillCandidate(data);
    },
    error: function(request, textStatus, errorThrown)
    {
        authCheck(request);
    },
    xhrFields: {
        withCredentials: true
    }
})
