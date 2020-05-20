function createWorkspace() {
    let uuid = $('#workspaceUUID').val();
    if(uuid) {
        fetch(`/api/v1/workspaces/${uuid}`, { method: 'POST' })
            .then(res => res.json())
            .then(json => {
                /** error handeling! */
                if(json.err) {
                    if(json.message === "1")
                        $('#error').html('This workspace already exists');
                    else 
                        $('#error').html('The name of the workspace must not contain speical characters');
                } else {
                    Cookies.set('workspaceUUID', uuid);
                    window.location.href = `/${uuid}`
                }
            });
    }
}