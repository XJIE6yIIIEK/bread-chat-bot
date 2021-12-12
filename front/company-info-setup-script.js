function AddInfo (info_name){
    let div = document.createElement("div");
    div.classList.add("list-group-item-info");

    let input_name_button = document.createElement("input");
    input_name_button.classList.add("input-tabs-item");
    input_name_button.placeholder = "Наименование кнопки*";
    if (info_name != null)
    input_name_button.value = info_name;
    div.appendChild(input_name_button);

    let input_info = document.createElement("input");
    input_info.classList.add("input-tabs-item");
    input_info.placeholder = "Информация о компании*";
    if (info_name != null)
    input_info.value = info_name;
    div.appendChild(input_info);

    let button = document.createElement("button");
    button.innerHTML = "X";
    button.classList.add("remove_info_button");
  
    div.appendChild(button);

    let list = document.getElementById("simpleList_info");
    list.appendChild(div);
}

// добавление информации о компании
$("body").on("click", ".add_info_button", function(){
    AddInfo(null);
});

// удаление информации о компании по клику
$("body").on("click", ".remove_info_button", function() {
    $(this).parent().remove(); 
});

// drag and drop инормация о компании
Sortable.create(simpleList_info, {animation: 150});