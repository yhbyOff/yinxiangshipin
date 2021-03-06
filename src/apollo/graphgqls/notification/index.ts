// 通知模块
import commentNotificationQuery from './commentNotificationQuery.graphql';
import followersNotificationsQuery from './followersNotificationsQuery.graphql';
import likeNotificationsQuery from './likeNotificationsQuery.graphql';
import otherNotificationsQuery from './otherNotificationsQuery.graphql';
import unreadsQuery from './unreadsQuery.graphql';
import publicNotificationQuery from './publicNotificationQuery.graphql';
import personalNotificationQuery from './personalNotificationQuery.graphql';
import SystemNotificationItem from './SystemNotificationItem.graphql';

export const notification = {
    commentNotificationQuery,
    followersNotificationsQuery,
    likeNotificationsQuery,
    otherNotificationsQuery,
    unreadsQuery,
    publicNotificationQuery,
    personalNotificationQuery,
    SystemNotificationItem,
};
