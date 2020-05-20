onload = () => {
    let workspaceUUID = Cookies.get('workspaceUUID');
    if(workspaceUUID)
        redirect(`/${workspaceUUID}`);
}

function getWorkspace() {
    let uuid = $('#workspaceUUID').val();
    if(uuid) 
        redirect(`/${uuid}`);
}

function createWorkspace() {
    window.location.href = '/workspaces/new'
}

function redirect(loc) {
    window.location.href = loc;
}