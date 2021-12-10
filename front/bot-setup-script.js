let form_id_count = 0;

function fillAllTabs(data)
{
    for ( key in data )
    {
        AddTab(data[key].s_name);
        let allLists = document.getElementsByClassName("tabs_item");
        let listNow = allLists[allLists.length-1];
        for (form in data[key].forms)
        {
            let form_id = data[key].forms[form].n_form;
            let form_name = document.getElementsByClassName("form_id:"+form_id)[0].getElementsByClassName("input-tabs-item")[0].value
            AddForm(form_name, form_id, listNow);
            form_id_count = Math.max(form_id_count, form_id);
        }
    };
    document.querySelector(".tabs_nav-btn").click();
}
function fillAllForms(data)
{
    for ( key in data )
    {
        AddForm(data[key].s_name, data[key].id);
    };
}

function fillAllInfo(data)
{
    fillAllForms(data.forms);
    fillAllTabs(data.vacancies);
}

function getAllInfo()
{
    $.ajax({
        url: address() + endpoints.botSettings,
        success: function (data, textStatus, request) {
            fillAllInfo(data);
        },
        error: function(request, textStatus, errorThrown){
            authCheck(request);
        },
        xhrFields: {
            withCredentials: true
        }
    })
}

getAllInfo();

function checkSameForm(list, item)
{
    let new_form_id = item.getAttribute("form_id");

    list.childNodes.forEach(function(ob){
        if (ob != item && ob.parentNode.parentNode.classList.contains("active") && ob.getAttribute("form_id") == new_form_id)
        {
            ob.remove();
        }
    })
}
function changeForm(text, form_id, source)
{
    document.querySelectorAll(".list-group-item").forEach(function (form){
        if (form != source && form.getAttribute("form_id")==form_id)
        {
            form.getElementsByClassName("input-tabs-item")[0].value = text;
        }
    })
}

// создание вакансии и поля её контента
function AddTab(vac_name) {
    // создаем кнопку таба
    let tab_button = document.createElement("button");
    tab_button.classList.add("tabs_nav-btn");
    let number_tab = $('.tabs_nav-btn').length + 1;
    tab_button.setAttribute("data-tab", "tab_" + number_tab);
    
    let input = document.createElement("input");
    input.classList.add("input-tabs-item");
    input.placeholder = "вакансия*";
    if (vac_name != null)
    input.value = vac_name;
    tab_button.appendChild(input);

    let remove_vac_button = document.createElement("button");
    remove_vac_button.innerHTML = "X";
    remove_vac_button.classList.add("remove_vac_button");
    tab_button.appendChild(remove_vac_button);

    let parent_tabs_button = document.querySelector(".tabs_nav");
    parent_tabs_button.appendChild(tab_button);

    // создаем контент таба
    let tab_item = document.createElement("div");
    tab_item.classList.add("tabs_item");
    let tabId = tab_button.getAttribute("data-tab");
    tab_item.id = tabId;

    let list_group = document.createElement("div");
    list_group.classList.add("list-group");
    let list_name = "simpleList" + number_tab;
    list_group.id = list_name;
    document.body.appendChild(list_group);
    list_name = document.getElementById(list_name);
    Sortable.create(list_name, {group: 'shared',
        animation: 150,
        scroll:true,
        scrollSensitivity: 80,
        scrollSpeed: 100,
        onAdd: function (evt)
        {
            checkSameForm(evt.to, evt.item);
        }
    }); // если сразу вносить list_name, то не будет работать
    let parent_tabs_item = document.querySelector(".tabs_content");

    tab_item.appendChild(list_group);
    parent_tabs_item.appendChild(tab_item);

    if ($(".tabs_nav-btn").length == 1)
    document.querySelector(".tabs_nav-btn").click();
}

// создание сортируемого списка требований
function AddForm (frm_name, form_id, list= document.getElementById("simpleList")){
    let div = document.createElement("div");
    div.classList.add("list-group-item");
    div.classList.add("form_id:"+form_id);
    div.setAttribute("form_id", form_id);

    let input = document.createElement("input");
    input.classList.add("input-tabs-item");
    input.placeholder = "Вопрос*";
    if (frm_name != null)
    input.value = frm_name;
    input.addEventListener("input", function(evt){
        changeForm(evt.target.value, form_id, evt.target);
    });
    div.appendChild(input);

    let button = document.createElement("button");
    button.innerHTML = "X";
    button.classList.add("remove_req_button");
  
    div.appendChild(button);

    list.appendChild(div);
}

// добавление таба по клику
$("body").on("click", ".add_vac_button", function(){
    AddTab(null);
});

// добавление требования по клику
$("body").on("click", ".add_req_button", function(){
    form_id_count+=1;
    AddForm(null, form_id_count);
});

// удаление таба по клику
$("body").on("click", ".remove_vac_button", function() {
    $(this).parent().remove(); 
    let tab_id = $(this).parent().attr("data-tab");
    $("#" + tab_id).remove();

    if ($(".tabs_nav-btn").length > 0 && ! $(".tabs_nav-btn").hasClass('active'))
    {
        let first_tab_button = $(".tabs_nav-btn").first();
        first_tab_button.addClass("active");

        let first_tab_content = $(".tabs_item").first();
        first_tab_content.addClass("active");
    }
});

// удаление требования по клику
$("body").on("click", ".remove_req_button", function() {
    if (this.parentNode.parentNode.id == "simpleList") // Если в основном листе
    {
        let this_form_id = this.parentNode.getAttribute("form_id");
        document.querySelectorAll(".list-group-item").forEach(function (form) {
            if (form.getAttribute("form_id")==this_form_id)
            {
                form.remove();
            }
        })
    }
    else {
        $(this).parent().remove();
    }
});

// обработка клика на кнопку таба
$("body").on("click", ".tabs_nav-btn", function() {
    let tab_id = this.getAttribute("data-tab");
    let current_tab = document.getElementById(tab_id);

    if (! this.classList.contains("active") && current_tab)
        {
            $(".tabs_nav-btn").removeClass("active");
            $(".tabs_item").removeClass("active");
    
            this.classList.add("active");
            current_tab.classList.add("active");
        }
});

//document.querySelector(".tabs__nav-btn").click();

// drag and drop
Sortable.create(simpleList, {
    group: {
    name: 'shared',
    pull: 'clone',
    put: false
},animation: 150,
    onClone: function (evt)
    {
        let input = evt.clone.getElementsByClassName("input-tabs-item")[0];
        input.addEventListener("input", function(evt){
            changeForm(evt.target.value, input.parentNode.getAttribute("form_id"), evt.target);
        });
    }
});