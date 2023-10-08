const host = "http://10.5.2.44:5000";
export const registerRoute = `${host}/api/auth/register`
export const loginRoute = `${host}/api/auth/login`
export const setAvatarRoute = `${host}/api/auth/setAvatar`
export const allUsersRoute = `${host}/api/auth/allUsers`

export const sendMessageRoute = `${host}/api/messages/addmsg`
export const getAllMessagesRoute = `${host}/api/messages/getmsg`
export const deleteChatRoute = `${host}/api/messages/delchat`