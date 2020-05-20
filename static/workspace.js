let workspaceUUID;

$(document).ready(async () => {

    /** get the tasks */
    workspaceUUID = window.location.href.split('/')[3] || '&';
    let req = await fetch(`api/v1/workspaces/${workspaceUUID}`);
    let json = await req.json();

    /** error handeling! */
    if(json.err) {
        console.log(json);
        if(Cookies.get('workspaceUUID'))
            Cookies.remove('workspaceUUID');
        window.location.href = `/notfound/${workspaceUUID}`;
        return;
    }

    /** display tasks */
    let tasks = json.data.tasks;
    let keys = Object.keys(tasks);
    /** sort them */
    for(let i of keys) {
        if(!tasks[i].done) {
            $('#tasks').append(`<div id="${i}">${tasks[i].title}\n<button onclick="doneTask(${i})">✅</button></div>`);
        }
    }
});

function newTask() {

    Swal.mixin({
        input: 'text',
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
        progressSteps: ['1', '2', '3', '4'],
      }).queue([
        {
            title: '👋 Create new task',
            text: 'Title'
        },
        {
            title: '👋 Create new task',
            text: 'Description'
        },
        {
            title: '👋 Create new task',
            text: 'Date in DD/MM'
        },
        {
            title: '👋 Create new task',
            text: 'Time'
        },
      ]).then(result => {
        let data = {
            title: result.value[0],
            description: result.value[1],
            untilDay: result.value[2],
            untilTime: result.value[3]
        }
        let params = new URLSearchParams(data).toString();
        fetch(`/api/v1/tasks/${workspaceUUID}?${params}`, {
            method: 'POST',
        }).then(res => res.json())
          .then(response => {

            /** check for errors */
            if(response.err) {
                Swal.fire(
                    '🍭 Error :(',
                    'Please make sure you have entered a title and the date and time is in the correct formalt',
                    'error'
                );
            } else {
                /** success */
                window.location.href = `/${workspaceUUID}`;
            }

        })
    });
}

function doneTask(id) {
    fetch(`/api/v1/tasks/${workspaceUUID}/${id}`, { method: 'PUT' })
        .then(res => res.json())
        .then(() => $(`#${id}`).hide())
}