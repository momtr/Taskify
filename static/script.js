onload = () => {
    let workspaceUUID = Cookies.get('workspaceUUID');
    if(workspaceUUID)
        $('#workspaceUUID').val(`${workspaceUUID}`);
}

function getWorkspace() {
    let uuid = $('#workspaceUUID').val();
    Cookies.set('workspaceUUID', uuid);
    if(uuid) 
        redirect(`/${uuid}`);
}

function createWorkspace() {
    window.location.href = '/workspaces/new'
}

function redirect(loc) {
    window.location.href = loc;
}