function fillAllTabs(data)
{
    for ( key in data )
    {
        let vac_id = data[key].id
        AddTab(data[key].s_name, vac_id);
        let allLists = document.getElementsByClassName("tabs_item");
        let listNow = (allLists[allLists.length-1]).childNodes[0];
        for (form in data[key].forms)
        {
            let form_id = data[key].forms[form].n_form;
            let form_name = document.getElementsByClassName("form_id:"+form_id)[0].getElementsByClassName("input-tabs-item")[0].value
            AddForm(form_name, form_id, listNow);
        }
    };
    let tab = document.querySelector(".tabs_nav-btn");
    if (tab != null)
    {
        tab.click();
    }
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
    let hassame = false;

    list.childNodes.forEach(function(ob){
        if (ob != item && ob.parentNode.parentNode.classList.contains("active") && ob.getAttribute("form_id") == new_form_id)
        {
            ob.remove();
            hassame = true;
        }
    })
    return hassame;
}
function changeForm(text, form_id, source)
{
    renameAfterTimeout(renameForm, source, form_id, text);
    //renameForm(form_id, text);
    document.querySelectorAll(".list-group-item").forEach(function (form){
        if (form != source && form.getAttribute("form_id")==form_id)
        {
            form.getElementsByClassName("input-tabs-item")[0].value = text;
        }
    })
}

// создание вакансии и поля её контента
function AddTab(vac_name, vac_id) {
    // создаем кнопку таба
    let tab_button = document.createElement("button");
    tab_button.classList.add("tabs_nav-btn");
    tab_button.setAttribute("vac_id", vac_id);
    let number_tab = $('.tabs_nav-btn').length + 1;
    tab_button.setAttribute("data-tab", "tab_" + number_tab);
    
    let input = document.createElement("input");
    input.setAttribute("timer_id","-1");
    input.addEventListener("input", function(evt){
        let target = evt.target;
        renameAfterTimeout(renameVacancy, target, target.parentNode.getAttribute("vac_id"), target.value);
        //renameVacancy(evt.target.parentNode.getAttribute("vac_id"), evt.target.value);
    });
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
    tab_item.setAttribute("vac_id", vac_id);
    let tabId = tab_button.getAttribute("data-tab");;
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
            let hs = checkSameForm(evt.to, evt.item);
            if (!hs)
            {
                createFTV(evt.to.parentNode.getAttribute("vac_id"), evt.item.getAttribute("form_id"));
            }
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
    input.setAttribute("timer_id","-1");
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
    createVacancy();
});

// добавление требования по клику
$("body").on("click", ".add_req_button", function(){
    createForm();
});

// удаление таба по клику
$("body").on("click", ".remove_vac_button", function() {
    if (confirm("Удалить вакансию?")) {
        $(this).parent().remove();
        let tab_id = $(this).parent().attr("data-tab");
        deleteVacancy(this.parentNode.getAttribute("vac_id"));
        $("#" + tab_id).remove();

        if ($(".tabs_nav-btn").length > 0 && !$(".tabs_nav-btn").hasClass('active')) {
            let first_tab_button = $(".tabs_nav-btn").first();
            first_tab_button.addClass("active");

            let first_tab_content = $(".tabs_item").first();
            first_tab_content.addClass("active");
        }
    }
});

// удаление требования по клику
$("body").on("click", ".remove_req_button", function() {
    if (confirm("Удалить требование?")) {
        let this_form_id = this.parentNode.getAttribute("form_id");
        if (this.parentNode.parentNode.id == "simpleList") // Если в основном листе
        {
            deleteForm(this_form_id);
            document.querySelectorAll(".list-group-item").forEach(function (form) {
                if (form.getAttribute("form_id") == this_form_id) {
                    form.remove();
                }
            })
        } else {
            deleteFTV(this.parentNode.parentNode.parentNode.getAttribute("vac_id"), this_form_id);
            $(this).parent().remove();
        }
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

function renameAfterTimeout(func, target, id, text)
{
    let last_timer = target.getAttribute("timer_id");
    if (last_timer != "-1")
    {
        clearTimeout(last_timer);
    }
    target.setAttribute("timer_id", setTimeout(func, 1000, id, text));
}

function createForm()
{
    $.ajax({
        type: "POST",
        url: address()+endpoints.forms,
        success: function (data) {
            AddForm(null, data.id);
        }
    })
}
function renameForm(form_id, text)
{
    $.ajax({
        type: "PUT",
        url: address() + endpoints.forms + "/" + form_id,
        data: {s_name:text}
    })
}
function deleteForm(form_id)
{
    $.ajax({
        type:"DELETE",
        url: address() + endpoints.forms + "/" + form_id
    })
}
function createVacancy()
{
    $.ajax({
        type:"POST",
        url:address()+endpoints.vacancies,
        success: function (data){
            AddTab(null, data.id)
        }
    })
}
function renameVacancy(vac_id, text)
{
    $.ajax({
        type: "PUT",
        url: address() + endpoints.vacancies + "/" + vac_id,
        data: {s_name:text}
    })
}
function deleteVacancy(vac_id)
{
    $.ajax({
        type:"DELETE",
        url: address() + endpoints.vacancies + "/" + vac_id
    })
}
function createFTV(vac_id, form_id)
{
    $.ajax({
        type:"POST",
        url:address()+endpoints.formsToVacs + "/" + vac_id + "/" + form_id
    })
}
function deleteFTV(vac_id, form_id)
{
    $.ajax({
        type:"DELETE",
        url: address() + endpoints.formsToVacs + "/" + vac_id + "/" + form_id
    })
}
