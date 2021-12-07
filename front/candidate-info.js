let id_cand_on_second_page = sessionStorage.getItem('id_cand');
console.log(id_cand_on_second_page);

$.getJSON({url:"http://46.146.165.142:60547/api/v1/candidates/"+ id_cand_on_second_page}, function(data) {
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
    if (data.s_external_resumes)
    {
      candidate_data += '<th class = "table_body_style">' + '<a href="#">'+ data.s_external_resumes +'</a>'+ '</th>';
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
     approp_vacans_data += '<tr>';
     approp_vacans_data += '<th class = "table_body_style">' + data.appropriateVacancies[i].s_name + '</th>';
     approp_vacans_data += '</tr>';
 }
$("#table_approp_vacans").append(approp_vacans_data);

})