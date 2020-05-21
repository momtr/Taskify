let workspaceUUID;
let tasks;
let keys;

$(document).ready(async () => {

    /** get the tasks */
    workspaceUUID = window.location.href.split('/')[3] || '&';
    $('#workspaceUUID').append(workspaceUUID);
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
    tasks = json.data.tasks;
    keys = Object.keys(tasks);
    /** sort them */
    for(let i of keys) {
        if(!tasks[i].done) {
            $('#tasks').append(`<div class="task" id="${i}" onclick="doneTask(${i})">${tasks[i].title}\n</div>`);
        }
    }
    for(let i of keys) {
        if(tasks[i].done && !tasks[i].removed) {
            $('#doneTasks').append(`<div class="task" onclick="removeTask(${i})" id="${i}_done">${tasks[i].title}\n</div>`);
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
    fetch(`/api/v1/tasks/done/${workspaceUUID}/${id}`, { method: 'PUT' })
        .then(res => res.json())
        .then(() => { 
            $(`#${id}`).hide()
            $('#doneTasks').append(`<div class="task" onclick="removeTask(${id})" id="${id}_done">${tasks[id].title}\n</div>`)
        })
}

function removeTask(id) {
    fetch(`/api/v1/tasks/remove/${workspaceUUID}/${id}`, { method: 'PUT' })
        .then(res => res.json())
        .then(() => $(`#${id}_done`).hide());
}