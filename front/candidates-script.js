
$.getJSON("http://46.146.165.142:60547/api/v1/candidates", function(data) {
    for ( key in data ) 
    {   console.log(key);
        console.log(data[key]);

       // создаём ячейку для кандидата 
        let tr = document.createElement('tr');

        let candidate = tr.appendChild(document.createElement('th'));
        candidate.classList.add("table_body_style");
        let a = candidate.appendChild(document.createElement('a'));
        a.href = "candidate.html";
        a.classList.add("candidates");
        a.innerHTML = data[key].s_name;
        a.id = data[key].id;

        let status = tr.appendChild(document.createElement('th'));
        status.classList.add("table_body_style");
        status.innerHTML = data[key].s_status;

        $("#table_cand").append(tr);
    };
  })

  $("body").on("click", ".candidates", function() {
    sessionStorage.setItem('id_cand', this.id); 
    });