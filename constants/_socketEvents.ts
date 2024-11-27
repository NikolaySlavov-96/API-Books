export enum _EReceiveEvents {
    USER_CONNECT = 'user_connect',
    SUPPORT_CHAT_USER_JOIN = 'support_chat_join',
    SUPPORT_CHAT_USER_LEAVE = 'support_chat_leave',
    USER_ACCEPT_JOIN_TO_ROOM = 'user_accept_join_to_room',
    SUPPORT_ACCEPT_USER = 'support_accept_user',
    SUPPORT_MESSAGE = 'support_message',
}

export enum _ESendEvents {
    ERROR = 'error',
    NEW_BOOK_ADDED = 'new-book-added',
    COMPLETE_ISSUE = 'complete-issue',
    NOTIFY_FOR_CREATE_ROOM = 'notify_for_created_room',
    USER_CONNECT = 'user_connect',
    SUPPORT_CHAT_USER_JOIN_ACKNOWLEDGMENT = 'support_chat_user_join_acknowledgment',
    SUPPORT_ACCEPT_USER_ACKNOWLEDGMENT = 'support_accept_user_acknowledgment',
    SUPPORT_MESSAGE = 'support_message',
    NOTIFY_ADMINS_OF_NEW_USER = 'notify_admins_of_new_user',
    // NEW
    NEW_PRODUCT_ADDED = 'new-product-added',
}