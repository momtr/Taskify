let workspaceUUID;
let tasks;
let keys;
let view;
let prios;

$(document).ready(async () => {

    view = ((Cookies.get('view') == 'true') ? true : false) || true;
    // changeView();

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

    /** tasks */
    tasks = json.data.tasks;
    keys = Object.keys(tasks);
    /** sort them */
    keys.sort((a, b) => {
        let aPrio = ((tasks[a].priority == 'prio-high') ? 3 : ((tasks[a].priority == 'prio-medium') ? 2 : ((tasks[a].priority == 'prio-low') ? 1 : 0)));
        let bPrio = ((tasks[b].priority == 'prio-high') ? 3 : ((tasks[b].priority == 'prio-medium') ? 2 : ((tasks[b].priority == 'prio-low') ? 1 : 0)));
        if(aPrio < bPrio)
            return 1;
        else return -1;
    })
    /** display tasks */
    for(let i of keys) {
        if(!tasks[i].done) {
            let prio = tasks[i].priority || 'prio-low';
            $('#tasks').append(`<div class="task ${prio}" id="${i}" onclick="doneTask(${i})">${tasks[i].title}\n</div>`);
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
        progressSteps: ['1', '2'],
      }).queue([
        {
            title: '👋 Create new task',
            text: 'Title'
        },
        {
            title: '👋 Create new task',
            input: 'select',
            inputOptions: {
                'prio-high': 'high',
                'prio-medium': 'medium',
                'prio-low': 'low'
            },
            inputPlaceholder: 'Select priority',
            showCancelButton: true,
        },
        /*
        {
            title: '👋 Create new task',
            text: 'Date in DD/MM'
        },
        {
            title: '👋 Create new task',
            text: 'Time'
        },
        */
      ]).then(result => {
        let data = {
            title: result.value[0],
            priority: result.value[1],
            description: result.value[2],
            untilDay: result.value[3],
            untilTime: result.value[4],
        }
        console.log(data);
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

function changeView(set) {
    if(view) {
        $('.task-container').css('flex-direction', 'row');
        $('.task').css('flex', '1 1 200px');
    } else {
        $('.task-container').css('flex-direction', 'column');
        $('.task').css('flex', '1 1 0px');
    }
    Cookies.set('view', view);
    if(set)
        view = !view;
}