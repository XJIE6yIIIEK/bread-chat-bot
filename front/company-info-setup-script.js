function initializeInfo()
{
    $.ajax({
        url: address()+endpoints.info,
        success: function (data, textStatus, request) {
            for (info in data)
            {
                AddInfo(data[info].id, data[info].s_name, data[info].s_message);
            }
        }
    })
}

initializeInfo()

function AddInfo (info_id, info_name, info_message){
    let div = document.createElement("div");
    div.classList.add("list-group-item-info");
    div.setAttribute("info_id", info_id);

    let input_name_button = document.createElement("input");
    input_name_button.classList.add("input-tabs-item");
    input_name_button.placeholder = "Наименование кнопки*";
    if (info_name != null)
    input_name_button.value = info_name;
    div.appendChild(input_name_button);

    let input_info = document.createElement("input");
    input_info.classList.add("input-tabs-item");
    input_info.placeholder = "Информация о компании*";
    if (info_message != null)
    input_info.value = info_message;
    div.appendChild(input_info);

    input_name_button.addEventListener("input", function(evt){
        renameInfo(evt.target);
    });
    input_info.addEventListener("input", function(evt){
        renameInfo(evt.target);
    });

    let button = document.createElement("button");
    button.innerHTML = "X";
    button.classList.add("remove_info_button");
  
    div.appendChild(button);

    let list = document.getElementById("simpleList_info");
    list.appendChild(div);
}

// добавление информации о компании
$("body").on("click", ".add_info_button", function(){
    createInfo();
});

// удаление информации о компании по клику
$("body").on("click", ".remove_info_button", function() {
    if (confirm("Удалить информацию?")) {
        deleteInfo(this.parentNode);
    }
});

// drag and drop инормация о компании
Sortable.create(simpleList_info, {animation: 150});

function createInfo()
{
    $.ajax({
        type:"POST",
        url:address()+endpoints.info,
        success: function (data){
            AddInfo(data.id, null, null);
        }
    })
}
function renameInfo(target)
{
    let list_item = target.parentNode;
    let info_id = list_item.getAttribute("info_id");
    let info_name = list_item.childNodes[0].value;
    let info_message = list_item.childNodes[1].value;
    $.ajax({
        type: "PUT",
        url: address()+endpoints.info+"/"+info_id,
        data: {s_name:info_name, s_message:info_message}
    })
}
function deleteInfo(target)
{
    let info_id = target.getAttribute("info_id");
    $.ajax({
        type: "DELETE",
        url: address()+endpoints.info+"/"+info_id,
        success: function (){
            target.remove();
        }
    })
}
