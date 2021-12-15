id_cand = sessionStorage.getItem('id_cand');
console.log(id_cand);

$("body").on("click", ".set_interviev", function(){
    console.log(document.getElementById("date_start").value);
    console.log(document.getElementById("select_vac").value);
});

let dat = "2001-12-10"
document.getElementById("date_start") = dat;
console.log(document.getElementById("date_start").value);