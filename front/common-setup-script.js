// drag and drop Общие требования
Sortable.create(simpleList_common, {group: 'shared',
    animation: 150,
    scroll:true,
    scrollSensitivity: 80,
    scrollSpeed: 100,
    onAdd: function (evt){
        let item = evt.item;
        let form_id = item.getAttribute("form_id");
        if (!checkFTV(item)) {
            setGeneral(form_id);
        }
        else
        {
            if (confirm("Сделать требование общим возможно только если оно не принадлижит ни одной вакансии. Вы можете продолжить, но это удалит данное требование из списков всех вакансий. Продолжить?"))
            {
                deleteFTVs(item);
                setGeneral(form_id);
            }
            else
            {
                item.remove();
            }
        }
    }
});

function checkFTV(item)
{
    let out = false;
    document.querySelector(".tabs_content").querySelectorAll(".list-group-item").forEach(function (ob){
        if (ob.getAttribute("form_id") == item.getAttribute("form_id"))
        {
            out = true;
        }
    })
    return out;
}
function deleteFTVs(item)
{
    let delete_form_id = item.getAttribute("form_id");
    document.querySelectorAll(".tabs_item").forEach(function (tab){
        let vac_id = tab.getAttribute("vac_id");
        tab.querySelectorAll(".list-group-item").forEach(function (form){
            let form_id = form.getAttribute("form_id")
            {
                if (form_id == delete_form_id)
                {
                    deleteFTV(vac_id, delete_form_id);
                    form.remove();
                }
            }
        })
    })
}

function setGeneral(id)
{
    $.ajax({
        type: "POST",
        url: address()+endpoints.general.replace(":id", id),
        xhrFields: {
            withCredentials: true
        }
    })
}

function removeGeneral(id)
{
    $.ajax({
        type: "DELETE",
        url: address()+endpoints.general.replace(":id", id),
        xhrFields: {
            withCredentials: true
        }
    })
}