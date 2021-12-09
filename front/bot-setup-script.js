function fillAllTabs(data)
{
    for ( key in data )
    {
        //console.log(key);
        //console.log(data[key]);

        AddTabs(data[key].s_name);

        document.querySelector(".tabs_nav-btn").click();
    };
}
function fillAllReqs(data)
{
    for ( key in data )
    {
        console.log(key);
        console.log(data[key]);

        AddReq(data[key].s_name);
    };
}
function fillFormsToVacs(data)
{

}
function getAllInfo()
{
    $.ajax({
        url: address() + endpoints.vacancies,
        success: function (data, textStatus, request) {
            fillAllTabs(data);
        },
        error: function(request, textStatus, errorThrown){
            authCheck(request);
        },
        xhrFields: {
            withCredentials: true
        }
    })
    $.ajax({
        url: address() + endpoints.forms,
        success: function (data, textStatus, request) {
            fillAllReqs(data);
        }
    })
    $.ajax({
        url: address() + endpoints.formsToVacs,
        success: function (data, textStatus, request) {
            fillFormsToVacs(data);
        }
    })
}

getAllInfo(); // <- Uncomment to turn on info getting

// создание вакансии и поля её контента
function AddTabs(vac_name) {
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
    Sortable.create(list_name, {group: 'shared', animation: 150}); // если сразу вносить list_name, то не будет работать
    let parent_tabs_item = document.querySelector(".tabs_content");

    tab_item.appendChild(list_group);
    parent_tabs_item.appendChild(tab_item);

    if ($(".tabs_nav-btn").length == 1)
    document.querySelector(".tabs_nav-btn").click();
}

// создание сортируемого списка требований
function AddReq (req_name){
    let div = document.createElement("div");
    div.classList.add("list-group-item");

    let input = document.createElement("input");
    input.classList.add("input-tabs-item");
    input.placeholder = "Вопрос*";
    if (req_name != null)
    input.value = req_name;
    div.appendChild(input);

    let button = document.createElement("button");
    button.innerHTML = "X";
    button.classList.add("remove_req_button");
  
    div.appendChild(button);

    let list = document.getElementById("simpleList");
    list.appendChild(div);
}

// добавление таба по клику
$("body").on("click", ".add_vac_button", function(){
    AddTabs(null);
});

// добавление требования по клику
$("body").on("click", ".add_req_button", function(){
    AddReq(null);
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
    $(this).parent().remove(); 
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
},animation: 150});